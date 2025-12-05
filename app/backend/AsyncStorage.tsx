import AsyncStorage from "@react-native-async-storage/async-storage";


export type UserCarDetails = {
    model : string,
    vNumber: string,
    detail: string,
    engineType: string,
    // due to engine type
    fuelType: string | null,
}   




export async function saveUserCarDetails(body: UserCarDetails){
    // Save details on async storage

    console.log("saving details")
    await AsyncStorage.setItem("details", JSON.stringify(body));

    // Get details
    const details = await AsyncStorage.getItem("details");
    // Parse details
    const data = details ? JSON.parse(details) : null;

    console.log(`${data.model}, ${data.engineType}, ${data.fuelType}`)
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