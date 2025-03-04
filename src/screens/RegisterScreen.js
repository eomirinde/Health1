import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Picker, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { register } from '../api/auth';
import { encrypt } from '../utils/encryption';

const RegisterScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [medicalInfo, setMedicalInfo] = useState('');
  const [userType, setUserType] = useState('patient');
  const [medicalLicense, setMedicalLicense] = useState('');
  const [facility, setFacility] = useState('');
  const [hmo, setHmo] = useState('');

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      const userData = { 
        name: encrypt(name), 
        email: encrypt(email), 
        password: encrypt(password), 
        userType: encrypt(userType), 
        emergencyContact: encrypt(emergencyContact), 
        medicalInfo: encrypt(medicalInfo), 
        medicalLicense: encrypt(medicalLicense), 
        facility: encrypt(facility), 
        hmo: encrypt(hmo) 
      };
      const data = await register(userData);
      Alert.alert('Success', 'Registration successful');
      // Save token and navigate to Dashboard
      navigation.navigate('Dashboard');
    } catch (error) {
      Alert.alert('Error', error.msg || 'An error occurred');
    }
  };

  const renderAdditionalFields = () => {
    if (userType === 'medicalPersonnel') {
      return (
        <>
          <TextInput
            style={styles.input}
            placeholder={t('medicalLicense')}
            value={medicalLicense}
            onChangeText={setMedicalLicense}
          />
        </>
      );
    } else if (userType === 'healthcareFacility') {
      return (
        <>
          <TextInput
            style={styles.input}
            placeholder={t('facilityName')}
            value={facility}
            onChangeText={setFacility}
          />
        </>
      );
    } else if (userType === 'hmo') {
      return (
        <>
          <TextInput
            style={styles.input}
            placeholder={t('hmoName')}
            value={hmo}
            onChangeText={setHmo}
          />
        </>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('register')}</Text>
      <Picker
        selectedValue={userType}
        style={styles.picker}
        onValueChange={(itemValue) => setUserType(itemValue)}
      >
        <Picker.Item label={t('patient')} value="patient" />
        <Picker.Item label={t('medicalPersonnel')} value="medicalPersonnel" />
        <Picker.Item label={t('healthcareFacility')} value="healthcareFacility" />
        <Picker.Item label={t('hmo')} value="hmo" />
      </Picker>
      <TextInput
        style={styles.input}
        placeholder={t('firstName')}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder={t('email')}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder={t('password')}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder={t('confirmPassword')}
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <TextInput
        style={styles.input}
        placeholder={t('emergencyContact')}
        value={emergencyContact}
        onChangeText={setEmergencyContact}
      />
      <TextInput
        style={styles.input}
        placeholder={t('medicalInfo')}
        value={medicalInfo}
        onChangeText={setMedicalInfo}
        multiline
      />
      {renderAdditionalFields()}
      <Button title={t('register')} onPress={handleRegister} />
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
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
  },
});

export default RegisterScreen;