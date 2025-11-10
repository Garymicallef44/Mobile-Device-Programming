import Navbar from '@/components/navbar';
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { db } from "../../firebaseConfig";

export default function HomeScreen() {


  const [garages, setGarages] = useState<any[]>([]);


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
