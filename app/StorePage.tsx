import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useStripe } from "@stripe/stripe-react-native";


type Garage = {
  Coordinates: any;
  Description: string;
  ElectricService: boolean;
  Id: number;
  Latitutde: number;
  Longitude: number;
  Location: string;
  Name: string;
  Rating: number;
  Services: string[];
  Town: string;
};

type ServicePageRouteParams = {
  StorePage: {
    garage: Garage;
  };
};


// COMPONENT
export default function ServicePage() {
  const route = useRoute<RouteProp<ServicePageRouteParams, "StorePage">>();
  const { garage } = route.params;

  const navigation = useNavigation<any>();
  const stripe = useStripe();

  // MULTI-SELECT CART
  const [cart, setCart] = useState<string[]>([]);

  const services = [
    { id: "oil", name: "Oil Change", price: 9999 },
    { id: "tyre", name: "Tyre Change (Fitting)", price: 2499 },
    { id: "engine", name: "Engine Servicing", price: 2499 },
  ];

  const toggleSelect = (id: string) => {
    setCart((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const selectedPrice = cart.reduce((sum, id) => {
    const s = services.find((s) => s.id === id);
    return sum + (s?.price ?? 0);
  }, 0);

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: "https://via.placeholder.com/600x300.png" }}
        style={styles.headerImage}
      />

      <View style={styles.section}>
        <Text style={styles.title}>{garage.Name}</Text>
        <Text style={styles.subtitle}>{garage.Description}</Text>
        <Text style={styles.address}>{garage.Location}</Text>

        <Text style={styles.heading}>Services Offered</Text>
        <Text style={styles.description}>
          Brake Repair, Battery replacements, Engine Diagnostics, Oil Change,
          General repairs and electronic installations.
        </Text>

        <Text style={styles.heading}>Garage Info</Text>
        <Text style={styles.description}>
          Trusted local garage with certified mechanics.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Select Services</Text>

        {services.map((s) => {
          const isSelected = cart.includes(s.id);
          return (
            <TouchableOpacity
              key={s.id}
              style={[styles.serviceItem, isSelected && styles.selectedItem]}
              onPress={() => toggleSelect(s.id)}
            >
              <Text style={[styles.serviceText, isSelected && styles.selectedText]}>
                {s.name}
              </Text>
              <Text style={[styles.priceText, isSelected && styles.selectedText]}>
                €{(s.price / 100).toFixed(2)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.totalBar}>
        <Text style={styles.totalText}>Total</Text>
        <Text style={styles.totalAmount}>€{(selectedPrice / 100).toFixed(2)}</Text>
      </View>

      {/* CONTINUE TO DETAILS PAGE */}
      <TouchableOpacity
        style={styles.orderButton}
        onPress={() =>
          navigation.navigate("orderDetails", {
            garage: garage,
            cart: cart,
            services: services,
          })
        }
      >
        <Text style={styles.orderButtonText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerImage: { width: "100%", height: 200 },
  section: { padding: 16 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#555" },
  address: { fontSize: 14, color: "#333", marginTop: 4 },
  heading: { fontSize: 18, fontWeight: "600", marginTop: 20, marginBottom: 6 },
  description: { fontSize: 14, color: "#444" },
  serviceItem: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#f2f2f2",
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedItem: { backgroundColor: "#f5a623" },
  serviceText: { fontSize: 16 },
  priceText: { fontSize: 16, fontWeight: "600" },
  selectedText: { color: "white" },
  totalBar: {
    borderTopWidth: 1,
    borderColor: "#ddd",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalText: { fontSize: 18, fontWeight: "600" },
  totalAmount: { fontSize: 18, fontWeight: "600" },
  orderButton: {
    backgroundColor: "#2266ff",
    padding: 16,
    margin: 16,
    borderRadius: 30,
    alignItems: "center",
  },
  orderButtonText: { color: "white", fontSize: 18, fontWeight: "600" },
});
