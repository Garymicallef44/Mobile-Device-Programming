import { RouteProp, useRoute } from "@react-navigation/native";
import { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";


type Garage = {
  Coordinates: any,
  Description: string,
  ElectricService: boolean,
  Id: number,
  Latitutde: number,
  Longitude: number,
  Location: string,
  Name: string,
  Rating: number,
  Services: string[],
  Town: string
};

type ServicePageRouteParams = {
  StorePage: {
    garage: Garage;
  };
};

export default function ServicePage() {
  const route = useRoute<RouteProp<ServicePageRouteParams, "StorePage">>();

  const { garage } = route.params; 

  console.log("Opened garage:", garage);
  const [selected, setSelected] = useState<string | null>(null);

  const services = [
    { id: "oil", name: "Oil Change", price: "€99.99" },
    { id: "tyre", name: "Tyre Change (Fitting)", price: "€24.99" },
    { id: "engine", name: "Engine Servicing", price: "€24.99" },
  ];

  const toggleSelect = (id: string) => {
    setSelected((prev) => (prev === id ? null : id));
  };

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: "https://via.placeholder.com/600x300.png" }}
        style={styles.headerImage}
      />

      <View style={styles.section}>
        <Text style={styles.title}>Name</Text>
        <Text style={styles.subtitle}>Details</Text>
        <Text style={styles.address}>Address</Text>

        <Text style={styles.heading}>Services Offered</Text>
        <Text style={styles.description}>
          Brake Repair, Battery replacements, Engine Diagnostics, Oil Change,
          General repairs and electronic installations.
        </Text>

        <Text style={styles.heading}>Garage Info</Text>
        <Text style={styles.description}>
          Trusted local garage specialized in quick, affordable repairs.
          Certified mechanics with over 10 years experience.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Select Services</Text>

        {services.map((s) => {
          const isSelected = selected === s.id;
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
                {s.price}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.totalBar}>
        <Text style={styles.totalText}>Total</Text>
        <Text style={styles.totalAmount}>{selected ? services.find(s => s.id === selected)?.price : "€0.00"}</Text>
      </View>

      <TouchableOpacity style={styles.orderButton}>
        <Text style={styles.orderButtonText}>Order Service</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerImage: {
    width: "100%",
    height: 200,
  },
  section: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
  },
  address: {
    fontSize: 14,
    color: "#333",
    marginTop: 4,
  },
  heading: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: "#444",
  },
  serviceItem: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#f2f2f2",
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedItem: {
    backgroundColor: "#f5a623",
  },
  serviceText: {
    fontSize: 16,
  },
  priceText: {
    fontSize: 16,
    fontWeight: "600",
  },
  selectedText: {
    color: "white",
  },
  totalBar: {
    borderTopWidth: 1,
    borderColor: "#ddd",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalText: {
    fontSize: 18,
    fontWeight: "600",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "600",
  },
  orderButton: {
    backgroundColor: "#f5a623",
    padding: 16,
    margin: 16,
    borderRadius: 30,
    alignItems: "center",
  },
  orderButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
