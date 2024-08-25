import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Foundation } from 'react-native-vector-icons';
import moment from 'moment';
import 'moment/locale/he';

const AppointmentNotification = ({ notification, ownerName }) => {
    const { pet_name, appointment_type, date, time } = notification;
    moment.locale('he');
    const parsedDate = moment(date, 'DD-MM-YYYY');
    const dayOfWeek = parsedDate.format('dddd');

    return (
        <View style={styles.notificationContainer}>
            <View style={styles.messageContainer}>
                <Text style={styles.notificationText}>תזכורת: תור וטרינרי עבור {pet_name}</Text>
                <Text style={styles.notificationMessage}>
                    {ownerName} שלום, {'\n'}
                    זוהי תזכורת לתור {appointment_type} עבור {pet_name},{'\n'}שיתקיים בתאריך {date} ביום {dayOfWeek} בשעה {time}.{'\n'}
                    צריך לתאם מחדש? עשה זאת בקלות דרך האפליקציה.
                    נתראה בקרוב <Foundation name="paw" size={18} color="#d7c6c1" />
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    notificationContainer: {
        backgroundColor: '#f0f4f7',
        padding: 10,
        marginVertical: 5,
        borderRadius: 5,
        borderColor: 'rgba(209, 189, 189, 0.5)',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    buttonContainer: {
        flexDirection: 'column',
    },
    button: {
        backgroundColor: '#adc0d1',
        padding: 6,
        borderRadius: 5,
        marginVertical: 3,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'FredokaSemibold',
    },
    messageContainer: {
        flex: 1,
        marginLeft: 10,
    },
    notificationText: {
        fontSize: 15,
        color: '#607385',
        fontFamily: 'FredokaSemibold',
        textAlign: 'right',
    },
    notificationMessage: {
        fontSize: 14,
        color: '#888',
        marginTop: 5,
        textAlign: 'right',
        fontFamily: 'FredokaRegular',
    },
});

export default AppointmentNotification;