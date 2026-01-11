
// This will be used to  retrieve user locations and define functions related to
// user location


import * as Location from 'expo-location';


// Town Information Type 
export type TownInfo = {
   city : string ,
   country: string, 
   district: string, 
   isoCountryCode: string, 
   name: string, 
   postalCode: string, 
   region: string, 
   street: string, 
   streetNumber: string, 
   subregion: string,  
   timezone: string
  }

// User location type
export type UserLocation = {
  town : TownInfo,
  coords : {
    lat : number,
    long : number
  }
}

// Coordinates type
export type Coordinates = {
  latitude : number,
  longitude : number
}


// Retrieves User GPS Location
export async function GetUserLocation() {
  
  // Request permissions from user to access location.
  let { status } = await Location.requestForegroundPermissionsAsync();
  // Check if permission granted
  if (status !== 'granted') {
    console.log('Permission denied');
    return;
  }
  // Get user coordinate position
  let location = await Location.getCurrentPositionAsync({accuracy: Location.Accuracy.BestForNavigation});

  return location;
}


// Calculates distance between user and garage
export function calculateGarageUserDistance(userLoc : Coordinates, garageLoc : Coordinates){

  // Implements Harversine Formula

  // Earth radius
  const R = 6371; // km
  // Converts input to radians
  const toRad = (x: number) => (x * Math.PI) / 180;

  // Calculate difference between user & garage latitude, longitude.
  const dLat = toRad(userLoc.latitude - garageLoc.latitude);
  const dLon = toRad(userLoc.longitude - garageLoc.longitude);

  // Calculate with equation
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(userLoc.latitude)) * Math.cos(toRad(garageLoc.latitude)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Return result
  return R * c;
}

// Retrieves town and street given coordinates
export async function GetTownAndStreet(latitude: number, longitude: number){
    // Retrieve information
    const res = await Location.reverseGeocodeAsync({
      latitude: latitude,
      longitude: longitude
    })


    // If info retrieved, return stringified info
    if (res.length > 0 ) {
      const place = res[0];
      return `${place.street}, ${place.city}`
    }

}

// Retrieves user town and coordinate locatoin
export async function GetUserTownAndLocation(){
  // Request permission from user to get location
  let { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== 'granted') {
      console.log('Permission denied');
      return null;
  }
  // Get user location
  let location = await Location.getCurrentPositionAsync({accuracy: Location.Accuracy.BestForNavigation});
  // null check
  if (!location){
    return null;
  }
  // Retrieve user town
  let userTown = await Location.reverseGeocodeAsync({
    latitude: location.coords.latitude,
    longitude : location.coords.longitude
  })

  // Parse results as UserLocation
  let results : UserLocation = {
    town : userTown[0] as TownInfo,
    coords : {
      lat : location.coords.latitude,
      long : location.coords.longitude
    }

  }
  // Return user location
  return results;



}
