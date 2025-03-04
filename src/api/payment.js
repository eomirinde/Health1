import axios from './axios';

export const processPayment = async (paymentData) => {
  try {
    const response = await axios.post('/payment/process', paymentData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};