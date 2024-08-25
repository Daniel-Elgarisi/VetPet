import axios from 'axios';
import { config } from '../config/config';

const BASE_URL = config.baseURL;

export const fetchPetMedicalRecords = async (petId) => {
  try {
    const response = await axios.get(`${BASE_URL}/records/get-records/${petId}`);
    return response.data;
  } catch (error) {
    console.log('Error fetching pet medical records:', error);
    throw error;
  }
};