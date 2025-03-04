import * as CryptoJS from 'crypto-js';

const secretKey = 'your-1028-bit-secret-key'; // Replace with your actual secret key

export const encrypt = (data) => {
  return CryptoJS.AES.encrypt(data, secretKey).toString();
};

export const decrypt = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};