
import { Text, View } from "react-native";
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
    let instances:HistoryInstance[] = [{id:5,name:"Tire Replacement",garageId:24,date:new Date(),location:{city:"Siggiewi",country:"Malta"}},{id:5,name:"Oil Change",garageId:244,date:new Date(),location:{city:"Sta. Venera",country:"Malta"}},{id:5,name:"Makeover",garageId:244,date:new Date(),location:{city:"Siggiewi",country:"Malta"}}]; 
    //load from firebase
    // we want to create a list of history cards
     return (
        
    <View style={{
        paddingTop:30,
        paddingLeft:15,
        paddingRight:15
    }}>
      <Text
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontSize: 22,
                  fontWeight: "700",
                  marginRight: 28,
                  height:10
                }}
              >
                History
              </Text>
            
      {instances.map((item)=>(
        <HistoryCard
        key={item.id}
        id={item.id}
        garageId={item.garageId}
        hisName={item.name}
        date={item.date}
        location={item.location}
        />
      ))}
    </View>
  );
}