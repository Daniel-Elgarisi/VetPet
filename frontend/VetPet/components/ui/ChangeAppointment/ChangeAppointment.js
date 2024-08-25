import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomSelectListChange from './CustomSelectListChange';
import HebrewDatePickerChange from './HebrewDatePickerChange';
import AppointmentHoursChange from './AppointmentHoursChange';
import CustomButton from '../Appointment/CustomButton';
import BookedAppointmentConfirmation from '../../../screens/BookedAppointmentConfirmation';
import { updatePetAppointment } from '../../../api/appointmentsApi';
import moment from 'moment';

const ChangeAppointment = ({ goBack, dateForChange, timeForChange, typeForChange }) => {
    const [isAppointmentBooked, setIsAppointmentBooked] = useState(false);
    const [tempType, setTempType] = useState('');
    const [tempDate, setTempDate] = useState('');
    const [tempTime, setTempTime] = useState('');

    useEffect(() => {
        setTempType(typeForChange);
        setTempDate(dateForChange);
        setTempTime(timeForChange);
    }, []);


    const handleDateChange = (newDate) => {
        const formattedDate = moment(newDate, 'YYYY-MM-DD').format('DD-MM-YYYY');
        setTempDate(formattedDate);
    };

    const handleTimeChange = (time) => {
        setTempTime(time);
    };

    const hasDetailsChanged = () => {
        return dateForChange !== tempDate ||
            timeForChange !== tempTime ||
            typeForChange !== tempType;
    };

    const handleConfirmAppointment = async () => {
        try {
            await updatePetAppointment(dateForChange, timeForChange, typeForChange, tempDate, tempTime, tempType);
            setIsAppointmentBooked(true);
        } catch (error) {
            console.log("Failed to schedule appointment");
        }
    };

    if (isAppointmentBooked) {
        return (
            <BookedAppointmentConfirmation
                selectedDate={tempDate}
                selectedTime={tempTime}
                visitType={tempType}
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
                <Text style={styles.title}>שינוי תור קיים</Text>
                {tempType && (
                    <CustomSelectListChange
                        onSelect={(item) => setTempType(item)}
                        placeholder="בחר סוג תור"
                        typeForChange={tempType}
                    />
                )}
                {tempDate && <HebrewDatePickerChange onDateChange={handleDateChange} dateForChange={tempDate} />}
                {tempDate && (
                    <>
                        <View style={styles.strip}></View>
                        <AppointmentHoursChange selectedDate={tempDate} onTimeSelect={handleTimeChange} timeForChange={tempTime} />
                    </>
                )}
                {hasDetailsChanged() && <CustomButton title="אישור" onPress={handleConfirmAppointment} />}
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

export default ChangeAppointment;
