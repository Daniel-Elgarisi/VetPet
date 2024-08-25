import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomSelectList from '../components/ui/Appointment/CustomSelectList';
import HebrewDatePicker from '../components/ui/Appointment/HebrewDatePicker';
import AppointmentHours from '../components/ui/Appointment/AppointmentHours';
import CustomButton from '../components/ui/Appointment/CustomButton';
import BookedAppointmentConfirmation from './BookedAppointmentConfirmation';
import { scheduleAppointment } from '../api/appointmentsApi';
import moment from 'moment';

const BookNewAppointment = ({ goBack }) => {
    const [visitType, setVisitType] = useState("");
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [isAppointmentBooked, setIsAppointmentBooked] = useState(false);

    const handleDateChange = (newDate) => {
        const formattedDate = moment(newDate, 'YYYY-MM-DD').format('DD-MM-YYYY');
        setSelectedDate(formattedDate);
    };

    const handleTimeChange = (time) => {
        setSelectedTime(time);
    };

    const handleConfirmAppointment = async () => {
        try {
            await scheduleAppointment(selectedDate, selectedTime, visitType);
            setIsAppointmentBooked(true);
        } catch (error){
            console.log("Failed to schedule appointment");
        }
    };

    if (isAppointmentBooked) {
        return (
            <BookedAppointmentConfirmation
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                visitType={visitType}
                goBack={goBack}
            />
        );
    }

    return (
        <ScrollView style={styles.scrollContainer}>
            <View style={styles.container}>
                <View style={styles.goBackContainer}>
                    <TouchableOpacity style={styles.goBackButton} onPress={goBack}>
                        <Text style={styles.goBackText}>חזרה לתפריט</Text>
                        <Ionicons name="return-up-forward-outline" size={24} color="#e3b5b8" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.title}>זימון תור חדש</Text>
                <CustomSelectList
                    onSelect={(item) => setVisitType(item)}
                    placeholder="בחר סוג תור"
                />
                <HebrewDatePicker onDateChange={handleDateChange} />
                {selectedDate && (
                    <>
                        <View style={styles.strip}></View>
                        <AppointmentHours selectedDate={selectedDate} onTimeSelect={handleTimeChange} />
                    </>
                )}
                {selectedTime && visitType && <CustomButton title="אישור" onPress={handleConfirmAppointment} />}
            </View >
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
    },
    container: {
        padding: 20,
    },
    goBackContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 20,
    },
    goBackButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    goBackText: {
        marginRight: 5,
        color: '#7c9ab6',
        fontFamily: 'FredokaRegular'
    },
    title: {
        marginBottom: 15,
        color: '#496783',
        fontSize: 20,
        textAlign: 'center',
        fontFamily: 'FredokaBold',
    },
    strip: {
        marginTop: 20,
        marginBottom: 10,
        height: 1,
        backgroundColor: '#beccda',
        width: '100%',
    },
});

export default BookNewAppointment;
