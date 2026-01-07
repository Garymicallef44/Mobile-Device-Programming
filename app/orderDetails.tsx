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

  const requiresGarageVisit = useMemo(
    () => services.some((s: any) => s.RequireGarage === true),
    [services]
  );

  const [phone, setPhone] = useState("");
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 35.8972,
    longitude: 14.5123,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [paying, setPaying] = useState(false);
  const [locationText, setLocationText] = useState<string>("");
  const [resolvingLocation, setResolvingLocation] = useState(false);

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
  }, [requiresGarageVisit, garage]);

  const requestLocation = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();

      if (status !== "granted") {
        const { status: newStatus } =
          await Location.requestForegroundPermissionsAsync();
        if (newStatus !== "granted") {
          alert("Location permission required.");
          return;
        }
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      updateMapToLocation(loc.coords.latitude, loc.coords.longitude);
    } catch {
      alert("Failed to get location. Please try again.");
    }
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

  const onMapPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    updateMapToLocation(latitude, longitude);
  };

  useEffect(() => {
    let cancelled = false;

    const resolve = async () => {
      if (!gps) {
        setLocationText("");
        return;
      }

      if (requiresGarageVisit) {
        const gTown = garage?.Town ?? garage?.city ?? "";
        const gLoc = garage?.Location ?? garage?.location ?? "";
        setLocationText(`${gTown} ${gLoc}`.trim());
        return;
      }

      setResolvingLocation(true);
      try {
        const txt = await GetTownAndStreet(gps.lat, gps.lng);
        if (!cancelled) setLocationText(String(txt ?? ""));
      } catch {
        if (!cancelled)
          setLocationText(
            `${gps.lat.toFixed(5)}, ${gps.lng.toFixed(5)}`
          );
      } finally {
        if (!cancelled) setResolvingLocation(false);
      }
    };

    resolve();
    return () => {
      cancelled = true;
    };
  }, [gps, requiresGarageVisit, garage]);

  const buildServiceStr = () => {
    if (!services || services.length === 0) return "";
    if (services.length === 1) return services[0].name;
    const names = services.map((s: any) => s.name);
    const last = names.pop();
    return `${names.join(", ")} and ${last}`;
  };

  const payNow = async () => {
    if (paying) return;

    const car = await Promise.resolve(getUserCarDetails());
    if (!car) return alert("Please add a car before placing an order.");

    if (!getUserCarDetails())
      return alert("Please enter your car details.");
    if (!phone) return alert("Please enter phone number");
    if (!gps) return alert("Please select a location on the map");

    setPaying(true);

    try {
      const response = await fetch(
        "http://10.0.2.2:3000/create-payment-intent",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ price }),
        }
      );

      const json = await response.json();
      const clientSecret = json.clientSecret;

      const initSheet = await stripe.initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: "Garage Services",
      });

      const payment = await stripe.presentPaymentSheet();

      if (payment.error) {
        alert(payment.error.message ?? "Payment failed");
        return;
      }

      const serviceStr = buildServiceStr();

      saveItem({
        name: serviceStr,
        garageName: garage?.Name,
        date: new Date(),
        price: price.toFixed(2),
      });

      const name = await getName();
      sendNotif(name, "Servify", "You have paid €" + price.toFixed(2));

      const mode = requiresGarageVisit ? "garage" : "mobile";
      const locationTextToPass = requiresGarageVisit
        ? `${garage?.Town ?? garage?.city ?? ""} ${
            garage?.Location ?? garage?.location ?? ""
          }`.trim()
        : locationText || `${gps.lat.toFixed(5)}, ${gps.lng.toFixed(5)}`;

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