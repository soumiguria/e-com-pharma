import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, PermissionsAndroid, Alert, NativeModules } from 'react-native';
import Constants from 'expo-constants';

// Dynamic Voice module loader - Optimized for EAS builds
const getVoiceModule = (): any => {
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    // Method 1: Direct require (most reliable for EAS)
    try {
      const VoiceModule = require('@react-native-voice/voice');
      if (VoiceModule) {
        const Voice = VoiceModule.default || VoiceModule;
        if (Voice && typeof Voice === 'object') {
          if (Voice.start || Voice.startSpeech || Voice.isAvailable) {
            return Voice;
          }
        }
      }
    } catch (e) {
      // Continue to next method
    }

    // Method 2: NativeModules (fallback for EAS)
    try {
      const VoiceModule = (NativeModules as any).Voice || 
                         (NativeModules as any).RCTVoice ||
                         (NativeModules as any).VoiceModule;
      if (VoiceModule && typeof VoiceModule === 'object') {
        return VoiceModule;
      }
    } catch (e) {
      // Continue
    }

    return null;
  } catch (error) {
    return null;
  }
};

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
 * Enhanced Voice Search Hook with real-time transcription
 * Supports auto-stop after silence, partial results, and proper error handling
 */
export const useVoiceSearch = (): UseVoiceSearchReturn => {
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState('');
  const [partialResult, setPartialResult] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  
  const isMountedRef = useRef(true);
  const listenersSetupRef = useRef(false);
  const voiceModuleRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastPartialResultRef = useRef<string>('');
  const SILENCE_TIMEOUT = 5000; // 5 seconds

  useEffect(() => {
    isMountedRef.current = true;
    initVoice();
    
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, []);

  const initVoice = async () => {
    if (Platform.OS === 'web') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setIsAvailable(!!SpeechRecognition);
      return;
    }

    // Check if running in Expo Go (which doesn't support native modules)
    const isRunningInExpoGo = !Constants.appOwnership || 
                              (Constants.executionEnvironment === 'storeClient' && 
                               !(NativeModules as any).ExpoDevClient);

    if (isRunningInExpoGo) {
      const errorMsg = 'Voice recognition requires a development build or EAS build. Expo Go does not support native modules.';
      setError(errorMsg);
      setIsAvailable(false);
      Alert.alert(
        '⚠️ Expo Go Not Supported',
        'Voice recognition requires native modules that are not available in Expo Go.\n\nPlease use:\n• Development Build: npx expo run:android\n• EAS Build: npx eas build --platform android',
        [{ text: 'OK' }]
      );
      return;
    }

    const Voice = getVoiceModule();
    voiceModuleRef.current = Voice;

    if (!Voice) {
      const errorMsg = 'Voice module not available. Please ensure you are using a development build or EAS build, not Expo Go.';
      setError(errorMsg);
      setIsAvailable(false);
      Alert.alert(
        'Voice Module Unavailable',
        'Voice recognition requires native modules. Please build the app using:\n• npx expo run:android\n• npx eas build --platform android',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      if (Voice.isAvailable && typeof Voice.isAvailable === 'function') {
        const available = await Voice.isAvailable();
        if (available) {
          setupListeners(Voice);
          setIsAvailable(true);
        } else {
          setIsAvailable(false);
        }
      } else {
        setupListeners(Voice);
        setIsAvailable(true);
      }
    } catch (err: any) {
      setIsAvailable(false);
    }
  };

  const setupListeners = (Voice: any) => {
    if (listenersSetupRef.current) {
      return;
    }

    if (!Voice || typeof Voice !== 'object') {
      return;
    }

    try {
      if (Voice.removeAllListeners && typeof Voice.removeAllListeners === 'function') {
        Voice.removeAllListeners();
      }

      // Speech started
      Voice.onSpeechStart = () => {
        if (isMountedRef.current) {
          setIsListening(true);
          setError(null);
          setResult('');
          setPartialResult('');
          lastPartialResultRef.current = '';
          resetSilenceTimer();
        }
      };

      // Speech ended
      Voice.onSpeechEnd = () => {
        if (isMountedRef.current) {
          clearSilenceTimer();
          setIsListening(false);
        }
      };

      // Final results
      Voice.onSpeechResults = (e: any) => {
        const text = e?.value?.[0] || e?.value || '';
        if (text && isMountedRef.current) {
          setResult(text);
          setPartialResult('');
          setIsListening(false);
          clearSilenceTimer();
        }
      };

      // Partial results (real-time)
      Voice.onSpeechPartialResults = (e: any) => {
        const text = e?.value?.[0] || e?.value || '';
        if (text && isMountedRef.current) {
          setPartialResult(text);
          lastPartialResultRef.current = text;
          resetSilenceTimer(); // Reset timer on new partial result
        }
      };

      // Speech error
      Voice.onSpeechError = (e: any) => {
        const msg = e?.error?.message || e?.message || e?.error || 'Speech recognition error';
        if (isMountedRef.current) {
          setError(msg);
          setIsListening(false);
          clearSilenceTimer();
        }
      };

      listenersSetupRef.current = true;
    } catch (err: any) {
      listenersSetupRef.current = false;
    }
  };

  const resetSilenceTimer = () => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      if (isListening && isMountedRef.current) {
        // Auto-stop after 5 seconds of silence
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

  const requestMicPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true;
    }

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
        Alert.alert(
          'Permission Required',
          'Microphone permission is required for voice search. Please enable it in settings.',
          [{ text: 'OK' }]
        );
        return false;
      }

      return true;
    } catch (e) {
      return false;
    }
  }, []);

  const startListening = useCallback(async () => {
    try {
      setError(null);
      setResult('');
      setPartialResult('');

      if (Platform.OS === 'web') {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
          setError('Speech recognition not supported');
          return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-IN';
        recognition.interimResults = true;
        recognition.continuous = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onerror = (e: any) => {
          setError(e?.error || 'Speech error');
          setIsListening(false);
        };
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (e: any) => {
          const text = e.results?.[e.resultIndex]?.[0]?.transcript || '';
          if (text) {
            setResult(text);
          }
          setIsListening(false);
        };

        recognition.start();
        return;
      }

      // Mobile - Get Voice module dynamically
      let Voice = voiceModuleRef.current || getVoiceModule();
      
      if (!Voice) {
        Voice = getVoiceModule();
        voiceModuleRef.current = Voice;
      }

      if (!Voice) {
        const errorMsg = 'Voice recognition module is not available. Please rebuild the app with EAS build.';
        setError(errorMsg);
        Alert.alert(
          'Voice Recognition Unavailable',
          'Voice recognition requires native modules. Please ensure the app is built with development client.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Setup listeners if not already done
      if (!listenersSetupRef.current) {
        setupListeners(Voice);
      }

      // Request permission
      const hasPermission = await requestMicPermission();
      if (!hasPermission) {
        setError('Microphone permission required');
        return;
      }

      // Check if start method exists
      const startMethod = Voice.start || Voice.startSpeech || Voice.startListening;
      
      if (!startMethod || typeof startMethod !== 'function') {
        const errorMsg = 'Voice recognition start method not available';
        setError(errorMsg);
        Alert.alert(
          'Voice Recognition Error',
          'Voice module methods not found. Please rebuild the app.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Start listening with locale
      const startResult = startMethod.call(Voice, 'en-IN');
      
      if (startResult && typeof startResult.then === 'function') {
        await startResult;
      }
      
      // Give it a moment to initialize
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setIsListening(true);
      setIsAvailable(true);
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to start voice recognition';
      setError(errorMsg);
      setIsListening(false);
      
      Alert.alert(
        'Voice Recognition Error',
        errorMsg,
        [{ text: 'OK' }]
      );
    }
  }, [requestMicPermission]);

  const stopListening = useCallback(async () => {
    try {
      clearSilenceTimer();

      if (Platform.OS === 'web') {
        setIsListening(false);
        return;
      }

      const Voice = voiceModuleRef.current || getVoiceModule();
      
      if (!Voice) {
        setIsListening(false);
        return;
      }

      const stopMethod = Voice.stop || Voice.stopSpeech || Voice.stopListening;
      
      if (stopMethod && typeof stopMethod === 'function') {
        await stopMethod.call(Voice);
      }

      setIsListening(false);
      
      // Use last partial result as final result if no final result yet
      if (!result && lastPartialResultRef.current) {
        setResult(lastPartialResultRef.current);
      }
    } catch (err: any) {
      setIsListening(false);
    }
  }, [result]);

  const cleanup = useCallback(() => {
    clearSilenceTimer();
    
    if (Platform.OS !== 'web') {
      const Voice = voiceModuleRef.current || getVoiceModule();
      
      if (Voice) {
        try {
          if (isListening) {
            const stopMethod = Voice.stop || Voice.stopSpeech || Voice.stopListening;
            if (stopMethod && typeof stopMethod === 'function') {
              stopMethod.call(Voice).catch(() => {});
            }
          }
          if (Voice.removeAllListeners && typeof Voice.removeAllListeners === 'function') {
            Voice.removeAllListeners();
          }
          listenersSetupRef.current = false;
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    }
    
    setIsListening(false);
  }, [isListening]);

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

