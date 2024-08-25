import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Foundation } from 'react-native-vector-icons';
import moment from 'moment-timezone';
import { useNavigation } from '@react-navigation/native';
import { cancelingPetSubscription } from '../../../api/notificationsApi';

const SubscriptionNotification = ({ notification, ownerName, setActiveItem, onRemoveNotification }) => {
    const { notificationId, id, name, renewalDate, subscription } = notification;
    const today = moment().tz('Asia/Jerusalem').startOf('day');
    const renewalMoment = moment(renewalDate).tz('Asia/Jerusalem').startOf('day');
    const daysLeft = renewalMoment.diff(today, 'days');
    const navigation = useNavigation();

    let message;
    if (subscription) {
        if (daysLeft > 2)
            message = (
                <Text style={styles.notificationMessage}>
                    {ownerName} שלום, {'\n'}
                    המנוי עבור {name} מסתיים בעוד {daysLeft} ימים. {'\n'}
                    הגיע הזמן לחדש <Foundation name="paw" size={18} color="#d7c6c1" />
                </Text>
            );
        else if (daysLeft === 2)
            message = (
                <Text style={styles.notificationMessage}>
                    {ownerName} שלום, {'\n'}
                    המנוי עבור {name} מסתיים בעוד יומיים. {'\n'}
                    הגיע הזמן לחדש <Foundation name="paw" size={18} color="#d7c6c1" />
                </Text>
            );
        else if (daysLeft === 1)
            message = (
                <Text style={styles.notificationMessage}>
                    {ownerName} שלום, {'\n'}
                    המנוי עבור {name} מסתיים מחר. {'\n'}
                    הגיע הזמן לחדש <Foundation name="paw" size={18} color="#d7c6c1" />
                </Text>
            );
        else if (daysLeft === 0)
            message = (
                <Text style={styles.notificationMessage}>
                    {ownerName} שלום, {'\n'}
                    המנוי עבור {name} מגיע היום לסיומו. {'\n'}
                    הגיע הזמן לחדש <Foundation name="paw" size={18} color="#d7c6c1" />
                </Text>
            );
    } else {
        message = (
            <Text style={styles.notificationMessage}>
                {ownerName} שלום, {'\n'}
                המנוי עבור {name} הסתיים. {'\n'}
                הגיע הזמן לחדש <Foundation name="paw" size={18} color="#d7c6c1" />
            </Text>
        );
    }

    const handlePaymentPress = () => {
        setActiveItem('ListOfPayments');
        navigation.navigate('ListOfPayments');
    };

    const handleSubscriptionCancellationPress = async () => {
        try {
            await cancelingPetSubscription(id);
            onRemoveNotification(notificationId);
        } catch (error) {
            console.log('Failed to unsubscribe:', error);
        }
    };

    return (
        <View style={styles.notificationContainer}>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={handleSubscriptionCancellationPress}>
                    <Text style={styles.buttonText}>לא מעוניין</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={handlePaymentPress}>
                    <Text style={styles.buttonText}>מעבר לתשלום</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.messageContainer}>
                <Text style={styles.notificationText}>תזכורת: חידוש מנוי עבור {name}</Text>
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

export default SubscriptionNotification;