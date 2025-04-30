import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister } from '@/api/auth';
import localforage from 'localforage';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from storage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = await localforage.getItem('user');
        const storedToken = await localforage.getItem('token');
        
        if (storedUser && storedToken) {
          setCurrentUser(JSON.parse(storedUser));
          setToken(storedToken);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiLogin({ email, password });
      const { user, token } = response;
      
      setCurrentUser(user);
      setToken(token);
      
      // Store in persistent storage
      await localforage.setItem('user', JSON.stringify(user));
      await localforage.setItem('token', token);
      
      return user;
    } catch (error) {
      setError(error.message || 'Failed to login');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRegister(userData);
      const { user, token } = response;
      
      setCurrentUser(user);
      setToken(token);
      
      // Store in persistent storage
      await localforage.setItem('user', JSON.stringify(user));
      await localforage.setItem('token', token);
      
      return user;
    } catch (error) {
      setError(error.message || 'Failed to register');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setCurrentUser(null);
    setToken(null);
    await localforage.removeItem('user');
    await localforage.removeItem('token');
  };

  const value = {
    currentUser,
    token,
    loading,
    error,
    isAuthenticated: !!currentUser,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};