import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LanguageSwitcher from '@/components/navigation/LanguageSwitcher';

const AuthLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-health-100 to-health-200 flex flex-col">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-health-800">Health1</h1>
            <p className="text-health-600">Global Healthcare Access</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <Outlet />
          </div>
        </div>
      </div>
      <div className="p-4 text-center text-sm text-health-600">
        &copy; {new Date().getFullYear()} Health1. All rights reserved.
      </div>
    </div>
  );
};

export default AuthLayout;