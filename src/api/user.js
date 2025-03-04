import axios from './axios';

export const getProfile = async () => {
  try {
    const response = await axios.get('/user/profile');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const updateProfile = async (profileData) => {
  try {
    const response = await axios.put('/user/profile', profileData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};