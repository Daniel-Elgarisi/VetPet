import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons, Ionicons, MaterialCommunityIcons, FontAwesome5 } from 'react-native-vector-icons';
import DisplayMedicalRecordDetails from './DisplayMedicalRecordDetails';
import DisplayPrescriptionDetails from '../Prescriptions/DisplayPrescriptionDetails';
import DisplayReferenceDetails from '../References/DisplayReferenceDetails';

const DisplayMedicalRecord = ({ record, petInfo, onBack }) => {
    const [showSummary, setShowSummary] = useState(false);
    const [showPrescriptions, setShowPrescriptions] = useState(false);
    const [showReferences, setShowReferences] = useState(false);

    const toggleSummary = () => setShowSummary(!showSummary);
    const togglePrescriptions = () => setShowPrescriptions(!showPrescriptions);
    const toggleReferences = () => setShowReferences(!showReferences);

    const prescription = record.prescriptions && record.prescriptions.length > 0 ? {
        appointment_date: record.date,
        name: petInfo.name,
        pet_type: petInfo.pet_type,
        breed: petInfo.breed,
        age: petInfo.age,
        sex: petInfo.sex,
        doctor_name: record.appointment.doctor.name,
        license: record.appointment.doctor.license,
        appointment_type: record.appointment.type,
        medicine: record.prescriptions.length > 0 ? record.prescriptions[0].medicine : null,
        instructions: record.prescriptions.length > 0 ? record.prescriptions[0].instructions : null,
        dose: record.prescriptions.length > 0 ? record.prescriptions[0].dose : null,
        treatment_duration: record.prescriptions.length > 0 ? record.prescriptions[0].treatment_duration : null,
        morning: record.prescriptions.length > 0 ? record.prescriptions[0].times.morning : null,
        noon: record.prescriptions.length > 0 ? record.prescriptions[0].times.noon : null,
        evening: record.prescriptions.length > 0 ? record.prescriptions[0].times.evening : null,
        purchase_from: record.prescriptions.length > 0 ? record.prescriptions[0].purchase.from : null,
        purchase_until: record.prescriptions.length > 0 ? record.prescriptions[0].purchase.until : null,
        administrative_information: record.prescriptions.length > 0 ? record.prescriptions[0].administrative_information : null,
        purchase_status: record.prescriptions.length > 0 ? record.prescriptions[0].purchase.status : null
    } : null;

    const reference = record.references && record.references.length > 0 ? {
        reference_type: record.references[0].reference_type,
        date_issued: record.references[0].date_issued,
        doctor_name: record.references[0].doctor.name,
        doctor_license: record.references[0].doctor.license,
        expiration_date: record.references[0].expiration_date,
        description: record.references[0].description,
        notes: record.references[0].notes
    } : null;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.goBackContainer}>
                <TouchableOpacity style={styles.goBackButton} onPress={onBack}>
                    <Text style={styles.goBackText}>חזרה לרשימת סיכומי הביקור</Text>
                    <Ionicons name="return-up-forward-outline" size={24} color="#e3b5b8" />
                </TouchableOpacity>
            </View>
            <Text style={styles.title}>סיכום ביקור רפואי</Text>
            <View style={styles.buttonsContainer}>
                <View>
                    <TouchableOpacity style={styles.button} onPress={toggleSummary}>
                        <MaterialIcons name="keyboard-arrow-down" size={24} color="#d4aaad" style={styles.arrowIcon} />
                        <View style={styles.buttonContent}>
                            <Ionicons name="document-text-outline" size={24} color="#537493" />
                            <Text style={styles.buttonText}>סיכום ביקור</Text>
                        </View>
                    </TouchableOpacity>
                    {showSummary && <DisplayMedicalRecordDetails record={record} petInfo={petInfo} />}
                </View>
                {record.prescriptions && record.prescriptions.length > 0 && (
                    <>
                        <View style={styles.separator} />
                        <View>
                            <TouchableOpacity style={styles.button} onPress={togglePrescriptions}>
                                <MaterialIcons name="keyboard-arrow-down" size={24} color="#d4aaad" style={styles.arrowIcon} />
                                <View style={styles.buttonContent}>
                                    <MaterialCommunityIcons name="pill" size={24} color="#537493" />
                                    <Text style={styles.buttonText}>מרשמים</Text>
                                </View>
                            </TouchableOpacity>
                            {showPrescriptions && (
                                <View style={styles.prescriptionAndReferenceContainer}>
                                    <DisplayPrescriptionDetails prescription={prescription} />
                                </View>
                            )}
                        </View>
                    </>
                )}
                {record.references && record.references.length > 0 && (
                    <>
                        <View style={styles.separator} />
                        <View>
                            <TouchableOpacity style={styles.button} onPress={toggleReferences}>
                                <MaterialIcons name="keyboard-arrow-down" size={24} color="#d4aaad" style={styles.arrowIcon} />
                                <View style={styles.buttonContent}>
                                    <FontAwesome5 name="file-medical-alt" size={24} color="#537493" />
                                    <Text style={styles.buttonText}>הפניות</Text>
                                </View>
                            </TouchableOpacity>
                            {showReferences && (
                                <View style={styles.prescriptionAndReferenceContainer}>
                                    <DisplayReferenceDetails reference={reference} petInfo={petInfo} />
                                </View>
                            )}
                        </View>
                    </>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 10,
        alignItems: 'stretch',
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
        fontSize: 20,
        fontFamily: 'FredokaBold',
        color: '#496783',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 10
    },
    buttonsContainer: {
        flexDirection: 'column',
        alignItems: 'stretch',
        marginBottom: 100
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    buttonContent: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        marginRight: 5
    },
    buttonText: {
        fontSize: 17,
        fontFamily: 'FredokaMedium',
        color: '#3b5268',
        marginRight: 5,
    },
    arrowIcon: {
        marginLeft: 10,
    },
    separator: {
        borderBottomWidth: 1,
        borderBottomColor: '#adc0d1',
        marginVertical: 10,
    },
    infoText: {
        fontSize: 14,
        fontFamily: 'FredokaRegular',
        color: '#666',
        textAlign: 'right',
        marginVertical: 5,
    },
    prescriptionAndReferenceContainer: {
        alignItems: 'stretch',
        marginTop: 10,
        marginBottom: 30,
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

export default DisplayMedicalRecord;
