import axios from 'axios';
import localforage from 'localforage';

// Create axios instance
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
instance.interceptors.request.use(
  async (config) => {
    const token = await localforage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle offline mode
    if (!navigator.onLine) {
      // Store failed requests for later retry
      const failedRequests = await localforage.getItem('failedRequests') || [];
      failedRequests.push({
        url: originalRequest.url,
        method: originalRequest.method,
        data: originalRequest.data,
        headers: originalRequest.headers,
        timestamp: Date.now(),
      });
      await localforage.setItem('failedRequests', failedRequests);
      
      // Return cached data if available
      const cachedData = await localforage.getItem(`cache_${originalRequest.url}`);
      if (cachedData) {
        return Promise.resolve({ data: cachedData, cached: true });
      }
    }
    
    // Handle token refresh on 401 Unauthorized
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Attempt to refresh token
        const refreshToken = await localforage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
            { refreshToken }
          );
          
          const { token } = response.data;
          await localforage.setItem('token', token);
          
          // Retry the original request
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return instance(originalRequest);
        }
      } catch (refreshError) {
        // If refresh token fails, redirect to login
        await localforage.removeItem('token');
        await localforage.removeItem('refreshToken');
        await localforage.removeItem('user');
        
        // Force reload to clear state
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Function to retry failed requests when back online
export const retryFailedRequests = async () => {
  const failedRequests = await localforage.getItem('failedRequests') || [];
  if (failedRequests.length === 0) return;
  
  // Clear failed requests
  await localforage.removeItem('failedRequests');
  
  // Retry each request
  for (const request of failedRequests) {
    try {
      await instance({
        url: request.url,
        method: request.method,
        data: request.data,
        headers: request.headers,
      });
    } catch (error) {
      console.error('Failed to retry request:', error);
    }
  }
};

// Listen for online status to retry failed requests
if (typeof window !== 'undefined') {
  window.addEventListener('online', retryFailedRequests);
}

export default instance;