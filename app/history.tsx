
import Navbar from "@/components/navbar";
import { useFocusEffect } from "@react-navigation/native";
import { Stack } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import HistoryCard from "../components/ui/historyCard";
import { getItems, HistoryInstance } from "../services/storage";
export default function HistoryPage() {



  const [items, setItems] = useState([]);
  useFocusEffect(useCallback(() => {

    const loadData = async () => {

      const data = await getItems();
      setItems(data);
    };
    loadData();
  }, []));

  //load from firebase
  // we want to create a list of history cards
  return (
    <>
      <Navbar />
      <ScrollView>

        <Stack.Screen
          options={{
            title: "History",
            headerBackTitle: "Back",
          }}
        />

        <View style={{
          paddingTop: 70,
          paddingLeft: 15,
          paddingRight: 15
        }}>

          <Text style={{ fontSize: 30, textAlign: "center", fontWeight: 700 }}>Servify</Text>



          {items.map((item: HistoryInstance, index: number) => (
            <HistoryCard
              key={index}

              garageName={item.garageName}
              hisName={item.name}
              date={new Date(item.date)}

              price={item.price}
            />

          ))}
        </View>
      </ScrollView>
    </>
  );
}