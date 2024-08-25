import { Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { config } from '../config/config';

const BASE_URL = config.baseURL;

export const scheduleAppointment = async (date, time, visitType) => {
  try {
    const serializedPet = await AsyncStorage.getItem('selectedPetId');
    const pet = JSON.parse(serializedPet);
    const petId = pet.petId;
    const response = await axios.post(`${BASE_URL}/appointments/create-appointment`, {
      appointmentType: visitType,
      date: date,
      time: time,
      petId: petId
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      Alert.alert("שגיאה", error.response.data.message);
      throw error;
    } else if (error.request) {
      Alert.alert("שגיאה", "לא ניתן לקבל תגובה מהשרת");
      throw error;
    } else {
      Alert.alert("שגיאה", "התרחשה שגיאה בבקשה");
      throw error;
    }
  }
};

export const fetchAppointmentTypes = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/appointments/get-AppointmentTypes`);
    if (response.status === 200)
      return response.data;
    else {
      Alert.alert("Error", response.data.message || "שגיאה לא צפויה התרחשה.");
      return null;
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || "אירעה שגיאה בעת שליפת סוגי פגישות.";
    Alert.alert("Error", errorMessage);
    return null;
  }
};

export const fetchFullyOccupiedAppointmentHoursByDate = async (date) => {
  try {
    const response = await axios.get(`${BASE_URL}/appointments/get-NonAvailableAppointmentsForDay/${date}`);
    return response.data.fullyBookedTimeSlots ? response.data.fullyBookedTimeSlots : [];
  } catch (error) {
    const errorMessage = error.response?.data?.message || "!!!התרחשה שגיאה לא צפויה.";
    Alert.alert("שגיאה", errorMessage);
    return [];
  }
};

export const deletePetAppointment = async (date, time) => {
  try {
    const selectedPet = await AsyncStorage.getItem('selectedPetId');
    if (!selectedPet) {
      console.log("No selected pet ID found.");
      return { status: 'error', message: 'לא נמצאה חיה.' };
    }
    const pet = JSON.parse(selectedPet);
    const petId = +pet.petId;
    const response = await axios.delete(`${BASE_URL}/appointments/delete-appointment`, {
      params: {
        date: date,
        time: time,
        petId: petId
      }
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "התרחשה שגיאה לא צפויה.";
    Alert.alert("שגיאה", errorMessage);
    throw error;
  }
};

export const updatePetAppointment = async (previousDate, previousTime, previousAppointmentType, date, time, appointmentType) => {
  try {
    const selectedPet = await AsyncStorage.getItem('selectedPetId');
    if (!selectedPet) {
      console.log("No selected pet ID found.");
      return { status: 'error', message: 'לא נמצאה חיה.' };
    }
    const pet = JSON.parse(selectedPet);
    const petId = +pet.petId;
    const response = await axios.post(`${BASE_URL}/appointments/update-appointment/${petId}`, {
      previousDate: previousDate,
      previousTime: previousTime,
      previousAppointmentType: previousAppointmentType,
      date: date,
      time: time,
      appointmentType: appointmentType
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "התרחשה שגיאה לא צפויה.";
    Alert.alert("שגיאה", errorMessage);
    throw error;
  }
};

export const fetchPreviousPetAppointments = async () => {
  try {
    const selectedPet = await AsyncStorage.getItem('selectedPetId');
    if (!selectedPet) {
      console.log("No selected pet ID found.");
      return { status: 'error', message: 'לא נבחרה חיה לטיפול.' };
    }
    const pet = JSON.parse(selectedPet);
    const petId = +pet.petId;
    const response = await axios.get(`${BASE_URL}/appointments/get-previousAppointments/${petId}`);
    return { status: 'success', data: response.data };
  } catch (error) {
    if (error.response) {
      switch (error.response.status) {
        case 404:
          return { status: 'info', message: error.response.data.message };
        case 500: r
          Alert.alert("שגיאת שרת", error.response.data.message);
          return { status: 'error', message: error.response.data.message };
        default:
          console.log("Unhandled status code:", error.response.status);
          return { status: 'error', message: error.response.data.message };
      }
    } else {
      console.log("An error occurred:", error.message);
      return { status: 'error', message: 'אירעה שגיאה בתהליך הבקשה.' };
    }
  }
};

export const fetchFuturePetAppointments = async () => {
  try {
    const selectedPet = await AsyncStorage.getItem('selectedPetId');
    if (!selectedPet) {
      console.log("No selected pet ID found.");
      return { status: 'error', message: 'לא נבחרה חיה לטיפול.' };
    }
    const pet = JSON.parse(selectedPet);
    const petId = +pet.petId;
    const response = await axios.get(`${BASE_URL}/appointments/get-futureAppointments/${petId}`);
    return { status: 'success', data: response.data };
  } catch (error) {
    if (error.response) {
      switch (error.response.status) {
        case 404:
          return { status: 'info', message: error.response.data.message };
        case 500: r
          Alert.alert("שגיאת שרת", error.response.data.message);
          return { status: 'error', message: error.response.data.message };
        default:
          console.log("Unhandled status code:", error.response.status);
          return { status: 'error', message: error.response.data.message };
      }
    } else {
      console.log("An error occurred:", error.message);
      return { status: 'error', message: 'אירעה שגיאה בתהליך הבקשה.' };
    }
  }
};

export const fetchPreviousAllMyPetsAppointments = async () => {
  try {
    const ownerId = await AsyncStorage.getItem('ownerId');
    if (!ownerId) {
      console.log("owner not found.");
      return { status: 'error', message: 'הבעלים לא נמצא.' };
    }
    const response = await axios.get(`${BASE_URL}/appointments/get-previousAppointmentsForOwner/${ownerId}`);
    return { status: 'success', data: response.data };
  } catch (error) {
    if (error.response) {
      switch (error.response.status) {
        case 404:
          return { status: 'info', message: error.response.data.message };
        case 500: r
          Alert.alert("שגיאת שרת", error.response.data.message);
          return { status: 'error', message: error.response.data.message };
        default:
          console.log("Unhandled status code:", error.response.status);
          return { status: 'error', message: error.response.data.message };
      }
    } else {
      console.log("An error occurred:", error.message);
      return { status: 'error', message: 'אירעה שגיאה בתהליך הבקשה.' };
    }
  }
};

export const fetchFutureAllMyPetsAppointments = async () => {
  try {
    const ownerId = await AsyncStorage.getItem('ownerId');
    if (!ownerId) {
      console.log("owner not found.");
      return { status: 'error', message: 'הבעלים לא נמצא.' };
    }
    const response = await axios.get(`${BASE_URL}/appointments/get-futureAppointmentsForOwner/${ownerId}`);
    return { status: 'success', data: response.data };
  } catch (error) {
    if (error.response) {
      switch (error.response.status) {
        case 404:
          return { status: 'info', message: error.response.data.message };
        case 500: r
          Alert.alert("שגיאת שרת", error.response.data.message);
          return { status: 'error', message: error.response.data.message };
        default:
          console.log("Unhandled status code:", error.response.status);
          return { status: 'error', message: error.response.data.message };
      }
    } else {
      console.log("An error occurred:", error.message);
      return { status: 'error', message: 'אירעה שגיאה בתהליך הבקשה.' };
    }
  }
};

export const fetchDailyVideoCallAppointments = async (petId) => {
  try {
    const response = await axios.get(`${BASE_URL}/appointments/get-videoCallForPet/${petId}`);
    return response.data;
  } catch (error) {
    console.log('Error fetching pet daily video call appointments:', error);
    throw error;
  }
};
