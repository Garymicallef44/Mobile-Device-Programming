import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';








export default function Navbar() {
    return(
        <SafeAreaProvider>
            <View style={styles.navbar}>
                <TouchableOpacity style={styles.navButton} onPress={() => {Alert.alert("aye bro")}}>Menu</TouchableOpacity>
                <Text style={styles.title}>Servify</Text>
            </View>
        </SafeAreaProvider>
        
    )
}

const styles = StyleSheet.create({
    navbar:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        height: 110,
        fontSize: 20,
        width: '100%',
        backgroundColor: 'white',
        color: 'black',
    },
    title:{
        fontSize: 30,
        fontWeight: 'bold',
    },
    navButton:{
        backgroundImage: './assets/images/menu-icon.png',
    }
})