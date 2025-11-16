import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import Voice from '@react-native-voice/voice';
import Constants from 'expo-constants';

const isExpoGo = Constants.appOwnership === 'expo';

interface VoiceSearchProps {
  onResult?: (text: string) => void;
}

const VoiceSearch: React.FC<VoiceSearchProps> = ({ onResult }) => {
  const [isListening, setIsListening] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Voice event handlers
  const onSpeechStart = (e: any) => {
    console.log('🎤 onSpeechStart:', e);
    setIsListening(true);
    setError(null);
  };

  const onSpeechResults = (e: any) => {
    console.log('🎤 onSpeechResults:', e);
    const values: string[] = e?.value || [];
    setResults(values);
    if (values[0] && onResult) {
      onResult(values[0]);
    }
  };

  const onSpeechEnd = (e: any) => {
    console.log('🎤 onSpeechEnd:', e);
    setIsListening(false);
  };

  const onSpeechError = (e: any) => {
    console.log('🎤 onSpeechError:', e);
    const message = e?.error?.message || 'Something went wrong with voice recognition.';
    setError(message);
    setIsListening(false);
  };

  // Attach listeners & cleanup
  useEffect(() => {
    if (isExpoGo) {
      // In Expo Go we do not touch native Voice module
      return;
    }

    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = onSpeechError;

    return () => {
      try {
        Voice.destroy().then(Voice.removeAllListeners).catch(() => {});
      } catch (e) {
        console.log('🎤 Voice cleanup error:', e);
      }
    };
  }, []);

  const requestMicPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'We need access to your microphone for voice search.',
          buttonPositive: 'OK',
        }
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    } catch (e) {
      console.warn('🎤 Mic permission error:', e);
      return false;
    }
  }, []);

  const startListening = useCallback(async () => {
    if (isExpoGo) {
      Alert.alert(
        'Voice Search',
        'Voice Search is disabled in Expo Go. Please run the app in a native build (EAS dev / production) to use this feature.'
      );
      return;
    }

    try {
      setError(null);
      setResults([]);

      const hasPermission = await requestMicPermission();
      if (!hasPermission) {
        setError('Microphone permission not granted.');
        return;
      }

      await Voice.start('en-IN');
    } catch (e: any) {
      console.log('🎤 startListening error:', e);
      const message = e?.message || 'Failed to start voice recognition.';
      setError(message);
      setIsListening(false);
    }
  }, [requestMicPermission]);

  const stopListening = useCallback(async () => {
    if (isExpoGo) {
      return;
    }
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (e: any) {
      console.log('🎤 stopListening error:', e);
      const message = e?.message || 'Failed to stop voice recognition.';
      setError(message);
    }
  }, []);

  if (isExpoGo) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Voice Search</Text>
        <Text style={styles.disabledText}>
          Voice Search is disabled in Expo Go. Please run the app in a native build to use this
          feature.
        </Text>
      </View>
    );
  }

  const topResult = results[0] || '';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Search</Text>
      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Status: </Text>
        <Text style={styles.statusValue}>{isListening ? 'Listening…' : 'Idle'}</Text>
      </View>
      <View style={styles.buttonsRow}>
        <Button
          title={isListening ? 'Listening…' : 'Start'}
          onPress={startListening}
          disabled={isListening}
        />
        <View style={{ width: 12 }} />
        <Button title="Stop" onPress={stopListening} disabled={!isListening} />
      </View>
      <Text style={styles.resultsLabel}>Heard:</Text>
      <Text style={styles.resultsText}>{topResult || '—'}</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

export default VoiceSearch;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  disabledText: {
    fontSize: 13,
    color: '#666',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 13,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultsLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  resultsText: {
    fontSize: 14,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: 'red',
  },
});


