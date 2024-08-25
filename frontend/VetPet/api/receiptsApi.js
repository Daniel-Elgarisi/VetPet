import axios from 'axios';
import { config } from '../config/config';

const BASE_URL = config.baseURL;

export const fetchReceipts = async (ownerId) => {
  try {
    const response = await axios.get(`${BASE_URL}/owners/get-transactionsForOwner/${ownerId}`);
    return response.data;
  } catch (error) {
    console.log('Error fetching notifications count:', error);
    throw error;
  }
};

