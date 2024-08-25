import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { Ionicons, Entypo } from '@expo/vector-icons';
import { fetchBloodsTestResultDetails } from '../../../api/petsMedicalTestsResultsApi';
import { getOwnerId } from '../../../api/ownerApi';
import { fetchOwnerDetails } from '../../../api/updateOwnerDetailsApi';
import findingsTranslations from './findingsTranslations';
import ViewShot from 'react-native-view-shot';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';

const DiagnosticImagingTestResult = ({ test, tableName, petName, dateOfBirthPet, onBack }) => {
    const [petTestResult, setPetTestResult] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [ownerName, setOwnerName] = useState('');
    const viewShotRef = useRef();

    useEffect(() => {
        const fetchDiagnosticImagingTestResult = async () => {
            try {
                const testResult = await fetchBloodsTestResultDetails(test.id, tableName);
                setPetTestResult(testResult);
                const ownerId = await getOwnerId();
                const ownerInfo = await fetchOwnerDetails(ownerId);
                setOwnerName(ownerInfo.name);
            } catch (error) {
                if (!error.response || error.response.status !== 404) {
                    const message = error.response?.data?.message || "אירעה שגיאה בהחזרת תוצאות הבדיקות של חיית המחמד";
                    Alert.alert('שגיאה', message);
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchDiagnosticImagingTestResult();
    }, []);

    const importantFindings = ['BodyPart', 'Views', 'RadiologistName', 'RadiologistReport', 'ExamType', 'Diagnosis'];
    const renderFindings = (keys) => {
        return keys.map((key) => {
            let value = petTestResult[key];
            if (value !== null) {
                const translatedName = findingsTranslations[key] || key;
                if (value === true)
                    value = 'חיובי';
                else if (value === false)
                    value = 'שלילי';
                const formattedValue = value.split('. ').join('.\n');
                return (
                    <View key={key} style={styles.infoContainer}>
                        <Text style={styles.findingKey}>{translatedName}:</Text>
                        <Text style={styles.findingValue}>{formattedValue}</Text>
                    </View>
                );
            }
            return null;
        });
    };

    const importantFindingsKeys = Object.keys(petTestResult).filter(key => importantFindings.includes(key));
    const otherFindingsKeys = Object.keys(petTestResult).filter(key => !importantFindings.includes(key));

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
                            align-items: flex-start;
                            width: 100%;
                            height: 100%;
                        }
                        .page {
                            width: 210mm;
                            height: 297mm;
                            box-sizing: border-box;
                            padding: 15mm;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            transform: scale(0.7,0.8);
                            transform-origin: top center;
                        }
                        .content-container {
                            display: flex;
                            flex-direction: column;
                            alignItems: flex-start;
                            width: 100%;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 20px;
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
                        <div class="content-container">
                            <div class="header">
                                <img src="data:image/jpg;base64,${uri}" />
                            </div>
                        </div>
                    </div>
                </body>
            </html>
            `;

            const filename = `תוצאות_${test.test_type}_${petName}_${test.date_executed}.pdf`;
            const tempFilename = `temp_${Date.now()}.pdf`;
            const { uri: pdfUri } = await Print.printToFileAsync({ html: htmlContent, width: 595, height: 842, base64: false, fileName: tempFilename });
            const newFilePath = `${FileSystem.documentDirectory}${filename}`;

            await FileSystem.moveAsync({
                from: pdfUri,
                to: newFilePath,
            });

            await Print.printAsync({ uri: newFilePath });
            Alert.alert('הצלחה', `תוצאת הבדיקה נשמרה בהצלחה.`);
        } catch (error) {
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.goBackContainer}>
                <TouchableOpacity style={styles.goBackButton} onPress={onBack}>
                    <Text style={styles.goBackText}>חזרה לרשימת הבדיקות</Text>
                    <Ionicons name="return-up-forward-outline" size={24} color="#e3b5b8" />
                </TouchableOpacity>
            </View>
            {isLoading ? (
                <ActivityIndicator size="large" color="#8da7bf" style={styles.indicator} />
            ) : (
                <View style={styles.testContainer}>
                    <View style={styles.centeredContainer}>
                        <TouchableOpacity style={styles.pdfButton} onPress={captureAndSharePDF}>
                            <Entypo name="export" size={20} color="#7c9ab6" />
                            <Text style={styles.pdfButtonText}>הורדה</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.findingsContainer}>
                        <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9, result: 'base64', width: 1080, height: 1920 }} style={{ backgroundColor: 'white' }}>
                            <Image
                                source={require('../../../assets/images/VetPetLogo.png')}
                                style={styles.headerImage}
                            />
                            <View style={styles.titleContainer}>
                                <Text style={styles.title}>תוצאות </Text>
                                <Text style={styles.title}>{test.test_type}</Text>
                            </View>
                            <Text style={styles.testDate}>בוצעה בתאריך: {test.date_executed}</Text>
                            <View style={styles.testInfoContainer}>
                                <View style={styles.infoContainer}>
                                    <Text style={styles.findingKey}>שם בעל חיית המחמד:</Text>
                                    <Text style={styles.findingValue}>{ownerName}</Text>
                                </View>
                                <View style={styles.infoContainer}>
                                    <Text style={styles.findingKey}>שם חיית המחמד:</Text>
                                    <Text style={styles.findingValue}>{petName}</Text>
                                </View>
                                <View style={styles.infoContainer}>
                                    <Text style={styles.findingKey}>תאריך לידה:</Text>
                                    <Text style={styles.findingValue}>{dateOfBirthPet}</Text>
                                </View>
                            </View>
                            <View style={styles.testInfoContainer}>
                                <Text style={styles.infoTypeTitle}>מידע קליני</Text>
                                {renderFindings(importantFindingsKeys)}
                            </View>
                            <View style={styles.testInfoContainer}>
                                <Text style={styles.infoTypeTitle}>ממצאים</Text>
                                {renderFindings(otherFindingsKeys)}
                            </View>
                            <View style={styles.horizontalStripesContainer}>
                                <View style={styles.horizontalStripe}>
                                    <Text style={styles.horizontalHeaderText}>שם הרדיולוג</Text>
                                    <View style={styles.stripeDivider} />
                                    <Text style={styles.horizontalDataText}>{petTestResult.RadiologistName}</Text>
                                </View>
                                <View style={styles.horizontalStripe}>
                                    <Text style={styles.horizontalHeaderText}>תאריך</Text>
                                    <View style={styles.stripeDivider} />
                                    <Text style={styles.horizontalDataText}>{test.date_executed}</Text>
                                </View>
                                <View style={styles.horizontalStripe}>
                                    <Text style={styles.horizontalHeaderText}>חתימה וחותמת הרדיולוג</Text>
                                    <View style={styles.stripeDivider} />
                                    <Text style={styles.horizontalDataText}>**חתימה דיגיטלית**</Text>
                                </View>
                            </View>
                        </ViewShot>
                    </View>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
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
    testContainer: {
        marginBottom: 50
    },
    titleContainer: {
        flexDirection: 'row-reverse',
        justifyContent: 'center',
    },
    title: {
        marginTop: 5,
        marginBottom: 5,
        color: '#496783',
        fontSize: 20,
        textAlign: 'center',
        fontFamily: 'FredokaBold',
    },
    infoTypeTitle: {
        color: '#496783',
        fontSize: 16,
        textAlign: 'right',
        marginRight: 3,
        fontWeight: '800',
        fontFamily: 'FredokaSemibold',
        marginVertical: 2,
    },
    testDate: {
        fontSize: 14,
        fontFamily: 'FredokaRegular',
        color: '#6f7d8b',
        textAlign: 'center',
        marginBottom: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    findingsContainer: {
        marginTop: 20,
        marginBottom: 50,
        marginTop: 20,
        padding: 12,
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
    testInfoContainer: {
        flexDirection: 'column',
        marginVertical: 7,
    },
    infoContainer: {
        flexDirection: 'row-reverse',
        marginTop: 3,
        marginBottom: 3,
        flexWrap: 'wrap',
        marginRight: 3
    },
    findingKey: {
        fontSize: 14,
        fontWeight: '700',
        color: '#525960',
        marginLeft: 4,
    },
    findingValue: {
        fontFamily: 'FredokaRegular',
        color: '#666',
        textAlign: 'right'
    },
    headerImage: {
        width: 160,
        height: 60,
        resizeMode: 'contain',
        opacity: 0.5,
        alignSelf: 'center'
    },
    centeredContainer: {
        alignItems: 'flex-strat',
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
        maxWidth: '25%',
        width: 'auto'
    },
    pdfButtonText: {
        color: '#7c9ab6',
        fontSize: 14,
        marginRight: 5,
        fontFamily: 'FredokaSemibold',
        marginLeft: 5,
    },
    indicator: {
        marginTop: '70%',
    },
    horizontalStripesContainer: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-around',
        marginTop: 20,
        marginBottom: 15
    },
    horizontalStripe: {
        alignItems: 'center',
        flexDirection: 'column-reverse'
    },
    horizontalHeaderText: {
        fontSize: 12,
        fontFamily: 'FredokaSemibold',
        color: '#5c81a3',
        textAlign: 'center',
    },
    stripeDivider: {
        width: '100%',
        height: 1.2,
        backgroundColor: '#7c9ab6',
        marginVertical: 3.5,
    },
    horizontalDataText: {
        fontSize: 12,
        fontFamily: 'FredokaRegular',
        color: '#666',
        textAlign: 'center',
    },
});

export default DiagnosticImagingTestResult;