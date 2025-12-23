import * as Notifications from 'expo-notifications';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { Alert, Button, StyleSheet, View } from 'react-native';
import { db } from "../../firebaseConfig";
Notifications.setNotificationHandler({
handleNotification: async () => ({
  shouldShowAlert:true,
  shouldPlaySound:true,
  shouldSetBadge:false,
  shouldShowBanner:false,
  shouldShowList:false
}),
});
async function registerForPushNotifications(){
  const {status: existingStatus}= await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted"){
    const {status} = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted"){
    Alert.alert("Failed to Get push token");
    return null;
  }
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  const q = query(collection(db,"devices"),where("token","==",token));
  console.log("Expo Push Token:", token);
  if ((await getDocs(q)).empty){
  await addDoc(collection(db,"devices"),{
    token:token
  });
}
  return token;
}
const sendNotif = async (token : string)=>{
  try{
    await fetch("https://exp.host/--/api/v2/push/send",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        to:token,
        sound:"default",
        title:"Sup",
        body:"your rent is due",
        
      }),
    });
  }catch(err){
    console.error("Error sending notification:",err);
  }
};

export default function App(){
  async function handlePress(){
    
    const token = await registerForPushNotifications();
    if (!token) return;
    console.log(token);
    await sendNotif(token);
    // Alert.alert("notif sent");
  }
  return(
    <View style={styles.button}>
      <Button title="press me"  onPress={handlePress}/>

      
    </View>
    );
}
const styles = StyleSheet.create({
  button:{
    marginTop:50,
  }
})