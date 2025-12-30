
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import HistoryCard from "../../components/ui/historyCard";
import { getItems, HistoryInstance } from "../../services/storage";
let counter = 0;
export default function HistoryPage(){

    const [history, setHistory] = useState<HistoryInstance[]>([]);
    // saveItem({name:"hello",garageName:"Hi",date:new Date(),location:{city:"Null",country:"Null"},price:0});  
    //TODO: Load from firebase
    
    useEffect(()=>{
    getItems().then(data =>{
      if (data) setHistory(data);
    });
    },[]);
    // let instances:HistoryInstance[] = [{id:5,name:"Tire Replacement",garageId:2,date:new Date(),location:{city:"Siggiewi",country:"Malta"}},{id:5,name:"Oil Change",garageId:3,date:new Date(),location:{city:"Sta. Venera",country:"Malta"}},{id:5,name:"Makeover",garageId:5,date:new Date(),location:{city:"Siggiewi",country:"Malta"}},{id:5,name:"Tire Replacement",garageId:2,date:new Date(),location:{city:"Siggiewi",country:"Malta"}},{id:5,name:"Oil Change",garageId:3,date:new Date(),location:{city:"Sta. Venera",country:"Malta"}},{id:5,name:"Makeover",garageId:5,date:new Date(),location:{city:"Siggiewi",country:"Malta"}},{id:5,name:"Tire Replacement",garageId:2,date:new Date(),location:{city:"Siggiewi",country:"Malta"}},{id:5,name:"Oil Change",garageId:3,date:new Date(),location:{city:"Sta. Venera",country:"Malta"}},{id:5,name:"Makeover",garageId:5,date:new Date(),location:{city:"Siggiewi",country:"Malta"}}]; 
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
      
      
            
      {history.map((item)=>(
        <HistoryCard
        key={counter}
        
        garageName={item.garageName}
        hisName={item.name}
        date={item.date}
        location={item.location}
        />

      ))}
    </View>
    </ScrollView>
  );
}