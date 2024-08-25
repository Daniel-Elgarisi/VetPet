import AsyncStorage from '@react-native-async-storage/async-storage';

export const getOwnerId = async () => {
  try {
    const ownerId = await AsyncStorage.getItem('ownerId');
    if (ownerId !== null) {
      return ownerId;
    } else {
      console.log('No ownerId found');
      return null;
    }
  } catch (error) {
    console.log('Failed to fetch ownerId:', error);
    throw error;
  }
};