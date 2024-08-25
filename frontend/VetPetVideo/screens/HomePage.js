import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { AntDesign, MaterialIcons, SimpleLineIcons, FontAwesome6 } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UpdateUserDetails from '../components/UpdateUserDetails/UpdateUserDetails';
import HeaderLogo from '../components/ui/Headers/HeaderLogo';
import VetProfile from '../components/VetProfile/VetProfile';
import VideoCallsList from '../components/VideoCalls/VideoCallsList';

const LogoutScreen = () => <View style={styles.screenContainer}><Text>Logout Screen</Text></View>;

const navigateAndSetActiveItem = (routeName, navigation, setActiveItem) => {
    setActiveItem(routeName);
    navigation.navigate(routeName, { reset: true });
};

const CustomDrawerContent = (props) => {
    const navigation = useNavigation();
    const { setNotificationCount, activeItem, setActiveItem } = props;

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('vetId');
            navigation.navigate('Login');
        } catch (error) {
            Alert.alert("שגיאת יציאה", "היציאה נכשלה. בבקשה נסה שוב.");
        }
    };

    const handleNavigateAndSetActiveItem = (routeName) => {
        if (routeName === 'Notifications') {
            setNotificationCount(0);
        }
        navigateAndSetActiveItem(routeName, navigation, setActiveItem);
    };

    return (
        <DrawerContentScrollView {...props} style={{ backgroundColor: '#8da7bf' }}>
            <View style={{ marginTop: 30 }}>
                <TouchableOpacity style={[styles.drawerButton, activeItem === 'VetProfile' && styles.activeDrawerButton]} onPress={() => handleNavigateAndSetActiveItem('VetProfile')}>
                    <Text style={styles.drawerText}>הפרופיל שלי</Text>
                    <FontAwesome6 name="user-doctor" size={22} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.drawerButton, activeItem === 'VideoCallsList' && styles.activeDrawerButton]} onPress={() => handleNavigateAndSetActiveItem('VideoCallsList')}>
                    <Text style={styles.drawerText}>שיחות ממטופלים</Text>
                    <MaterialIcons name="video-camera-front" size={22} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.drawerButton, activeItem === 'UpdateUserDetails' && styles.activeDrawerButton]} onPress={() => handleNavigateAndSetActiveItem('UpdateUserDetails')}>
                    <Text style={styles.drawerText}>עדכון פרטים אישיים</Text>
                    <AntDesign name="user" size={22} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.drawerButton, activeItem === 'Logout' && styles.activeDrawerButton]} onPress={handleLogout}>
                    <Text style={styles.drawerText}>התנתקות</Text>
                    <SimpleLineIcons name="logout" size={22} color="white" />
                </TouchableOpacity>
            </View>
        </DrawerContentScrollView>
    );
};

const Drawer = createDrawerNavigator();

function DrawerContentNavigator() {
    const [activeItem, setActiveItem] = useState('VetProfile');

    return (
        <Drawer.Navigator
            initialRouteName="VetProfile"
            drawerContent={() => (
                <CustomDrawerContent
                    activeItem={activeItem}
                    setActiveItem={setActiveItem}
                />
            )}
            screenOptions={{
                drawerPosition: 'right',
                headerTitleAlign: 'center',
                headerShown: true,
                drawerStyle: { width: 200, },
                title: '',
                headerLeft: () => null,
                headerTitle: () => <HeaderLogo />,
                headerStyle: {
                    height: 83,
                    backgroundColor: '#8da7bf',
                },
                headerRight: () => {
                    const navigation = useNavigation();
                    return (
                        <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={styles.menuButton}>
                            <MaterialIcons name="menu" size={24} color="white" />
                        </TouchableOpacity>
                    );
                },
            }}
        >
            <Drawer.Screen name="VetProfile" component={VetProfile} />
            <Drawer.Screen name="VideoCallsList" component={VideoCallsList} />
            <Drawer.Screen name="UpdateUserDetails" component={UpdateUserDetails} />
            <Drawer.Screen name="Logout" component={LogoutScreen} />
        </Drawer.Navigator>
    );
}

export default function HomePage() {
    return (
        <>
            <StatusBar style="light" />
            <DrawerContentNavigator />
        </>
    );
}

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    drawerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingVertical: 15,
        paddingHorizontal: 15,
    },
    drawerText: {
        fontSize: 16,
        marginRight: 10,
        color: 'white',
        fontFamily: 'FredokaMedium'
    },
    menuButton: {
        marginRight: 10,
    },
    activeDrawerButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)'
    },
    notificationsContanier: {
        marginLeft: 10,
        flexDirection: 'row'
    },
    notificationsContainer: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
    },
    notificationsBadge: {
        position: 'absolute',
        top: -5,
        right: -9,
        backgroundColor: '#c0595e',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationsNumber: {
        color: 'white',
        fontSize: 12,
        fontFamily: 'FredokaMedium'
    },
});
