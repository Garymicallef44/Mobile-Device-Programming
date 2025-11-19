import * as Location from 'expo-location';

export type UserLocation = {
  town : object,
  coords : {
    lat : number,
    long : number
  }
}

export async function GetUserLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission denied');
        return;
      }
      let location = await Location.getCurrentPositionAsync({accuracy: Location.Accuracy.BestForNavigation});
      console.log(location);
      return location;
}


export async function GetUserTownAndLocation(){
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
        console.log('Permission denied');
        return null;
    }

    let location = await Location.getCurrentPositionAsync({accuracy: Location.Accuracy.BestForNavigation});

    if (!location){
      return null;
    }
    let userTown = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude : location.coords.longitude
    })
    console.log(userTown[0])

    let results : UserLocation = {
      town : userTown[0],
      coords : {
        lat : location.coords.latitude,
        long : location.coords.longitude
      }

    }

    return results;



}
