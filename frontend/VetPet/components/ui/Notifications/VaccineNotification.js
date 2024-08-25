import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Foundation } from 'react-native-vector-icons';

const VaccineNotification = ({ notification, ownerName }) => {
    const { petName, vaccine_name, daysUntilExpiry } = notification;

    let message;
    if (daysUntilExpiry > 2)
        message = (
            <Text style={styles.notificationMessage}>
                {ownerName} שלום, {'\n'}
                תוקף חיסון {vaccine_name} עבור {petName} מגיע לסיומו בעוד {daysUntilExpiry} ימים. {'\n'}
                למען בריאות חיית המחמד שלך, אנא הזמינ/י תור לחידוש בהקדם <Foundation name="paw" size={18} color="#d7c6c1" />
            </Text>
        );
    else if (daysUntilExpiry === 2)
        message = (
            <Text style={styles.notificationMessage}>
                {ownerName} שלום, {'\n'}
                תוקף חיסון {vaccine_name} עבור {petName} מגיע לסיומו בעוד יומיים. {'\n'}
                למען בריאות חיית המחמד שלך, אנא הזמינ/י תור לחידוש בהקדם <Foundation name="paw" size={18} color="#d7c6c1" />
            </Text>
        );
    else if (daysUntilExpiry === 1)
        message = (
            <Text style={styles.notificationMessage}>
                {ownerName} שלום, {'\n'}
                תוקף חיסון {vaccine_name} עבור {petName} מגיע לסיומו מחר. {'\n'}
                למען בריאות חיית המחמד שלך, אנא הזמינ/י תור לחידוש בהקדם <Foundation name="paw" size={18} color="#d7c6c1" />
            </Text>
        );
    else if (daysUntilExpiry === 0)
        message = (
            <Text style={styles.notificationMessage}>
                {ownerName} שלום, {'\n'}
                תוקף חיסון {vaccine_name} עבור {petName} מגיע לסיומו היום. {'\n'}
                למען בריאות חיית המחמד שלך, אנא הזמינ/י תור לחידוש בהקדם <Foundation name="paw" size={18} color="#d7c6c1" />
            </Text>
        );
    else
        message = (
            <Text style={styles.notificationMessage}>
                {ownerName} שלום, {'\n'}
                תוקף חיסון {vaccine_name} עבור {petName} הסתיים. {'\n'}
                למען בריאות חיית המחמד שלך, אנא הזמינ/י תור לחידוש בהקדם <Foundation name="paw" size={18} color="#d7c6c1" />
            </Text>
        );

    return (
        <View style={styles.notificationContainer}>
            <View style={styles.messageContainer}>
                <Text style={styles.notificationText}>תזכורת: חידוש חיסון עבור {petName}</Text>
                {message}
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

export default VaccineNotification;