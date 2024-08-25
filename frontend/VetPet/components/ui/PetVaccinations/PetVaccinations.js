import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, EvilIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchPetDetails, fetchVaccinations } from '../../../api/petsApi';

const DisplayPetVaccinations = ({ goBack }) => {
    const [vaccinations, setVaccinations] = useState([]);
    const [selectedYear, setSelectedYear] = useState('');
    const [filterVisible, setFilterVisible] = useState(false);
    const [years, setYears] = useState([]);
    const [tempSelectedYear, setTempSelectedYear] = useState('');
    const [petName, setPetName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPetData = async () => {
            try {
                const serializedPet = await AsyncStorage.getItem('selectedPetId');
                const petId = JSON.parse(serializedPet).petId;
                const petInfo = await fetchPetDetails(petId);
                setPetName(petInfo.name);
                const petDateOfBirth = petInfo.dateofbirth;
                const birthYear = parseInt(petDateOfBirth.split('-')[2], 10);
                const currentYear = new Date().getFullYear();
                const yearArray = [];
                for (let year = currentYear; year >= birthYear; year--) {
                    yearArray.push(year.toString());
                }
                setYears(yearArray);

                const vaccinations = await fetchVaccinations(petId, petDateOfBirth);
                const sortedVaccinations = vaccinations.sort((a, b) =>
                    new Date(b.date_given.split('-').reverse().join('-')) -
                    new Date(a.date_given.split('-').reverse().join('-'))
                );
                setVaccinations(sortedVaccinations);
            } catch (error) {
                if (!error.response || error.response.status !== 404) {
                    const message = error.response?.data?.message || "אירעה שגיאה בהחזרת חיסוניה של חיית המחמד";
                    Alert.alert('שגיאה', message);
                }
                setVaccinations([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPetData();
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
    };

    const filteredVaccinations = selectedYear
        ? vaccinations.filter(vaccine => vaccine.date_given.split('-')[2] === selectedYear)
        : vaccinations;

    const displayMessage = selectedYear
        ? `טרם ניתנו חיסונים ל${petName} בשנת ${selectedYear}`
        : `טרם ניתנו חיסונים ל${petName}`;

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
                <Text style={styles.title}>החיסונים שלי</Text>
                <View style={{ width: 24 }} />
            </View>
            {loading ? (
                <ActivityIndicator size="large" color="#8da7bf" />
            ) : (
                <View style={styles.tableContainer}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderText, styles.vaccineNameHeader]}>שם החיסון</Text>
                        <Text style={[styles.tableHeaderText, styles.vaccineDate]}>תאריך</Text>
                        <Text style={styles.tableHeaderText}>ניתן בגיל</Text>
                        <Text style={styles.tableHeaderText}>בתוקף</Text>
                    </View>
                    {filteredVaccinations.length > 0 ? (
                        filteredVaccinations.map((vaccine, index) => (
                            <View key={index} style={styles.tableRow}>
                                <Text style={[styles.tableCell, styles.vaccineName]}>{vaccine.vaccine_name}</Text>
                                <Text style={[styles.tableCell, styles.vaccineDate]}>{vaccine.date_given}</Text>
                                <Text style={styles.tableCell}>{vaccine.age_given}</Text>
                                <View style={styles.tableCellStatus}>
                                    {vaccine.status === 'do not renew' ? (
                                        <>
                                            <EvilIcons name="check" size={24} color="#339966" />
                                        </>
                                    ) : (
                                        <>
                                            <EvilIcons name="close-o" size={24} color="#e60000" />
                                        </>
                                    )}
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noVaccinationsText}>{displayMessage}</Text>
                    )}
                </View>
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
                            <Picker.Item key="כל החיסונים" label="כל החיסונים" value="" />
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
        paddingHorizontal: 20,
        paddingTop: 10
    },
    tableContainer: {
        borderWidth: 1,
        borderColor: '#9db3c8',
        borderRadius: 10,
        overflow: 'hidden',
        marginTop: 5,
        marginBottom: 50
    },
    tableHeader: {
        flexDirection: 'row-reverse',
        backgroundColor: '#9db3c8',
        padding: 10,
    },
    tableHeaderText: {
        flex: 1,
        fontFamily: 'FredokaSemibold',
        color: '#ffffff',
        fontSize: 15,
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row-reverse',
        backgroundColor: 'rgba(255, 255, 255,0.6)',
        borderBottomWidth: 1,
        borderBottomColor: '#9db3c8',
        padding: 13,
    },
    tableCell: {
        flex: 1,
        fontFamily: 'FredokaRegular',
        color: '#666',
        fontSize: 14,
        textAlign: 'center',
    },
    vaccineNameHeader: {
        flex: 1.4,
    },
    vaccineName: {
        flex: 1.4,
        textAlign: 'right',
        fontFamily: 'FredokaSemibold',
    },
    vaccineDate: {
        flex: 1.2,
    },
    tableCellStatus: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    vaccineStatusText: {
        color: '#666',
        fontSize: 14,
        fontFamily: 'FredokaRegular',
        marginLeft: 0,
    },
    noVaccinationsText: {
        textAlign: 'center',
        color: '#666',
        fontSize: 14,
        fontFamily: 'FredokaRegular',
        margin: 20,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '70%',
        height: '38%',
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
        marginTop: 5,
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

export default DisplayPetVaccinations;
