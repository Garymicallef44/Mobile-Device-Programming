import { useRoute } from "@react-navigation/native";
import { useStripe } from "@stripe/stripe-react-native";
import * as Location from "expo-location";
import { Stack, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
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
  const router = useRouter();
  const stripe = useStripe();

  const { garage, price, services } = route.params;

  // Check if service selected for order requires user to go to garage.
  const requiresGarageVisit = useMemo(
    () => services.some((s: any) => s.RequireGarage === true),
    [services]
  );

  // Phone number
  const [phone, setPhone] = useState("");
  // GPS Location of service
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  // Region of service
  const [region, setRegion] = useState<Region>({
    latitude: 35.8972,
    longitude: 14.5123,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // User is paying state
  const [paying, setPaying] = useState(false);
  // Location of service text
  const [locationText, setLocationText] = useState<string>("");
  const [resolvingLocation, setResolvingLocation] = useState(false);

  // Check if overall service orders require garage visit
  useEffect(() => {
    if (!requiresGarageVisit) {
      // If not, request location of user
      requestLocation();
    }
  }, [requiresGarageVisit]);

  // Check if services require garage vist & the garage has coordinates
  useEffect(() => {
    if (requiresGarageVisit && garage?.Coordinates) {
      // Update map to service location
      updateMapToLocation(
        garage.Coordinates.latitude,
        garage.Coordinates.longitude
      );
    }
  }, [requiresGarageVisit, garage]);

  // Request user location
  const requestLocation = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      // If user hasn't granted access
      if (status !== "granted") {
        // Request again
        const { status: newStatus } =
          await Location.requestForegroundPermissionsAsync();
        if (newStatus !== "granted") {
          // Return if is granted
          alert("Location permission required.");
          return;
        }
      }

      // Get user location 
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      // Update live map location
      updateMapToLocation(loc.coords.latitude, loc.coords.longitude);
    } catch {
      alert("Failed to get location. Please try again.");
    }
  };

  // Update map's location on order overview.
  const updateMapToLocation = (lat: number, lng: number) => {
    // Sets location to respective latitude, longitude coordinates
    setRegion({
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    // Sets GPS state
    setGps({ lat, lng });
  };

  // On press event listener for map
  const onMapPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    // Update map location to pressed region
    updateMapToLocation(latitude, longitude);
  };


  useEffect(() => {

    let cancelled = false;

    const resolve = async () => {
      // If no GPS location is provided
      if (!gps) {
        // Set Location text to none
        setLocationText("");
        return;
      }

      // If Services require garage visit
      if (requiresGarageVisit) {
        // Update information of garage town and location
        const gTown = garage?.Town ?? garage?.city ?? "";
        const gLoc = garage?.Location ?? garage?.location ?? "";
        // Display on order overview.
        setLocationText(`${gTown} ${gLoc}`.trim());
        return;
      }

      
      setResolvingLocation(true);
      try {
        // Get town and street of selected / pre-selected location
        const txt = await GetTownAndStreet(gps.lat, gps.lng);
        // If user hasn't cancelled, set location text
        if (!cancelled) setLocationText(String(txt ?? ""));
      } catch {
        // If user hasn't cancelled, set location coordinates
        if (!cancelled)
          setLocationText(
            `${gps.lat.toFixed(5)}, ${gps.lng.toFixed(5)}`
          );
      } finally {
        // Resolving location is complete
        if (!cancelled) setResolvingLocation(false);
      }
    };

    resolve();
    return () => {
      cancelled = true;
    };
  }, [gps, requiresGarageVisit, garage]);

  // used to retrieve name of services
  const buildServiceStr = () => {
    // Return nothing if no services
    if (!services || services.length === 0) return "";
  
    // If there are only 1 service, return just that name
    if (services.length === 1) return services[0].name;

    // Through each service, return their name
    const names = services.map((s: any) => s.name);
    const last = names.pop();
    // Return services
    return `${names.join(", ")} and ${last}`;
  };


  const payNow = async () => {
    // If user is paying
    if (paying) return;

    // Check if user has car details defined
    const car = await Promise.resolve(getUserCarDetails());
    if (!car) return alert("Please add a car before placing an order.");

    // If user has not entered any car details
    if (!getUserCarDetails())
      return alert("Please enter your car details.");
    // If user hasn't entered a phone number
    if (!phone) return alert("Please enter phone number");
    // If user hasn't selected a location on map
    if (!gps) return alert("Please select a location on the map");

    // Set paying state to true
    setPaying(true);

    try {
      // Post Request to payment intent endpoint
      const response = await fetch(
        "http://10.0.2.2:3000/create-payment-intent",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ price }),
        }
      );

      // get JSON format of response
      const json = await response.json();
      const clientSecret = json.clientSecret;

      const initSheet = await stripe.initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: "Garage Services",
      });

      // Request payment sheet from stripe
      const payment = await stripe.presentPaymentSheet();

      // If payment has failed
      if (payment.error) {
        alert(payment.error.message ?? "Payment failed");
        return;
      }

      // Get service string representations
      const serviceStr = buildServiceStr();

      // Save item
      saveItem({
        name: serviceStr,
        garageName: garage?.Name,
        date: new Date(),
        price: price.toFixed(2),
      });

      
      const name = await getName();

      // Provide price paid
      sendNotif(name, "Servify", "You have paid €" + price.toFixed(2));

      // Set mode based if user has to visit garage
      const mode = requiresGarageVisit ? "garage" : "mobile";
      // Pass Garage location if garage visit is needed
      const locationTextToPass = requiresGarageVisit
        ? `${garage?.Town ?? garage?.city ?? ""} ${
            garage?.Location ?? garage?.location ?? ""
          }`.trim()
        : locationText || `${gps.lat.toFixed(5)}, ${gps.lng.toFixed(5)}`;

      // Reroute user to confirmation page
      router.replace({
        pathname: "/confirmation",
        params: {
          total: price.toFixed(2),
          garageName: garage?.Name ?? "",
          services: serviceStr,
          mode,
          locationText: locationTextToPass,
        },
      });
    } catch (err) {
      console.error(err);
    } finally {
      setPaying(false);
    }
  };

  const sendNotif = async (
    id: string,
    title: string,
    message: string
  ) => {
    try {
      
      await fetch("http://10.0.2.2:3000/send-notif", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title, msg: message }),
      });
    } catch (err) {
      console.error("Error sending notification:", err);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Garages Near You", headerBackTitle: "Back" }} />
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
        <Text style={[styles.label, { marginTop: 20, fontSize: 20 }]}>
          {requiresGarageVisit ? "Garage Location" : "Select Service Location"}
        </Text>
        <Text style={[styles.label, { marginTop: 5 }]}>
          {requiresGarageVisit
            ? "Your selected service/s require a visit to the garage."
            : "Please select the location where you want the service to be performed on the map below."}
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
          <TouchableOpacity
            style={styles.gpsButton}
            onPress={requestLocation}
            disabled={paying}
          >
            <Text style={styles.gpsButtonText}>Use Current Location</Text>
          </TouchableOpacity>
        )}

        {!!gps && (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.location}>
              Location:{" "}
              {resolvingLocation ? "Resolving..." : locationText || "—"}
            </Text>
            {resolvingLocation && (
              <View style={{ marginTop: 8 }}>
                <ActivityIndicator />
              </View>
            )}
          </View>
        )}

        {/* Total */}
        <View style={styles.servicesList}>
          <Text style={[styles.label, { marginBottom: 10 }]}>
            Selected Services
          </Text>

          {services.map((s: any, i: number) => (
            <View key={i}>
              <Text style={styles.serviceItem}>
                {s.name}: €{s.Price.toFixed(2)}
              </Text>
            </View>
          ))}

          <View style={styles.totalBox}>
            <Text style={styles.totalText}>Total</Text>
            <Text style={styles.totalAmount}>€{price.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.paybtncontainer}>
        <TouchableOpacity
          style={[styles.payButton, paying ? styles.payButtonDisabled : null]}
          onPress={payNow}
          disabled={paying}
        >
          <Text style={styles.payButtonText}>
            {paying ? "Processing..." : `Pay Now €${price.toFixed(2)}`}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "white" },
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
  location: { fontSize: 15, fontWeight: "500", color: "green" },
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
    marginBottom: 30,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  servicesList: {
    display: "flex",
    flexDirection: "column",
    marginTop: 10,
    height: "auto",
    backgroundColor: "#fafafa",
    padding: 10,
    borderRadius: 8,
    gap: 5,
  },
  serviceItem: {
    fontSize: 16,
    width: "100%",
    height: "auto",
    backgroundColor: "#ff4800ff",
    color: "white",
    padding: 10,
    borderRadius: 8,
  },
  paybtncontainer: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
});