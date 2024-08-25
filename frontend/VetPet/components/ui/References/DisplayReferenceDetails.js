import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const isHebrew = (text) => {
    const hebrewPattern = /[\u0590-\u05FF]/;
    return hebrewPattern.test(text);
};

const DisplayReferenceDetails = ({ reference, petInfo }) => {
    const descriptionAlignment = isHebrew(reference.description) ? 'right' : 'left';

    return (
        <>
            <Image
                source={require('../../../assets/images/VetPetHeader2.png')}
                style={styles.headerImage}
            />
            <Text style={styles.title}>הפניה לבדיקת {reference.reference_type}</Text>
            <Text style={styles.subTitle}>תאריך הנפקה: {reference.date_issued}</Text>
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
                            <Text style={styles.sectionHeadText}>גורם מפנה</Text>
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.headText}>שם הרופא:</Text>
                            <Text style={styles.infoText}>{reference.doctor_name}</Text>
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.headText}>מס' רשיון:</Text>
                            <Text style={styles.infoText}>{reference.doctor_license}</Text>
                        </View>
                    </View>
                    <View style={styles.sectionRectangular}>
                        <View style={styles.headTextContainer}>
                            <Text style={styles.sectionHeadText}>פרטי הפניה</Text>
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.headText}>סוג הפניה:</Text>
                            <Text style={styles.infoText}>{reference.reference_type}</Text>
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.headText}>תוקף הפניה:</Text>
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.infoExpirationText}>מ: {reference.date_issued}</Text>
                            <Text style={styles.infoExpirationText}> עד: {reference.expiration_date}</Text>
                        </View>
                    </View>
                </View>
            </View>
            <View style={styles.divider1} />
            <View>
                <Text style={styles.referenceDescriptionText}>דף מידע לבדיקות</Text>
                <Text style={[styles.referenceDescriptionSubText, { textDecorationLine: 'underline' }]}>להלן הבדיקות שהומלצו ע"י הוטרינר, אנא פעל בהתאם להנחיות:</Text>
                <Text style={[styles.referenceDescriptionSubText, { textAlign: descriptionAlignment }]}>{reference.description}</Text>
            </View>
            <View style={styles.divider2} />
            <View>
                <Text style={[styles.subTitle, { marginBottom: 1 }]}>הנחיות נוספות</Text>
                <Text style={styles.referenceDescriptionSubText}>{reference.notes}</Text>
            </View>
            <View style={styles.divider2} />
            <View style={styles.horizontalStripesContainer}>
                <View style={styles.horizontalStripe}>
                    <Text style={styles.horizontalHeaderText}>שם הרופא</Text>
                    <View style={styles.stripeDivider} />
                    <Text style={styles.horizontalDataText}>{reference.doctor_name}</Text>
                </View>
                <View style={styles.horizontalStripe}>
                    <Text style={styles.horizontalHeaderText}>מס' רשיון</Text>
                    <View style={styles.stripeDivider} />
                    <Text style={styles.horizontalDataText}>{reference.doctor_license}</Text>
                </View>
                <View style={styles.horizontalStripe}>
                    <Text style={styles.horizontalHeaderText}>חתימה וחותמת הרופא</Text>
                    <View style={styles.stripeDivider} />
                    <Text style={styles.horizontalDataText}>**חתימה דיגיטלית**</Text>
                </View>
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
    infoExpirationText: {
        fontSize: 12,
        fontFamily: 'FredokaRegular',
        color: '#666',
        marginBottom: 2,
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
    referenceDescriptionText: {
        fontSize: 14,
        fontFamily: 'FredokaSemibold',
        color: '#5c81a3',
        textAlign: 'center',
        marginTop: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#5c81a3',
        textDecorationLine: 'underline'
    },
    referenceDescriptionSubText: {
        fontSize: 12,
        fontFamily: 'FredokaRegular',
        color: '#666',
        marginBottom: 8,
        textAlign: 'right',
        marginTop: 5,
        textDecorationLine: 'none'
    },
    divider1: {
        width: '100%',
        height: 2,
        backgroundColor: '#7c9ab6',
        marginTop: -2,
        marginBottom: 12
    },
    divider2: {
        width: '100%',
        height: 2,
        backgroundColor: 'rgba(92, 129, 163, 0.2)',
        marginTop: 5,
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
        marginTop: 10,
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

export default DisplayReferenceDetails;
