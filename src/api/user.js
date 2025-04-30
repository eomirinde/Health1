import axios from './axios';
import localforage from 'localforage';

export const getProfile = async () => {
  try {
    // Try to get from cache first if offline
    if (!navigator.onLine) {
      const cachedProfile = await localforage.getItem('userProfile');
      if (cachedProfile) {
        return { ...cachedProfile, cached: true };
      }
    }
    
    const response = await axios.get('/user/profile');
    
    // Cache the profile for offline use
    await localforage.setItem('userProfile', response.data);
    
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch profile');
    }
    throw new Error('Network error. Please check your connection.');
  }
};

export const updateProfile = async (profileData) => {
  try {
    const response = await axios.put('/user/profile', profileData);
    
    // Update the cached profile
    await localforage.setItem('userProfile', response.data);
    
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to update profile');
    }
    throw new Error('Network error. Please check your connection.');
  }
};

export const updateEmergencyContact = async (contactData) => {
  try {
    const response = await axios.put('/user/emergency-contact', contactData);
    
    // Update the cached profile
    const cachedProfile = await localforage.getItem('userProfile');
    if (cachedProfile) {
      cachedProfile.emergencyContact = contactData;
      await localforage.setItem('userProfile', cachedProfile);
    }
    
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to update emergency contact');
    }
    throw new Error('Network error. Please check your connection.');
  }
};

export const updateMedicalInfo = async (medicalData) => {
  try {
    const response = await axios.put('/user/medical-info', medicalData);
    
    // Update the cached profile
    const cachedProfile = await localforage.getItem('userProfile');
    if (cachedProfile) {
      cachedProfile.medicalInfo = medicalData;
      await localforage.setItem('userProfile', cachedProfile);
    }
    
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to update medical information');
    }
    throw new Error('Network error. Please check your connection.');
  }
};

export const uploadProfileImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('profileImage', imageFile);
    
    const response = await axios.post('/user/profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Update the cached profile
    const cachedProfile = await localforage.getItem('userProfile');
    if (cachedProfile) {
      cachedProfile.profileImage = response.data.profileImage;
      await localforage.setItem('userProfile', cachedProfile);
    }
    
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to upload profile image');
    }
    throw new Error('Network error. Please check your connection.');
  }
};