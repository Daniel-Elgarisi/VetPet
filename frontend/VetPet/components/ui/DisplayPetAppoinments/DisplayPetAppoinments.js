import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchPreviousPetAppointments, fetchFuturePetAppointments, deletePetAppointment } from '../../../api/appointmentsApi';
import ChangeAppointment from '../ChangeAppointment/ChangeAppointment';

const DisplayPetAppoinments = ({ goBack }) => {
    const [appointmentsType, setAppointmentsType] = useState('future');
    const [appointments, setAppointments] = useState([]);
    const [message, setMessage] = useState("");
    const [changeAppointmetSelected, setChangeAppointmetSelected] = useState(false);
    const [selectedAppointmetDateForChange, setSelectedAppointmetDateForChange] = useState("");
    const [selectedAppointmetTimeForChange, setSelectedAppointmetTimeForChange] = useState("");
    const [selectedAppointmetTypeForChange, setSelectedAppointmetTypeForChange] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            let fetchedAppointments;
            if (appointmentsType === 'future')
                fetchedAppointments = await fetchFuturePetAppointments();
            else
                fetchedAppointments = await fetchPreviousPetAppointments();
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
            console.log("Error fetching appointments: ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [appointmentsType]);


    const handleAppointmentCancellation = async (date, time) => {
        try {
            await deletePetAppointment(date, time);
            const updatedAppointments = appointments.filter(appointment => appointment.date !== date || appointment.time !== time);
            setAppointments(updatedAppointments);
        } catch (error) {
            console.log("Failed to delete appointment");
        }
    };

    const handleGoBack = async () => {
        setSelectedAppointmetDateForChange("");
        setSelectedAppointmetTimeForChange("");
        setSelectedAppointmetTypeForChange("");
        try {
            await fetchAppointments();
        } catch (error) {
            console.log("Error fetching appointments: ", error);
        }
        setChangeAppointmetSelected(false);
    };

    const handleChangeAppointment = (date, time, type) => {
        setSelectedAppointmetDateForChange(date);
        setSelectedAppointmetTimeForChange(time);
        setSelectedAppointmetTypeForChange(type);
        setChangeAppointmetSelected(true);
    };

    if (changeAppointmetSelected) {
        return <ChangeAppointment
            goBack={handleGoBack}
            dateForChange={selectedAppointmetDateForChange}
            timeForChange={selectedAppointmetTimeForChange}
            typeForChange={selectedAppointmetTypeForChange}
        />;
    }

    return (
        <ScrollView contentContainerStyle={[styles.container, styles.scrollViewContent]}>
            <View style={styles.goBackContainer}>
                <TouchableOpacity style={styles.goBackButton} onPress={goBack}>
                    <Text style={styles.goBackText}>חזרה לתפריט</Text>
                    <Ionicons name="return-up-forward-outline" size={24} color="#e3b5b8" />
                </TouchableOpacity>
            </View>
            <Text style={styles.title}>התורים שלי</Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, appointmentsType === 'previous' && styles.activeButton]}
                    onPress={() => {
                        setLoading(true);
                        setAppointmentsType('previous');
                    }}
                >
                    <Text style={styles.buttonText}>תורים קודמים</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, appointmentsType === 'future' && styles.activeButton]}
                    onPress={() => {
                        setLoading(true);
                        setAppointmentsType('future');
                    }}
                >
                    <Text style={styles.buttonText}>תורים עתידיים</Text>
                </TouchableOpacity>
            </View>
            {loading ? ( 
                <ActivityIndicator size="large" color="#8da7bf" />
            ) : (
                message !== "" ? (
                    <Text style={styles.noAppointmentsText}>{message}</Text>
                ) : (
                    appointments.map((appointment, index) => (
                        <View key={index} style={styles.appointmentContainer}>
                            {appointmentsType === 'future' && (
                                <View style={styles.buttonsContainer}>
                                    <TouchableOpacity style={styles.appointmentButton} onPress={() => handleChangeAppointment(appointment.date, appointment.time, appointment.appointment_type)}>
                                        <Text style={styles.appointmentButtonText}>שינוי</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.appointmentButton} onPress={() => handleAppointmentCancellation(appointment.date, appointment.time)}>
                                        <Text style={styles.appointmentButtonText}>ביטול</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                            <View style={styles.appointmentDetails}>
                                <Text style={appointmentsType === 'future' ? styles.appointmentType : styles.previousAppointmentsType}>{appointment.appointment_type}</Text>
                                <Text style={appointmentsType === 'future' ? styles.appointmentDateTime : styles.previousAppointmentsDateTime}>תאריך: {appointment.date}</Text>
                                <Text style={appointmentsType === 'future' ? styles.appointmentDateTime : styles.previousAppointmentsDateTime}>שעה: {appointment.time}</Text>
                            </View>
                        </View>
                    ))
                )
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        marginTop: '5%',
        alignItems: 'stretch',
        paddingHorizontal: 10,
    },
    title: {
        marginTop: 5,
        marginBottom: 15,
        color: '#496783',
        fontSize: 20,
        textAlign: 'center',
        fontFamily: 'FredokaBold',
    },
    scrollViewContent: {
        paddingBottom: 80,
    },
    goBackContainer: {
        width: '100%',
        alignItems: 'flex-end',
        paddingHorizontal: 10,
        paddingTop: 5,
    },
    goBackButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    goBackText: {
        marginRight: 5,
        color: '#7c9ab6',
        fontFamily: 'FredokaRegular',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
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
        padding: 5,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(209, 189, 189, 0.5)',
        marginVertical: 3,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    appointmentDetails: {
        flex: 3,
        alignItems: 'flex-end',
        padding: 5,
        marginRight: 5
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
    previousAppointmentsDateTime: {
        color: '#a6a6a6',
        fontSize: 14,
        marginVertical: 2,
        fontFamily: 'FredokaRegular',
    },
    appointmentDateTime: {
        color: '#666',
        fontSize: 14,
        marginVertical: 2,
        fontFamily: 'FredokaRegular',
    },
    buttonsContainer: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        height: '100%',
        paddingLeft: 10,
        marginTop: 10
    },
    appointmentButton: {
        backgroundColor: '#ddbbbd',
        paddingVertical: 5,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginBottom: 5,
        width: 80,
    },
    appointmentButtonText: {
        fontFamily: 'FredokaSemibold',
        textAlign: 'center',
        color: 'white'
    }
});

export default DisplayPetAppoinments;