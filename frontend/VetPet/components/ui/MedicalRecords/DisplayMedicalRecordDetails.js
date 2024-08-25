import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const DisplayMedicalRecordDetails = ({ record, petInfo }) => {
    const tableRows = [
        { label: 'סיבת הפניה', value: record.causeOfReferral },
        { label: 'תסמינים', value: record.symptoms },
        { label: 'בדיקה גופנית', value: record.examination },
        { label: 'תיאור', value: record.description },
        { label: 'תוצאות הדמיה', value: record.imaging },
        { label: 'תוכנית טיפולית', value: record.treatmentPlan },
    ];

    return (
        <View style={styles.medicalRecordContainer}>
            <Image
                source={require('../../../assets/images/VetPetHeader2.png')}
                style={styles.headerImage}
            />
            <Text style={styles.title}>סיכום ביקור {record.appointment.type}</Text>
            <Text style={styles.subTitle}>שנרשם בתאריך {record.date}</Text>
            <View style={styles.divider1} />
            <View style={styles.infoContainer}>
                <View style={styles.sectionRectangular}>
                    <View style={styles.headPatientDetailsTextContainer}>
                        <Text style={styles.sectionHeadText}>פרטי מטופל</Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.headText}>שם מטופל:</Text>
                        <Text style={styles.infoText}>{petInfo.name}</Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.headText}>סוג חיה:</Text>
                        <Text style={styles.infoText}>{petInfo.pet_type}</Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.headText}>גזע:</Text>
                        <Text style={styles.infoText}>{petInfo.breed}</Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.headText}>גיל:</Text>
                        <Text style={styles.infoText}>{petInfo.age}</Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.headText}>מין:</Text>
                        <Text style={styles.infoText}>{petInfo.sex}</Text>
                    </View>
                </View>
                <View>
                    <View style={[styles.sectionRectangular, styles.marginBottom]}>
                        <View style={styles.headTextContainer}>
                            <Text style={styles.sectionHeadText}>פרטי רופא</Text>
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.headText}>שם הרופא:</Text>
                            <Text style={styles.infoText}>{record.appointment.doctor.name}</Text>
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.headText}>מס' רשיון:</Text>
                            <Text style={styles.infoText}>{record.appointment.doctor.license}</Text>
                        </View>
                    </View>
                    <View style={styles.sectionRectangular}>
                        <View style={styles.headTextContainer}>
                            <Text style={styles.sectionHeadText}>פרטי ביקור</Text>
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.headText}>סוג הביקור:</Text>
                            <Text style={styles.infoText}>{record.appointment.type}</Text>
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.headText}>תאריך הביקור:</Text>
                            <Text style={styles.infoText}>{record.date}</Text>
                        </View>
                    </View>
                </View>
            </View>
            <View style={styles.divider1} />
            <View style={styles.tableContainer}>
                {tableRows.map(
                    (row, index) =>
                        row.value && (
                            <View key={index} style={styles.tableRow}>
                                <Text style={styles.tableHeader}>{row.label}</Text>
                                <Text style={styles.tableData}>{row.value}</Text>
                            </View>
                        )
                )}
            </View>
            <View style={styles.horizontalStripesContainer}>
                <View style={styles.horizontalStripe}>
                    <Text style={styles.horizontalHeaderText}>שם הרופא</Text>
                    <View style={styles.stripeDivider} />
                    <Text style={styles.horizontalDataText}>{record.appointment.doctor.name}</Text>
                </View>
                <View style={styles.horizontalStripe}>
                    <Text style={styles.horizontalHeaderText}>מס' רשיון</Text>
                    <View style={styles.stripeDivider} />
                    <Text style={styles.horizontalDataText}>{record.appointment.doctor.license}</Text>
                </View>
                <View style={styles.horizontalStripe}>
                    <Text style={styles.horizontalHeaderText}>חתימה וחותמת הרופא</Text>
                    <View style={styles.stripeDivider} />
                    <Text style={styles.horizontalDataText}>**חתימה דיגיטלית**</Text>
                </View>
            </View>
        </View>
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
        fontSize: 16,
        fontFamily: 'FredokaSemibold',
        color: '#5c81a3',
        textAlign: 'right',
        marginTop: -20
    },
    subTitle: {
        fontSize: 13,
        fontFamily: 'FredokaMedium',
        color: '#5c81a3',
        textAlign: 'right',
        marginBottom: 8,
    },
    medicalRecordContainer: {
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
    headerImage: {
        width: 160,
        height: 60,
        resizeMode: 'contain',
        opacity: 0.5,
        alignSelf: 'left',
        marginLeft: -40
    },
    infoContainer: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: 20,
    },
    sectionRectangular: {
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'rgba(92, 129, 163, 0.3)',
        paddingHorizontal: 15,
        paddingVertical: 8,
        alignItems: 'flex-end'
    },
    marginBottom: {
        marginBottom: 15,
    },
    section: {
        flexDirection: 'row-reverse'
    },
    infoText: {
        fontSize: 12,
        fontFamily: 'FredokaRegular',
        color: '#666',
        marginBottom: 2,
        marginRight: 5,
        textAlign: 'right',
    },
    headText: {
        fontSize: 13,
        fontFamily: 'FredokaMedium',
        color: '#666',
        marginBottom: 2,
        textAlign: 'right',
    },
    sectionHeadText: {
        fontSize: 14,
        fontFamily: 'FredokaSemibold',
        color: '#5c81a3',
        marginBottom: 8,
        textAlign: 'center',
        marginTop: -18,
        backgroundColor: 'white'
    },
    divider1: {
        width: '100%',
        height: 2,
        backgroundColor: '#7c9ab6',
        marginTop: -2,
        marginBottom: 12
    },
    headPatientDetailsTextContainer: {
        width: '100%',
    },
    headTextContainer: {
        width: '60%',
    },
    tableContainer: {
        flexDirection: 'column',
    },
    tableRow: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(92, 129, 163, 0.2)',
    },
    tableHeader: {
        fontSize: 13,
        fontFamily: 'FredokaSemibold',
        color: '#5c81a3',
        flex: 0.9,
        textAlign: 'right',
    },
    tableData: {
        fontSize: 12,
        fontFamily: 'FredokaRegular',
        color: '#666',
        flex: 2,
        textAlign: 'right',
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

export default DisplayMedicalRecordDetails;
