import axios from 'axios';
import { config } from '../config/config';

const BASE_URL = config.baseURL;

export const fetchPetReferences = async (petId) => {
  try {
      const response = await axios.get(`${BASE_URL}/references/get-references/${petId}`);
      return response.data;
  } catch (error) {
      throw error;
  }
};