import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useStripe, CardField, StripeProvider } from '@stripe/stripe-react-native';
import { WebView } from 'react-native-webview';
import { createPayPalPayment, createStripePaymentIntent, capturePayPalPayment, captureCreditCardPayment, updatePetSubscription } from '../../../api/paymentApi';
import CustomAlert from './CustomAlert';

const STRIPE_PUBLISHABLE_KEY = 'pk_test_51PaeWDRsEnTrRWGeENi9zZEsbMW9Epm2WzvK9UObdXQY9o2jmjx8jQyOzk6UZbZKaXvdOcvzJmVHCFFeEZDEfnqj00VBu39ISh';

const PaymentForm = ({ payment, ownerId, onBack, onPaymentSuccess }) => {
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [approvalUrl, setApprovalUrl] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [showSuccessImage, setShowSuccessImage] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('₪120.00');
    const stripe = useStripe();

    const handlePayPalPress = async () => {
        setSelectedMethod('PayPal');
        try {
            const data = await createPayPalPayment(ownerId, payment.id, payment.description);

            if (data && data.id) {
                const approvalUrl = `https://www.sandbox.paypal.com/checkoutnow?token=${data.id}`;
                setApprovalUrl(approvalUrl);
            } else {
                console.log("PayPal response did not contain an ID:", data);
            }
        } catch (error) {
            console.log("PayPal payment error:", error.message);
        }
    };

    const handleCreditCardPress = () => {
        setSelectedMethod('CreditCard');
    };

    const handleCreditCardPayment = async () => {
        try {
            const paymentIntentId = await createStripePaymentIntent(12000, 'ILS', payment.description);
            const { error, paymentIntent } = await stripe.confirmPayment(paymentIntentId, {
                paymentMethodType: 'Card',
            });

            if (error) {
                console.log("Credit card payment error:", error);
            } else {
                await captureCreditCardPayment(ownerId, payment.name, payment.id, payment.description, paymentIntent);
                await updatePetSubscription(payment.id);
                setShowSuccessImage(true);
                setTimeout(() => {
                    setShowSuccessImage(false);
                    onPaymentSuccess(payment.id);
                }, 3000);
            }
        } catch (error) {
            console.log("Stripe payment error:", error.message);
        }
    };

    const handleNavigationStateChange = async (navState) => {
        const { url } = navState;

        if (url.includes(`/paypal/success`)) {
            const queryString = url.split('?')[1];
            const params = new URLSearchParams(queryString);
            const orderID = params.get('token');

            if (orderID && !url.includes('processed=true')) {
                try {
                    const result = await capturePayPalPayment(orderID, ownerId, payment.name, payment.id, payment.description);
                    await updatePetSubscription(payment.id);
                    const status = result['capture'].status;
                    if (status === 'COMPLETED') {
                        setApprovalUrl(`https://www.sandbox.paypal.com/checkoutnow?token=${orderID}`);
                        setTimeout(() => {
                            onPaymentSuccess(payment.id);
                        }, 3000);
                    }
                    navState.url = `${url}&processed=true`;
                } catch (error) {
                    console.log("Capture PayPal payment error:", error.message);
                    setAlertMessage('שגיאה באישור התשלום');
                    setShowAlert(true);
                    setTimeout(() => {
                        setShowAlert(false);
                    }, 3000);
                }
            } else {
                console.log('Order ID not found in URL');
            }
        } else if (url.includes(`/paypal/cancel`)) {
            setApprovalUrl(null);
            setAlertMessage('התשלום נכשל, אנא נסה שוב.');
            setShowAlert(true);
            setTimeout(() => {
                setShowAlert(false);
            }, 3000);
        }
    };

    return (
        <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
            <LinearGradient colors={['#c9d9e8', '#e8f9fc', '#f8eced']} style={styles.mainContainer}>
                <View style={styles.container}>
                    <View style={styles.goBackContainer}>
                        <TouchableOpacity style={styles.goBackButton} onPress={onBack}>
                            <Text style={styles.goBackText}>חזרה לרשימת התשלומים</Text>
                            <Ionicons name="return-up-forward-outline" size={24} color="#e3b5b8" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.title}>ביצוע תשלום</Text>
                    <TouchableOpacity
                        style={styles.paypalPaymentButton}
                        onPress={handlePayPalPress}
                    >
                        <View style={styles.buttonContainer}>
                            <Image source={require('../../../assets/images/PayPalLogo.png')} style={styles.paypalLogo} />
                            <Text style={styles.payText}>Pay</Text>
                            <Text style={styles.palText}>Pal</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.creditCardPaymentButton}
                        onPress={handleCreditCardPress}
                    >
                        <View style={styles.buttonContainer}>
                            <FontAwesome5 name="credit-card" size={15} color="white" />
                            <Text style={styles.creditCardText}>כרטיס אשראי</Text>
                        </View>
                    </TouchableOpacity>
                    {selectedMethod === 'CreditCard' && (
                        <LinearGradient colors={['#ced9e3', '#dee6ed', '#eff2f6', '#ffffff']} style={styles.paymentForm}>
                            <Text style={styles.subTitle}>הזן פרטי אשראי</Text>
                            <View style={styles.amountContainer}>
                                <Text style={styles.paymentAmountTitle}>סכום העסקה:  </Text>
                                <Text style={styles.paymentAmount}> ILS </Text>
                                <Text style={styles.paymentAmount}>{paymentAmount}</Text>
                            </View>
                            <CardField
                                postalCodeEnabled={false}
                                placeholders={{
                                    number: '**** **** **** ****',
                                }}
                                cardStyle={styles.cardField}
                                style={styles.cardContainer}
                            />
                            <TouchableOpacity style={styles.submitPayButton} onPress={handleCreditCardPayment}>
                                <Text style={styles.submitPayButtonText}>בצע תשלום</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    )}
                    {showSuccessImage && (
                        <Modal visible={true} transparent={true} animationType="slide">
                            <View style={styles.modalContainer}>
                                <Image source={require('../../../assets/images/paymentSuccess.png')} style={styles.successImage} />
                            </View>
                        </Modal>
                    )}
                    {approvalUrl && (
                        <Modal visible={true} transparent={true} animationType="slide">
                            <View style={styles.modalContainer}>
                                <TouchableOpacity style={styles.returnButton} onPress={() => setApprovalUrl(null)}>
                                    <Text style={styles.returnButtonText}>חזרה</Text>
                                </TouchableOpacity>
                                <View style={styles.webViewContainer}>
                                    <WebView
                                        originWhitelist={['*']}
                                        source={{ uri: approvalUrl }}
                                        javaScriptEnabled={true}
                                        domStorageEnabled={true}
                                        allowsInlineMediaPlayback={true}
                                        mixedContentMode="always"
                                        androidLayerType="software"
                                        onError={(syntheticEvent) => {
                                            setApprovalUrl(null);
                                        }}
                                        onHttpError={(syntheticEvent) => {
                                            const { nativeEvent } = syntheticEvent;
                                            console.warn('WebView HTTP error: ', nativeEvent);
                                            Alert.alert('WebView HTTP error', `Failed to load PayPal page: ${nativeEvent.description}`);
                                        }}
                                        style={styles.webView}
                                        onNavigationStateChange={handleNavigationStateChange}
                                    />
                                </View>
                            </View>
                        </Modal>
                    )}
                    <CustomAlert visible={showAlert} message={alertMessage} />
                </View>
            </LinearGradient>
        </StripeProvider>
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
        paddingHorizontal: 10,
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
    title: {
        marginTop: 20,
        marginBottom: 5,
        color: '#496783',
        fontSize: 23,
        textAlign: 'center',
        fontFamily: 'FredokaBold',
    },
    subTitle: {
        marginTop: 20,
        marginBottom: 5,
        color: 'rgba(73, 103, 131, 1)',
        fontSize: 20,
        textAlign: 'center',
        fontFamily: 'FredokaBold',
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    paypalLogo: {
        width: 20,
        height: 20,
        marginRight: 5,
    },
    payText: {
        color: '#00457C',
        textAlign: 'center',
        fontFamily: 'FredokaSemibold',
        fontSize: 16,
    },
    palText: {
        color: '#0079C1',
        textAlign: 'center',
        fontFamily: 'FredokaSemibold',
        fontSize: 16,
    },
    paypalPaymentButton: {
        padding: 10,
        backgroundColor: 'rgba(173, 192, 209, 0.8)',
        borderRadius: 5,
        marginVertical: 15,
        width: '80%',
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    creditCardPaymentButton: {
        padding: 10,
        backgroundColor: 'rgba(212, 170, 173, 0.6)',
        borderRadius: 5,
        marginVertical: 2,
        width: '80%',
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        marginTop: -2,
    },
    creditCardText: {
        color: '#fff',
        textAlign: 'center',
        fontFamily: 'FredokaSemibold',
        marginLeft: 5,
        fontSize: 16,
    },
    paymentAmountTitle:{
        color: 'rgba(73, 103, 131, 0.9)',
        fontSize: 16,
        fontFamily: 'FredokaMedium',
        textAlign: 'center',
    },
    paymentAmount: {
        color: '#737373',
        fontSize: 14,
        fontFamily: 'FredokaRegular',
        textAlign: 'center',
    },
    amountContainer: {
        flexDirection: 'row-reverse',
        justifyContent: 'center',
        alignItems: 'baseline',
        marginBottom: 10

    },
    paymentForm: {
        width: '90%',
        marginTop: 30,
        paddingVertical: 15,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(239, 242, 246, 0.7)',
        borderColor: 'rgba(173, 192, 209, 0.6)',
        borderWidth: 2,
        borderRadius: 5,
        shadowColor: '#000000',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 2,
    },
    cardContainer: {
        height: 40,
        backgroundColor: 'rgba(108, 141, 172, 0.1)',
        borderColor: 'rgba(173, 192, 209, 0.6)',
        borderWidth: 2,
        borderRadius: 5,
        shadowColor: '#000000',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 2,
        marginTop: 10
    },
    cardField: {
        width: '100%',
        height: '100%',
        borderRadius: 5,
        borderWidth: 1,
        padding: 10,
    },
    submitPayButton: {
        marginTop: 10,
        marginBottom: 15,
        alignSelf: 'center',
        padding: 10,
        backgroundColor: 'rgba(73, 103, 131, 0.5)',
        borderRadius: 5,
        marginVertical: 5,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 2,
    },
    submitPayButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'FredokaSemibold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    returnButton: {
        alignSelf: 'center',
        backgroundColor: '#9db3c8',
        paddingVertical: 8,
        width: '20%',
        borderRadius: 15,
        margin: 10,
        alignItems: 'center',
        borderColor: '#7c9ab6',
        borderWidth: 1,
        elevation: 3,
        shadowColor: 'black',
        shadowOpacity: 0.1,
        shadowOffset: { width: 1, height: 1 },
        shadowRadius: 5,
    },
    returnButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontFamily: 'FredokaSemibold',
    },
    webViewContainer: {
        width: '90%',
        height: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        overflow: 'hidden',
        padding: 20
    },
    webView: {
        flex: 1,
    },
    successImage: {
        width: 320,
        height: 500,
        borderRadius: 10,
        padding: 30
    },
});

export default PaymentForm;
