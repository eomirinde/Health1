import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { processPayment } from '../api/payment';

const PaymentScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [amount, setAmount] = useState('');

  const handlePayment = async () => {
    try {
      const paymentData = { cardNumber, expiryDate, cvv, amount };
      const data = await processPayment(paymentData);
      Alert.alert('Success', 'Payment processed successfully');
      navigation.navigate('Dashboard');
    } catch (error) {
      Alert.alert('Error', error.msg || 'An error occurred');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('payment')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('cardNumber')}
        value={cardNumber}
        onChangeText={setCardNumber}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder={t('expiryDate')}
        value={expiryDate}
        onChangeText={setExpiryDate}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder={t('cvv')}
        value={cvv}
        onChangeText={setCvv}
        keyboardType="numeric"
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder={t('amount')}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <Button title={t('payNow')} onPress={handlePayment} />
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

export default PaymentScreen;