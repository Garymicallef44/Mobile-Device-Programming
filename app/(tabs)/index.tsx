import { GetUserTownAndLocation, UserLocation } from '@/app/backend/UserLocationService';
import { garageImages } from '@/components/garageImages';
import Navbar from '@/components/navbar';
import { useNavigation } from "@react-navigation/native";
import * as Notifications from 'expo-notifications';
import { addDoc, collection, GeoPoint, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from 'react';
import { FlatList, Image, ImageBackground, LogBox, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from "../../firebaseConfig.js";
import { getName, saveName } from '../../services/storage';
import { getLoginSession, getUserCarDetails } from '../backend/AsyncStorage';
export default function HomeScreen() {

  useEffect(() => {
    registerForPushNotifsAndSaveName();
  }, []);

  const navigation = useNavigation<any>();
  LogBox.ignoreAllLogs();


  useEffect(() => {
    // Run account check
    const check = async () => {
      // check if there is existing session
      const session = await getLoginSession();
      // If no session 
      if (!session) {
        // Navigate to the login page
        navigation.navigate("Login");
        return;
      }

      // Get user car details
      const car = await getUserCarDetails();

      // If no car details have been entered
      if (!car) {

        // Navigate to car details page
        navigation.navigate("garage");
        return;
      }

    }
    check();
  }, []);

  // Service Type
  type Service = {
    Price: number;
    RequireGarage: boolean;
  };

  // ServiceList type
  type ServicesList = {
    [serviceName: string]: Service;
  };

  // Garage type
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
    Services: ServicesList;
    Town: string;
  };

  // Garages type for array
  type Garages = {
    garages: Garage[];
  }

  // User location state
  const [userLoc, setUserLoc] = useState<UserLocation | null>();
  // Garages retrieved state
  const [garages, setGarages] = useState<Garage[]>([]);



  const SERVICE_KEYWORDS: Record<string, string> = {
    "Car Wash": "wash",
    "Tyre Change": "tyre",
    "Towing": "tow"
  };

  // Quick services media mapper for logo
  const quickServices = [
    { id: 0, name: "Car Wash", src: require("../../MediaSources/Symbols/car-wash.png") },
    { id: 1, name: "Tyre Change", src: require("../../MediaSources/Symbols/tyrechange.png") },
    { id: 2, name: "Towing", src: require("../../MediaSources/Symbols/towing.png") }
  ]


  // Calculate garage distance from user
  const calculateGarageDistance = (gLatitude: number, gLongitude: number): string => {
    if (!userLoc) return "Distance unavailable";

    // Harvensine Equation

    const R = 6371; // km
    const toRad = (x: number) => (x * Math.PI) / 180;

    const dLat = toRad(userLoc.coords.lat - gLatitude);
    const dLon = toRad(userLoc.coords.long - gLongitude);


    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(userLoc.coords.lat)) * Math.cos(toRad(gLatitude)) * Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;
    return `${distance.toFixed(1)} km away`;
  }
  
  // Retrieve nearest garage to user
  const findNearestGarageForService = (serviceName: string) => {
    // If there is no user location or garages retrieved from DB, return nothing.
    if (!userLoc || garages.length === 0) return null;

    // Search based on service keywords
    const keyword = SERVICE_KEYWORDS[serviceName];
    // if no keywords return nothing
    if (!keyword) return null;

    // Filter garage based on keywords
    const matching = garages.filter(g => {
      return Object.keys(g.Services).some(k => k.toLowerCase().includes(keyword));
    });

    // If there are no garages that match the filter
    if (matching.length === 0) return null;

    let nearest = null;
    let nearestDist = Number.MAX_VALUE;

    for (const g of matching) {
      const dist = distance(
        userLoc.coords.lat,
        userLoc.coords.long,
        g.Coordinates.latitude,
        g.Coordinates.longitude
      );
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = g;
      }
    }

    return nearest;
  };

  // raw distance calculation
  const distance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const toRad = (v: number) => (v * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };


  // API Caller to retrieve garages from firestore
  useEffect(() => {

    // If there is no user location, return nothing
    if (!userLoc) {
      return;
    }

    // Query Database
    const querySnapshot = async () => {
      // Create DB Query
      const dbQ = query(
        collection(db, "serviceGarages"))

      // Request db for query
      const querySnapshot = await getDocs(dbQ);
      const garages: Garage[] = [];
      
      // Push each retrieved garage
      if (querySnapshot) {
        querySnapshot.forEach((doc) => {
          // Parse retrieved data as a Garage type
          garages.push(doc.data() as Garage);
        });
      }
      // Set garage state
      setGarages(garages);
    }

    // Call query
    querySnapshot();
  }, [userLoc])

  // Retrive user's location details
  useEffect(() => {
    let loc;
    const retrieveUserLocation = async () => {
      loc = await GetUserTownAndLocation();
      // console.log(`Retrieved loc ${loc?.town.city}`)
      setUserLoc(loc);
    }


    retrieveUserLocation();
  }, [])

  // Check if user is logged in
  useEffect(() => {
    const checkLogin = async () => {
      const loggedIn: boolean = await getLoginSession();
      if (!loggedIn) {
        navigation.setOptions({
          headerBackVisible: false,
        });
        // navigation.navigate("Login");
      }
    }

    checkLogin();
  }, [])

  async function registerForPushNotifsAndSaveName() {
    // Get notifications permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
  
    let finalStatus = existingStatus;

    // If permissions aren't granted
    if (existingStatus !== "granted") {
      // Request for permission
      const { status } = await Notifications.requestPermissionsAsync();
  
      finalStatus = status;
    }
    // If the final status isn't granted
    if (finalStatus !== "granted") {
      // Return nothing
      return null;
    }

    const token = ((await Notifications.getExpoPushTokenAsync()).data);

    // Define query for device with token
    let q = query(collection(db, "devices"), where("token", "==", token));

    // If no device exists in the db
    if ((await getDocs(q)).empty) {
      // Create document in db with device token
      await addDoc(collection(db, "devices"), {
        token: token
      });
    }
    // Define query again
    q = query(collection(db, "devices"), where("token", "==", token));
    // Retrieve doc
    let docs = await getDocs(q);

    saveName({ name: docs.docs[0].id });
    // console.log((await getName())[0].name);
    return (await getName())[0].name;
  }

  return (
    <View>
      <Navbar />
      <FlatList
        style={{ backgroundColor: 'white' }}
        data={garages}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListHeaderComponent={
          <>

            <View style={{ paddingTop: 90 }} />

            <ImageBackground
              source={require('../../MediaSources/Backgrounds/quickservicebg.jpg')}
              resizeMode="cover"
              style={styles.quickServicesContainer}
            >
              <Text style={styles.smallTitle}>Quick Service</Text>

              <FlatList
                data={quickServices}
                numColumns={3}
                scrollEnabled={false}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.quickServiceOption}
                    onPress={() => {
                      const nearest = findNearestGarageForService(item.name);
                      if (!nearest) return alert('No garage nearby.');
                      navigation.navigate('StorePage', { garage: nearest });
                    }}
                  >
                    <Image style={styles.quickServiceOptionImage} source={item.src} />
                    <Text>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </ImageBackground>

            <View style={{ margin: 10 }}>
              <Text style={{ fontSize: 35, fontWeight: '800' }}>
                Available Nearby
              </Text>
              <Text style={{ fontWeight: 900, fontSize: 15 }}>Based on your location.</Text>
              <Text style={{ fontWeight: 900, fontSize: 15 }}>Your Current Town: {userLoc ? userLoc.town.city : ''} </Text>
            </View>
          </>
        }
        renderItem={({ item: garage }) => (
          <TouchableOpacity
            style={styles.serviceContainer}
            onPress={() => navigation.navigate('StorePage', { garage })}
          >
            <Image
              style={styles.servicesImage}
              source={garageImages[garage.Id]}
            />

            <View style={styles.serviceInfo}>
              <Text style={{ fontSize: 22, fontWeight: '900' }}>
                {garage.Name}
              </Text>

              <Text>{garage.Town}{garage.ElectricService ? <Text style={{ "color": "blue" }}> • Electric Service </Text> : null} </Text>
              <Text style={{ fontWeight: 900 }}></Text>

              <Text numberOfLines={2}>
                {Object.keys(garage.Services).slice(0, 3).join(' | ')}
              </Text>

              <Text style={{ fontWeight: '800' }}>
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchBarContainer: {
    width: "100%",
    height: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  searchBar: {
    width: '75%',
    height: 60,
    color: 'black',
    gap: 5,
    backgroundColor: '#F9F9F9',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 10,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  quickServices: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    gap: 5,
  },
  quickServicesContainer: {
    height: 250,
    padding: 16.5,
    backgroundColor: 'lightgray',
    backgroundSize: '105%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 10,
  },
  smallTitle: {
    fontSize: 30,
    fontWeight: '600',
    letterSpacing: 2,
    color: 'white',
  },
  quickServiceOption: {
    margin: 10,
    backgroundColor: '#FFBD71',
    width: '27.5%',
    height: 110,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
  },
  quickServiceOptionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  quickServiceOptionImage: {
    width: '80%',
    height: '60%'
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  servicesContainer: {
    height: 100,
    overflowY: 'scroll',
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    color: 'black',
    margin: 10,
  },
  servicesContent: {
    marginTop: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    width: '90%',
    alignSelf: 'center'
  },
  serviceContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: -999,
    height: 150,
    backgroundColor: '#f2f2f2f2',
    borderRadius: 10,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    padding: 4,
    marginBottom: 10,
    gap: 0
  },

  servicesImage: {
    width: '40%',
    height: '90%',
    borderRadius: 20,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 10,
  },
  serviceInfo: {
    display: 'flex',
    flexDirection: 'column',
    padding: 10,
    width: '60%'

  }
});