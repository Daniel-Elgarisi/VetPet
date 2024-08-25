import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { fetchFullyOccupiedAppointmentHoursByDate } from '../../../api/appointmentsApi';
import { AntDesign } from '@expo/vector-icons';
import moment from 'moment';
import 'moment-timezone';

const daysInHebrew = {
    'Sunday': "א'", 'Monday': "ב'", 'Tuesday': "ג'",
    'Wednesday': "ד'", 'Thursday': "ה'", 'Friday': "ו'", 'Saturday': "ש'",
};

const AppointmentHoursChange = ({ selectedDate, onTimeSelect, timeForChange }) => {
    moment.locale('en');
    const [selectedTime, setSelectedTime] = useState(timeForChange);
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

    useEffect(() => {
        setSelectedTime(timeForChange);
        updateAvailableTimes();
    }, [selectedDate]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            updateAvailableTimes();
        }, 60000); // Update every 60 seconds
        return () => clearInterval(intervalId); // Cleanup on unmount
    }, [selectedDate]);

    const dateParts = selectedDate.split('-');
    const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    const momentDate = moment(formattedDate);
    const dayOfWeek = momentDate.format('dddd');
    const dayInHebrew = daysInHebrew[dayOfWeek];
    const isFriday = dayOfWeek === 'Friday';

    const generateTimeSlots = () => {
        let startHour = 8;
        let startMinute = 30;
        let endHour = isFriday ? 13 : 18;
        let endMinute = isFriday ? 0 : 30;
        const interval = 15;
        const timeSlots = [];
        const isToday = moment().tz("Asia/Jerusalem").format('YYYY-MM-DD') === moment.tz(formattedDate, "Asia/Jerusalem").format('YYYY-MM-DD');

        if (isToday) {
            const currentTime = moment().tz("Asia/Jerusalem");
            const defaultStartTime = moment().tz("Asia/Jerusalem").set({ hour: 8, minute: 30, second: 0 });

            if (currentTime.isAfter(defaultStartTime)) {
                startHour = currentTime.hour();
                startMinute = currentTime.minute();
                startMinute += interval - (startMinute % interval);
                if (startMinute >= 60) {
                    startHour += 1;
                    startMinute -= 60;
                }
            } else {
                startHour = 8;
                startMinute = 30;
            }
        }

        while (startHour < endHour || (startHour === endHour && startMinute <= endMinute)) {
            const time = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
            timeSlots.push(time);
            startMinute += interval;
            if (startMinute >= 60) {
                startMinute = 0;
                startHour++;
            }
        }

        return timeSlots;
    };

    const updateAvailableTimes = async () => {
        const generatedSlots = generateTimeSlots();
        try {
            const occupiedTimes = await fetchFullyOccupiedAppointmentHoursByDate(selectedDate);
            if (occupiedTimes.length === 0) {
                setAvailableTimeSlots(generatedSlots);
            } else {
                const filteredSlots = generatedSlots.filter(slot => !occupiedTimes.includes(slot));
                setAvailableTimeSlots(filteredSlots);
            }
        } catch (error) {
            console.log("שגיאה באחזור שעות פגישות בתפוסה מלאה על פי תאריך", error);
            setAvailableTimeSlots(generatedSlots);
        }
    };

    const handleTimeSelect = (time) => {
        setSelectedTime(time);
        onTimeSelect(time);
    };

    const rows = availableTimeSlots.reduce((acc, time, index) => {
        const rowIndex = Math.floor(index / 4);
        if (!acc[rowIndex]) {
            acc[rowIndex] = [];
        }
        acc[rowIndex].push(time);
        return acc;
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.dateText}>{`${selectedDate} - יום ${dayInHebrew}`}</Text>
            {availableTimeSlots.length === 0 ? (
                <View style={styles.noSlotsContainer}>
                    <AntDesign name="meh" size={22} color="#dca3a6" />
                    <Text style={styles.noSlotsText}>לא נמצאו תורים פנויים בתאריך הנבחר</Text>
                </View>
            ) : (
                rows.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.row}>
                        {[...row].reverse().map((time, timeIndex) => (
                            <TouchableOpacity
                                key={timeIndex}
                                style={[
                                    styles.rectangle,
                                    time === selectedTime ? styles.selectedTime : {}
                                ]}
                                onPress={() => handleTimeSelect(time)}
                            >
                                <Text style={[styles.timeText, time === selectedTime ? styles.selectedTimeText : {}]}>
                                    {time}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )))}
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 10,
        alignItems: 'center',
    },
    dateText: {
        alignSelf: 'flex-start',
        textAlign: 'right',
        color: '#496783',
        fontFamily: 'FredokaSemibold',
        fontSize: 16,
        marginBottom: 20,
        width: '100%',
    },
    noSlotsContainer: {
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems: 'center',
        marginTop: -10,
    },
    noSlotsText: {
        marginLeft: 10,
        color: '#dca3a6',
        fontFamily: 'FredokaSemibold',
        fontSize: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginBottom: 15,
        width: '100%',
    },
    rectangle: {
        borderWidth: 1,
        borderColor: '#d3ab92',
        borderRadius: 15,
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginHorizontal: 5,
        minWidth: 70,
        alignItems: 'flex-start',
        backgroundColor: '#f8eded',
        elevation: 3,
        shadowColor: 'black',
        shadowOpacity: 0.1,
        shadowOffset: { width: 1, height: 1 },
        shadowRadius: 5,
    },
    timeText: {
        fontFamily: 'FredokaRegular',
        fontSize: 14,
        color: '#595959',
        textAlign: 'center'
    },
    selectedTime: {
        backgroundColor: '#dca3a6',
    },
    selectedTimeText: {
        color: 'white',
        fontFamily: 'FredokaSemibold',
    }
});

export default AppointmentHoursChange;
