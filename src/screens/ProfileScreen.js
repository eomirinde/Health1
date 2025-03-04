import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { getProfile, updateProfile } from '../api/user';

const ProfileScreen = () => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    emergencyContact: '',
    medicalInfo: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (error) {
        Alert.alert('Error', error.msg || 'An error occurred');
      }
    };

    fetchProfile();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      await updateProfile(profile);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', error.msg || 'An error occurred');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('profile')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('firstName')}
        value={profile.name}
        onChangeText={(value) => setProfile({ ...profile, name: value })}
      />
      <TextInput
        style={styles.input}
        placeholder={t('email')}
        value={profile.email}
        onChangeText={(value) => setProfile({ ...profile, email: value })}
      />
      <TextInput
        style={styles.input}
        placeholder={t('emergencyContact')}
        value={profile.emergencyContact}
        onChangeText={(value) => setProfile({ ...profile, emergencyContact: value })}
      />
      <TextInput
        style={styles.input}
        placeholder={t('medicalInfo')}
        value={profile.medicalInfo}
        onChangeText={(value) => setProfile({ ...profile, medicalInfo: value })}
        multiline
      />
      <Button title={t('updateProfile')} onPress={handleUpdateProfile} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});

export default ProfileScreen;