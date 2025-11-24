import * as Location from 'expo-location';

export type UserLocation = {
  town : object,
  coords : {
    lat : number,
    long : number
  }
}

export type Coordinates = {
  latitude : number,
  longitude : number
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


export function calculateGarageUserDistance(userLoc : Coordinates, garageLoc : Coordinates){

  const R = 6371; // km
  const toRad = (x: number) => (x * Math.PI) / 180;

  const dLat = toRad(userLoc.latitude - garageLoc.latitude);
  const dLon = toRad(userLoc.longitude - garageLoc.longitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(userLoc.latitude)) * Math.cos(toRad(garageLoc.latitude)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
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
