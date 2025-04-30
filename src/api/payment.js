import axios from './axios';
import CryptoJS from 'crypto-js';
import { getEncryptionKey } from '@/utils/encryption';
import localforage from 'localforage';

// Helper function to encrypt sensitive data
const encryptData = async (data) => {
  const key = await getEncryptionKey();
  return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
};

export const processPayment = async (paymentData) => {
  try {
    // Encrypt sensitive payment data
    const encryptedData = {
      ...paymentData,
      cardNumber: await encryptData(paymentData.cardNumber),
      cvv: await encryptData(paymentData.cvv),
      expiryDate: await encryptData(paymentData.expiryDate),
    };
    
    const response = await axios.post('/payment/process', encryptedData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Payment processing failed');
    }
    throw new Error('Network error. Please check your connection.');
  }
};

export const getPaymentHistory = async () => {
  try {
    // Try to get from cache first if offline
    if (!navigator.onLine) {
      const cachedHistory = await localforage.getItem('paymentHistory');
      if (cachedHistory) {
        return { ...cachedHistory, cached: true };
      }
    }
    
    const response = await axios.get('/payment/history');
    
    // Cache the payment history for offline use
    await localforage.setItem('paymentHistory', response.data);
    
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch payment history');
    }
    throw new Error('Network error. Please check your connection.');
  }
};

export const getPaymentMethods = async () => {
  try {
    // Try to get from cache first if offline
    if (!navigator.onLine) {
      const cachedMethods = await localforage.getItem('paymentMethods');
      if (cachedMethods) {
        return { ...cachedMethods, cached: true };
      }
    }
    
    const response = await axios.get('/payment/methods');
    
    // Cache the payment methods for offline use
    await localforage.setItem('paymentMethods', response.data);
    
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch payment methods');
    }
    throw new Error('Network error. Please check your connection.');
  }
};

export const addPaymentMethod = async (methodData) => {
  try {
    // Encrypt sensitive payment data
    const encryptedData = {
      ...methodData,
      cardNumber: await encryptData(methodData.cardNumber),
      cvv: await encryptData(methodData.cvv),
      expiryDate: await encryptData(methodData.expiryDate),
    };
    
    const response = await axios.post('/payment/methods', encryptedData);
    
    // Update cached payment methods
    const cachedMethods = await localforage.getItem('paymentMethods') || { methods: [] };
    cachedMethods.methods.push(response.data);
    await localforage.setItem('paymentMethods', cachedMethods);
    
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to add payment method');
    }
    throw new Error('Network error. Please check your connection.');
  }
};

export const deletePaymentMethod = async (methodId) => {
  try {
    const response = await axios.delete(`/payment/methods/${methodId}`);
    
    // Update cached payment methods
    const cachedMethods = await localforage.getItem('paymentMethods');
    if (cachedMethods && cachedMethods.methods) {
      cachedMethods.methods = cachedMethods.methods.filter(method => method.id !== methodId);
      await localforage.setItem('paymentMethods', cachedMethods);
    }
    
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to delete payment method');
    }
    throw new Error('Network error. Please check your connection.');
  }
};