import { Alert } from 'react-native';

export const handleApiError = (error: any, defaultMessage: string = 'An error occurred') => {
  const message = error?.message || error?.toString() || defaultMessage;
  console.error('API Error:', error);
  Alert.alert('Error', message);
};

export const showSuccessMessage = (message: string) => {
  Alert.alert('Success', message);
};

export const showInfoMessage = (title: string, message: string) => {
  Alert.alert(title, message);
};