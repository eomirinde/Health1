import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LoginScreen from '../../src/screens/LoginScreen';

describe('LoginScreen', () => {
  it('renders correctly', () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
  });

  it('handles login', () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password');
    fireEvent.press(getByText('Login'));
    // Add assertions for login API call and navigation
  });
});