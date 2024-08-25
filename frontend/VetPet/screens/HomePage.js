import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { AntDesign, MaterialIcons, SimpleLineIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from "expo-linear-gradient";
import { PetProvider } from '../Context/PetContext';
import { fetchNotificationsCount } from '../api/notificationsApi';
import { getOwnerId } from '../api/ownerApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UpdateUserDetails from '../components/UpdateUserDetails';
import MyPets from '../components/MyPets';
import DisplayAllMyPetsAppointmets from '../components/ui/DisplayAllMyPetsAppointmets/DisplayAllMyPetsAppointmets';
import Notifications from '../components/ui/Notifications/Notifications';
import ListOfPayments from '../components/ui/Payments/ListOfPayments';
import Receipts from '../components/ui/Receipts/Receipts';
import UserGuide from '../components/ui/UserGuide/UserGuide';
import HeaderLogo from '../components/HeaderLogo';

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
            const keysToRemove = ['selectedPetId', 'ownerId'];
            await AsyncStorage.multiRemove(keysToRemove);
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
                <TouchableOpacity style={[styles.drawerButton, activeItem === 'MyPets' && styles.activeDrawerButton]} onPress={() => handleNavigateAndSetActiveItem('MyPets')}>
                    <Text style={styles.drawerText}>חיות המחמד שלי</Text>
                    <FontAwesome name="paw" size={18} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.drawerButton, activeItem === 'UpdateUserDetails' && styles.activeDrawerButton]} onPress={() => handleNavigateAndSetActiveItem('UpdateUserDetails')}>
                    <Text style={styles.drawerText}>עדכון פרטים אישיים</Text>
                    <AntDesign name="user" size={18} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.drawerButton, activeItem === 'DisplayAllMyPetsAppointmets' && styles.activeDrawerButton]} onPress={() => handleNavigateAndSetActiveItem('DisplayAllMyPetsAppointmets')}>
                    <Text style={styles.drawerText}>התורים שלי</Text>
                    <FontAwesome name="calendar-check-o" size={18} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.drawerButton, activeItem === 'Notifications' && styles.activeDrawerButton]} onPress={() => handleNavigateAndSetActiveItem('Notifications')}>
                    <Text style={styles.drawerText}>התראות</Text>
                    <Ionicons name="notifications-outline" size={18} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.drawerButton, activeItem === 'ListOfPayments' && styles.activeDrawerButton]} onPress={() => handleNavigateAndSetActiveItem('ListOfPayments')}>
                    <Text style={styles.drawerText}>תשלומים</Text>
                    <MaterialIcons name="payment" size={18} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.drawerButton, activeItem === 'Receipts' && styles.activeDrawerButton]} onPress={() => handleNavigateAndSetActiveItem('Receipts')}>
                    <Text style={styles.drawerText}>קבלות</Text>
                    <Ionicons name="receipt-outline" size={18} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.drawerButton, activeItem === 'UserGuide' && styles.activeDrawerButton]} onPress={() => handleNavigateAndSetActiveItem('UserGuide')}>
                    <Text style={styles.drawerText}>מדריך למשתמש</Text>
                    <SimpleLineIcons name="info" size={18} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.drawerButton, activeItem === 'Logout' && styles.activeDrawerButton]} onPress={handleLogout}>
                    <Text style={styles.drawerText}>התנתקות</Text>
                    <SimpleLineIcons name="logout" size={18} color="white" />
                </TouchableOpacity>
            </View>
        </DrawerContentScrollView>
    );
};

const Drawer = createDrawerNavigator();

function DrawerContentNavigator({ notificationCount, setNotificationCount, onPaymentSuccess }) {
    const navigation = useNavigation();
    const [activeItem, setActiveItem] = useState('MyPets');

    const handleNotificationPress = useCallback(() => {
        setNotificationCount(0);
        navigateAndSetActiveItem('Notifications', navigation, setActiveItem);
    }, [navigation, setNotificationCount, setActiveItem]);

    return (
        <Drawer.Navigator
            initialRouteName="MyPets"
            drawerContent={(props) => (
                <CustomDrawerContent
                    {...props}
                    setNotificationCount={setNotificationCount}
                    activeItem={activeItem}
                    setActiveItem={setActiveItem}
                />
            )}
            screenOptions={{
                drawerPosition: 'right',
                headerTitleAlign: 'center',
                headerShown: true,
                drawerStyle: { width: 200, },
                headerLeft: () => {
                    return (
                        <TouchableOpacity style={styles.notificationsContainer} onPress={handleNotificationPress}>
                            <Ionicons name="notifications-outline" size={23} color="#496783" />
                            {notificationCount > 0 && (
                                <View style={styles.notificationsBadge}>
                                    <Text style={styles.notificationsNumber}>{notificationCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                },
                title: '',
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
            <Drawer.Screen name="MyPets" component={MyPets} />
            <Drawer.Screen name="UpdateUserDetails" component={UpdateUserDetails} />
            <Drawer.Screen name="DisplayAllMyPetsAppointmets" component={DisplayAllMyPetsAppointmets} />
            <Drawer.Screen name="Notifications">
                {props => <Notifications {...props} setActiveItem={setActiveItem} />}
            </Drawer.Screen>
            <Drawer.Screen name="ListOfPayments">
                {props => <ListOfPayments {...props} onPaymentSuccess={onPaymentSuccess} />}
            </Drawer.Screen>
            <Drawer.Screen name="Receipts" component={Receipts} />
            <Drawer.Screen name="UserGuide" component={UserGuide} />
            <Drawer.Screen name="Logout" component={LogoutScreen} />
        </Drawer.Navigator>
    );
}

export default function HomePage() {
    const [notificationCount, setNotificationCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchNotificationCount = async () => {
        try {
            const ownerId = await getOwnerId();
            const count = await fetchNotificationsCount(ownerId);
            setNotificationCount(count);
        } catch (error) {
            console.log('Error fetching notification count:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotificationCount();
    }, []);

    if (loading) {
        return (
            <LinearGradient colors={['#c9d9e8', '#e8f9fc', '#f8eced']} style={styles.screenContainer}>
                <ActivityIndicator size="large" color="#8da7bf" />
            </LinearGradient>
        );
    }

    return (
        <>
            <StatusBar style="light" />
            <PetProvider>
                <DrawerContentNavigator
                    notificationCount={notificationCount}
                    setNotificationCount={setNotificationCount}
                    onPaymentSuccess={fetchNotificationCount}
                />
            </PetProvider>
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
