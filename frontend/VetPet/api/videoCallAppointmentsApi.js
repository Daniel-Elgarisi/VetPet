import axios from 'axios';
import { config } from '../config/config';

const BASE_URL = config.baseURL;

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
