import { GetUserTownAndLocation, UserLocation } from '@/app/backend/UserLocationService';
import { garageImages } from '@/components/garageImages';
import Navbar from '@/components/navbar';
import { useNavigation } from "@react-navigation/native";
import { collection, GeoPoint, getDocs, query } from "firebase/firestore";
import { useEffect, useState } from 'react';
import { FlatList, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from "../../firebaseConfig";
import { getLoginSession, getUserCarDetails } from '../backend/AsyncStorage';
export default function HomeScreen() {
  const navigation = useNavigation<any>();

 

  useEffect(() => {
    console.log("Running account check")
    if(!getUserCarDetails() || !getLoginSession()){
      alert('Please login to an account before browsing.');
    }
    console.log("Running account check - seems to be fine")
  },[]);

  type Service = {
    Price: number;
    RequireGarage: boolean;
  };

  type ServicesList = {
    [serviceName: string]: Service;
  };

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

  type Garages = {
    garages: Garage[];
  }


  const [userLoc, setUserLoc] = useState<UserLocation | null >();
  const [garages, setGarages] = useState<Garage[]>([]);

  const SERVICE_KEYWORDS: Record<string, string> = {
  "Car Wash": "wash",
  "Tyre Change": "tyre",
  "Towing": "tow"
  };


  const quickServices = [
    {id: 0, name: "Car Wash", src: require("../../MediaSources/Symbols/car-wash.png")},
    {id: 1, name: "Tyre Change", src: require("../../MediaSources/Symbols/tyrechange.png")},
    {id: 2, name: "Towing", src: require("../../MediaSources/Symbols/towing.png")}
  ]


  const calculateGarageDistance = (gLatitude : number, gLongitude : number) : string => {
      if (!userLoc) return "Distance unavailable";
      
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

    const findNearestGarageForService = (serviceName: string) => {
    if (!userLoc || garages.length === 0) return null;

    const keyword = SERVICE_KEYWORDS[serviceName];
    if (!keyword) return null;

    const matching = garages.filter(g => {
      return Object.keys(g.Services).some(k => k.toLowerCase().includes(keyword));
    });

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

    if(!userLoc) {
      return;
    }

    
    const querySnapshot = async () => {
      // Define query
      // const dbQ= query(
      //       collection(db, "serviceGarages"),
      //       where('Town', '==', userLoc?.town.city))

      const dbQ= query(
            collection(db, "serviceGarages"))

      const querySnapshot = await getDocs(dbQ);
      const garages: Garage[] = [];
      if (querySnapshot){
        querySnapshot.forEach((doc) => {
          garages.push(doc.data() as Garage);
        });
      }
      console.log(garages);
      setGarages(garages);
    }

    querySnapshot();
  }, [userLoc])

  // Retrive user's location details
  useEffect(() => {
    let loc;
    const retrieveUserLocation =  async () => {
      loc = await GetUserTownAndLocation();
      // console.log(`Retrieved loc ${loc?.town.city}`)
      setUserLoc(loc);
    }
    

    retrieveUserLocation();
  }, [])

  // Check if user is logged in
  useEffect( () => {
    const checkLogin = async () => {
      const loggedIn : boolean = await getLoginSession();
      if (!loggedIn){
        navigation.setOptions({
           headerBackVisible: false,
        });
        // navigation.navigate("Login");
      }
    }

    checkLogin();
  }, [])
  return (
<FlatList
  style={{ backgroundColor: 'white' }}
  data={garages}
  // keyExtractor={(item) => item.Id.toString()}
  contentContainerStyle={{ paddingBottom: 40 }}
  ListHeaderComponent={
    <>
      <Navbar />
      <View style={{ paddingTop: 90 }} />

      <ImageBackground
        source={require('../../MediaSources/Backgrounds/quickservicebg.jpg')}
        imageStyle={{ ...StyleSheet.absoluteFillObject, resizeMode: 'cover' }}
        resizeMode="stretch"
        style={styles.quickServicesContainer}
      >
        <Text style={styles.smallTitle}>Quick Service</Text>

        <FlatList
          data={quickServices}
          numColumns={4}
          scrollEnabled={false}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
          }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.quickServiceOption}
              onPress={() => {
                const nearest = findNearestGarageForService(item.name);

                if (!nearest) {
                  alert('No garage offers this service nearby.');
                  return;
                }

                navigation.navigate('StorePage', { garage: nearest });
              }}
            >
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

      <View style={styles.servicesContainer}>
        <Text style={{ color: 'black', fontSize: 35, fontWeight: '800' }}>
          Available Nearby
        </Text>
        <Text>Based on your car details and location.</Text>
        <Text>Your Current Town: {userLoc ? userLoc.town.city : ''}</Text>
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
        <Text
          style={{ fontSize: 25, fontWeight: '900' }}
          numberOfLines={2}
        >
          {garage.Name}
        </Text>

        <Text>{garage.Town}{garage.ElectricService ? <Text style={{color: "blue"}}> {'\u2022'} Electric Service </Text> : null} {`\n`}</Text>

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

  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchBarContainer:{
    width: "100%",
    height: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  searchBar:{
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
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 10,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  quickServices:{
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
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 10,
  },
    smallTitle:{
    fontSize: 30,
    fontWeight: '600',
    letterSpacing: 2,
    color: 'white',
  },
  quickServiceOption:{
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
  quickServiceOptionText:{
    fontSize: 16,
    fontWeight: '600',
  },
  quickServiceOptionImage:{
    width: '90%',
    height: '60%'
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  servicesContainer:{
    height: 100,
    overflowY: 'scroll',
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    color: 'black',
    margin: 10,
  },
  servicesContent:{
      marginTop: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      width: '90%',
      alignSelf: 'center'
  },
  serviceContainer:{
    alignItems: 'center',
    justifyContent: 'center',
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

  servicesImage:{
    width: '40%',
    height: '90%',
    borderRadius: 20,
    shadowColor: 'black',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 10,
  },
  serviceInfo:{ 
    display: 'flex',
    flexDirection: 'column',
    padding: 10,
    width: '60%'

  }
});