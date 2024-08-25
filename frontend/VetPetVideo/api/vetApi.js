import axios from 'axios';
import { config } from '../config/config';

const BASE_URL = config.baseURL;

export const fetchVetDetails = async (vetId) => {
  try {
    const response = await axios.get(`${BASE_URL}/vets/get-VetInformation/${vetId}`);
    return response.data;
  } catch (error) {
    console.log('Error fetching user details:', error);
    throw error;
  }
};

export const updateVetDetails = async (vetId, phoneNumber, email) => {
  try {
    const response = await axios.post(`${BASE_URL}/vets/edit-vetsProfile/${vetId}`, {
      phone_number: phoneNumber,
      email: email
    });
    return response.data;
  } catch (error) {
    console.log('Error updating user details:', error);
    throw error;
  }
};