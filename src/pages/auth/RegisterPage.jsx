import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff } from 'lucide-react';
import { isValidEmail, isStrongPassword } from '@/lib/utils';

const RegisterPage = () => {
  const { t } = useTranslation();
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [userType, setUserType] = useState('patient');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    emergencyContact: '',
    medicalInfo: '',
    medicalLicense: '',
    facility: '',
    hmo: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) {
      newErrors.name = t('nameRequired');
    }
    
    if (!formData.email) {
      newErrors.email = t('emailRequired');
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = t('invalidEmail');
    }
    
    if (!formData.password) {
      newErrors.password = t('passwordRequired');
    } else if (!isStrongPassword(formData.password)) {
      newErrors.password = t('passwordRequirements');
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('passwordsDoNotMatch');
    }
    
    if (userType === 'patient' && !formData.emergencyContact) {
      newErrors.emergencyContact = t('emergencyContactRequired');
    }
    
    if (userType === 'medicalPersonnel' && !formData.medicalLicense) {
      newErrors.medicalLicense = t('medicalLicenseRequired');
    }
    
    if (userType === 'healthcareFacility' && !formData.facility) {
      newErrors.facility = t('facilityNameRequired');
    }
    
    if (userType === 'hmo' && !formData.hmo) {
      newErrors.hmo = t('hmoNameRequired');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const userData = {
        ...formData,
        userType,
      };
      
      await register(userData);
      
      toast({
        title: t('registrationSuccess'),
        description: t('accountCreated'),
      });
      
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: t('registrationFailed'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-200">
        {t('register')}
      </h2>
      
      <Tabs defaultValue="patient" onValueChange={setUserType} className="mb-6">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="patient">{t('patient')}</TabsTrigger>
          <TabsTrigger value="medicalPersonnel">{t('medicalPersonnel')}</TabsTrigger>
          <TabsTrigger value="healthcareFacility">{t('healthcareFacility')}</TabsTrigger>
          <TabsTrigger value="hmo">{t('hmo')}</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t('fullName')}</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder={t('enterFullName')}
            disabled={loading}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">{t('email')}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
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
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
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
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('passwordHint')}
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder={t('confirmYourPassword')}
            disabled={loading}
            className={errors.confirmPassword ? 'border-red-500' : ''}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">{errors.confirmPassword}</p>
          )}
        </div>
        
        {userType === 'patient' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="emergencyContact">{t('emergencyContact')}</Label>
              <Input
                id="emergencyContact"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                placeholder={t('enterEmergencyContact')}
                disabled={loading}
                className={errors.emergencyContact ? 'border-red-500' : ''}
              />
              {errors.emergencyContact && (
                <p className="text-sm text-red-500">{errors.emergencyContact}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="medicalInfo">{t('medicalInfo')}</Label>
              <Input
                id="medicalInfo"
                name="medicalInfo"
                value={formData.medicalInfo}
                onChange={handleChange}
                placeholder={t('enterMedicalInfo')}
                disabled={loading}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('medicalInfoHint')}
              </p>
            </div>
          </>
        )}
        
        {userType === 'medicalPersonnel' && (
          <div className="space-y-2">
            <Label htmlFor="medicalLicense">{t('medicalLicense')}</Label>
            <Input
              id="medicalLicense"
              name="medicalLicense"
              value={formData.medicalLicense}
              onChange={handleChange}
              placeholder={t('enterMedicalLicense')}
              disabled={loading}
              className={errors.medicalLicense ? 'border-red-500' : ''}
            />
            {errors.medicalLicense && (
              <p className="text-sm text-red-500">{errors.medicalLicense}</p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('licenseVerificationNote')}
            </p>
          </div>
        )}
        
        {userType === 'healthcareFacility' && (
          <div className="space-y-2">
            <Label htmlFor="facility">{t('facilityName')}</Label>
            <Input
              id="facility"
              name="facility"
              value={formData.facility}
              onChange={handleChange}
              placeholder={t('enterFacilityName')}
              disabled={loading}
              className={errors.facility ? 'border-red-500' : ''}
            />
            {errors.facility && (
              <p className="text-sm text-red-500">{errors.facility}</p>
            )}
          </div>
        )}
        
        {userType === 'hmo' && (
          <div className="space-y-2">
            <Label htmlFor="hmo">{t('hmoName')}</Label>
            <Input
              id="hmo"
              name="hmo"
              value={formData.hmo}
              onChange={handleChange}
              placeholder={t('enterHmoName')}
              disabled={loading}
              className={errors.hmo ? 'border-red-500' : ''}
            />
            {errors.hmo && (
              <p className="text-sm text-red-500">{errors.hmo}</p>
            )}
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
          ) : t('register')}
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('alreadyHaveAccount')}{' '}
          <Link
            to="/login"
            className="text-health-600 hover:text-health-800 dark:text-health-400 dark:hover:text-health-300 font-medium"
          >
            {t('login')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;