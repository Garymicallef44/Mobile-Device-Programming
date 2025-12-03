import { GetUserTownAndLocation, UserLocation } from "@/app/backend/UserLocationService";
import Navbar from "@/components/navbar";
import { useNavigation } from "@react-navigation/native";
import { collection, GeoPoint, getDocs, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../firebaseConfig";

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  type Garage = {
    Coordinates: GeoPoint;
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

  const [userLoc, setUserLoc] = useState<UserLocation | null>(null);
  const [garages, setGarages] = useState<Garage[]>([]);

  const quickServices = [
    { id: "qs1", name: "Car Wash", src: require("../../MediaSources/Symbols/car-wash.png") },
    { id: "qs2", name: "Tyre Change", src: require("../../MediaSources/Symbols/tyrechange.png") },
    { id: "qs3", name: "Towing", src: require("../../MediaSources/Symbols/towing.png") },
  ];

  const garageImages: Record<number, any> = {
    1: require("../../MediaSources/AutoShops/1.jpg"),
    2: require("../../MediaSources/AutoShops/2.jpg"),
  };

  const calculateGarageDistance = (gLat: number, gLong: number): string => {
    if (!userLoc) return "Distance unavailable";

    const R = 6371;
    const toRad = (x: number) => (x * Math.PI) / 180;

    const dLat = toRad(userLoc.coords.lat - gLat);
    const dLon = toRad(userLoc.coords.long - gLong);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(userLoc.coords.lat)) *
        Math.cos(toRad(gLat)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return `${(R * c).toFixed(1)} km away`;
  };

  // LOAD GARAGES
  useEffect(() => {

    if (!userLoc) return;

    const loadGarages = async () => {
      const q = query(collection(db, "serviceGarages"));
      const snap = await getDocs(q);

      const items: Garage[] = [];
      snap.forEach((doc) => items.push(doc.data() as Garage));

      setGarages(items.filter((g) => g && g.Id != null));
    };

    loadGarages();

  }, [userLoc]);

  // LOAD USER LOCATION
  useEffect(() => {
    const loadLocation = async () => {
      const loc = await GetUserTownAndLocation();
      setUserLoc(loc);
    };

    loadLocation();
  }, []);

  return (
  <View style={{ flex: 1 }}>
    <Navbar />

    <FlatList
      data={garages}
      keyExtractor={(item, index) => (item?.Id ?? index).toString()}
      contentContainerStyle={{ paddingTop: 90, paddingBottom: 40 }}

      ListHeaderComponent={
        <>
          {/* QUICK SERVICE SECTION */}
          <ImageBackground
            source={require("../../MediaSources/Backgrounds/quickservicebg.jpg")}
            style={styles.quickServicesContainer}
            imageStyle={StyleSheet.absoluteFillObject}
          >
            <Text style={styles.smallTitle}>Quick Service</Text>

            <FlatList
              data={quickServices}
              numColumns={4}
              scrollEnabled={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.quickServices}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.quickServiceOption}>
                  <Image
                    resizeMode="contain"
                    style={styles.quickServiceOptionImage}
                    source={item.src}
                  />
                  <Text style={styles.quickServiceOptionText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </ImageBackground>

          {/* NEARBY TITLE */}
          <View style={styles.servicesHeader}>
            <Text style={styles.servicesTitle}>Available Nearby</Text>
            <Text>Based on your car details and location.</Text>
            <Text>Your Current Town: {userLoc ? userLoc.town.city : ""}</Text>
          </View>
        </>
      }

      renderItem={({ item: garage }) => (
        <TouchableOpacity
          style={styles.serviceContainer}
          onPress={() => navigation.navigate("StorePage", { garage })}
        >
          <Image
            style={styles.servicesImage}
            source={garageImages[garage.Id] ?? garageImages[1]}
          />

          <View style={styles.serviceInfo}>
            <Text style={styles.garageName} numberOfLines={2}>
              {garage.Name}
            </Text>
            <Text>{garage.Town}</Text>
            <Text numberOfLines={2}>{garage.Services.slice(0, 3).join(" | ")}</Text>
            <Text style={styles.garageDistance}>
              {calculateGarageDistance(
                garage.Coordinates.latitude,
                garage.Coordinates.longitude
              )}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    />
  </View>
);

}

const styles = StyleSheet.create({
  quickServicesContainer: {
    height: 250,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  smallTitle: {
    fontSize: 30,
    fontWeight: "600",
    color: "white",
    marginBottom: 10,
  },
  quickServices: {
    justifyContent: "center",
    width: "100%",
  },
  quickServiceOption: {
    margin: 10,
    backgroundColor: "#FFBD71",
    width: "25%",
    height: 110,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  quickServiceOptionImage: {
    width: "80%",
    height: "55%",
  },
  quickServiceOptionText: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 5,
  },
  servicesHeader: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  servicesTitle: {
    fontSize: 35,
    fontWeight: "800",
    color: "black",
  },
  serviceContainer: {
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    marginVertical: 10,
    padding: 10,
    marginHorizontal: 16,
  },
  servicesImage: {
    width: 120,
    height: 120,
    borderRadius: 16,
  },
  serviceInfo: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: "center",
  },
  garageName: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 5,
  },
  garageDistance: {
    marginTop: 5,
    fontWeight: "700",
  },
});
