import React, { useEffect } from 'react';
import { Text, Animated, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

const TitlesScreen = () => {
    const navigation = useNavigation();
    const welcomeOpacity = new Animated.Value(0);
    const vetPetOpacity = new Animated.Value(0);
    const imageOpacity = new Animated.Value(0);

    useEffect(() => {
        Animated.sequence([
            Animated.timing(welcomeOpacity, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(vetPetOpacity, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(imageOpacity, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.delay(500),
            Animated.parallel([
                Animated.timing(welcomeOpacity, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(vetPetOpacity, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(imageOpacity, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]),
        ]).start(() => navigation.replace('Home'));
    }, [navigation]);

    return (
        <>
            <StatusBar style='dark' />
            <LinearGradient colors={['#c9d9e8', '#e8f9fc', '#f8eced']} style={styles.titlesContainer}>
                <Animated.View style={{ ...styles.fadeContainer, opacity: welcomeOpacity }}>
                    <Text style={styles.text}>ברוכים הבאים</Text>
                </Animated.View>
                <Animated.View style={{ ...styles.fadeContainer, opacity: vetPetOpacity, marginTop: 10 }}>
                    <Text style={styles.text}>ל-VetPet</Text>
                </Animated.View>
                <Animated.View style={{ ...styles.fadeContainer, opacity: imageOpacity, marginTop: 20 }}>
                    <Image source={require('../assets/images/VetPetLogo.png')} style={styles.image} />
                </Animated.View>
            </LinearGradient>
        </>
    );
};

const styles = StyleSheet.create({
    titlesContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fadeContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 45,
        textAlign: 'center',
        fontFamily: 'FredokaBold',
        color: '#1b2956',
    },
    image: {
        width: 140,
        height: 140,
        resizeMode: 'contain',
    },
});

export default TitlesScreen;
