import * as Location from 'expo-location';

export async function GetUserLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission denied 💀');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      console.log(location);

  return null;
}
