import Navbar from '@/components/navbar';
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from 'react';
import { FlatList, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from "../../firebaseConfig";

export default function HomeScreen() {


  const [garages, setGarages] = useState<any[]>([]);


  const quickServices = [
    {id: 0, name: "Car Wash", src: require("../../MediaSources/Symbols/car-wash.png")},
    {id: 1, name: "Tyre Change", src: require("../../MediaSources/Symbols/tyrechange.png")},
    {id: 2, name: "Towing", src: require("../../MediaSources/Symbols/towing.png")}
    
  ]

  // API Caller to retrieve garages from firestore
  useEffect(() => {

    const querySnapshot = async () => {
      const querySnapshot = await getDocs(collection(db, "serviceGarages"));
      const garages: any[] = [];
      querySnapshot.forEach((doc) => {
        garages.push(doc.data());
      });
      
      setGarages(garages);
    }

    querySnapshot();
  }, [])


  return (
        <>
          <Navbar />
          <View className={"search-bar-section"}>

          </View>
          <ImageBackground source={require('../../MediaSources/Backgrounds/quickservicebg.png')}className={"quick-services-section"} style={styles.quickServicesContainer}>
              <Text style={styles.smallTitle}>Quick Service</Text>
              <FlatList numColumns={4} contentContainerStyle={{alignItems:'center', justifyContent: 'center', width: '100%'}} style={styles.quickServices} data={quickServices}
              keyExtractor={(item) => item.id.toString()} renderItem={({ item }) => 
                <TouchableOpacity style={styles.quickServiceOption}>
                    <Image resizeMode={"contain"} style={styles.quickServiceOptionImage} source={item.src} />
                    <Text style={styles.quickServiceOptionText}>{item.name}</Text>
                </TouchableOpacity>}
              />
          </ImageBackground>
          <View>
            { garages.map((garage, index) => (
              <View key={index} style={styles.test}>
                <Text>{garage.Name}</Text>
                <Text>Hello</Text>
              </View>
            )) }  

          </View>
        
        </>


  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    width: '100%',
    height: 250,
    padding: 16.5,
    backgroundColor: 'lightgray',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
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

  test:{
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 290,
    width: '100%',
    backgroundColor: 'lightblue',
  }
});
