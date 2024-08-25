import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, Text, View, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SimpleLineIcons, MaterialIcons } from '@expo/vector-icons';
import CustomButton from '../components/ui/Appointment/CustomButton';
import { fetchOwnerDetails, updateOwnerDetails } from '../api/updateOwnerDetailsApi';
import AsyncStorage from '@react-native-async-storage/async-storage';


const UpdateUserDetails = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [apartmentNumber, setApartmentNumber] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getOwnerDetails = async () => {
      try {
        const ownerId = await AsyncStorage.getItem('ownerId');
        const data = await fetchOwnerDetails(ownerId);
        setPhoneNumber(data.phone_number);
        setCity(data.city);
        setStreet(data.street);
        setApartmentNumber(data.apartment_number);
        setEmail(data.email);
      } catch (error) {
        console.log('Failed to load user details:', error);
      } finally {
        setLoading(false);
      }
    };

    getOwnerDetails();
  }, []);

  const handleUpdateOwnerDetails = async () => {
    try {
      const ownerId = await AsyncStorage.getItem('ownerId');
      await updateOwnerDetails(ownerId, phoneNumber, email, city, street, apartmentNumber);
      Alert.alert("הצלחה", "פרטייך האישיים עודכנו בהצלחה במערכת.");
      console.log('Owner details updated successfully');
    } catch (error) {
      console.error('Failed to update owner details:', error);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#c9d9e8', '#e8f9fc', '#f8eced']} style={styles.mainLoadingContainer}>
        <View>
          <ActivityIndicator size="large" color="#8da7bf" />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#c9d9e8', '#e8f9fc', '#f8eced']} style={styles.mainContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>עדכון פרטים אישיים</Text>
        <View style={styles.inputContainer}>
          <SimpleLineIcons name="phone" size={22} color="#d0aeb0" />
          <TextInput
            style={styles.input}
            onChangeText={setPhoneNumber}
            value={phoneNumber}
            placeholder="טלפון"
            keyboardType="number-pad"
            returnKeyType="done"
          />
        </View>
        <View style={styles.inputContainer}>
          <MaterialIcons name="alternate-email" size={22} color="#d0aeb0" />
          <TextInput
            style={styles.input}
            onChangeText={setEmail}
            value={email}
            placeholder="אימייל"
            keyboardType='email-address'
          />
        </View>
        <View style={styles.inputContainer}>
          <SimpleLineIcons name="location-pin" size={22} color="#d0aeb0" />
          <TextInput
            style={styles.input}
            onChangeText={setCity}
            value={city}
            placeholder="עיר מגורים"
          />
        </View>
        <View style={styles.locationContainer}>
          <View style={styles.number}>
            <TextInput
              style={styles.locationInput}
              onChangeText={setApartmentNumber}
              value={apartmentNumber}
              placeholder="בית"
              keyboardType="number-pad"
              returnKeyType="done"
            />
          </View>
          <View style={styles.street}>
            <TextInput
              style={styles.locationInput}
              onChangeText={setStreet}
              value={street}
              placeholder="רחוב"
            />
          </View>
        </View>
        <CustomButton title="אישור" onPress={handleUpdateOwnerDetails} />
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '80%',
    marginVertical: 8,
    borderWidth: 2,
    borderRadius: 15,
    borderColor: '#7c9ab6',
    padding: 8,
    backgroundColor: '#dbe6f0',
    height: 43,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    color: '#537493',
    textAlign: 'right',
    fontSize: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    width: '80%',
  },
  locationInput: {
    paddingHorizontal: 10,
    color: '#537493',
    textAlign: 'right',
    fontSize: 16,
    flex: 1,
  },
  title: {
    marginBottom: 15,
    color: '#496783',
    fontSize: 23,
    textAlign: 'center',
    fontFamily: 'FredokaBold'
  },
  street: {
    width: '69%',
    marginVertical: 8,
    borderWidth: 2,
    borderRadius: 15,
    borderColor: '#7c9ab6',
    padding: 10,
    backgroundColor: '#dbe6f0',
    height: 40,
    marginLeft: 2,
  },
  number: {
    width: '30%',
    marginVertical: 8,
    borderWidth: 2,
    borderRadius: 15,
    borderColor: '#7c9ab6',
    padding: 10,
    backgroundColor: '#dbe6f0',
    height: 40,
    marginRight: 2,
  }
});

export default UpdateUserDetails;
