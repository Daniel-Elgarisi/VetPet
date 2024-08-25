import axios from 'axios';
import { config } from '../config/config';

const BASE_URL = config.baseURL;

export const fetchpetsMedicalTestsResults = async (petId) => {
  try {
    const response = await axios.get(`${BASE_URL}/medicalTestsResults/get-medical-tests-results/${petId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchBloodsTestResultDetails = async (testId, tableName) => {
  try {
    const response = await axios.get(`${BASE_URL}/medicalTestsResults/get-test-result-details/${testId}/${tableName}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchBloodTestFindingsInfo = async (test_type, petGender, pet_type) => {
  try {
    const gender = petGender === 'זכר' ? 'male' : 'female';
    const response = await axios.get(`${BASE_URL}/medicalTestsResults/get-blood-test-findings-info/${test_type}/${gender}/${pet_type}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};