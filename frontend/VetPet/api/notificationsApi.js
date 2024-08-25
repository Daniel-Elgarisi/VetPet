import axios from 'axios';
import { config } from '../config/config';
import { fetchPetsByOwnerId, fetchPetDetails } from './petsApi';

const BASE_URL = config.baseURL;

export const fetchNotificationsCount = async (ownerId) => {
  try {
    const response = await axios.get(`${BASE_URL}/notifications/get-total-notifications-count/${ownerId}`);
    return response.data.count;
  } catch (error) {
    console.log('Error fetching notifications count:', error);
    throw error;
  }
};

export const fetchAppointmentsNotifications = async (ownerId) => {
  try {
    const response = await axios.get(`${BASE_URL}/appointments/get-futureAppointmentsForOwnerInNext3Days/${ownerId}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return [];
    } else {
      console.log('Error fetching appointments notifications:', error);
      throw error;
    }
  }
};

export const fetchVaccinesNotifications = async (ownerId) => {
  try {
    const ownerPets = await fetchPetsByOwnerId(ownerId);
    const notifications = [];

    for (const pet of ownerPets) {
      const petDetails = await fetchPetDetails(pet.id);
      const petType = petDetails.pet_type;
      const petId = pet.id;
      const petName = petDetails.name;

      try {
        const response = await axios.get(`${BASE_URL}/vaccines/get-vaccines-notifications/${petId}/${petType}`);
        if (response.data && response.data.length > 0) {
          response.data.forEach(notification => {
            notifications.push({
              ...notification,
              petName,
            });
          });
        }
      } catch (error) {
        if (error.response && error.response.status === 404)
          continue;
        else
          throw error;
      }
    }
    return notifications;
  } catch (error) {
    console.log('Error fetching vaccinations notifications:', error);
    throw error;
  }
};

export const fetchSubscriptionNotifications = async (ownerId) => {
  try {
    const response = await axios.get(`${BASE_URL}/pets/get-pets-subscription/${ownerId}`);
    return response.data;
  } catch (error) {
    console.log('Error fetching subscription notifications:', error);
    throw error;
  }
};

export const fetchPotentialPetsSubscription = async (ownerId) => {
  try {
    const response = await axios.get(`${BASE_URL}/pets/get-potential-pets-subscription/${ownerId}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return [];
    } else {
      console.log('Error potential pets subscription:', error);
      throw error;
    }
  }
};

export const cancelingPetSubscription = async (petId) => {
  try {
    const response = await axios.put(`${BASE_URL}/pets/cancel-pet-subscription/${petId}`);
    return response.data;
  } catch (error) {
    console.log('Error fetching notifications count:', error);
    throw error;
  }
};