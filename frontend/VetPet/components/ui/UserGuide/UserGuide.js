import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Video } from 'expo-av';

const UserGuide = () => {
    return (
        <LinearGradient colors={['#c9d9e8', '#e8f9fc', '#f8eced']} style={styles.mainContainer}>
            <View style={styles.container}>
                <Text style={styles.title}>מדריך משתמש</Text>
                <View style={styles.videoContainer}>
                    <Video
                        source={require('../../../assets/videos/userGuideVideo/VetPetUserGuideVideo.mp4')}
                        rate={1.0}
                        volume={1.0}
                        isMuted={false}
                        resizeMode="contain"
                        shouldPlay
                        useNativeControls
                        style={styles.video}
                    />
                    <Image
                        source={require('../../../assets/images/iphone-x-simulator.png')}
                        style={styles.phoneFrame}
                    />
                </View>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        alignItems: 'center',
    },
    mainLoadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '100%',
        marginTop: '10%',
        alignItems: 'center',
    },
    title: {
        marginBottom: 15,
        color: '#496783',
        fontSize: 23,
        textAlign: 'center',
        fontFamily: 'FredokaBold'
    },
    videoContainer: {
        width: 306,
        height: 700,
        marginTop: 10
    },
    video: {
        alignSelf: 'center',
        width: 279,
        height: 601,
        borderRadius: 20,
        marginLeft: 6
    },
    phoneFrame: {
        position: 'absolute',
        marginTop: -10,
        width: 305,
        height: 625,
    },
});

export default UserGuide;
