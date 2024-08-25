import axios from 'axios';
import { config } from '../config/config';

const BASE_URL = config.baseURL;

export const fetchPetsByOwnerId = async (ownerId) => {
  try {
    const response = await axios.get(`${BASE_URL}/pets/get-pets/${ownerId}`);
    const petsArray = response.data;
    const simplifiedPetsArray = petsArray.map(pet => ({
      id: pet.id,
      name: pet.name
    }));
    return simplifiedPetsArray;
  } catch (error) {
    console.log('Error fetching pets:', error);
    throw error;
  }
};

export const fetchPetDetails = async (petId) =>{
  try {
    const response = await axios.get(`${BASE_URL}/pets/get-fullPetInformation/${petId}`);
    return response.data[0];
  } catch (error) {
    console.log('Error fetching pet details:', error);
    throw error;
  }
};

export const fetchVaccinations = async (petId, petDateOfBirth) => {
  try {
      const response = await axios.get(`${BASE_URL}/vaccines/get-vaccines/${petId}/${petDateOfBirth}`);
      return response.data;
  } catch (error) {
      throw error;
  }
};
