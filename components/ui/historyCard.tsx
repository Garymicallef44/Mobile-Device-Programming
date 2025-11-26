import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
type HistoryCardProps={
    id:number,
    hisName:string,
    garageId:number,
    date:Date,
    location:{city:string,country:string}
}
export default function HistoryCard({id,hisName,garageId,date,location}:HistoryCardProps){
    return(<View style={styles.item}>
        <Text style={styles.itemText}>
            {hisName} {date.toLocaleDateString("en-UK")} 
        </Text>
        <View style={styles.row}>
        <MaterialIcons name="location-on" size={20}/>
        <Text style={styles.locationText}>{location.city}, {location.country}</Text></View>
    </View>);
}
const styles = StyleSheet.create({
    item:{
        marginTop:10,
        marginBottom:10,
        borderWidth:1,
        borderColor:"#ccc",
        borderRadius:10,
        paddingLeft:7,
        paddingBottom:6
    },
    itemText:{
        
        fontSize:20
    },
    locationText:{
        fontSize:16
    },
    row:{
        flexDirection: "row", // make children inline
    alignItems: "center", // vertically center icon and text
    marginTop: 5,
    }
})