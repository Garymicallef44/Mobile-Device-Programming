import AsyncStorage from "@react-native-async-storage/async-storage";
import saveNewCar from "./FirestoreMedium";
export type FuelType = "Petrol" | "Diesel";
export type EngineType = "Electric" | "Gas";

export type UserCarDetails = {
  model: string;
  vNumber: string;
  detail: string;
  engineType: EngineType;
  fuelType: FuelType | null;
};

export async function saveUserId(){
    
}

export async function saveUserCarDetails(body: UserCarDetails){
    // Save details on async storage
    console.log("saving details")

    await saveNewCar()
    await AsyncStorage.setItem("details", JSON.stringify(body));

    // Get details
    const details = await AsyncStorage.getItem("details");
    // Parse details
    const data = details ? JSON.parse(details) : null;

    console.log(`${data.model}, ${data.engineType}, ${data.fuelType}`)
}

export async function setLoginSession() {
    await AsyncStorage.setItem("hasLoggedIn", JSON.stringify(true));
}

export async function getLoginSession() {
    const session = await AsyncStorage.getItem("hasLoggedIn");
    return session ? true : false;
}

// Dummy export to silence route warning - this is not a route file
export default function DummyComponent() { return null; }

export async function getUserCarDetails(){

    // Get details
    const details = await AsyncStorage.getItem("details");
    // Parse details
    const data = details ? JSON.parse(details) : null;

    // Return details as type UserCarDetails
    if (data != null){
        return data as UserCarDetails;
    }       


}