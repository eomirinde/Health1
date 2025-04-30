import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getProfile, updateProfile, updateEmergencyContact, updateMedicalInfo, uploadProfileImage } from '@/api/user';
import { getInitials } from '@/lib/utils';

const ProfilePage = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    bloodType: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
    },
    medicalInfo: {
      allergies: '',
      medications: '',
      conditions: '',
      notes: '',
    },
    profileImage: null,
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const data = await getProfile();
        setProfile({
          ...profile,
          ...data,
          // Ensure nested objects exist
          emergencyContact: {
            ...profile.emergencyContact,
            ...data.emergencyContact,
          },
          medicalInfo: {
            ...profile.medicalInfo,
            ...data.medicalInfo,
          },
        });
      } catch (error) {
        toast({
          title: t('errorFetchingProfile'),
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested objects
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfile({
        ...profile,
        [parent]: {
          ...profile[parent],
          [child]: value,
        },
      });
    } else {
      setProfile({
        ...profile,
        [name]: value,
      });
    }
  };

  const handleProfileUpdate = async () => {
    setSaving(true);
    try {
      await updateProfile({
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender,
        bloodType: profile.bloodType,
      });
      
      toast({
        title: t('profileUpdated'),
        description: t('profileUpdateSuccess'),
      });
    } catch (error) {
      toast({
        title: t('updateFailed'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEmergencyContactUpdate = async () => {
    setSaving(true);
    try {
      await updateEmergencyContact(profile.emergencyContact);
      
      toast({
        title: t('emergencyContactUpdated'),
        description: t('emergencyContactUpdateSuccess'),
      });
    } catch (error) {
      toast({
        title: t('updateFailed'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleMedicalInfoUpdate = async () => {
    setSaving(true);
    try {
      await updateMedicalInfo(profile.medicalInfo);
      
      toast({
        title: t('medicalInfoUpdated'),
        description: t('medicalInfoUpdateSuccess'),
      });
    } catch (error) {
      toast({
        title: t('updateFailed'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: t('uploadFailed'),
        description: t('fileTooLarge'),
        variant: 'destructive',
      });
      return;
    }
    
    // Check file type
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      toast({
        title: t('uploadFailed'),
        description: t('invalidFileType'),
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setSaving(true);
      const data = await uploadProfileImage(file);
      
      setProfile({
        ...profile,
        profileImage: data.profileImage,
      });
      
      toast({
        title: t('imageUploaded'),
        description: t('profileImageUpdateSuccess'),
      });
    } catch (error) {
      toast({
        title: t('uploadFailed'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-health-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.profileImage} alt={profile.name} />
              <AvatarFallback className="text-lg bg-health-100 text-health-800">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
            <label 
              htmlFor="profile-image" 
              className="absolute bottom-0 right-0 bg-health-600 text-white p-1 rounded-full cursor-pointer hover:bg-health-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              <input 
                id="profile-image" 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload} 
                disabled={saving}
              />
            </label>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {profile.name}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {profile.email}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="personal" className="mt-6">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="personal">{t('personalInfo')}</TabsTrigger>
          <TabsTrigger value="emergency">{t('emergencyContact')}</TabsTrigger>
          <TabsTrigger value="medical">{t('medicalInfo')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>{t('personalInfo')}</CardTitle>
              <CardDescription>
                {t('personalInfoDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('fullName')}</Label>
                  <Input
                    id="name"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('email')}</Label>
                  <Input
                    id="email"
                    name="email"
                    value={profile.email}
                    disabled={true} // Email cannot be changed
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('phone')}</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">{t('dateOfBirth')}</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={profile.dateOfBirth}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">{t('gender')}</Label>
                  <select
                    id="gender"
                    name="gender"
                    value={profile.gender}
                    onChange={handleChange}
                    disabled={saving}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">{t('selectGender')}</option>
                    <option value="male">{t('male')}</option>
                    <option value="female">{t('female')}</option>
                    <option value="other">{t('other')}</option>
                    <option value="prefer-not-to-say">{t('preferNotToSay')}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodType">{t('bloodType')}</Label>
                  <select
                    id="bloodType"
                    name="bloodType"
                    value={profile.bloodType}
                    onChange={handleChange}
                    disabled={saving}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">{t('selectBloodType')}</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">{t('address')}</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={profile.address}
                  onChange={handleChange}
                  disabled={saving}
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleProfileUpdate} disabled={saving}>
                {saving ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('saving')}
                  </span>
                ) : t('saveChanges')}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="emergency">
          <Card>
            <CardHeader>
              <CardTitle>{t('emergencyContact')}</CardTitle>
              <CardDescription>
                {t('emergencyContactDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact.name">{t('contactName')}</Label>
                  <Input
                    id="emergencyContact.name"
                    name="emergencyContact.name"
                    value={profile.emergencyContact.name}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact.relationship">{t('relationship')}</Label>
                  <Input
                    id="emergencyContact.relationship"
                    name="emergencyContact.relationship"
                    value={profile.emergencyContact.relationship}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact.phone">{t('contactPhone')}</Label>
                  <Input
                    id="emergencyContact.phone"
                    name="emergencyContact.phone"
                    value={profile.emergencyContact.phone}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleEmergencyContactUpdate} disabled={saving}>
                {saving ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('saving')}
                  </span>
                ) : t('saveChanges')}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="medical">
          <Card>
            <CardHeader>
              <CardTitle>{t('medicalInfo')}</CardTitle>
              <CardDescription>
                {t('medicalInfoDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="medicalInfo.allergies">{t('allergies')}</Label>
                <Textarea
                  id="medicalInfo.allergies"
                  name="medicalInfo.allergies"
                  value={profile.medicalInfo.allergies}
                  onChange={handleChange}
                  disabled={saving}
                  placeholder={t('allergiesPlaceholder')}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medicalInfo.medications">{t('currentMedications')}</Label>
                <Textarea
                  id="medicalInfo.medications"
                  name="medicalInfo.medications"
                  value={profile.medicalInfo.medications}
                  onChange={handleChange}
                  disabled={saving}
                  placeholder={t('medicationsPlaceholder')}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medicalInfo.conditions">{t('medicalConditions')}</Label>
                <Textarea
                  id="medicalInfo.conditions"
                  name="medicalInfo.conditions"
                  value={profile.medicalInfo.conditions}
                  onChange={handleChange}
                  disabled={saving}
                  placeholder={t('conditionsPlaceholder')}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medicalInfo.notes">{t('additionalNotes')}</Label>
                <Textarea
                  id="medicalInfo.notes"
                  name="medicalInfo.notes"
                  value={profile.medicalInfo.notes}
                  onChange={handleChange}
                  disabled={saving}
                  placeholder={t('notesPlaceholder')}
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleMedicalInfoUpdate} disabled={saving}>
                {saving ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('saving')}
                  </span>
                ) : t('saveChanges')}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;