import AsyncStorage from "@react-native-async-storage/async-storage";
export type HistoryInstance = {
        name:string,
        garageName:string,
        date:Date,
        
        price: number
    }
export type Name = {
    name:string
}
export const saveItem = async(item: HistoryInstance)=>{
    try {
        const existingData = await AsyncStorage.getItem("@history");
        const currentHistory :HistoryInstance[] = existingData ?JSON.parse(existingData):[];
        currentHistory.unshift(item);
        const historyStr = JSON.stringify(currentHistory);
        await AsyncStorage.setItem('@history',historyStr);
    }catch(e){
        console.log("Fail: "+ e);
    }
}
export const getItems = async () =>{
    try{
        const existingData = await AsyncStorage.getItem('@history');
        
        return existingData ?JSON.parse(existingData):[];
    }catch(e){
        console.log("Fail: "+e);
        return [];
    }
}
export const saveName = async(item: Name)=>{
    try {
        const existingData = await AsyncStorage.getItem("@name");
        const currentName = existingData ?JSON.parse(existingData):[];
        currentName.unshift(item);
        const nameStr = JSON.stringify(currentName);
        await AsyncStorage.setItem('@name',nameStr);
    }catch(e){
        console.log("Fail: "+ e);
    }
}
export const getName = async () =>{
    try{
        const existingData = await AsyncStorage.getItem('@name');
        
        return existingData ?JSON.parse(existingData):'';
    }catch(e){
        console.log("Fail: "+e);
        return '';
    }
}