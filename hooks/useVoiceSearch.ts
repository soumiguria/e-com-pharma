import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import speechToTextService from '../services/api/speechToTextService';

interface UseVoiceSearchReturn {
  isListening: boolean;
  error: string | null;
  result: string;
  partialResult: string;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  isAvailable: boolean;
}

/**
 * Enhanced Voice Search Hook using Google Cloud Speech-to-Text API
 * Records audio and sends it to Google Cloud for transcription
 */
export const useVoiceSearch = (): UseVoiceSearchReturn => {
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState('');
  const [partialResult, setPartialResult] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  
  const recordingRef = useRef<Audio.Recording | null>(null);
  const isMountedRef = useRef(true);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const SILENCE_TIMEOUT = 5000; // 5 seconds

  useEffect(() => {
    isMountedRef.current = true;
    initAudio();
    
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, []);

  const initAudio = async () => {
    try {
      // Request audio permissions
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      
      // Check if Google Cloud Speech-to-Text is configured
      const isConfigured = speechToTextService.isConfigured();
      setIsAvailable(isConfigured);
      
      if (!isConfigured) {
        setError('Google Cloud Speech-to-Text API key not configured. Please set EXPO_PUBLIC_GOOGLE_SPEECH_API_KEY environment variable.');
      }
    } catch (err: any) {
      console.error('❌ Audio initialization error:', err);
      setIsAvailable(false);
      setError('Failed to initialize audio recording');
    }
  };

  const requestMicPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      return true;
    }

    if (Platform.OS === 'android') {
      try {
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );

        if (hasPermission) {
          return true;
        }

        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs microphone access for voice search.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'Allow',
          }
        );

        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          // No alert - just show red mic icon
          return false;
        }

        return true;
      } catch (e) {
        return false;
      }
    }

    // iOS - handled by Audio.requestPermissionsAsync
    return true;
  }, []);

  const startListening = useCallback(async () => {
    try {
      setError(null);
      setResult('');
      setPartialResult('');

      // Check if service is configured
      if (!speechToTextService.isConfigured()) {
        const errorMsg = 'Google Cloud Speech-to-Text API key not configured. Please set EXPO_PUBLIC_GOOGLE_SPEECH_API_KEY environment variable.';
        setError(errorMsg);
        // No alert - just show red mic icon
        return;
      }

      // Request microphone permission
      const hasPermission = await requestMicPermission();
      if (!hasPermission) {
        setError('Microphone permission required');
        return;
      }

      // Set audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      console.log('🎤 Starting audio recording...');
      
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => {
          // This callback provides recording status updates
          if (status.isRecording) {
            setIsListening(true);
            resetSilenceTimer();
          }
        }
      );

      recordingRef.current = recording;
      setIsListening(true);
      resetSilenceTimer();

      console.log('✅ Recording started');
    } catch (err: any) {
      console.error('❌ Error starting recording:', err);
      const errorMsg = err?.message || 'Failed to start recording';
      setError(errorMsg);
      setIsListening(false);
      // No alert - just show red mic icon
    }
  }, [requestMicPermission]);

  const stopListening = useCallback(async () => {
    try {
      clearSilenceTimer();

      if (!recordingRef.current) {
        setIsListening(false);
        return;
      }

      console.log('🛑 Stopping recording...');
      
      // Stop recording
      await recordingRef.current.stopAndUnloadAsync();
      
      // Get the recording URI
      const uri = recordingRef.current.getURI();
      
      if (!uri) {
        setError('Failed to get recording file');
        setIsListening(false);
        return;
      }

      console.log('📁 Recording saved to:', uri);
      
      // Convert audio to base64
      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log('📤 Sending audio to Google Cloud Speech-to-Text...');
      
      // Show loading state
      setPartialResult('Processing...');

      // Send to Google Cloud Speech-to-Text
      const response = await speechToTextService.recognizeAudio(base64Audio, 16000);

      if (response.success && response.result) {
        const transcript = response.result.transcript;
        console.log('✅ Transcription received:', transcript);
        setResult(transcript);
        setPartialResult('');
      } else {
        const errorMsg = response.error || 'Failed to recognize speech';
        console.error('❌ Speech recognition failed:', errorMsg);
        setError(errorMsg);
        setPartialResult('');
      }

      // Clean up recording file
      try {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      } catch (e) {
        // Ignore cleanup errors
      }

      // Clean up recording reference
      recordingRef.current = null;
      setIsListening(false);
    } catch (err: any) {
      console.error('❌ Error stopping recording:', err);
      const errorMsg = err?.message || 'Failed to process recording';
      setError(errorMsg);
      setIsListening(false);
      
      // Clean up
      if (recordingRef.current) {
        try {
          await recordingRef.current.stopAndUnloadAsync();
          recordingRef.current = null;
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    }
  }, []);

  const resetSilenceTimer = () => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      if (isListening && isMountedRef.current) {
        // Auto-stop after 5 seconds of silence
        console.log('⏱️ Silence timeout reached, stopping recording...');
        stopListening();
      }
    }, SILENCE_TIMEOUT);
  };

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  const cleanup = useCallback(async () => {
    clearSilenceTimer();
    
    if (recordingRef.current) {
      try {
        const uri = recordingRef.current.getURI();
        await recordingRef.current.stopAndUnloadAsync();
        
        // Clean up recording file
        if (uri) {
          try {
            await FileSystem.deleteAsync(uri, { idempotent: true });
          } catch (e) {
            // Ignore cleanup errors
          }
        }
      } catch (e) {
        // Ignore cleanup errors
      }
      recordingRef.current = null;
    }
    
    setIsListening(false);
  }, []);

  return {
    isListening,
    error,
    result,
    partialResult,
    startListening,
    stopListening,
    isAvailable,
  };
};
