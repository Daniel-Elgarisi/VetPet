import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Entypo } from '@expo/vector-icons';
import { fetchOwnerDetails } from '../../../api/updateOwnerDetailsApi';
import ViewShot from 'react-native-view-shot';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';

const formatDescription = (description) => {
    const keyword = 'עבור';
    const index = description.indexOf(keyword);
    if (index !== -1) {
        return description.substring(0, index) + '\n' + description.substring(index);
    }
    return description;
};

const ReceiptDisplay = ({ receipt, onBack }) => {
    const viewShotRef = useRef();
    const [loading, setLoading] = useState(true);
    const [ownerDetails, setOwnerDetails] = useState(null);

    useEffect(() => {
        const LoadDataForReceiptDisplay = async () => {
            try {
                const owner_details = await fetchOwnerDetails(receipt.owner_id);
                setOwnerDetails(owner_details);
            } catch (error) {
                console.log("Failed to load owner data", error);
            } finally {
                setLoading(false);
            }
        };
        LoadDataForReceiptDisplay();
    }, []);

    const captureAndSharePDF = async () => {
        try {
            const uri = await viewShotRef.current.capture({ format: 'jpg', quality: 0.9, result: 'base64' });

            const htmlContent = `
            <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 0;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            transform: scale(0.9, 0.7);
                            transform-origin: top center;
                            margin-top: 100;
                            width: 100%;
                            height: 80%;
                        }
                        .page {
                            width: 210mm;
                            height: 297mm;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            box-sizing: border-box;
                            padding: 15mm;
                        }
                        img {
                            width: 100%;
                            height: auto;
                            max-width: 100%;
                            max-height: 100%;
                        }
                    </style>
                </head>
                <body>
                    <div class="page">
                        <img src="data:image/jpg;base64,${uri}" />
                    </div>
                </body>
            </html>
            `;

            const filename = `קבלה_${receipt.description}_${receipt.created_at}.pdf`;
            const tempFilename = `temp_${Date.now()}.pdf`;
            const { uri: pdfUri } = await Print.printToFileAsync({ html: htmlContent, width: 595, height: 842, base64: false, fileName: tempFilename });
            const newFilePath = `${FileSystem.documentDirectory}${filename}`;

            await FileSystem.moveAsync({
                from: pdfUri,
                to: newFilePath,
            });

            await Print.printAsync({ uri: newFilePath });
            Alert.alert('הצלחה', `הקבלה נשמרה בהצלחה.`);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <LinearGradient colors={['#c9d9e8', '#e8f9fc', '#f8eced']} style={styles.mainContainer}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.goBackContainer}>
                    <TouchableOpacity style={styles.goBackButton} onPress={onBack}>
                        <Text style={styles.goBackText}>חזרה לרשימת הקבלות</Text>
                        <Ionicons name="return-up-forward-outline" size={24} color="#e3b5b8" />
                    </TouchableOpacity>
                </View>
                {loading ? (
                    <ActivityIndicator size="large" color="#8da7bf" />
                ) : (
                    <>
                        <View style={styles.centeredContainer}>
                            <TouchableOpacity style={styles.pdfButton} onPress={captureAndSharePDF}>
                                <Entypo name="export" size={20} color="#7c9ab6" />
                                <Text style={styles.pdfButtonText}>הורדה</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.receiptContainer}>
                            <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9, result: 'base64', width: 1080, height: 1920 }} style={{ backgroundColor: 'white' }}>
                                <Image
                                    source={require('../../../assets/images/VetPetHeader2.png')}
                                    style={styles.headerImage}
                                />
                                <Text style={styles.title}>קבלה מס' {receipt.id}</Text>
                                <View style={styles.divider1} />
                                <View style={styles.infoContainer}>
                                    <View style={styles.section}>
                                        <Text style={styles.headText}>לכבוד:</Text>
                                        {ownerDetails && (
                                            <>
                                                <Text style={styles.receiptText}>{ownerDetails.name}</Text>
                                                <Text style={styles.receiptText}>ת.ז: {ownerDetails.identity_number}</Text>
                                            </>
                                        )}
                                    </View>
                                    <View style={styles.sectionDate}>
                                        <Text style={styles.headText}>תאריך העסקה:</Text>
                                        <Text style={styles.receiptText}>{receipt.created_at}</Text>
                                    </View>
                                </View>
                                <View style={styles.receiptDetails}>
                                    <View style={styles.headerDetailRow}>
                                        <Text style={[styles.detailHeader, styles.descriptionHeader]}>תיאור</Text>
                                        <Text style={styles.detailHeader}>מחיר</Text>
                                        <Text style={[styles.detailHeader, styles.quantityHeader]}>כמות</Text>
                                        <Text style={styles.detailHeader}>סכום</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={[styles.detailText, styles.descriptionText]}>{formatDescription(receipt.description)}</Text>
                                        <Text style={styles.detailText}>₪{receipt.amount}</Text>
                                        <Text style={[styles.detailText, styles.quantityText]}>1</Text>
                                        <Text style={styles.detailText}>₪{receipt.amount}</Text>
                                    </View>
                                    <View style={styles.divider2} />
                                    <View style={styles.totalContainer}>
                                        <View style={styles.TotalRow}>
                                            <Text style={styles.totalText}>סיכום ביניים</Text>
                                            <Text style={styles.totalAmount}>₪{receipt.amount}</Text>
                                        </View>
                                        <View style={styles.divider2} />
                                        <View style={styles.TotalRow}>
                                            <Text style={styles.totalText}>סכום כולל</Text>
                                            <Text style={styles.totalAmount}>₪{receipt.amount}</Text>
                                        </View>
                                        <View style={styles.divider2} />
                                        <View style={styles.TotalRow}>
                                            <Text style={styles.totalText}>תשלום</Text>
                                            <Text style={styles.totalAmount}>₪{receipt.amount}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.paymentMethodSection}>
                                        <Text style={styles.headText}>מזהה עסקה:</Text>
                                        <Text style={styles.receiptPaymentMethod}>{receipt.transaction_id}</Text>
                                    </View>
                                    <View style={styles.paymentMethodSection}>
                                        <Text style={styles.headText}>אמצעי תשלום:</Text>
                                        <Text style={styles.receiptPaymentMethod}>{receipt.payment_method}</Text>
                                    </View>
                                    <View style={styles.divider3} />
                                </View>
                            </ViewShot>
                        </View>
                    </>
                )}
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1
    },
    container: {
        flexGrow: 1,
        marginTop: '5%',
        alignItems: 'stretch',
        paddingHorizontal: 10,
    },
    title: {
        marginTop: 5,
        marginBottom: 5,
        color: '#496783',
        fontSize: 20,
        textAlign: 'center',
        fontFamily: 'FredokaBold',
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
    centeredContainer: {
        alignItems: 'flex-start',
        marginBottom: -10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 2,
        elevation: 3,
    },
    pdfButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#e3b5b8',
        borderWidth: 1.2,
        padding: 5,
        borderRadius: 5,
        width: 'auto',
    },
    pdfButtonText: {
        color: '#7c9ab6',
        fontSize: 14,
        marginRight: 5,
        fontFamily: 'FredokaSemibold',
        marginLeft: 5,
    },
    receiptContainer: {
        alignItems: 'stretch',
        marginTop: 20,
        marginBottom: 50,
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    headerImage: {
        width: 160,
        height: 60,
        resizeMode: 'contain',
        opacity: 0.5,
        alignSelf: 'left',
        marginLeft: -40
    },
    title: {
        fontSize: 18,
        fontFamily: 'FredokaSemibold',
        color: '#5c81a3',
        textAlign: 'right',
        marginBottom: 10,
        marginTop: -20
    },
    infoContainer: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between'
    },
    section: {
        marginBottom: 12
    },
    sectionDate: {
        marginLeft: 20
    },
    receiptText: {
        fontSize: 14,
        fontFamily: 'FredokaRegular',
        color: '#666',
        marginBottom: 2,
        textAlign: 'right',
    },
    receiptPaymentMethod: {
        fontSize: 14,
        fontFamily: 'FredokaRegular',
        color: '#666',
        marginBottom: 2,
        textAlign: 'right',
        marginRight: 8
    },
    headText: {
        fontSize: 14,
        fontFamily: 'FredokaSemibold',
        color: '#666',
        marginBottom: 2,
        textAlign: 'right',
    },
    divider1: {
        width: '100%',
        height: 2,
        backgroundColor: '#7c9ab6',
        marginTop: -2,
        marginBottom: 12
    },
    divider2: {
        width: '100%',
        height: 2,
        backgroundColor: 'rgba(73, 103, 131, 0.15)',
        marginTop: -2,
    },
    divider3: {
        marginBottom: 30,
        width: '100%',
        height: 2,
        backgroundColor: '#7c9ab6',
        marginTop: -2,
        marginTop: 15
    },
    receiptDetails: {
        marginTop: 5,
    },
    detailRow: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(73, 103, 131, 0.05)',
        padding: 5
    },
    TotalRow: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(73, 103, 131, 0.05)',
        padding: 5
    },
    headerDetailRow: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(73, 103, 131, 0.2)',
        padding: 5
    },
    detailHeader: {
        fontSize: 14,
        fontFamily: 'FredokaSemibold',
        color: '#496783',
        flex: 2,
        textAlign: 'center',
    },
    detailText: {
        fontSize: 14,
        fontFamily: 'FredokaRegular',
        color: '#666',
        flex: 2,
        textAlign: 'center',
    },
    quantityHeader: {
        flex: 1,
        marginHorizontal: 10
    },
    quantityText: {
        flex: 1,
        marginHorizontal: 10
    },
    descriptionHeader: {
        flex: 3.2,
        textAlign: 'right',
    },
    descriptionText: {
        flex: 3.2,
        textAlign: 'right',
    },
    totalContainer: {
        width: '50%',
        marginBottom: 25
    },
    totalText: {
        fontSize: 14,
        fontFamily: 'FredokaRegular',
        color: '#666',
        flex: 1,
        textAlign: 'center',
        marginLeft: 10
    },
    totalAmount: {
        fontSize: 14,
        fontFamily: 'FredokaRegular',
        color: '#666',
        flex: 1,
        textAlign: 'center',
    },
    paymentMethodSection: {
        marginTop: 2,
        flexDirection: 'row-reverse'
    }
});

export default ReceiptDisplay;
