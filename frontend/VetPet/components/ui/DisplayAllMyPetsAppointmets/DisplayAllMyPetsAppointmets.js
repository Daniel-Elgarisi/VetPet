import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { fetchPreviousAllMyPetsAppointments, fetchFutureAllMyPetsAppointments } from '../../../api/appointmentsApi';

const DisplayAllMyPetsAppointmets = () => {
    const [appointmentsType, setAppointmentsType] = useState('future');
    const [appointments, setAppointments] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            fetchAppointments();
        }, [appointmentsType])
    );

    useFocusEffect(
        useCallback(() => {
            fetchAppointments();
        }, [])
    );

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            let fetchedAppointments;
            if (appointmentsType === 'future')
                fetchedAppointments = await fetchFutureAllMyPetsAppointments();
            else
                fetchedAppointments = await fetchPreviousAllMyPetsAppointments();
            if (fetchedAppointments.status === 'success') {
                const sortedAppointments = fetchedAppointments.data.sort((a, b) => {
                    const datePartsA = a.date.split('-');
                    const formattedDateA = `${datePartsA[2]}-${datePartsA[1]}-${datePartsA[0]}T${a.time}`;
                    const datePartsB = b.date.split('-');
                    const formattedDateB = `${datePartsB[2]}-${datePartsB[1]}-${datePartsB[0]}T${b.time}`;
                    const dateTimeA = new Date(formattedDateA);
                    const dateTimeB = new Date(formattedDateB);
                    return appointmentsType === 'future' ? dateTimeA - dateTimeB : dateTimeB - dateTimeA;
                });
                setAppointments(sortedAppointments);
                setMessage("");
            } else if (fetchedAppointments.status === 'info') {
                setMessage(fetchedAppointments.message);
            } else if (fetchedAppointments.status === 'error') {
                console.log(fetchedAppointments.message);
            }
        } catch (error) {
            console.log("Error fetching queues: ", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <LinearGradient colors={['#c9d9e8', '#e8f9fc', '#f8eced']} style={styles.mainContainer}>
                <ScrollView contentContainerStyle={styles.container}>
                    <Text style={styles.title}>התורים שלי</Text>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, appointmentsType === 'previous' && styles.activeButton]}
                            onPress={() => setAppointmentsType('previous')}
                        >
                            <Text style={styles.buttonText}>תורים קודמים</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, appointmentsType === 'future' && styles.activeButton]}
                            onPress={() => setAppointmentsType('future')}
                        >
                            <Text style={styles.buttonText}>תורים עתידיים</Text>
                        </TouchableOpacity>
                    </View>
                    <ActivityIndicator size="large" color="#8da7bf" />
                </ScrollView>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={['#c9d9e8', '#e8f9fc', '#f8eced']} style={styles.mainContainer}>
            <ScrollView contentContainerStyle={[styles.container, styles.scrollViewContent]}>
                <Text style={styles.title}>התורים שלי</Text>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, appointmentsType === 'previous' && styles.activeButton]}
                        onPress={() => setAppointmentsType('previous')}
                    >
                        <Text style={styles.buttonText}>תורים קודמים</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, appointmentsType === 'future' && styles.activeButton]}
                        onPress={() => setAppointmentsType('future')}
                    >
                        <Text style={styles.buttonText}>תורים עתידיים</Text>
                    </TouchableOpacity>
                </View>
                {message !== "" ? (
                    <Text style={styles.noAppointmentsText}>{message}</Text>
                ) : (
                    appointments.map((appointment, index) => (
                        <View key={index} style={styles.appointmentContainer}>
                            <View style={[styles.column, styles.descriptionColumn]}>
                                <Text style={appointmentsType === 'future' ? styles.appointmentType : styles.previousAppointmentsType}>
                                    {appointment.appointment_type}: {appointment.pet_name}
                                </Text>
                            </View>
                            <View style={styles.column}>
                                <Text style={appointmentsType === 'future' ? styles.columnHeader : styles.previousColumnHeader}>תאריך</Text>
                                <Text style={appointmentsType === 'future' ? styles.appointmentDate : styles.previousAppointmentsDate}>
                                    {appointment.date}
                                </Text>
                            </View>
                            <View style={styles.column}>
                                <Text style={appointmentsType === 'future' ? styles.columnHeader : styles.previousColumnHeader}>שעה</Text>
                                <Text style={appointmentsType === 'future' ? styles.appointmentTime : styles.previousAppointmentsTime}>
                                    {appointment.time}
                                </Text>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
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
        marginBottom: 15,
        color: '#496783',
        fontSize: 23,
        textAlign: 'center',
        fontFamily: 'FredokaBold',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    button: {
        padding: 10,
        borderRadius: 10,
        backgroundColor: 'rgba(141, 167, 191, 0.4)',
    },
    activeButton: {
        backgroundColor: 'rgba(141, 167, 191, 1)',
    },
    buttonText: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontFamily: 'FredokaSemibold',
        fontSize: 15,
    },
    noAppointmentsText: {
        textAlign: 'center',
        color: '#496783',
        fontSize: 16,
        marginTop: 20,
        fontFamily: 'FredokaSemibold',
        color: '#7c9ab6',
    },
    appointmentContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(209, 189, 189, 0.5)',
        marginVertical: 5,
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    column: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    descriptionColumn: {
        flex: 2,
        alignItems: 'flex-end',
        marginRight: 5
    },
    columnHeader: {
        color: '#666',
        fontSize: 15,
        fontFamily: 'FredokaMedium',
        marginBottom: 5,
    },
    previousColumnHeader: {
        color: '#8c8c8c',
        fontSize: 15,
        fontFamily: 'FredokaMedium',
        marginBottom: 5,
    },
    appointmentDetails: {
        flex: 3,
        alignItems: 'flex-end',
        padding: 5
    },
    appointmentType: {
        color: '#6b6461',
        fontSize: 16,
        fontFamily: 'FredokaSemibold',
        marginBottom: 5
    },
    previousAppointmentsType: {
        color: '#9e9794',
        fontSize: 16,
        fontFamily: 'FredokaSemibold',
        marginBottom: 5
    },
    previousAppointmentsDate: {
        color: '#a6a6a6',
        fontSize: 14,
        marginVertical: 2,
        fontFamily: 'FredokaRegular',
        textAlign: 'center'
    },
    previousAppointmentsTime: {
        color: '#a6a6a6',
        fontSize: 14,
        marginVertical: 2,
        fontFamily: 'FredokaRegular',
        textAlign: 'center'
    },
    timeInfo: {
        flexDirection: 'row-reverse'
    },
    appointmentDate: {
        color: '#666',
        fontSize: 14,
        marginVertical: 2,
        fontFamily: 'FredokaRegular',
        textAlign: 'center'
    },
    appointmentTime: {
        color: '#666',
        fontSize: 14,
        marginVertical: 2,
        fontFamily: 'FredokaRegular',
        textAlign: 'center'
    },
});

export default DisplayAllMyPetsAppointmets;