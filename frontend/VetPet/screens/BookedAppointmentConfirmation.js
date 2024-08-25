import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, EvilIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Calendar from 'expo-calendar';

const BookedAppointmentConfirmation = ({ goBack, selectedDate, selectedTime, visitType }) => {

    const addAppointmentToCalendar = async () => {
        const { status } = await Calendar.requestCalendarPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('ההרשאה נדחתה', 'אנחנו צריכים הרשאות יומן כדי לגרום לזה לעבוד!');
            return;
        }

        const defaultCalendar = await getDefaultCalendarSource();

        try {
            const dateParts = selectedDate.split('-');
            const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
            const startDateTime = new Date(`${formattedDate}T${selectedTime}`);
            const endDateTime = new Date(startDateTime.getTime() + 15 * 60 * 1000);
            const serializedPet = await AsyncStorage.getItem('selectedPetId');
            const pet = JSON.parse(serializedPet);
            const petId = pet.petName;
            const eventId = await Calendar.createEventAsync(defaultCalendar.id, {
                title: `תור לוטרינר: ${visitType} עבור ${petId}`,
                startDate: startDateTime,
                endDate: endDateTime,
                notes: `ביקור וטרינרי עבור ${petId}.\nסוג הביקור: ${visitType}.`,
            });
            Alert.alert('הצלחה', 'התור נוסף ללוח השנה שלך בהצלחה.');
        } catch (error) {
            Alert.alert('שגיאה', 'פעולת הוספת התור לללוח השנה שלך נכשלה.');
        }
    };

    const getDefaultCalendarSource = async () => {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        const defaultCalendar = calendars.find(calendar => calendar.title === "Calendar" && calendar.allowsModifications) ||
            calendars.find(calendar => calendar.allowsModifications);

        if (!defaultCalendar) {
            throw new Error('אין לוחות שנה זמינים הניתנים לשינוי.');
        }
        return defaultCalendar;
    };

    return (
        <ScrollView style={styles.scrollContainer}>
            <View style={styles.container}>
                <View style={styles.goBackContainer}>
                    <TouchableOpacity style={styles.goBackButton} onPress={goBack}>
                        <Text style={styles.goBackText}>חזרה לתפריט</Text>
                        <Ionicons name="return-up-forward-outline" size={24} color="#e3b5b8" />
                    </TouchableOpacity>
                </View>
                <LinearGradient colors={['#dee6ed','#eff2f6','#ffffff','#ffffff','#ffffff']} style={styles.confirmContainer}>
                    <Image
                        source={require('../assets/images/check.png')}
                        style={styles.headerImage}
                    />
                    <View style={styles.type}>
                        <Text style={styles.typeText}>התור זומן בהצלחה</Text>
                        <Text style={styles.typeText}>סוג ביקור - {visitType}</Text>
                    </View>
                    <View style={styles.dateAndTimeContainer}>
                        <View style={styles.timeContainer}>
                            <Text style={styles.description}>שעה</Text>
                            <Text style={styles.info}>{selectedTime}</Text>
                        </View>
                        <View style={styles.dateContainer}>
                            <Text style={styles.description}>תאריך</Text>
                            <Text style={styles.info}>{selectedDate}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.addDateButton} onPress={addAppointmentToCalendar}>
                        <Text style={styles.addDateText}>הוסף ליומן שלי</Text>
                        <EvilIcons name="calendar" size={24} color='white' />
                    </TouchableOpacity>
                </LinearGradient>
                <TouchableOpacity style={styles.finishButton} onPress={goBack}>
                    <Text style={styles.finishText}>סיום</Text>
                </TouchableOpacity>
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
    confirmContainer: {
        alignItems: 'center',
        marginTop: '20%',
        backgroundColor: 'rgba(255, 255, 255,0.7)',
        paddingVertical: 40,
        paddingHorizontal: 30,
        marginHorizontal: 10,
        borderRadius: 10,
        borderWidth: 1.2,
        borderColor: 'rgba(157, 179, 200,0.6)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 2,
    },
    dateAndTimeContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 3,
    },
    dateContainer: {
        flexDirection: 'column',
        marginHorizontal: 25,
    },
    timeContainer: {
        flexDirection: 'column',
        marginHorizontal: 40,
    },
    type: {
        marginVertical: 0,
        marginBottom: 20
    },
    typeText: {
        textAlign: 'center',
        marginVertical: 2,
        fontFamily: 'FredokaSemibold',
        fontSize: 16,
        color: '#637383',
    },
    description: {
        textAlign: 'center',
        marginVertical: 2,
        fontFamily: 'FredokaSemibold',
        fontSize: 16,
        color: '#656667',
    },
    info: {
        margin: 2,
        textAlign: 'center',
        marginVertical: 2,
        fontSize: 16,
        color: '#656667',
        fontFamily: 'FredokaRegular',
    },
    addDateButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
        borderRadius: 8,
        borderColor: 'rgba(145, 159, 172,0.4)',
        borderWidth: 0.2,
        paddingHorizontal: 15,
        paddingVertical: 5,
        backgroundColor: '#9db3c8',
        elevation: 3,
        shadowColor: 'black',
        shadowOpacity: 0.1,
        shadowOffset: { width: 1, height: 1 },
        shadowRadius: 5,
    },
    addDateText: {
        fontFamily: 'FredokaSemibold',
        fontSize: 16,
        color: 'white',
    },
    headerImage: {
        width: 250,
        height: 90,
        resizeMode: 'contain',
        opacity: 0.4,
        alignSelf: 'center'
    },
    finishButton: {
        alignSelf: 'center',
        backgroundColor: '#ddbbbd',
        paddingVertical: 8,
        width: '40%',
        borderRadius: 15,
        margin: 10,
        alignItems: 'center',
        borderColor: '#cc999d',
        borderWidth: 0.1,
        elevation: 3,
        shadowColor: 'black',
        shadowOpacity: 0.1,
        shadowOffset: { width: 1, height: 1 },
        shadowRadius: 5,
    },
    finishText: {
        color: '#ffffff',
        fontSize: 16,
        fontFamily: 'FredokaSemibold',
    },
});

export default BookedAppointmentConfirmation;