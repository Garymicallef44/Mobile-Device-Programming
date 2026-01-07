import { garageImages } from "@/components/garageImages";
import { RouteProp, useRoute } from "@react-navigation/native";
import { Stack, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getUserCarDetails } from "./backend/AsyncStorage";


type Service = {
  Price: number;
  RequireGarage: boolean;
};

type ServicesList = {
  [serviceName: string]: Service;
};

const EuroFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'EUR'
})


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
  Services: ServicesList,
  Town: string
};

type ServicePageRouteParams = {
  StorePage: {
    garage: Garage;
  };
};

export default function ServicePage() {
  const route = useRoute<RouteProp<ServicePageRouteParams, "StorePage">>();

  const navigation = useNavigation<any>();

  const [selectedServices, setSelectedServices] = useState<string[]>([]);;

  const [isElectric, setIsElectric] = useState<boolean>(false);
  const { garage } = route.params; 

  const [selected, setSelected] = useState<number[]>([]);

  const services = Object.keys(garage.Services);

  const [price, setPrice] = useState<number>(0);

  const toggleSelect = (p: number, id: number) => {
    if (selected.includes(id)){
      setSelected(prev => prev.filter(x => x !== id))
      setPrice(price - p)
    }else {
      setSelected(prev => [...prev, id])
      setPrice(price + p)
    }

  };

  useEffect(() => {
    const run = async () => {
      const carDetails = await getUserCarDetails();

      if(!carDetails){
        alert("Please enter your car details to proceed with ordering.");
        navigation.navigate("garage");
      }else{
        setIsElectric(carDetails.engineType === "Electric");
      }
    }

    run();
  }, [])
 

 
  return (
    <ScrollView style={styles.container}>
      <Image
        source={garageImages[garage.Id] }
        style={styles.headerImage}
      />
      <Stack.Screen
          options={{
            title: "Store Page",
            headerBackTitle: "Back",
          }}
        />
      <View style={styles.section}>
        <Text style={styles.title}>{garage.Name}</Text>
        <Text style={styles.address}>Address - {garage.Location}, {garage.Town}</Text>


        <Text style={styles.heading}>Garage Info</Text>
        <Text style={styles.description}>
          {garage.Description}
        </Text>
    </View>
     
      <View style={styles.section}>
        <Text style={styles.heading}>Select Services</Text>
         {(isElectric && !garage.ElectricService) ? <Text style={[styles.description, {fontWeight: 900, marginBottom:10}]}>Note: Your electric car may be limited to some services, please check to ensure a correct order placement.</Text> : null}
  
        {services.map((s, i) => {
          let isSelected = selected.includes(i)
          return (
            <TouchableOpacity
              key={i}
              style={[styles.serviceItem, isSelected && styles.selectedItem]}
              onPress={() => toggleSelect(garage.Services[s].Price, i)}
            >
              <Text style={[styles.serviceText, isSelected && styles.selectedText]}>
                {s}
              </Text>
              <Text style={[styles.priceText, isSelected && styles.selectedText]}>
                {EuroFormat.format(garage.Services[s].Price)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.totalBar}>
        <Text style={styles.totalText}>Total</Text>
        <Text style={styles.totalAmount}>{EuroFormat.format(price)}</Text>
      </View>
      <TouchableOpacity
        style={styles.orderButton}
        onPress={() => {
          if (selected.length === 0) {
            alert("Please select at least one service");
            return;
          }

          const selectedServices = selected.map(i => {
            const name = services[i];
            return {
              name,
              ...garage.Services[name],
            };
          });

          navigation.navigate("orderDetails", {
            garage,
            price,
            services: selectedServices,
          });
        }}
      >
        <Text style={styles.orderButtonText}>
          Order Service
        </Text>
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
