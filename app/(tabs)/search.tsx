import { calculateGarageUserDistance, GetUserTownAndLocation, UserLocation } from '@/app/backend/UserLocationService';
import { useNavigation } from "@react-navigation/native";
import { collection, GeoPoint, getDocs, query } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { db } from "../../firebaseConfig";

export default function SearchPage() {
  type Garage = {
    Coordinates: GeoPoint,
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

  const [userLoc, setUserLoc] = useState<UserLocation | null>(null);
  const [garages, setGarages] = useState<Garage[]>([]);
  const [queryText, setQueryText] = useState("");

  const navigation = useNavigation<any>();

  const garageImages: Record<number, any> = {
    1: require("../../MediaSources/AutoShops/1.jpg"),
    2: require("../../MediaSources/AutoShops/2.jpg"),
  };

  useEffect(() => {
    const loadLoc = async () => {
      const loc = await GetUserTownAndLocation();
      setUserLoc(loc);
    };

    loadLoc();
  }, []);

  useEffect(() => {
    if (!userLoc) return;

    const loadGarages = async () => {
      const dbQ = query(collection(db, "serviceGarages"));
      const snap = await getDocs(dbQ);

      const results: Garage[] = [];
      snap.forEach(doc => results.push(doc.data() as Garage));

      setGarages(results);
    };

    loadGarages();
  }, [userLoc]);

  const filtered = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    if (!q) return garages;

    return garages.filter(g =>
      g.Name.toLowerCase().includes(q) ||
      g.Town.toLowerCase().includes(q) ||
      Object.keys(g.Services).join(" ").toLowerCase().includes(q)
    );
  }, [queryText, garages]);

  return (
  <View style={{ flex: 1, backgroundColor: "white", padding: 16 }}>

    {/* TITLE ON TOP */}
    <View style={{ paddingTop: 60, paddingBottom: 10 }}>
      <Text
        style={{
          textAlign: "center",
          fontSize: 28,
          fontWeight: "700",
          color: "black"
        }}
      >
        Servify
      </Text>
    </View>

    {/* SEARCH BAR */}
    <TextInput
      style={styles.searchInput}
      placeholder="Search for a garage or service"
      placeholderTextColor="#666"
      value={queryText}
      onChangeText={setQueryText}
    />

    {/* RESULTS */}
    <ScrollView contentContainerStyle={{ paddingVertical: 20, gap: 15 }}>
      {filtered.map((garage, index) => (
        <TouchableOpacity
          key={index}
          style={styles.card}
          onPress={() => navigation.navigate("StorePage", { garage })}
        >
          <Image style={styles.image} source={garageImages[garage.Id]} />

          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{garage.Name}</Text>
            <Text>{garage.Town}</Text>
            <Text numberOfLines={1}>{Object.keys(garage.Services).slice(0, 3).join(" • ")}</Text>

            <Text style={{ fontWeight: "700" }}>
              {userLoc
                ? `${calculateGarageUserDistance(
                    { latitude: userLoc.coords.lat, longitude: userLoc.coords.long },
                    { latitude: garage.Coordinates.latitude, longitude: garage.Coordinates.longitude }
                  ).toFixed(1)} km away`
                : "Distance unavailable"}
            </Text>
          </View>
        </TouchableOpacity>
      ))}


      {filtered.length === 0 && (
        <Text style={{ textAlign: "center", marginTop: 50 }}>
          No results found
        </Text>
      )}
    </ScrollView>

  </View>
);

}

const styles = StyleSheet.create({
  searchInput: {
    width: "100%",
    backgroundColor: "#f3f3f3",
    padding: 12,
    borderRadius: 12,
    fontSize: 16
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    padding: 10,
    gap: 10,
    alignItems: "center"
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 12    
  },
  title: {
    fontSize: 20,
    fontWeight: "800"
  }
});