import AsyncStorage from "@react-native-async-storage/async-storage";
// import saveNewCar from "./FirestoreMedium";
export type FuelType = "Petrol" | "Diesel";
export type EngineType = "Electric" | "Gas";

export type UserCarDetails = {
  model: string;
  vNumber: string;
  detail: string;
  engineType: EngineType;
  fuelType: FuelType | null;
};


// Save car details
export async function saveUserCarDetails(body: UserCarDetails){
    // Save details on async storage
    await AsyncStorage.setItem("details", JSON.stringify(body));

    // Get details
    const details = await AsyncStorage.getItem("details");
    // Parse details
    const data = details ? JSON.parse(details) : null;

    console.log(`${data.model}, ${data.engineType}, ${data.fuelType}`)
}

// Assign login session when user signs in successfully
export async function setLoginSession(status: boolean) {
    await AsyncStorage.setItem("hasLoggedIn", JSON.stringify(status));
}

// Check if user login session is active
export async function getLoginSession(){
    // Retrieve value of hasLoggedIn from session storage
    const session = await AsyncStorage.getItem("hasLoggedIn");
    
    if (session === null ){
        return false;
    }
    return true;
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