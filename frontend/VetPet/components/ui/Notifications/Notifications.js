import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { getOwnerId } from '../../../api/ownerApi';
import { fetchSubscriptionNotifications, fetchVaccinesNotifications, fetchAppointmentsNotifications } from '../../../api/notificationsApi';
import SubscriptionNotification from './SubscriptionNotification';
import VaccineNotification from './VaccineNotification';
import AppointmentNotification from './AppointmentNotification';
import { fetchOwnerDetails } from '../../../api/updateOwnerDetailsApi';
import { Foundation } from 'react-native-vector-icons';

const Notifications = ({ setActiveItem }) => {
    const [appointmentsNotifications, setAppointmentsNotifications] = useState(null);
    const [vaccinesNotifications, setVaccinesNotifications] = useState(null);
    const [subscriptionNotifications, setSubscriptionNotifications] = useState(null);
    const [ownerName, setOwnerName] = useState('');
    const [notificationsExist, setNotificationsExist] = useState(true);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const ownerId = await getOwnerId();
            const subscription = await fetchSubscriptionNotifications(ownerId);
            if (subscription.length > 0) {
                const subscriptionWithId = subscription.map((notif, index) => ({ ...notif, notificationId: index }));
                setSubscriptionNotifications(subscriptionWithId);
            } else
                setSubscriptionNotifications(subscription);
            const vaccines = await fetchVaccinesNotifications(ownerId);
            setVaccinesNotifications(vaccines);
            const appointments = await fetchAppointmentsNotifications(ownerId);
            setAppointmentsNotifications(appointments);
            const ownerInfo = await fetchOwnerDetails(ownerId);
            const firstName = ownerInfo.name.split(' ')[0];
            setOwnerName(firstName);
            if (subscription.length === 0 && vaccines.length === 0 && appointments.length === 0)
                setNotificationsExist(false);
        } catch (error) {
            console.log('Error fetching Notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchNotifications();
        }, [])
    );


    const handleRemoveNotification = (notificationId) => {
        setSubscriptionNotifications((prevNotifications) =>
            prevNotifications.filter((notification) => notification.notificationId !== notificationId)
        );
    };

    if (loading) {
        return (
            <LinearGradient colors={['#c9d9e8', '#e8f9fc', '#f8eced']} style={styles.mainLoadingContainer}>
                <View>
                    <ActivityIndicator size="large" color="#8da7bf" />
                </View>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={['#c9d9e8', '#e8f9fc', '#f8eced']} style={styles.mainContainer}>
            <ScrollView contentContainerStyle={[styles.container, styles.scrollViewContent]}>
                <Text style={styles.title}>התראות</Text>
                {notificationsExist ? (
                    <>
                        {appointmentsNotifications && appointmentsNotifications.length > 0 && (
                            <View style={styles.notificationsSection}>
                                {appointmentsNotifications.map((notification, index) => (
                                    <AppointmentNotification key={index} notification={notification} ownerName={ownerName} />
                                ))}
                            </View>
                        )}
                        {vaccinesNotifications && vaccinesNotifications.length > 0 && (
                            <View style={styles.notificationsSection}>
                                {vaccinesNotifications.map((notification, index) => (
                                    <VaccineNotification key={index} notification={notification} ownerName={ownerName} />
                                ))}
                            </View>
                        )}
                        {subscriptionNotifications && subscriptionNotifications.length > 0 && (
                            <View style={styles.notificationsSection}>
                                {subscriptionNotifications.map((notification, index) => (
                                    <SubscriptionNotification
                                        key={index}
                                        notification={notification}
                                        ownerName={ownerName}
                                        setActiveItem={setActiveItem}
                                        onRemoveNotification={handleRemoveNotification}
                                    />
                                ))}
                            </View>
                        )}
                    </>
                ) : (
                    <View style={styles.noNotificationsContainer}>
                        <Foundation name="paw" size={18} color="#d0aeb0" />
                        <Text style={styles.noNotificationsText}>אין התראות חדשות</Text>
                        <Foundation name="paw" size={18} color="#d0aeb0" />
                    </View>
                )}
            </ScrollView>
        </LinearGradient>
    );
};


const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    mainLoadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '100%',
        marginTop: 10,
        alignItems: 'center',
        paddingHorizontal: 10
    },
    scrollViewContent: {
        paddingBottom: 80,
    },
    title: {
        marginTop: 20,
        marginBottom: 5,
        color: '#496783',
        fontSize: 23,
        textAlign: 'center',
        fontFamily: 'FredokaBold',
    },
    notificationsSection: {
        width: '100%',
    },
    noNotificationsContainer: {
        flexDirection: 'row',
        alignItems: 'baseline'
    },
    noNotificationsText: {
        marginTop: 10,
        color: '#6c8dac',
        fontSize: 16,
        textAlign: 'center',
        fontFamily: 'FredokaRegular',
        marginHorizontal: 6
    },
});

export default Notifications;