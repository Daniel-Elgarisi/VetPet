import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, Text, View, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SimpleLineIcons, MaterialIcons } from '@expo/vector-icons';
import CustomButton from '../ui/Buttons/CustomButton';
import { fetchVetDetails, updateVetDetails } from '../../api/vetApi';
import AsyncStorage from '@react-native-async-storage/async-storage';


const UpdateUserDetails = () => {
  const [vetId, setVetId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getVetDetails = async () => {
      try {
        const vet_id = await AsyncStorage.getItem('vetId');
        setVetId(vet_id);
        const data = await fetchVetDetails(vet_id);
        setPhoneNumber(data.phone_number);
        setEmail(data.email);
      } catch (error) {
        console.log('Failed to load user details:', error);
      } finally {
        setLoading(false);
      }
    };

    getVetDetails();
  }, []);

  const handleUpdateVetDetails = async () => {
    try {
      await updateVetDetails(vetId, phoneNumber, email);
      Alert.alert("הצלחה", "פרטייך האישיים עודכנו בהצלחה במערכת.");
      console.log('Vet details updated successfully');
    } catch (error) {
      console.error('Failed to update vet details:', error);
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
        <CustomButton title="אישור" onPress={handleUpdateVetDetails} />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: '50%'
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
  title: {
    marginBottom: 15,
    color: '#496783',
    fontSize: 23,
    textAlign: 'center',
    fontFamily: 'FredokaBold'
  },
});

export default UpdateUserDetails;
