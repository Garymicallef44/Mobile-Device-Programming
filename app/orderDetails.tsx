import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import * as Location from "expo-location";
import MapView, { Marker, MapPressEvent, Region } from "react-native-maps";
import { useStripe } from "@stripe/stripe-react-native";
import { useRoute } from "@react-navigation/native";

export default function OrderDetailsPage() {
  const route = useRoute<any>();
  const { garage, cart, services } = route.params;

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
    requestLocation();
  }, []);

  const requestLocation = async () => {
  const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();

  if (status !== "granted") {
    const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
    if (newStatus !== "granted") {yeah
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

  // CART TOTAL
  const selectedPrice = cart.reduce((sum: number, id: string) => {
    const s = services.find((s: any) => s.id === id);
    return sum + (s?.price ?? 0);
  }, 0);

  // PAYMENT
  const payNow = async () => {
    if (!phone) return alert("Please enter phone number");
    if (!gps) return alert("Please select a location on the map");

    const response = await fetch("http://10.0.2.2:3000/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: selectedPrice }),
    });

    const json = await response.json();
    const clientSecret = json.clientSecret;

    const initSheet = await stripe.initPaymentSheet({
      paymentIntentClientSecret: clientSecret,
      merchantDisplayName: "Garage Services",
    });

    if (initSheet.error) return alert("Error initializing payment");

    const payment = await stripe.presentPaymentSheet();

    if (payment.error) alert("Payment failed");
    else alert("Payment complete!");
  };

  return (
    <View style={styles.container}>
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
      <Text style={[styles.label, { marginTop: 20 }]}>Select Service Location</Text>

      <MapView
        style={styles.map}
        region={region}
        onPress={onMapPress}
      >
        {gps && (
          <Marker
            draggable
            coordinate={{ latitude: gps.lat, longitude: gps.lng }}
            onDragEnd={(e) => {
              const { latitude, longitude } = e.nativeEvent.coordinate;
              updateMapToLocation(latitude, longitude);
            }}
          />
        )}
      </MapView>

      {/* ⭐ NEW BUTTON: Use Current Location */}
      <TouchableOpacity style={styles.gpsButton} onPress={requestLocation}>
        <Text style={styles.gpsButtonText}>Use Current Location</Text>
      </TouchableOpacity>

      {gps && (
        <Text style={styles.location}>
          Selected: {gps.lat.toFixed(5)}, {gps.lng.toFixed(5)}
        </Text>
      )}

      {/* Total */}
      <View style={styles.totalBox}>
        <Text style={styles.totalText}>Total</Text>
        <Text style={styles.totalAmount}>
          €{(selectedPrice / 100).toFixed(2)}
        </Text>
      </View>

      <TouchableOpacity style={styles.payButton} onPress={payNow}>
        <Text style={styles.payButtonText}>Pay Now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
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
  location: { marginTop: 10, fontSize: 14, color: "green" },
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
  },
  payButtonText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
