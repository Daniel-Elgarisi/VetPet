import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchPetDetails } from '../../../api/petsApi';
import { Foundation, Ionicons } from '@expo/vector-icons';

import defaultImage from '../../../assets/images/paw.png';

const ViewPetProfile = ({ goBack }) => {
    const [petImage, setPetImage] = useState(null);
    const [petName, setPetName] = useState('');
    const [petAge, setPetAge] = useState('');
    const [petSex, setPetSex] = useState('');
    const [petType, setPetType] = useState('');
    const [petBreed, setPetBreed] = useState('');
    const [petWeight, setPeWeight] = useState('');
    const [petDateOfBirth, setPetDateOfBirth] = useState('');
    const [petChipNumber, setPetChipNumber] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPetData = async () => {
            try {
                const serializedPet = await AsyncStorage.getItem('selectedPetId');
                const pet = JSON.parse(serializedPet);
                const petId = pet.petId;
                const myPetsSerialized = await AsyncStorage.getItem('pets');
                const myPets = JSON.parse(myPetsSerialized);
                const matchedPet = myPets.find(pet => pet.id === +petId);

                if (matchedPet && matchedPet.imageUrl)
                    setPetImage({ uri: matchedPet.imageUrl });
                else
                    setPetImage(defaultImage);

                const petInfo = await fetchPetDetails(petId);
                setPetName(petInfo.name);
                setPetAge(petInfo.age);
                setPetSex(petInfo.sex);
                setPetType(petInfo.pet_type);
                setPetBreed(petInfo.breed);
                setPeWeight(petInfo.weight);
                setPetDateOfBirth(petInfo.dateofbirth);
                if (petInfo.chip_number)
                    setPetChipNumber(petInfo.chip_number);
            } catch (error) {
                console.log("Failed to load pet data");
                setPetImage(defaultImage);
            } finally {
                setLoading(false);
            }
        };
        fetchPetData();
    }, []);

    if (loading) {
        return (
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.goBackContainer}>
                    <TouchableOpacity style={styles.goBackButton} onPress={goBack}>
                        <Text style={styles.goBackText}>חזרה לתפריט</Text>
                        <Ionicons name="return-up-forward-outline" size={24} color="#e3b5b8" />
                    </TouchableOpacity>
                </View>
                <ActivityIndicator size="large" color="#8da7bf" style={styles.indicator}/>
            </ScrollView>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.goBackContainer}>
                <TouchableOpacity style={styles.goBackButton} onPress={goBack}>
                    <Text style={styles.goBackText}>חזרה לתפריט</Text>
                    <Ionicons name="return-up-forward-outline" size={24} color="#e3b5b8" />
                </TouchableOpacity>
            </View>
            <View style={styles.shadowWrapper}>
                <View style={styles.petCircle}>
                    {petImage && <Image source={petImage} style={styles.petImage} />}
                </View>
            </View>
            <View style={styles.infoContainer}>
                <View style={styles.rowContainer}>
                    <Foundation name="paw" size={22} color="#d7c6c1" />
                    <Text style={styles.descriptionText}>שם:</Text>
                    <Text style={styles.text}>{petName}</Text>
                </View>
                <View style={styles.rowContainer}>
                    <Foundation name="paw" size={22} color="#d7c6c1" />
                    <Text style={styles.descriptionText}>גיל:</Text>
                    <Text style={styles.text}>{petAge}</Text>
                </View>
                <View style={styles.rowContainer}>
                    <Foundation name="paw" size={22} color="#d7c6c1" />
                    <Text style={styles.descriptionText}>מין:</Text>
                    <Text style={styles.text}>{petSex}</Text>
                </View>
                <View style={styles.rowContainer}>
                    <Foundation name="paw" size={22} color="#d7c6c1" />
                    <Text style={styles.descriptionText}>סוג:</Text>
                    <Text style={styles.text}>{petType}</Text>
                </View>
                <View style={styles.rowContainer}>
                    <Foundation name="paw" size={22} color="#d7c6c1" />
                    <Text style={styles.descriptionText}>גזע:</Text>
                    <Text style={styles.text}>{petBreed}</Text>
                </View>
                <View style={styles.rowContainer}>
                    <Foundation name="paw" size={22} color="#d7c6c1" />
                    <Text style={styles.descriptionText}>משקל:</Text>
                    <Text style={styles.text}>{petWeight}</Text>
                </View>
                <View style={styles.rowContainer}>
                    <Foundation name="paw" size={22} color="#d7c6c1" />
                    <Text style={styles.descriptionText}>תאריך לידה:</Text>
                    <Text style={styles.text}>{petDateOfBirth}</Text>
                </View>
                <View style={styles.rowContainer}>
                    <Foundation name="paw" size={22} color="#d7c6c1" />
                    <Text style={styles.descriptionText}>מספר שבב:</Text>
                    <Text style={styles.text}>{petChipNumber}</Text>
                </View>
            </View>
        </ScrollView>
    );
};

export default ViewPetProfile;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        marginTop: '5%',
        alignItems: 'stretch',
        paddingHorizontal: 20,
    },
    goBackContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 5,
    },
    goBackButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    goBackText: {
        marginRight: 5,
        color: '#7c9ab6',
        fontFamily: 'FredokaRegular'
    },
    shadowWrapper: {
        width: 200,
        height: 200,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20,
        backgroundColor: 'transparent',
        shadowColor: 'black',
        shadowOpacity: 0.3,
        shadowOffset: { width: 1, height: 2 },
        shadowRadius: 5,
        elevation: 4,
        alignSelf: 'center',
    },
    petCircle: {
        width: '100%',
        height: '100%',
        borderRadius: 100,
        borderColor: '#cab3ad',
        borderWidth: 2.8,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
    },
    petImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    infoContainer: {
        width: '100%',
        marginTop: 7,
        alignItems: 'flex-end',
    },
    rowContainer: {
        flexDirection: 'row-reverse',
        padding: 12,
        width: '100%',
    },
    descriptionText: {
        color: '#a47e74',
        fontSize: 18,
        fontFamily: 'FredokaMedium',
        lineHeight: 24,
        marginRight: 8
    },
    text: {
        color: '#404040',
        fontSize: 16,
        fontFamily: 'FredokaRegular',
        marginRight: 5,
        lineHeight: 24,
    },
    indicator:{
        marginTop: '80%'
    }
});