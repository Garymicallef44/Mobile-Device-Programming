
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import HistoryCard from "../../components/ui/historyCard";
export default function HistoryPage(){
    type HistoryInstance = {
        id:number,
        name:string,
        garageId:number,
        date:Date,
        location:{city:string, country:string}
    }
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