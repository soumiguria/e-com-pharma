import { useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';

export const useVoiceRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    try {
      // For Expo managed workflow, voice recognition requires development build
      // Check platform capabilities
      if (Platform.OS === 'web') {
        setError('Voice recognition is not supported on web. Please use mobile app.');
        setIsAvailable(false);
      } else if (Platform.OS === 'ios' || Platform.OS === 'android') {
        // In managed workflow, voice recognition is not available
        // It would be available in development build
        setError('Voice recognition requires a development build. Please type your search.');
        setIsAvailable(false);
      } else {
        setError('Voice recognition is not available on this platform.');
        setIsAvailable(false);
      }
    } catch (err) {
      console.error('Voice availability check failed:', err);
      setError('Failed to check voice recognition availability.');
      setIsAvailable(false);
    }
  };

  const startListening = async () => {
    if (!isAvailable) {
      Alert.alert(
        'Voice Recognition',
        'Voice recognition requires a development build. Please type your search for now.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setError(null);
      setTranscript('');
      setIsListening(true);
      
      // Simulate voice recognition process
      setTimeout(() => {
        setIsListening(false);
        Alert.alert(
          'Voice Recognition',
          'Voice recognition is not available in the current build. Please type your search.',
          [{ text: 'OK' }]
        );
      }, 1000);
      
    } catch (err: any) {
      console.error('Voice recognition error:', err);
      setError(err.message || 'Failed to start voice recognition');
      setIsListening(false);
    }
  };

  const stopListening = async () => {
    try {
      setIsListening(false);
    } catch (err) {
      console.error('Error stopping voice recognition:', err);
    }
  };

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    isAvailable,
  };
}; 