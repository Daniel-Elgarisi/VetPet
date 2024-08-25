import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { fetchVetDetails } from '../../api/vetApi';

const defaultImageMale = require('../../assets/images/maleDoctor.png');
const defaultImageFemale = require('../../assets/images/femaleDoctor.png');

const VetProfile = () => {
  const [vetDetails, setVetDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);

  const getVetDetails = async () => {
    try {
      const vetId = await AsyncStorage.getItem('vetId');
      const data = await fetchVetDetails(vetId);
      setVetDetails(data);
      if (data.gender === 'זכר')
        setProfileImage(defaultImageMale);
      else
        setProfileImage(defaultImageFemale);
    } catch (error) {
      console.error('Failed to load vet details:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      getVetDetails();
    }, [])
  );

  if (loading) {
    return (
      <LinearGradient colors={['#c9d9e8', '#e8f9fc', '#f8eced']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8da7bf" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#c9d9e8', '#e8f9fc', '#f8eced']} style={styles.mainContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>הפרופיל שלי</Text>
        <View style={styles.profileContainer}>
          <View style={styles.imageContainer}>
            <Image source={profileImage} style={styles.profileImage} resizeMode="contain" />
          </View>
          <ScrollView contentContainerStyle={styles.infoContainer}>
            <Text style={styles.infoTextName}>{vetDetails?.name}</Text>
            <View style={styles.separator} />
            <View style={styles.infoField}>
              <Feather name="check-circle" size={12} color='rgba(88, 102, 116, 0.5)' />
              <View>
                <Text style={styles.infoTitleText}>מספר רישיון:</Text>
                <Text style={styles.infoText}>{vetDetails?.license}</Text>
              </View>
            </View>
            <View style={styles.infoField}>
              <Feather name="check-circle" size={12} color='rgba(88, 102, 116, 0.5)' />
              <View>
                <Text style={styles.infoTitleText}>מספר טלפון:</Text>
                <Text style={styles.infoText}>{vetDetails?.phone_number}</Text>
              </View>
            </View>
            <View style={styles.infoField}>
              <Feather name="check-circle" size={12} color='rgba(88, 102, 116, 0.5)' />
              <View>
                <Text style={styles.infoTitleText}>כתובת אימייל:</Text>
                <Text style={styles.infoText}>{vetDetails?.email}</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContainer: {
    flex: 1,
  },
  container: {
    width: '100%',
    height: '100%',
    marginTop: 40,
    alignItems: 'center',
    paddingHorizontal: 10
  },
  profileContainer: {
    width: '91%',
    height: '65%',
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'flex-start',
    padding: 20,
    overflow: 'hidden',
    flexDirection: 'row',
    borderColor: 'rgba(73, 103, 131, 0.1)',
    borderWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.9,
    shadowRadius: 20,
    elevation: 5,
  },
  profileImage: {
    width: 200,
    height: 460,
    opacity: 0.7,
    marginTop: -20,
    marginLeft: -10,
  },
  imageContainer: {
    position: 'relative',
    width: 100,
    alignItems: 'flex-start',
  },
  infoContainer: {
    flex: 1,
    paddingTop: 10,
    marginRight: 0,
    zIndex: 1,
  },
  title: {
    marginBottom: 15,
    color: '#496783',
    fontSize: 23,
    textAlign: 'center',
    fontFamily: 'FredokaBold'
  },
  infoTextName: {
    fontSize: 20,
    fontFamily: 'FredokaBold',
    marginBottom: 8,
    textAlign: 'right',
    color: '#586674'
  },
  infoTitleText: {
    fontSize: 14,
    fontFamily: 'FredokaMedium',
    marginBottom: 3,
    textAlign: 'right',
    marginRight: 3,
    color: 'rgba(88, 102, 116, 0.9)'
  },
  infoText: {
    fontSize: 13,
    fontFamily: 'FredokaRegular',
    marginBottom: 5,
    textAlign: 'right',
    marginRight: 3
  },
  separator: {
    width: '90%',
    height: 1.5,
    backgroundColor: 'rgba(88, 102, 116, 0.3)',
    marginBottom: 10,
    marginTop: -4,
    alignSelf: 'flex-end'
  },
  infoField: {
    flexDirection: 'row-reverse',
    marginBottom: 10,
    alignItems: 'baseline'
  }
});

export default VetProfile;
