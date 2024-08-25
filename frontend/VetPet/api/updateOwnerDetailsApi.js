import axios from 'axios';
import { config } from '../config/config';

const BASE_URL = config.baseURL;

export const fetchOwnerDetails = async (ownerId) => {
  try {
    const response = await axios.get(`${BASE_URL}/owners/get-ownerInformation/${ownerId}`);
    return response.data;
  } catch (error) {
    console.log('Error fetching user details:', error);
    throw error;
  }
};

export const updateOwnerDetails = async (ownerId, phoneNumber, email, city, street, apartmentNumber) => {
  try {
    const response = await axios.post(`${BASE_URL}/owners/edit-ownersProfile/${ownerId}`, {
      phone_number: phoneNumber,
      city: city,
      street: street,
      apartment_number: apartmentNumber,
      email: email
    });
    return response.data;
  } catch (error) {
    console.log('Error fetching user details:', error);
    throw error;
  }
};