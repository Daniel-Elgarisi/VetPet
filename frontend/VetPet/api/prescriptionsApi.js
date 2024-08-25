import axios from 'axios';
import { config } from '../config/config';

const BASE_URL = config.baseURL;

export const fetchPetPrescriptions = async (petId) => {
  try {
      const response = await axios.get(`${BASE_URL}/prescriptions/get-prescriptions-detail/${petId}`);
      return response.data;
  } catch (error) {
      throw error;
  }
};