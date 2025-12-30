import AsyncStorage from "@react-native-async-storage/async-storage";
export type HistoryInstance = {
        
        name:string,
        garageName:string,
        date:Date,
        location:{city:string, country:string},
        price: number
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
        
        return existingData!=null ?JSON.parse(existingData):[];
    }catch(e){
        console.log("Fail: "+e)
    }
}