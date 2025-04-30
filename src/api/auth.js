import axios from './axios';
import CryptoJS from 'crypto-js';
import { getEncryptionKey } from '@/utils/encryption';

// Helper function to encrypt sensitive data
const encryptData = async (data) => {
  const key = await getEncryptionKey();
  return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
};

export const login = async (userData) => {
  try {
    // Only encrypt sensitive data
    const encryptedData = {
      email: userData.email,
      password: await encryptData(userData.password),
    };
    
    const response = await axios.post('/auth/login', encryptedData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Login failed');
    }
    throw new Error('Network error. Please check your connection.');
  }
};

export const register = async (userData) => {
  try {
    // Encrypt sensitive data
    const encryptedData = {
      ...userData,
      password: await encryptData(userData.password),
    };
    
    const response = await axios.post('/auth/register', encryptedData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Registration failed');
    }
    throw new Error('Network error. Please check your connection.');
  }
};

export const verifyOtp = async (email, otp) => {
  try {
    const response = await axios.post('/auth/verify-otp', { email, otp });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'OTP verification failed');
    }
    throw new Error('Network error. Please check your connection.');
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await axios.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Password reset request failed');
    }
    throw new Error('Network error. Please check your connection.');
  }
};

export const resetPassword = async (token, password) => {
  try {
    const encryptedPassword = await encryptData(password);
    const response = await axios.post('/auth/reset-password', { 
      token, 
      password: encryptedPassword 
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Password reset failed');
    }
    throw new Error('Network error. Please check your connection.');
  }
};

export const validateLicense = async (licenseData) => {
  try {
    const response = await axios.post('/auth/validate-license', licenseData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'License validation failed');
    }
    throw new Error('Network error. Please check your connection.');
  }
};