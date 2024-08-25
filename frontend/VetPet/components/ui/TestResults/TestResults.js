import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, EvilIcons, MaterialIcons, Foundation } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { fetchpetsMedicalTestsResults } from '../../../api/petsMedicalTestsResultsApi';
import { fetchPetDetails } from '../../../api/petsApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BloodsTestResult from './BloodsTestResult';
import DiagnosticImagingTestResult from './DiagnosticImagingTestResult';

const DisplayTestResults = ({ goBack }) => {
    const [medicalTestsResults, setMedicalTestsResults] = useState([]);
    const [filteredTestResults, setFilteredTestResults] = useState([]);
    const [selectedYear, setSelectedYear] = useState('');
    const [filterVisible, setFilterVisible] = useState(false);
    const [years, setYears] = useState([]);
    const [tempSelectedYear, setTempSelectedYear] = useState('');
    const [currentTest, setCurrentTest] = useState(null);
    const [petInfo, setPetInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPetsTestsResults = async () => {
            try {
                const serializedPet = await AsyncStorage.getItem('selectedPetId');
                const petId = JSON.parse(serializedPet).petId;
                const petInfo = await fetchPetDetails(petId);
                setPetInfo(petInfo);
                const petDateOfBirth = petInfo.dateofbirth;
                const birthYear = parseInt(petDateOfBirth.split('-')[2], 10);
                const currentYear = new Date().getFullYear();
                const yearArray = ['כל התוצאות'];
                for (let year = currentYear; year >= birthYear; year--) {
                    yearArray.push(year.toString());
                }
                setYears(yearArray);
                const testsResults = await fetchpetsMedicalTestsResults(petId);
                const sortedTests = testsResults.sort((a, b) => {
                    const dateA = new Date(a.date_executed.split('-').reverse().join('-'));
                    const dateB = new Date(b.date_executed.split('-').reverse().join('-'));
                    return dateB - dateA;
                });
                setMedicalTestsResults(sortedTests);
                setFilteredTestResults(sortedTests);
            } catch (error) {
                if (!error.response || error.response.status !== 404) {
                    const message = error.response?.data?.message || "אירעה שגיאה בהחזרת תוצאות הבדיקות של חיית המחמד";
                    Alert.alert('שגיאה', message);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchPetsTestsResults();
    }, []);

    const toggleFilterModal = () => {
        setTempSelectedYear(selectedYear);
        setFilterVisible(!filterVisible);
    };

    const handleYearChange = (year) => {
        setTempSelectedYear(year);
    };

    const confirmYearChange = () => {
        setSelectedYear(tempSelectedYear);
        setFilterVisible(false);

        if (tempSelectedYear === 'כל התוצאות' || tempSelectedYear === '') {
            setFilteredTestResults(medicalTestsResults);
        } else {
            const filteredResults = medicalTestsResults.filter(test => {
                const testYear = test.date_executed.split('-')[2]; // Extract year from date_executed
                return testYear === tempSelectedYear;
            });
            setFilteredTestResults(filteredResults);
        }
    };

    const viewTestDetails = (test) => {
        setCurrentTest(test);
    };

    const handleBackToList = () => {
        setCurrentTest(null);
    };


    if (currentTest) {
        let tableName;
        let isBloods = true;
        switch (currentTest.test_type) {
            case '(CBC) ספירת דם':
                tableName = 'complete_blood_count_results';
                break;
            case 'כימיה בדם':
                tableName = 'blood_chemistry_results';
                break;
            case 'בדיקת שתן':
                tableName = 'urinalysis_results';
                break;
            case 'בדיקת צואה':
                tableName = 'fecal_examination_results';
                break;
            case '(TSH) תפקוד בלוטת התריס ':
                tableName = 'thyroid_function_results';
                break;
            case 'תפקוד הלבלב':
                tableName = 'pancreatic_function_results';
                break;
            case 'פרופיל קרישה':
                tableName = 'coagulation_profile_results';
                break;
            case 'רנטגן':
                tableName = 'xray_results';
                isBloods = false;
                break;
            case 'אולטרסאונד':
                tableName = 'ultrasound_results';
                isBloods = false;
                break;
            case 'MRI':
                tableName = 'mri_results';
                isBloods = false;
                break;
            case 'CT סריקת':
                tableName = 'ct_scan_results';
                isBloods = false;
                break;
            default:
                tableName = '';
                break;
        }
        if (isBloods)
            return <BloodsTestResult test={currentTest} tableName={tableName} petGender={petInfo.sex} pet_type={petInfo.pet_type} onBack={handleBackToList} />;
        else
            return <DiagnosticImagingTestResult test={currentTest} tableName={tableName} petName={petInfo.name} dateOfBirthPet={petInfo.dateofbirth} onBack={handleBackToList} />;
    }

    return (
        <ScrollView contentContainerStyle={[styles.container, styles.scrollViewContent]}>
            <View style={styles.goBackContainer}>
                <TouchableOpacity style={styles.goBackButton} onPress={goBack}>
                    <Text style={styles.goBackText}>חזרה לתפריט</Text>
                    <Ionicons name="return-up-forward-outline" size={24} color="#e3b5b8" />
                </TouchableOpacity>
            </View>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={toggleFilterModal}>
                    <Ionicons name="filter" size={24} color="#dca3a6" />
                </TouchableOpacity>
                <Text style={styles.title}>תוצאות בדיקות</Text>
                <View style={{ width: 24 }} />
            </View>
            {loading ? (
                <ActivityIndicator size="large" color="#8da7bf" />
            ) : (
                filteredTestResults.length > 0 ? (
                    filteredTestResults.map((test, index) => (
                        <TouchableOpacity key={index} style={styles.testContainer} onPress={() => viewTestDetails(test)}>
                            <View style={styles.testDetails}>
                                <Text style={styles.testName}>{test.test_type}</Text>
                                <Text style={styles.testDate}>{test.date_executed}</Text>
                            </View>
                            <View style={styles.testIcons}>
                                <MaterialIcons name="keyboard-arrow-left" size={24} color="#5c81a3" />
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.noTestsContainer}>
                        <Foundation name="paw" size={18} color="#d0aeb0" />
                        <Text style={styles.noTestsText}>לא נמצאו תוצאות בדיקות</Text>
                        <Foundation name="paw" size={18} color="#d0aeb0" />
                    </View>
                )
            )}
            <Modal
                transparent={true}
                animationType="slide"
                visible={filterVisible}
                onRequestClose={toggleFilterModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity style={styles.closeButton} onPress={toggleFilterModal}>
                            <EvilIcons name="close" size={22} color="black" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>בחר שנה</Text>
                        <Picker
                            selectedValue={tempSelectedYear}
                            onValueChange={(itemValue) => handleYearChange(itemValue)}
                            style={styles.picker}
                        >
                            {years.map(year => (
                                <Picker.Item key={year} label={year} value={year} />
                            ))}
                        </Picker>
                        <TouchableOpacity style={styles.filterButton} onPress={confirmYearChange}>
                            <Text style={styles.filterButtonText}>סינון</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    scrollViewContent: {
        paddingBottom: 80,
    },
    title: {
        marginTop: 5,
        marginBottom: 15,
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
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    testContainer: {
        backgroundColor: 'rgba(255, 255, 255,0.6)',
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#d1bdbd',
        marginVertical: 3,
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    testDetails: {
        flex: 1.4,
    },
    testName: {
        color: '#3b5268',
        fontSize: 14,
        fontFamily: 'FredokaSemibold',
        textAlign: 'right'
    },
    testDate: {
        color: '#666',
        fontSize: 14,
        fontFamily: 'FredokaRegular',
        textAlign: 'right'
    },
    testIcons: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '70%',
        height: '40%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: 'FredokaBold',
        marginBottom: -10,
        color: '#496783'
    },
    picker: {
        width: '100%',
    },
    filterButton: {
        marginTop: 0,
        backgroundColor: '#adc0d1',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    filterButtonText: {
        color: 'white',
        fontFamily: 'FredokaSemibold',
    },
    noTestsContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
    },
    noTestsText: {
        marginTop: 10,
        color: '#6c8dac',
        fontSize: 16,
        textAlign: 'center',
        fontFamily: 'FredokaRegular',
        marginHorizontal: 6
    },
});

export default DisplayTestResults;

