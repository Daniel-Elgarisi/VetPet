import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons, Entypo } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import DisplayReferenceDetails from './DisplayReferenceDetails';

const DisplayReference = ({ reference, petInfo, onBack }) => {
    const viewShotRef = useRef();

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
                            transform: scale(0.5, 0.6);
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

            const filename = `הפניה לבדיקת_${reference.reference_type}_עבור_${petInfo.name}_${reference.date_issued}.pdf`;
            const tempFilename = `temp_${Date.now()}.pdf`;
            const { uri: pdfUri } = await Print.printToFileAsync({ html: htmlContent, width: 595, height: 842, base64: false, fileName: tempFilename });
            const newFilePath = `${FileSystem.documentDirectory}${filename}`;

            await FileSystem.moveAsync({
                from: pdfUri,
                to: newFilePath,
            });

            await Print.printAsync({ uri: newFilePath });
            Alert.alert('הצלחה', `ההפניה נשמרה בהצלחה.`);
        } catch (error) {
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.goBackContainer}>
                <TouchableOpacity style={styles.goBackButton} onPress={onBack}>
                    <Text style={styles.goBackText}>חזרה לרשימת ההפניות</Text>
                    <Ionicons name="return-up-forward-outline" size={24} color="#e3b5b8" />
                </TouchableOpacity>
            </View>
            <View style={styles.centeredContainer}>
                <TouchableOpacity style={styles.pdfButton} onPress={captureAndSharePDF}>
                    <Entypo name="export" size={20} color="#7c9ab6" />
                    <Text style={styles.pdfButtonText}>הורדה</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.referenceContainer}>
                <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9, result: 'base64', width: 1080, height: 1920 }} style={{ backgroundColor: 'white' }}>
                    <DisplayReferenceDetails reference={reference} petInfo={petInfo} />
                </ViewShot>
            </View>
        </ScrollView>
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
    referenceContainer: {
        alignItems: 'stretch',
        marginTop: 20,
        marginBottom: 70,
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
});

export default DisplayReference;
