import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
 







export default function Navbar() {
    return(
        <SafeAreaProvider>
            <View style={styles.navbar}>
                <TouchableOpacity style={styles.navButton} onPress={() => {Alert.alert("aye bro")}}>
                    <Image source={require("../MediaSources/Symbols/Icons/Menu.png")}>

                    </Image>
                </TouchableOpacity>
                <Text style={styles.title}>Servify</Text>
            </View>
        </SafeAreaProvider>
        
    )
}

const styles = StyleSheet.create({
    navbar:{
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 110,
        fontSize: 20,
        width: '100%',
        backgroundColor: 'white',
        color: '#404040',
    },
    title:{
        fontSize: 35,
        fontWeight: '900',
    },
    navButton:{
       position: 'relative',
       right: 100,
    }
})