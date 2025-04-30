import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { isValidEmail } from '@/lib/utils';

const LoginPage = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // 1: Email/Password, 2: OTP

  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = t('emailRequired');
    } else if (!isValidEmail(email)) {
      newErrors.email = t('invalidEmail');
    }
    
    if (!password) {
      newErrors.password = t('passwordRequired');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 1) {
      if (!validateForm()) return;
      
      setLoading(true);
      try {
        // In a real implementation, this would send the email/password and get back a request for OTP
        // For now, we'll just move to step 2
        setStep(2);
      } catch (error) {
        toast({
          title: t('loginFailed'),
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    } else {
      // Step 2: Validate OTP
      if (!otp) {
        setErrors({ otp: t('otpRequired') });
        return;
      }
      
      setLoading(true);
      try {
        await login(email, password);
        toast({
          title: t('loginSuccess'),
          description: t('welcomeBack'),
        });
        navigate('/dashboard');
      } catch (error) {
        toast({
          title: t('loginFailed'),
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-200">
        {t('login')}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {step === 1 ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('enterEmail')}
                disabled={loading}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('enterPassword')}
                  disabled={loading}
                  className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  tabIndex="-1"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>
            
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-health-600 hover:text-health-800 dark:text-health-400 dark:hover:text-health-300"
              >
                {t('forgotPassword')}
              </Link>
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="otp">{t('otpVerification')}</Label>
            <Input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder={t('enterOtp')}
              disabled={loading}
              className={errors.otp ? 'border-red-500' : ''}
              maxLength={6}
            />
            {errors.otp && (
              <p className="text-sm text-red-500">{errors.otp}</p>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('otpSentToEmail')}
            </p>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm text-health-600 hover:text-health-800 dark:text-health-400 dark:hover:text-health-300"
            >
              {t('goBack')}
            </button>
          </div>
        )}
        
        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('processing')}
            </span>
          ) : step === 1 ? t('continue') : t('login')}
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('noAccount')}{' '}
          <Link
            to="/register"
            className="text-health-600 hover:text-health-800 dark:text-health-400 dark:hover:text-health-300 font-medium"
          >
            {t('signUp')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;