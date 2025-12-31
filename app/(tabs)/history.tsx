
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import HistoryCard from "../../components/ui/historyCard";
import { getItems, HistoryInstance } from "../../services/storage";
export default function HistoryPage(){
    
    
    
    const [items, setItems] = useState([]);
    useFocusEffect(useCallback(()=>{
      
    const loadData = async ()=>{
      
        const data = await getItems();
        setItems(data);
    };
    loadData();
  },[]));
    
    //load from firebase
    // we want to create a list of history cards
     return (
      <ScrollView>
      
      
      
    <View style={{
      paddingTop:30,
      paddingLeft:15,
      paddingRight:15
    }}>
      
      <Text style={{fontSize:30,textAlign:"center", fontWeight:700}}>Servify</Text>
      
      
            
      {items.map((item:HistoryInstance,index:number)=>(
        <HistoryCard
        key={index}
        
        garageName={item.garageName}
        hisName={item.name}
        date={new Date(item.date)}
        location={item.location}
        price={item.price}
        />
        
      ))}
    </View>
    </ScrollView>
  );
}