import axios from 'axios';
import { config } from '../config/config';

const BASE_URL = config.baseURL;

export const fetchDailyVideoCallAppointments = async (vetId) => {
  try {
    const response = await axios.get(`${BASE_URL}/appointments/get-videoCall-appointmentForDoctor/${vetId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchVideoCallParticipantCount = async (roomName) => {
  try {
    const response = await axios.get(`${BASE_URL}/appointments/get-participantCount`, {
      params: { roomName }
    });
    return response.data.participantCount;
  } catch (error) {
    throw error;
  }
};
