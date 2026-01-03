import { useRoute } from "@react-navigation/native";
import { useStripe } from "@stripe/stripe-react-native";
import * as Location from "expo-location";
import { useEffect, useState } from "react";

import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { MapPressEvent, Marker, Region } from "react-native-maps";
import { getName, saveItem } from "../services/storage";
import { getUserCarDetails } from "./backend/AsyncStorage";
import { GetTownAndStreet } from "./backend/UserLocationService";

export default function OrderDetailsPage() {
  const route = useRoute<any>();
  const { garage, price, services } = route.params;
  const requiresGarageVisit = services.some(
  (s: any) => s.RequireGarage === true
 );

  const stripe = useStripe();

  const [phone, setPhone] = useState("");
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 35.8972,
    longitude: 14.5123,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // Ask for location permission on mount
    useEffect(() => {
      if (!requiresGarageVisit) {
        requestLocation();
      }
    }, [requiresGarageVisit]);


  useEffect(() => {
    if (requiresGarageVisit && garage?.Coordinates) {
      updateMapToLocation(
        garage.Coordinates.latitude,
        garage.Coordinates.longitude
      );
    }
  }, [requiresGarageVisit]);

  const requestLocation = async () => {
  const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();

  if (status !== "granted") {
    const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
    if (newStatus !== "granted") {
      alert("Location permission required.");
      return;
    }
  }

  const loc = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  updateMapToLocation(loc.coords.latitude, loc.coords.longitude);
};


  const updateMapToLocation = (lat: number, lng: number) => {
    setRegion({
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });

    setGps({ lat, lng });
  };

  // When user taps the map
  const onMapPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    updateMapToLocation(latitude, longitude);
  };


  // PAYMENT
  const payNow = async () => {

    if(!getUserCarDetails()) return alert("Yo man get a car bitchass");
    if (!phone) return alert("Please enter phone number");
    if (!gps) return alert("Please select a location on the map");

    const response = await fetch("http://10.0.2.2:3000/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price }),
    });

    const json = await response.json();
    const clientSecret = json.clientSecret;

    const initSheet = await stripe.initPaymentSheet({
      paymentIntentClientSecret: clientSecret,
      merchantDisplayName: "Garage Services",
    });

    if (initSheet.error) return alert("Error initializing payment");

    const payment = await stripe.presentPaymentSheet();

    if (payment.error){ alert("Payment failed");}
    else {
      alert("Payment complete!");
      let serviceStr = '';
    if (services.length > 1){
      let serviceNames = services.map((s:any)=>
          s.name
      );
      let last = serviceNames.pop();
      serviceStr =  serviceNames.join(', ') + " and " +  last;
    }else{
      serviceStr = services[0].name;
    }
    console.log(serviceStr);
    let city= '';
    let location= '';
    if(requiresGarageVisit){
      city=garage?.city;
      location=garage?.location;
    }else{
      city = gps.lat.toString();
      location = gps.lng.toString();
    }
    saveItem({name:serviceStr,garageName:garage?.Name,date:new Date(),price:price.toFixed(2)});
     let name = await getName();
     sendNotif(name,'Servify', 'You have paid '+price.toFixed(2))
    }
  };
  const sendNotif = async (id:string,title:string,message:string)=>{
  try{
    const response = await fetch("http://10.0.2.2:3000/send-notif",{
      method:"POST",
      headers:{"Content-Type": "application/json"},
      body: JSON.stringify({
        id:id,
        title:title,
        msg:message,
        
      }),
    });
    console.log(response);
    const data= await response.json();
  }catch(err){
    console.error("Error sending notification:",err);
  }
};
  return (
    <>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Order Details</Text>

        {/* Phone number input */}
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter phone number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

      {/* Map */}
      <Text style={[styles.label, { marginTop: 20, fontSize:20}]}>
        {requiresGarageVisit ? "Garage Location" : "Select Service Location"}
      </Text>
      <Text style={[styles.label, { marginTop: 5}]}>
        {requiresGarageVisit ? "Your selected service/s require a visit to the garage." : "Please select the location where you want the service to be performed on the map below."}
      </Text>

      

        <MapView
          style={styles.map}
          region={region}
          onPress={requiresGarageVisit ? undefined : onMapPress}
          scrollEnabled={!requiresGarageVisit}
          zoomEnabled={!requiresGarageVisit}
          rotateEnabled={!requiresGarageVisit}
        >

          {gps && (
            <Marker
              draggable={!requiresGarageVisit}
              coordinate={{ latitude: gps.lat, longitude: gps.lng }}
              onDragEnd={(e) => {
                if (requiresGarageVisit) return;
                const { latitude, longitude } = e.nativeEvent.coordinate;
                updateMapToLocation(latitude, longitude);
              }}
            />
          )}
        </MapView>

        {!requiresGarageVisit && (
          <TouchableOpacity style={styles.gpsButton} onPress={requestLocation}>
            <Text style={styles.gpsButtonText}>Use Current Location</Text>
          </TouchableOpacity>
        )}


        {gps && (
          <Text style={styles.location}>
            Location : {GetTownAndStreet(gps.lat, gps.lng)}
          </Text>
        )}

        {/* Total */}
        <View style={styles.servicesList}>
          <Text style={[styles.label, { marginBottom: 10 }]}>Selected Services</Text>
          {services.map((s: any, i: number) => (
            <View key={i}> 
              <Text style={styles.serviceItem}> 
                {s.name}: €{s.Price.toFixed(2)} 
              </Text>

            </View>

          ))}

          <View style={styles.totalBox}>
            <Text style={styles.totalText}>Total</Text>
            <Text style={styles.totalAmount}>
              €{price.toFixed(2)}
          </Text>
        </View>
        </View>




      </ScrollView>

      <View style={styles.paybtncontainer}>
        <TouchableOpacity style={styles.payButton} onPress={payNow}>
            <Text style={styles.payButtonText}>Pay Now €{price.toFixed(2)}</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "white"},
  title: { fontSize: 30, fontWeight: "700", marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "600", marginTop: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginTop: 5,
  },
  map: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    marginTop: 10,
  },
  gpsButton: {
    backgroundColor: "#2266ff",
    padding: 12,
    marginTop: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  gpsButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  location: { marginTop: 10, fontSize: 15, fontWeight: 500, color: "green" },
  totalBox: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "#eee",
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalText: { fontSize: 20, fontWeight: "600" },
  totalAmount: { fontSize: 20, fontWeight: "700" },
  payButton: {
    backgroundColor: "#f5a623",
    padding: 16,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 30,
    marginBottom: 30
  },
  payButtonText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  servicesList: {
    display: "flex",
    flexDirection: "column",
    marginTop: 10,
    height: 'auto',
    backgroundColor: '#fafafa',
    padding: 10,
    borderRadius: 8,
    gap: 5
  },
  serviceItem: {
    fontSize: 16,
    width: '100%',
    height: 'auto',
    backgroundColor: '#ff4800ff',
    color: 'white',
    padding: 10,
    borderRadius: 8,
  },
  paybtncontainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingBottom: 40,
  }
});
