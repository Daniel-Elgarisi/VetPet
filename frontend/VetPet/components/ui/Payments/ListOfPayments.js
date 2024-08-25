import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from "expo-linear-gradient";
import { Foundation, MaterialIcons, MaterialCommunityIcons } from 'react-native-vector-icons';
import { fetchSubscriptionNotifications, fetchPotentialPetsSubscription } from '../../../api/notificationsApi';
import { getOwnerId } from '../../../api/ownerApi';
import PaymentForm from './PaymentsForm';

const ListOfPayments = ({ onPaymentSuccess }) => {
    const [ownerId, setOwnerId] = useState(null);
    const [subscriptionRenewalPayments, setSubscriptionRenewalPayments] = useState([]);
    const [subscriptionCreationPayments, setSubscriptionCreationPayments] = useState([]);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [paymentExist, setPaymentExist] = useState(true);

    const loadPayments = async () => {
        try {
            const owner_id = await getOwnerId();
            const parsedOwnerId = JSON.parse(owner_id);
            setOwnerId(parsedOwnerId);
            const renewal_payments = await fetchSubscriptionNotifications(parsedOwnerId);
            if (renewal_payments.length > 0) {
                renewal_payments.forEach(payment => {
                    payment.description = `חידוש מנוי VetPet עבור ${payment.name}`;
                });
            }
            setSubscriptionRenewalPayments(renewal_payments);
            const creation_Payments = await fetchPotentialPetsSubscription(parsedOwnerId);
            if (creation_Payments.length > 0) {
                creation_Payments.forEach(payment => {
                    payment.description = `רכישת מנוי VetPet חדש עבור ${payment.name}`;
                });
            }
            setSubscriptionCreationPayments(creation_Payments);
            if (renewal_payments.length === 0 && creation_Payments.length === 0)
                setPaymentExist(false);
        } catch (error) {
            console.log('Error fetching payments:', error);
            setPaymentExist(false);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadPayments();
        }, [])
    );

    useEffect(() => {
        if (subscriptionRenewalPayments.length === 0 && subscriptionCreationPayments.length === 0) {
            setPaymentExist(false);
        } else {
            setPaymentExist(true);
        }
    }, [subscriptionRenewalPayments, subscriptionCreationPayments]);


    const handlePaymentPress = (payment) => {
        setSelectedPayment(payment);
    };

    const handlePaymentSuccess = (paymentId) => {
        setSubscriptionRenewalPayments(prev => prev.filter(payment => payment.id !== paymentId));
        setSubscriptionCreationPayments(prev => prev.filter(payment => payment.id !== paymentId));
        setSelectedPayment(null);
        onPaymentSuccess();
    };

    if (selectedPayment) {
        return (
            <PaymentForm
                payment={selectedPayment}
                ownerId={ownerId}
                onBack={() => setSelectedPayment(null)}
                onPaymentSuccess={handlePaymentSuccess}
            />
        );
    }

    return (
        <LinearGradient colors={['#c9d9e8', '#e8f9fc', '#f8eced']} style={styles.mainContainer}>
            <ScrollView contentContainerStyle={[styles.container, styles.scrollViewContent]}>
                <Text style={styles.title}>תשלומים</Text>
                {isLoading ? (
                    <ActivityIndicator size="large" color="#8da7bf" />
                ) : (
                    paymentExist ? (
                        <>
                            {subscriptionRenewalPayments && subscriptionRenewalPayments.length > 0 && (
                                <View style={styles.paymentsSection}>
                                    <Text style={styles.sectionTitle}>תשלומים עבור חידוש מנוי</Text>
                                    {subscriptionRenewalPayments.map((item, index) => (
                                        <TouchableOpacity key={index} style={styles.paymentContainer} onPress={() => handlePaymentPress(item)}>
                                            <View style={styles.proccedToPaymentContainer}>
                                                <MaterialIcons name="keyboard-arrow-left" size={24} color="#d4aaad" />
                                                <MaterialCommunityIcons name="credit-card-refresh-outline" size={24} color="#d4aaad" />
                                            </View>
                                            <View style={styles.messageContainer}>
                                                <Text style={styles.messageText}>{`חידוש מנוי שנתי עבור ${item.name}`}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                            {subscriptionCreationPayments && subscriptionCreationPayments.length > 0 && subscriptionRenewalPayments && subscriptionRenewalPayments.length > 0 && (
                                <View style={styles.divider} />
                            )}
                            {subscriptionCreationPayments && subscriptionCreationPayments.length > 0 && (
                                <View style={styles.paymentsSection}>
                                    <Text style={styles.sectionTitle}>תשלומים עבור יצירת מנוי</Text>
                                    {subscriptionCreationPayments.map((item, index) => (
                                        <TouchableOpacity key={index} style={styles.paymentContainer} onPress={() => handlePaymentPress(item)}>
                                            <View style={styles.proccedToPaymentContainer}>
                                                <MaterialIcons name="keyboard-arrow-left" size={24} color="#d4aaad" />
                                                <MaterialCommunityIcons name="credit-card-plus-outline" size={24} color="#d4aaad" />
                                            </View>
                                            <View style={styles.messageContainer}>
                                                <Text style={styles.messageText}>{`יצירת מנוי עבור ${item.name}`}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </>
                    ) : (
                        <View style={styles.noPaymentsContainer}>
                            <Foundation name="paw" size={18} color="#d0aeb0" />
                            <Text style={styles.noPaymentsText}>לא נמצאו תשלומים עתידיים</Text>
                            <Foundation name="paw" size={18} color="#d0aeb0" />
                        </View>
                    )
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
    sectionTitle: {
        color: '#b89496',
        fontSize: 15,
        fontFamily: 'FredokaSemibold',
        textAlign: 'right',
        marginBottom: 3
    },
    paymentsSection: {
        width: '100%',
        marginTop: 15
    },
    paymentContainer: {
        backgroundColor: '#f0f4f7',
        padding: 12,
        marginVertical: 3,
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
    messageContainer: {
        flexDirection: 'row',
    },
    messageText: {
        color: '#3b5268',
        fontSize: 15,
        fontFamily: 'FredokaSemibold',
        textAlign: 'right'
    },
    proccedToPaymentContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    noPaymentsContainer: {
        flexDirection: 'row',
        alignItems: 'baseline'
    },
    noPaymentsText: {
        marginTop: 10,
        color: '#6c8dac',
        fontSize: 16,
        textAlign: 'center',
        fontFamily: 'FredokaRegular',
        marginHorizontal: 6
    },
    divider: {
        width: '100%',
        height: 2,
        backgroundColor: '#ced9e3',
        marginTop: 25,
        marginBottom: 10
    },
});

export default ListOfPayments;
