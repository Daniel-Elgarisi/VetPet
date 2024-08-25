import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchBloodsTestResultDetails, fetchBloodTestFindingsInfo } from '../../../api/petsMedicalTestsResultsApi';
import FindingBloodResultComponent from './FindingBloodResultComponent';

const BloodsTestResult = ({ test, tableName, petGender, pet_type, onBack }) => {
    const [petTestResult, setPetTestResult] = useState([]);
    const [bloodTestFindingsInfo, setBloodTestFindingsInfo] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBloodTestResult = async () => {
            try {
                const testResult = await fetchBloodsTestResultDetails(test.id, tableName);
                setPetTestResult(testResult);
                const findingsInfo = await fetchBloodTestFindingsInfo(test.test_type, petGender, pet_type);
                setBloodTestFindingsInfo(findingsInfo);
                setIsLoading(false);
            } catch (error) {
                if (!error.response || error.response.status !== 404) {
                    const message = error.response?.data?.message || "אירעה שגיאה בהחזרת תוצאות הבדיקות של חיית המחמד";
                    Alert.alert('שגיאה', message);
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchBloodTestResult();
    }, []);

    const results = Object.entries(petTestResult)
        .filter(([key, value]) => value !== null)
        .map(([key, value]) => {
            const findingInfo = bloodTestFindingsInfo.find(finding => finding.finding_name === key);
            return { finding_name: key, value, ...findingInfo };
        });

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.goBackContainer}>
                <TouchableOpacity style={styles.goBackButton} onPress={onBack}>
                    <Text style={styles.goBackText}>חזרה לרשימת הבדיקות</Text>
                    <Ionicons name="return-up-forward-outline" size={24} color="#e3b5b8" />
                </TouchableOpacity>
            </View>
            {isLoading ? (
                <ActivityIndicator size="large" color="#8da7bf" style={styles.indicator}/>
            ) : (
                <View style={styles.testContainer}>
                    <Text style={styles.title}>{test.test_type}</Text>
                    <Text style={styles.testDate}>בוצע בתאריך: {test.date_executed}</Text>
                    {results.map((result, index) => (
                        <FindingBloodResultComponent key={index} findingResult={result} findingInfo={result} />
                    ))}
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
    testContainer:{
        marginBottom: 50
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
        marginTop: 15,
        marginBottom: 8,
        color: '#496783',
        fontSize: 20,
        textAlign: 'center',
        fontFamily: 'FredokaBold',
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
    findingContainer: {
        marginBottom: 20,
        padding: 10,
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
    findingKey: {
        fontSize: 15,
        marginBottom: 5,
        fontFamily: 'FredokaRegular',
        color: '#525960',
    },
    axisContainer: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    axis: {
        position: 'relative',
        width: '85%',
        height: 5,
        backgroundColor: '#7c9ab6',
        marginBottom: 10,
    },
    normalRange: {
        position: 'absolute',
        height: '100%',
    },
    resultMarker: {
        position: 'absolute',
        top: -18,
        transform: [{ translateX: -13 }]  // Adjusting for the center position
    },
    findingValue: {
        fontFamily: 'FredokaRegular',
        color: '#666',
        marginBottom: 5,
    },
    axisLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '85%',
    },
    axisLabel: {
        fontFamily: 'FredokaRegular',
        color: '#9199a1',
        fontSize: 12,
    },
    attachments: {
        marginTop: 20,
    },
    attachmentsText: {
        fontSize: 16,
        fontFamily: 'FredokaSemibold',
        color: '#3b5268',
        textAlign: 'center',
    },
    indicator: {
        marginTop: '70%'
    }
});

export default BloodsTestResult;