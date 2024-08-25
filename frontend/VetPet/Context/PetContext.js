import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchPetsByOwnerId } from '../api/petsApi';
import { getOwnerId } from '../api/ownerApi';

const PetContext = createContext();

export const usePets = () => useContext(PetContext);

export const PetProvider = ({ children }) => {
  const [pets, setPets] = useState([]);

  const loadPets = useCallback(async () => {
    try {
      const ownerId = await getOwnerId();
      const fetchedPets = await fetchPetsByOwnerId(ownerId);
      const storedPetsString = await AsyncStorage.getItem('pets');
      let storedPets = storedPetsString ? JSON.parse(storedPetsString) : [];
      let updatedPets = [];
      fetchedPets.forEach(fetchedPet => {
        const storedPetIndex = storedPets.findIndex(p => p.id === fetchedPet.id);
        if (storedPetIndex !== -1) {
          updatedPets.push(storedPets[storedPetIndex]);
        } else {
          updatedPets.push({
            id: fetchedPet.id,
            name: fetchedPet.name
          });
        }
      });

      storedPets = storedPets.filter(p => fetchedPets.some(f => f.id === p.id));
      await AsyncStorage.setItem('pets', JSON.stringify(updatedPets));
      setPets(updatedPets);
    } catch (error) {
      console.error("Failed to update pet image:", err);
      throw error;
    }
  }, []);

  const updatePetImage = async (petId, imageUrl) => {
    try {
      const updatedPets = pets.map(pet => pet.id === petId ? { ...pet, imageUrl } : pet);
      setPets(updatedPets);
      await AsyncStorage.setItem('pets', JSON.stringify(updatedPets));
    } catch (error) {
      console.error("Failed to update pet image:", err);
      throw error;
    }
  };

  return (
    <PetContext.Provider value={{ pets, updatePetImage, loadPets }}>
      {children}
    </PetContext.Provider>
  );
};

export default PetProvider;
