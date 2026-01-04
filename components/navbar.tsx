import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function Navbar() {
    const [menuVisible, setMenuVisible] = useState(false);
    const slideAnimation = useRef(new Animated.Value(-Dimensions.get('window').width)).current;
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const navigateTo = (route: string) => {
        toggleMenu();
        router.push(route as any);
    };

    const toggleMenu = () => {
        if (menuVisible) {
            Animated.timing(slideAnimation, {
                toValue: -Dimensions.get('window').width,
                duration: 300,
                useNativeDriver: true,
            }).start(() => setMenuVisible(false));
        } else {
            setMenuVisible(true);
            Animated.timing(slideAnimation, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    };

    return(
        <>
            <View style={[styles.navbar, { paddingTop: insets.top }]}>
                <TouchableOpacity style={styles.navButton} onPress={toggleMenu}>
                    <Image source={require("../MediaSources/Symbols/Icons/Menu.png")} />
                </TouchableOpacity>
                <Text style={styles.title}>Servify</Text>
            </View>

            {menuVisible && (
                <>
                    <TouchableOpacity 
                        style={styles.overlay} 
                        activeOpacity={1} 
                        onPress={toggleMenu}
                    />
                    
                    <Animated.View 
                        style={[
                            styles.menu,
                            { transform: [{ translateX: slideAnimation }] }
                        ]}
                    >
                        <View style={styles.menuHeader}>
                            <Text style={styles.menuTitle}>Menu</Text>
                            <TouchableOpacity onPress={toggleMenu}>
                                <Ionicons name="chevron-back" size={32} color="#000" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.menuBody}>
                            <View style={styles.menuItems}>
                                <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/(tabs)')}>
                                    <Ionicons name="home" size={24} color="#000" style={styles.menuIcon} />
                                    <Text style={styles.menuText}>Home</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => router.push("/garage")}
                                    >
                                    <Ionicons name="car" size={24} color="#000" style={styles.menuIcon} />
                                    <Text style={styles.menuText}>My Garage</Text>
                                </TouchableOpacity>


                                <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/history")}>
                                    <Ionicons name="time" size={24} color="#000" style={styles.menuIcon} />
                                    <Text style={styles.menuText}>Service History</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); Alert.alert("Settings", "Settings page does not currently exist"); }}>
                                    <Ionicons name="settings" size={24} color="#000" style={styles.menuIcon} />
                                    <Text style={styles.menuText}>Settings</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.menuFooter}>
                                <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/(tabs)/account')}>
                                    <Ionicons name="person" size={24} color="#000" style={styles.menuIcon} />
                                    <Text style={styles.menuText}>Account</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Animated.View>
                </>
            )}
        </>
    )
}

const styles = StyleSheet.create({
    navbar:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingBottom: 10,
        fontSize: 20,
        width: '100%',
        backgroundColor: 'white',
        color: '#404040',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        elevation: 1000,
    },
    title:{
        fontSize: 35,
        fontWeight: '900',
        flex: 1,
        textAlign: 'center',
        marginRight: 50,
    },
    navButton:{
       paddingLeft: 15,
       paddingRight: 15,
    },
    overlay:{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 9999,
        elevation: 9999,
    },
    menu:{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '75%',
        height: '100%',
        backgroundColor: 'white',
        zIndex: 9999,
        elevation: 9999,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    menuHeader:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingTop: 60,
        paddingBottom: 40,
    },
    menuTitle:{
        fontSize: 32,
        fontWeight: '900',
        color: '#000',
    },
    menuBody:{
        flex: 1,
        flexDirection: 'column',
    },
    menuContent:{
        flex: 1,
    },
    menuItems:{
        paddingTop: 20,
    },
    menuItem:{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 30,
    },
    menuText:{
        fontSize: 20,
        color:'#000',
        fontWeight: '700',
    },
    menuIcon:{
        marginRight: 15,
    },
    menuFooter:{
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        paddingVertical: 10,
        backgroundColor: 'white',
    }
})