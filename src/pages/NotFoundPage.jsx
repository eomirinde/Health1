import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const NotFoundPage = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-9xl font-bold text-health-600">404</h1>
      <h2 className="text-3xl font-semibold mt-4 mb-6 text-gray-800 dark:text-gray-200">
        {t('pageNotFound')}
      </h2>
      <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mb-8">
        {t('pageNotFoundDescription')}
      </p>
      <div className="flex space-x-4">
        <Button asChild>
          <Link to={isAuthenticated ? '/dashboard' : '/login'}>
            {isAuthenticated ? t('backToDashboard') : t('backToLogin')}
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <a href="mailto:support@health1.com">
            {t('contactSupport')}
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;