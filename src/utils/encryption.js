import CryptoJS from 'crypto-js';
import localforage from 'localforage';

// Generate a device-specific encryption key
export const getEncryptionKey = async () => {
  let key = await localforage.getItem('encryptionKey');
  
  if (!key) {
    // Generate a random key if none exists
    const randomKey = CryptoJS.lib.WordArray.random(128/8).toString();
    await localforage.setItem('encryptionKey', randomKey);
    key = randomKey;
  }
  
  // Combine with a constant salt for added security
  const salt = import.meta.env.VITE_ENCRYPTION_SALT || 'health1-salt';
  return CryptoJS.PBKDF2(key, salt, { keySize: 256/32, iterations: 1000 }).toString();
};

// Encrypt data
export const encrypt = async (data) => {
  if (!data) return null;
  
  const key = await getEncryptionKey();
  return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
};

// Decrypt data
export const decrypt = async (encryptedData) => {
  if (!encryptedData) return null;
  
  try {
    const key = await getEncryptionKey();
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

// Hash data (one-way)
export const hash = (data) => {
  if (!data) return null;
  return CryptoJS.SHA256(data).toString();
};

// Secure compare (constant time)
export const secureCompare = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
};