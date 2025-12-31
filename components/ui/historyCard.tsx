import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type HistoryCardProps={
    hisName:string,
    garageName:string,
    date:Date,
    location:{city:string,country:string}
    price:number
}
export default function HistoryCard({hisName,garageName,date,location,price}:HistoryCardProps){
    return(<View style={styles.item}>
        <View style={styles.row}>
            <Text style={styles.itemText}>
                {hisName} 
            </Text>
        </View>
        <View style={styles.row}>
            <MaterialIcons name="schedule" size={20} style={{paddingRight:4}}/>
            <Text style={styles.locationText}>{date.toLocaleDateString("en-UK")} </Text>
        </View>
        <View style={styles.row}>
            <MaterialIcons name="build" size={17} style={{marginLeft:3}}></MaterialIcons>
            <Text style={styles.garageText}>{garageName}</Text>
        </View>
        <View style={styles.row}>
        <MaterialIcons name="location-on" size={20}/>
        <Text style={styles.locationText}>{location.city}, {location.country}</Text></View>
        <View style={styles.row}>
            <MaterialIcons name="monetization-on"/>
            <Text style={styles.locationText}> €{price}</Text></View>
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
    marginTop: 10,
    
    },
    garageText:{
        fontSize:15,
        marginLeft:5
    }
})