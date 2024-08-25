import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Alert } from 'react-native';
import { MaterialIcons, EvilIcons, Ionicons, Foundation } from 'react-native-vector-icons';
import { Picker } from '@react-native-picker/picker';
import { fetchPetPrescriptions } from '../../../api/prescriptionsApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DisplayPrescription from './DisplayPrescription';

const PrescriptionsList = ({ goBack }) => {
    const [petId, setPetId] = useState(null);
    const [prescriptions, setPrescriptions] = useState([]);
    const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [selectedYear, setSelectedYear] = useState('');
    const [filterVisible, setFilterVisible] = useState(false);
    const [years, setYears] = useState([]);
    const [tempSelectedYear, setTempSelectedYear] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadPrescriptions = async () => {
            try {
                const serializedPet = await AsyncStorage.getItem('selectedPetId');
                const petId = JSON.parse(serializedPet).petId;
                setPetId(petId);
                const petPrescriptions = await fetchPetPrescriptions(petId);
                const prescriptionYears = ['כל השנים'];
                petPrescriptions.forEach(prescription => {
                    const year = prescription.appointment_date.split('-')[2];
                    if (!prescriptionYears.includes(year)) {
                        prescriptionYears.push(year);
                    }
                });

                prescriptionYears.sort((a, b) => b - a);
                setYears(prescriptionYears);

                const sortedPrescriptions = petPrescriptions.sort((a, b) => {
                    const [dayA, monthA, yearA] = a.appointment_date.split('-');
                    const [dayB, monthB, yearB] = b.appointment_date.split('-');
                    return new Date(`${yearB}-${monthB}-${dayB}`) - new Date(`${yearA}-${monthA}-${dayA}`);
                });
                setPrescriptions(sortedPrescriptions);
                setFilteredPrescriptions(sortedPrescriptions);
            } catch (error) {
                if (!error.response || error.response.status !== 404) {
                    const message = error.response?.data?.message || "אירעה שגיאה בהחזרת מרשמי התרופות שניתנו לחיית המחמד";
                    Alert.alert('שגיאה', message);
                }
                setPrescriptions([]);
                setFilteredPrescriptions([]);
            } finally {
                setIsLoading(false);
            }
        };
        loadPrescriptions();
    }, []);

    const handleYearChange = (year) => {
        setTempSelectedYear(year);
    };

    const confirmYearChange = () => {
        setSelectedYear(tempSelectedYear);
        setFilterVisible(false);
        if (tempSelectedYear === 'כל השנים' || tempSelectedYear === '') {
            setFilteredPrescriptions(prescriptions);
        } else {
            const filtered = prescriptions.filter(prescription => prescription.appointment_date.split('-')[2] === tempSelectedYear);
            setFilteredPrescriptions(filtered);
        }
    };

    const toggleFilterModal = () => {
        setTempSelectedYear(selectedYear);
        setFilterVisible(!filterVisible);
    };

    const handlePrescriptionPress = (prescription) => {
        setSelectedPrescription(prescription);
    };

    if (selectedPrescription) {
        return <DisplayPrescription prescription={selectedPrescription} onBack={() => setSelectedPrescription(null)} />;
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
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
                <Text style={styles.title}>מרשמים ותרופות</Text>
                <View style={{ width: 24 }} />
            </View>
            {isLoading ? (
                <ActivityIndicator size="large" color="#8da7bf" />
            ) : (
                filteredPrescriptions.length > 0 ? (
                    filteredPrescriptions.map((prescription, index) => (
                        <TouchableOpacity key={index} style={styles.prescriptionContainer} onPress={() => handlePrescriptionPress(prescription)}>
                            <View style={styles.prescriptionDetails}>
                                <Text style={styles.appointmentType}>{prescription.appointment_type}</Text>
                                <Text style={styles.prescriptionDate}>{prescription.appointment_date}</Text>
                            </View>
                            <View style={styles.arrowIcon}>
                                <MaterialIcons name="keyboard-arrow-left" size={24} color="#5c81a3" />
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.noPrescriptionsContainer}>
                        <Foundation name="paw" size={18} color="#d0aeb0" />
                        <Text style={styles.noPrescriptionsText}>לא נמצאו מרשמים</Text>
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
    prescriptionContainer: {
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
    prescriptionDetails: {
        flex: 1.4,
    },
    appointmentType: {
        color: '#3b5268',
        fontSize: 14,
        fontFamily: 'FredokaSemibold',
        textAlign: 'right'
    },
    prescriptionDate: {
        color: '#666',
        fontSize: 14,
        fontFamily: 'FredokaRegular',
        textAlign: 'right',
        marginTop: 3
    },
    arrowIcon: {
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
    noPrescriptionsContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
    },
    noPrescriptionsText: {
        marginTop: 10,
        color: '#6c8dac',
        fontSize: 16,
        textAlign: 'center',
        fontFamily: 'FredokaRegular',
        marginHorizontal: 6
    },
});

export default PrescriptionsList;
