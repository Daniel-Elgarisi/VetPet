import React, { useCallback, useState, useEffect } from 'react';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { EvilIcons } from '@expo/vector-icons';
import { usePets } from '../Context/PetContext';
import PetHealthManagement from '../screens/PetHealthManagement';

const MyPets = () => {
  const { pets, updatePetImage, loadPets } = usePets();
  const [activeComponent, setActiveComponent] = useState('MyPets');
  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    if (route.params?.reset) {
      setActiveComponent('MyPets');
      navigation.setParams({ reset: undefined });
    }
  }, [route.params?.reset, navigation]);

  useFocusEffect(
    useCallback(() => {
      loadPets();
    }, [loadPets])
  );

  const pickImage = async (petId) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("נדרשת הרשאה", "סירבת לאפשר לאפליקציה הזו לגשת לתמונות שלך!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.cancelled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      updatePetImage(petId, imageUri);
    }
  };

  const handlePetSelected = async (petId, petName) => {
    try {
      await AsyncStorage.removeItem('selectedPetId');
      const selectedPet = { petId: petId.toString(), petName };
      const serializedSelectedPet = JSON.stringify(selectedPet);
      await AsyncStorage.setItem('selectedPetId', serializedSelectedPet);
      setActiveComponent('PetHealthManagement');
    } catch (error) {
      console.log("בחירת חיית המחמד נכשלה", error);
    }
  };

  const handleGoBack = () => {
    setActiveComponent('MyPets');
  };

  if (activeComponent === 'MyPets') {
    return (
      <LinearGradient colors={['#c9d9e8', '#e8f9fc', '#f8eced']} style={styles.gradientBackground}>
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
          <View style={styles.container}>
            {pets.map((pet) => (
              <View key={pet.id} style={styles.petCircle}>
                <TouchableOpacity onPress={() => handlePetSelected(pet.id, pet.name)} style={styles.petImageTouchable}>
                  <Image
                    source={pet.imageUrl ? { uri: pet.imageUrl } : require('../assets/images/paw.png')}
                    style={styles.petImage}
                  />
                </TouchableOpacity>
                <Text style={styles.petName}>{pet.name}</Text>
                <TouchableOpacity onPress={() => pickImage(pet.id)} style={styles.cameraIcon}>
                  <EvilIcons name="camera" size={30} color="#737373" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
    );
  } else if (activeComponent === 'PetHealthManagement') {
    return (
      <PetHealthManagement goBack={handleGoBack} />
    );
  }

};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 20
  },
  petCircle: {
    width: 110,
    height: 110,
    borderRadius: 60,
    borderColor: '#cab3ad',
    borderWidth: 2.8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    marginHorizontal: '8%',
    backgroundColor: '#f0f0f0',
    position: 'relative',
    elevation: 4,
    shadowColor: 'black',
    shadowOpacity: 0.3,
    shadowOffset: { width: 1, height: 2 },
    shadowRadius: 5,
  },
  petImageTouchable: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    overflow: 'hidden',
  },
  petImage: {
    width: '100%',
    height: '100%',
  },
  petName: {
    color: '#a47e74',
    fontSize: 17,
    fontFamily: 'FredokaMedium',
    position: 'absolute',
    bottom: -25,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 15,
    padding: 2,
  },
});

export default MyPets;
