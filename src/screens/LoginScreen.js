import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { login } from '../api/auth';
import { encrypt } from '../utils/encryption';

const LoginScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [secretAnswer, setSecretAnswer] = useState('');

  const handleLogin = async () => {
    try {
      const userData = { email: encrypt(email), password: encrypt(password) };
      const data = await login(userData);
      Alert.alert('Success', 'Login successful');
      // Save token and navigate to Dashboard
      navigation.navigate('Dashboard');
    } catch (error) {
      Alert.alert('Error', error.msg || 'An error occurred');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('login')}</Text>
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
        placeholder="OTP"
        value={otp}
        onChangeText={setOtp}
      />
      <TextInput
        style={styles.input}
        placeholder="Secret Answer"
        value={secretAnswer}
        onChangeText={setSecretAnswer}
      />
      <Button title={t('login')} onPress={handleLogin} />
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

export default LoginScreen;