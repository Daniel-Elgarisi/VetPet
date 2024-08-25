import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const DisplayPrescriptionDetails = ({ prescription }) => {

    return (
        <>
            <Image
                source={require('../../../assets/images/VetPetHeader2.png')}
                style={styles.headerImage}
            />
            <Text style={styles.title}>תרופה שהופק לה מרשם דיגיטלי</Text>
            <Text style={styles.subTitle}>בביקור מתאריך: {prescription.appointment_date}</Text>
            <View style={styles.divider1} />
            <View style={styles.infoContainer}>
                <View style={styles.sectionRectangular}>
                    <View style={styles.headPatientDetailsTextContainer}>
                        <Text style={styles.sectionHeadText}>פרטי מטופל</Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.headText}>שם מטופל:</Text>
                        <Text style={styles.infoText}>{prescription.name}</Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.headText}>סוג חיה:</Text>
                        <Text style={styles.infoText}>{prescription.pet_type}</Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.headText}>גזע:</Text>
                        <Text style={styles.infoText}>{prescription.breed}</Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.headText}>גיל:</Text>
                        <Text style={styles.infoText}>{prescription.age}</Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.headText}>מין:</Text>
                        <Text style={styles.infoText}>{prescription.sex}</Text>
                    </View>
                </View>

                <View>
                    <View style={[styles.sectionRectangular, styles.marginBottom]}>
                        <View style={styles.headTextContainer}>
                            <Text style={styles.sectionHeadText}>פרטי רופא</Text>
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.headText}>שם הרופא:</Text>
                            <Text style={styles.infoText}>{prescription.doctor_name}</Text>
                        </View>
                    </View>
                    <View style={styles.sectionRectangular}>
                        <View style={styles.headTextContainer}>
                            <Text style={styles.sectionHeadText}>פרטי ביקור</Text>
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.headText}>סוג הביקור:</Text>
                            <Text style={styles.infoText}>{prescription.appointment_type}</Text>
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.headText}>תאריך הביקור:</Text>
                            <Text style={styles.infoText}>{prescription.appointment_date}</Text>
                        </View>
                    </View>
                </View>
            </View>
            <View style={styles.divider1} />
            <View style={styles.prescriptionDetails}>
                <View style={styles.headerDetailRow}>
                    <Text style={styles.detailHeader}>תרופה</Text>
                    <Text style={[styles.detailHeader, styles.detailHeaderLarge]}>אופן השימוש</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailText}>{prescription.medicine}</Text>
                    <Text style={[styles.detailText, styles.detailTextLarge]}>{prescription.instructions}{'\n'}{prescription.dose}</Text>
                </View>
            </View>
            <View style={styles.prescriptionDetails}>
                <View style={styles.headerDetailRow}>
                    <Text style={[styles.detailHeader, styles.detailHeaderLarge]}>משך הטיפול</Text>
                    <Text style={styles.detailHeader}>בוקר</Text>
                    <Text style={styles.detailHeader}>צהריים</Text>
                    <Text style={styles.detailHeader}>ערב</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={[styles.detailText, styles.detailTextLarge]}>{prescription.treatment_duration}</Text>
                    <Text style={styles.detailText}>{prescription.morning}</Text>
                    <Text style={styles.detailText}>{prescription.noon}</Text>
                    <Text style={styles.detailText}>{prescription.evening}</Text>
                </View>
            </View>

            <View style={styles.prescriptionDetails}>
                <View style={styles.headerDetailRow}>
                    <Text style={[styles.detailHeader, styles.detailHeaderLarge]}>בתוקף לרכישה</Text>
                    <Text style={styles.detailHeader}>מידע מנהלי</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={[styles.detailText, styles.detailTextLarge]}>{prescription.purchase_from} - {prescription.purchase_until}</Text>
                    <Text style={styles.detailText}>{prescription.administrative_information}</Text>
                </View>
            </View>
            <View style={styles.horizontalStripesContainer}>
                <View style={styles.horizontalStripe}>
                    <Text style={styles.horizontalHeaderText}>שם הרופא</Text>
                    <View style={styles.stripeDivider} />
                    <Text style={styles.horizontalDataText}>{prescription.doctor_name}</Text>
                </View>
                <View style={styles.horizontalStripe}>
                    <Text style={styles.horizontalHeaderText}>מס' רשיון</Text>
                    <View style={styles.stripeDivider} />
                    <Text style={styles.horizontalDataText}>{prescription.license}</Text>
                </View>
                <View style={styles.horizontalStripe}>
                    <Text style={styles.horizontalHeaderText}>חתימה וחותמת הרופא</Text>
                    <View style={styles.stripeDivider} />
                    <Text style={styles.horizontalDataText}>**חתימה דיגיטלית**</Text>
                </View>
            </View>
            <View style={[styles.section, styles.extraMarginBottomAndTop]}>
                <Text style={styles.headText}>סטטוס מרשם:</Text>
                <Text style={styles.infoText}>{prescription.purchase_status}</Text>
            </View>
        </>
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
    sectionDate: {
        marginLeft: 20
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
    prescriptionDetails: {
        marginTop: 10,
    },
    extraMarginBottomAndTop: {
        marginBottom: 10,
        marginTop: 10,
    },
    detailRow: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(73, 103, 131, 0.06)',
        padding: 5
    },
    headerDetailRow: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(73, 103, 131, 0.18)',
        padding: 5
    },
    detailHeader: {
        fontSize: 13,
        fontFamily: 'FredokaSemibold',
        color: '#496783',
        flex: 1,
        textAlign: 'right',
    },
    detailHeaderLarge: {
        flex: 1.5
    },
    detailText: {
        fontSize: 12,
        fontFamily: 'FredokaRegular',
        color: '#666',
        flex: 1,
        textAlign: 'right',
    },
    detailTextLarge: {
        flex: 1.5
    },
    headPatientDetailsTextContainer: {
        width: '100%',
    },
    headTextContainer: {
        width: '60%',
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

export default DisplayPrescriptionDetails;
