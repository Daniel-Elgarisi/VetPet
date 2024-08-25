import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Alert } from 'react-native';
import { MaterialIcons, EvilIcons, Ionicons, Foundation } from 'react-native-vector-icons';
import { Picker } from '@react-native-picker/picker';
import { fetchPetReferences } from '../../../api/referencesApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DisplayReference from './DisplayReference';

const ReferencesList = ({ goBack }) => {
    const [petInfo, setPetInfo] = useState(null);
    const [references, setReferences] = useState([]);
    const [filteredReferences, setFilteredReferences] = useState([]);
    const [selectedReference, setSelectedReference] = useState(null);
    const [selectedYear, setSelectedYear] = useState('');
    const [filterVisible, setFilterVisible] = useState(false);
    const [years, setYears] = useState([]);
    const [tempSelectedYear, setTempSelectedYear] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadReferences = async () => {
            try {
                const serializedPet = await AsyncStorage.getItem('selectedPetId');
                const petId = JSON.parse(serializedPet).petId;
                const petReferences = await fetchPetReferences(petId);
                setPetInfo(petReferences.pet);
                const referencesData = petReferences.references;

                if (referencesData.length > 0) {
                    const referencesYears = ['כל השנים'];
                    referencesData.forEach(reference => {
                        const year = reference.date_issued.split('-')[2];
                        if (!referencesYears.includes(year)) {
                            referencesYears.push(year);
                        }
                    });
                    referencesYears.sort((a, b) => b - a);
                    setYears(referencesYears);
                    const sortedReferences = referencesData.sort((a, b) => {
                        const [dayA, monthA, yearA] = a.date_issued.split('-');
                        const [dayB, monthB, yearB] = b.date_issued.split('-');
                        return new Date(`${yearB}-${monthB}-${dayB}`) - new Date(`${yearA}-${monthA}-${dayA}`);
                    });
                    setReferences(sortedReferences);
                    setFilteredReferences(sortedReferences);
                } else {
                    setReferences([]);
                    setFilteredReferences([]);
                }
            } catch (error) {
                if (!error.response || error.response.status !== 404) {
                    const message = error.response?.data?.message || "אירעה שגיאה בהחזרת הפניות שניתנו לחיית המחמד";
                    Alert.alert('שגיאה', message);
                }
                setReferences([]);
                setFilteredReferences([]);
            } finally {
                setIsLoading(false);
            }
        };
        loadReferences();
    }, []);

    const handleYearChange = (year) => {
        setTempSelectedYear(year);
    };

    const confirmYearChange = () => {
        setSelectedYear(tempSelectedYear);
        setFilterVisible(false);
        if (tempSelectedYear === 'כל השנים' || tempSelectedYear === '') {
            setFilteredReferences(references);
        } else {
            const filtered = references.filter(reference => reference.date_issued.split('-')[2] === tempSelectedYear);
            setFilteredReferences(filtered);
        }
    };

    const toggleFilterModal = () => {
        setTempSelectedYear(selectedYear);
        setFilterVisible(!filterVisible);
    };

    const handleReferencePress = (reference) => {
        setSelectedReference(reference);
    };

    if (selectedReference) {
        return <DisplayReference reference={selectedReference} petInfo={petInfo} onBack={() => setSelectedReference(null)} />;
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
                <Text style={styles.title}>הפניות</Text>
                <View style={{ width: 24 }} />
            </View>
            {isLoading ? (
                <ActivityIndicator size="large" color="#8da7bf" />
            ) : (
                filteredReferences.length > 0 ? (
                    filteredReferences.map((reference, index) => (
                        <TouchableOpacity key={index} style={styles.referenceContainer} onPress={() => handleReferencePress(reference)}>
                            <View style={styles.referenceDetails}>
                                <Text style={styles.referenceType}>הפניה לבדיקת {reference.reference_type}</Text>
                                <Text style={styles.referenceDate}>{reference.date_issued}</Text>
                            </View>
                            <View style={styles.arrowIcon}>
                                <MaterialIcons name="keyboard-arrow-left" size={24} color="#5c81a3" />
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.noReferencesContainer}>
                        <Foundation name="paw" size={18} color="#d0aeb0" />
                        <Text style={styles.noReferencesText}>לא נמצאו הפניות</Text>
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
    referenceContainer: {
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
    referenceDetails: {
        flex: 1.4,
    },
    referenceType: {
        color: '#3b5268',
        fontSize: 14,
        fontFamily: 'FredokaSemibold',
        textAlign: 'right'
    },
    referenceDate: {
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
    noReferencesContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
    },
    noReferencesText: {
        marginTop: 10,
        color: '#6c8dac',
        fontSize: 16,
        textAlign: 'center',
        fontFamily: 'FredokaRegular',
        marginHorizontal: 6
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
});

export default ReferencesList;
