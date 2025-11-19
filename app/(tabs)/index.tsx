import { GetUserTownAndLocation, UserLocation } from '@/components/getUserLocation';
import Navbar from '@/components/navbar';
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from 'react';
import { FlatList, Image, ImageBackground, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from "../../firebaseConfig";

export default function HomeScreen() {



  type Garage = {
    Coordinates: number[],
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
  }

  type Garages = {
    garages: Garage[];
  }


  const [userLoc, setUserLoc] = useState<UserLocation | null >();
  const [garages, setGarages] = useState<Garage[]>([]);


  const quickServices = [
    {id: 0, name: "Car Wash", src: require("../../MediaSources/Symbols/car-wash.png")},
    {id: 1, name: "Tyre Change", src: require("../../MediaSources/Symbols/tyrechange.png")},
    {id: 2, name: "Towing", src: require("../../MediaSources/Symbols/towing.png")}
  ]


  const garageImages: Record<number, any> = {
    1 : require(`../../MediaSources/AutoShops/1.jpg`)
  }

  // API Caller to retrieve garages from firestore
  useEffect(() => {

    const querySnapshot = async () => {
      const querySnapshot = await getDocs(collection(db, "serviceGarages"));
      const garages: Garage[] = [];
      querySnapshot.forEach((doc) => {
        
        garages.push(doc.data() as Garage);
      });
      
      setGarages(garages);
    }

    querySnapshot();
  }, [])


  // Retrive user's location details
  useEffect(() => {
    const retrieveUserLocation =  async () => {
      const loc = await GetUserTownAndLocation();
      setUserLoc(loc);
    }

    retrieveUserLocation();
  }, [])

  return (
        <ScrollView style={{backgroundColor: 'white'}}>
          <Navbar />
          <View className={"search-bar-section"} style={styles.searchBarContainer}>
              <View style={styles.searchBar}>
                <TouchableOpacity style={{height: '50%', width: '10%'}}>
                  <Image style={{height: '100%', width: '100%'}}source={require('../../MediaSources/Symbols/Icons/Search.png')}></Image>
                </TouchableOpacity>
                <TextInput style={{color: 'black', width: '80%'}} placeholder='Search for a garage'></TextInput>
              </View>
          </View>
          <ImageBackground source={require('../../MediaSources/Backgrounds/quickservicebg.jpg')} imageStyle={{...StyleSheet.absoluteFillObject, resizeMode: "cover"}} resizeMode="stretch" className={"quick-services-section"} style={styles.quickServicesContainer}>
              <Text style={styles.smallTitle}>Quick Service</Text>
              <FlatList numColumns={4} contentContainerStyle={{alignItems:'center', justifyContent: 'center', width: '100%'}} style={styles.quickServices} data={quickServices}
              keyExtractor={(item) => item.id.toString()} renderItem={({ item }) => 
                <TouchableOpacity style={styles.quickServiceOption}>
                    <Image resizeMode={"contain"} style={styles.quickServiceOptionImage} source={item.src} />
                    <Text style={styles.quickServiceOptionText}>{item.name}</Text>
                </TouchableOpacity>}
              />
          </ImageBackground>
          <View style={styles.servicesContainer}>
            <Text style={{color: 'black', fontSize: 35, fontWeight: 800}}>Available Nearby</Text>
            <Text style={{}}>Based on your car details and location.</Text>
            <Text>Your Current Town: {userLoc ? userLoc.town.city : ""}</Text>
            <View style={styles.servicesContent}> 
                { garages.map((garage, index) => (
                  <View key={index} style={styles.serviceContainer}>
                    <Image style={styles.servicesImage} source={garageImages[garage.Id]}></Image>
                    <View style={styles.serviceInfo}>
                      <Text style={{fontSize: 30, fontWeight: 900}}>{garage.Name}</Text>
                      <Text>{garage.Town}</Text>
                      <Text>{Object.values(garage.Services)}</Text>
                    </View>
                  </View>
                )) }  
            </View>

          </View>
        </ScrollView>
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
    height: 500,
    overflowY: 'scroll',
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    color: 'black',
    margin: 10,
  },
  serviceContainer:{
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
    backgroundColor: '#F6F6F6',
    borderRadius: 10, 
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    gap: 15
  },
  servicesContent:{
      marginTop: 20,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '90%',
      alignSelf: 'center'
  },
  servicesImage:{
    width: '40%',
    height: '90%',
    borderRadius: 20
  },
  serviceInfo:{ 
    display: 'flex',
    flexDirection: 'column'

  }
});
