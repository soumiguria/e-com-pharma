import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';

// Load Voice module with better error handling
let Voice: any = null;
let isModuleLoaded = false;

const initializeVoiceModule = () => {
  if (Platform.OS === 'web' || isModuleLoaded) {
    return Voice;
  }

  try {
    const VoiceModule = require('@react-native-voice/voice');
    
    // Handle different export patterns
    if (VoiceModule && typeof VoiceModule === 'object') {
      Voice = VoiceModule.default || VoiceModule.Voice || VoiceModule;
      
      if (Voice && typeof Voice === 'object') {
        isModuleLoaded = true;
        console.log('✅ Voice module initialized successfully');
        return Voice;
      }
    }
  } catch (error: any) {
    console.warn('⚠️ Voice module not available:', error?.message || error);
  }
  
  return null;
};

// Initialize once
Voice = initializeVoiceModule();

export const useVoiceRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [status, setStatus] = useState<string>('');
  
  const mediaRecorderRef = useRef<any>(null);
  const voiceInstanceRef = useRef<any>(null);
  const isInitializedRef = useRef(false);

  // Initialize on mount
  useEffect(() => {
    initVoiceRecognition();
    return cleanup;
  }, []);

  const initVoiceRecognition = async () => {
    if (Platform.OS === 'web') {
      // Web: Check for Speech Recognition API
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsAvailable(true);
      } else {
        setIsAvailable(false);
        setError('Speech recognition not supported on this browser');
      }
      return;
    }

    // Mobile: Initialize native module
    try {
      // Ensure module is loaded
      if (!Voice) {
        Voice = initializeVoiceModule();
      }

      if (!Voice) {
        console.warn('⚠️ Voice module not available');
        setIsAvailable(false);
        return;
      }

      // Check availability
      let available = true;
      if (typeof Voice.isAvailable === 'function') {
        try {
          available = await Voice.isAvailable();
        } catch (e) {
          console.warn('⚠️ Availability check failed:', e);
        }
      }

      if (available) {
        setupListeners();
        setIsAvailable(true);
        isInitializedRef.current = true;
      } else {
        setIsAvailable(false);
        setError('Speech recognition is not available on this device');
      }
    } catch (err: any) {
      console.error('❌ Initialization error:', err);
      setIsAvailable(false);
      setError('Failed to initialize voice recognition');
    }
  };

  const setupListeners = () => {
    if (!Voice || isInitializedRef.current) {
      return;
    }

    try {
      // Remove any existing listeners
      if (typeof Voice.removeAllListeners === 'function') {
        Voice.removeAllListeners();
      }

      // Setup event listeners
      Voice.onSpeechStart = () => {
        console.log('🎤 Speech recognition started');
        setIsListening(true);
        setError(null);
        setTranscript('');
        setStatus('Listening...');
      };

      Voice.onSpeechEnd = () => {
        console.log('🎤 Speech recognition ended');
        setIsListening(false);
        setStatus('');
      };

      Voice.onSpeechResults = (e: { value?: string[] }) => {
        const text = e?.value?.[0] || '';
        console.log('🎤 Speech result:', text);
        if (text) {
          setTranscript(text);
          setIsListening(false);
          setStatus('');
        }
      };

      Voice.onSpeechPartialResults = (e: { value?: string[] }) => {
        const text = e?.value?.[0] || '';
        if (text) {
          console.log('🎤 Partial result:', text);
          setTranscript(text);
        }
      };

      Voice.onSpeechError = (e: { error?: { message?: string } }) => {
        const errorMessage = e?.error?.message || 'Speech recognition error';
        console.error('❌ Speech error:', errorMessage);
        setError(errorMessage);
        setIsListening(false);
        setStatus('');
      };

      voiceInstanceRef.current = Voice;
      isInitializedRef.current = true;
      console.log('✅ Voice listeners setup complete');
    } catch (err) {
      console.error('❌ Error setting up listeners:', err);
      setError('Failed to setup voice recognition listeners');
      isInitializedRef.current = false;
    }
  };

  const requestMicPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true; // iOS handles permissions automatically
    }

    try {
      // Check current permission
      const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );

      if (hasPermission) {
        return true;
      }

      // Request permission
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'This app needs microphone access to enable voice search. Please allow microphone permission.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'Allow',
        }
      );

      return result === PermissionsAndroid.RESULTS.GRANTED;
    } catch (e) {
      console.error('Permission error:', e);
      return false;
    }
  }, []);

  const startListening = useCallback(async () => {
    try {
      console.log('🎤 Requesting to start voice recognition...');
      setError(null);
      setTranscript('');
      setStatus('');

      if (Platform.OS === 'web') {
        // Web implementation
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
          setError('Speech recognition not supported');
          return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-IN';
        recognition.interimResults = true;
        recognition.continuous = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
          setStatus('Listening...');
        };

        recognition.onerror = (e: any) => {
          setError(e?.error || 'Speech recognition error');
          setIsListening(false);
          setStatus('');
        };

        recognition.onend = () => {
          setIsListening(false);
          setStatus('');
        };

        recognition.onresult = (e: any) => {
          const text = e.results?.[e.resultIndex]?.[0]?.transcript || '';
          if (text) {
            setTranscript(text);
          }
          setIsListening(false);
          setStatus('');
        };

        mediaRecorderRef.current = recognition;
        recognition.start();
        return;
      }

      // Mobile implementation
      // Ensure Voice module is available
      if (!Voice) {
        Voice = initializeVoiceModule();
      }

      if (!Voice) {
        const errorMsg = 'Voice recognition module is not available. Please rebuild the app with a development build.';
        setError(errorMsg);
        Alert.alert(
          'Voice Recognition Not Available',
          errorMsg,
          [{ text: 'OK' }]
        );
        setIsAvailable(false);
        return;
      }

      // Setup listeners if not already done
      if (!isInitializedRef.current) {
        setupListeners();
        
        // Wait a bit for listeners to be set
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!isInitializedRef.current) {
          setError('Failed to initialize voice recognition. Please try again.');
          return;
        }
      }

      // Request permission
      const hasPermission = await requestMicPermission();
      if (!hasPermission) {
        setError('Microphone permission is required for voice search');
        Alert.alert(
          'Permission Required',
          'Please allow microphone permission in app settings to use voice search.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Start listening
      if (typeof Voice.start !== 'function') {
        setError('Voice recognition start method not available');
        return;
      }

      console.log('🎤 Starting voice recognition...');
      await Voice.start('en-IN');
      setIsListening(true);
      setIsAvailable(true);
      setStatus('Listening...');
      console.log('✅ Voice recognition started successfully');
    } catch (err: any) {
      console.error('❌ Error starting voice recognition:', err);
      const errorMsg = err?.message || err?.toString() || 'Failed to start voice recognition';
      setError(errorMsg);
      setIsListening(false);
      setStatus('');
      
      // Show helpful error message
      if (errorMsg.includes('null') || errorMsg.includes('startSpeech')) {
        Alert.alert(
          'Voice Recognition Error',
          'Voice recognition is not properly initialized. Please restart the app or rebuild with a development build.',
          [{ text: 'OK' }]
        );
      }
    }
  }, [requestMicPermission]);

  const stopListening = useCallback(async () => {
    try {
      console.log('🎤 Stopping voice recognition...');

      if (Platform.OS === 'web') {
        const recognition = mediaRecorderRef.current;
        if (recognition && typeof recognition.stop === 'function') {
          recognition.stop();
        }
      } else {
        if (Voice && typeof Voice.stop === 'function') {
          await Voice.stop();
        }
      }

      setIsListening(false);
      setStatus('');
      console.log('✅ Voice recognition stopped');
    } catch (err) {
      console.error('❌ Error stopping voice recognition:', err);
      setIsListening(false);
      setStatus('');
    }
  }, []);

  const cleanup = useCallback(() => {
    console.log('🧹 Cleaning up voice recognition...');
    
    if (Platform.OS === 'web') {
      const recognition = mediaRecorderRef.current;
      if (recognition && typeof recognition.stop === 'function') {
        try {
          recognition.stop();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      mediaRecorderRef.current = null;
    } else {
      if (Voice) {
        try {
          if (typeof Voice.stop === 'function' && isListening) {
            Voice.stop().catch(() => {});
          }
          if (typeof Voice.destroy === 'function') {
            Voice.destroy().catch(() => {});
          }
          if (typeof Voice.removeAllListeners === 'function') {
            Voice.removeAllListeners();
          }
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      isInitializedRef.current = false;
      voiceInstanceRef.current = null;
    }
    
    setIsListening(false);
    setStatus('');
  }, [isListening]);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    isAvailable,
    status,
  };
};
