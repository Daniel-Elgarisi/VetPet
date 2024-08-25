import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Foundation, MaterialIcons, EvilIcons, Ionicons } from 'react-native-vector-icons';
import { Picker } from '@react-native-picker/picker';
import { fetchReceipts } from '../../../api/receiptsApi';
import { getOwnerId } from '../../../api/ownerApi';
import ReceiptDisplay from './ReceiptDisplay';

const Receipts = () => {
    const [ownerId, setOwnerId] = useState(null);
    const [receipts, setReceipts] = useState([]);
    const [filteredReceipts, setFilteredReceipts] = useState([]);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [selectedYear, setSelectedYear] = useState('');
    const [filterVisible, setFilterVisible] = useState(false);
    const [years, setYears] = useState([]);
    const [tempSelectedYear, setTempSelectedYear] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const loadReceipts = async () => {
        try {
            const owner_id = await getOwnerId();
            const parsedOwnerId = JSON.parse(owner_id);
            setOwnerId(parsedOwnerId);
            let owner_receipts = await fetchReceipts(parsedOwnerId);
            owner_receipts = owner_receipts.map(receipt => ({
                ...receipt,
                payment_method: receipt.payment_method === 'Credit Card' ? 'כרטיס אשראי' : 'חשבון PayPal'
            }));
            const receiptYears = ['כל השנים'];
            owner_receipts.forEach(receipt => {
                const year = receipt.created_at.split('-')[2];
                if (!receiptYears.includes(year)) {
                    receiptYears.push(year);
                }
            });
            receiptYears.sort((a, b) => b - a);
            setYears(receiptYears);
            owner_receipts.sort((a, b) => {
                const [dayA, monthA, yearA] = a.created_at.split('-');
                const [dayB, monthB, yearB] = b.created_at.split('-');
                return new Date(`${yearB}-${monthB}-${dayB}`) - new Date(`${yearA}-${monthA}-${dayA}`);
            });
            setReceipts(owner_receipts);
            setFilteredReceipts(owner_receipts);
        } catch (error) {
            console.log('Error fetching receipts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadReceipts();
        }, [])
    );

    const handleYearChange = (year) => {
        setTempSelectedYear(year);
    };

    const confirmYearChange = () => {
        setSelectedYear(tempSelectedYear);
        setFilterVisible(false);
        if (tempSelectedYear === 'כל השנים' || tempSelectedYear === '') {
            setFilteredReceipts(receipts);
        } else {
            const filtered = receipts.filter(receipt => receipt.created_at.split('-')[2] === tempSelectedYear); // Filter by year
            setFilteredReceipts(filtered);
        }
    };

    const toggleFilterModal = () => {
        setTempSelectedYear(selectedYear);
        setFilterVisible(!filterVisible);
    };

    const handleReceiptPress = (receipt) => {
        setSelectedReceipt(receipt);
    };

    if (selectedReceipt) {
        return <ReceiptDisplay receipt={selectedReceipt} onBack={() => setSelectedReceipt(null)} />;
    }

    return (
        <LinearGradient colors={['#c9d9e8', '#e8f9fc', '#f8eced']} style={styles.mainContainer}>
            <ScrollView contentContainerStyle={[styles.container, styles.scrollViewContent]}>
                <View style={styles.headerContainer}>
                    <View style={styles.iconContainer}>
                        <TouchableOpacity onPress={toggleFilterModal}>
                            <Ionicons name="filter" size={24} color="#dca3a6" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.title}>קבלות</Text>
                    <View style={{ width: 24 }} />
                </View>
                {isLoading ? (
                    <ActivityIndicator size="large" color="#8da7bf" />
                ) : (
                    filteredReceipts.length > 0 ? (
                        <View style={styles.receiptsSection}>
                            {filteredReceipts.map((item, index) => (
                                <TouchableOpacity key={index} style={styles.receiptContainer} onPress={() => handleReceiptPress(item)}>
                                    <View style={styles.proccedToReceiptContainer}>
                                        <MaterialIcons name="keyboard-arrow-left" size={24} color="#d4aaad" />
                                    </View>
                                    <View style={styles.textContainer}>
                                        <Text style={styles.descriptionText}>{item.description}</Text>
                                        <Text style={styles.dateText}>{item.created_at}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.noReceiptsContainer}>
                            <Foundation name="paw" size={18} color="#d0aeb0" />
                            <Text style={styles.noReceiptsText}>לא נמצאו קבלות</Text>
                            <Foundation name="paw" size={18} color="#d0aeb0" />
                        </View>
                    )
                )}
            </ScrollView>
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
        paddingHorizontal: 10,
        alignItems: 'stretch',
    },
    scrollViewContent: {
        paddingBottom: 80,
    },
    title: {
        marginTop: 20,
        color: '#496783',
        fontSize: 23,
        textAlign: 'center',
        fontFamily: 'FredokaBold',
    },
    iconContainer: {
        top: 18,
    },
    receiptsSection: {
        width: '100%',
        marginTop: 15,
        marginBottom: 50
    },
    receiptContainer: {
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
    textContainer: {
        flex: 1,
        alignItems: 'flex-end',
    },
    descriptionText: {
        color: '#3b5268',
        fontSize: 14,
        fontFamily: 'FredokaSemibold',
        textAlign: 'right'
    },
    dateText: {
        color: '#3b5268',
        fontSize: 14,
        fontFamily: 'FredokaRegular',
        textAlign: 'right',
        marginTop: 2
    },
    proccedToReceiptContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    noReceiptsContainer: {
        flexDirection: 'row',
        alignItems: 'baseline'
    },
    noReceiptsText: {
        marginTop: 10,
        color: '#6c8dac',
        fontSize: 16,
        textAlign: 'center',
        fontFamily: 'FredokaRegular',
        marginHorizontal: 6
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10
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

export default Receipts;
