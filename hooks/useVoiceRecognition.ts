import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, PermissionsAndroid, Alert, NativeModules } from 'react-native';
import Constants from 'expo-constants';

// Direct import - simpler approach
let Voice: any = null;

// Initialize Voice module
const getVoiceModule = (): any => {
  // Web या unsupported env में सीधे null
  if (Platform.OS === 'web') {
    return null;
  }

  // Cached instance
  if (Voice && typeof Voice === 'object') {
    return Voice;
  }

  try {
    // Method 1: Try NativeModules.Voice directly (bare / prebuild build में)
    if (NativeModules.Voice && typeof NativeModules.Voice === 'object') {
      console.log('✅ Using NativeModules.Voice directly');
      Voice = NativeModules.Voice;
      return Voice;
    }

    // Method 2: Try to require the package
    try {
      const VoiceModule = require('@react-native-voice/voice');
      
      // Try different export patterns
      let voiceInstance = VoiceModule.default || VoiceModule;
      
      // If it's a function, it might be a constructor
      if (typeof voiceInstance === 'function') {
        try {
          voiceInstance = new voiceInstance();
        } catch (e) {
          // Not a constructor, use as is
        }
      }
      
      if (voiceInstance && typeof voiceInstance === 'object') {
        // Check if it has start methods
        if (typeof voiceInstance.start === 'function' || typeof voiceInstance.startSpeech === 'function') {
          console.log('✅ Voice module loaded from package');
          Voice = voiceInstance;
          return Voice;
        }
        
        // If it doesn't have start, but NativeModules.Voice exists, use that
        if (NativeModules.Voice) {
          console.log('✅ Using NativeModules.Voice (package loaded but no start method)');
          Voice = NativeModules.Voice;
          return Voice;
        }
      }
    } catch (e) {
      console.warn('⚠️ Package require failed:', e);
    }

    // Method 3: Last resort - check NativeModules.Voice again
    if (NativeModules.Voice && typeof NativeModules.Voice === 'object') {
      console.log('✅ Using NativeModules.Voice as fallback');
      Voice = NativeModules.Voice;
      return Voice;
    }

    console.error('❌ Voice module not found');
    return null;
  } catch (error: any) {
    console.error('❌ Error loading Voice module:', error);
    return null;
  }
};

export const useVoiceRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [status, setStatus] = useState<string>('');
  
  const listenersSetupRef = useRef(false);
  const isMountedRef = useRef(true);

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
      // Web पर सिर्फ browser speech rec check
      setIsAvailable(!!SpeechRecognition);
      return;
    }

    try {
      // Expo Go में native voice module नहीं होता, isAvailable false रखें और चुपचाप disable कर दें
      if (Constants.appOwnership === 'expo') {
        console.log('⚠️ Running in Expo Go - disabling native voice recognition');
        setIsAvailable(false);
        setError(null);
        return;
      }

      // Wait for native modules
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const voiceModule = getVoiceModule();
      
      if (!voiceModule) {
        console.warn('⚠️ Voice module not available (likely Expo Go / dev client without native module)');
        setIsAvailable(false);
        // Error hard मत दिखाओ, सिर्फ availability false रखो
        setError(null);
        return;
      }

      // Setup listeners
      setupListeners(voiceModule);
      setIsAvailable(true);
      console.log('✅ Voice recognition ready');
    } catch (err: any) {
      console.error('❌ Init error:', err);
      setIsAvailable(false);
      setError('Failed to initialize voice recognition');
    }
  };

  const setupListeners = (voiceModule: any) => {
    if (listenersSetupRef.current) {
      return;
    }

    if (!voiceModule || typeof voiceModule !== 'object') {
      console.error('❌ Cannot setup listeners: voiceModule is null or invalid');
      return;
    }

    try {
      // Remove old listeners
      if (typeof voiceModule.removeAllListeners === 'function') {
        try {
          voiceModule.removeAllListeners();
        } catch (e) {
          console.warn('⚠️ Error removing listeners:', e);
        }
      }

      // Verify module is still valid
      if (!voiceModule || typeof voiceModule !== 'object') {
        console.error('❌ Voice module became invalid after removeAllListeners');
        return;
      }

      // Setup new listeners
      voiceModule.onSpeechStart = () => {
        console.log('🎤 Started');
        if (isMountedRef.current) {
          setIsListening(true);
          setError(null);
          setTranscript('');
          setStatus('Listening...');
        }
      };

      voiceModule.onSpeechEnd = () => {
        console.log('🎤 Ended');
        if (isMountedRef.current) {
          setIsListening(false);
          setStatus('');
        }
      };

      voiceModule.onSpeechResults = (e: any) => {
        const text = e?.value?.[0] || '';
        console.log('🎤 Result:', text);
        if (text && isMountedRef.current) {
          setTranscript(text);
          setIsListening(false);
          setStatus('');
        }
      };

      voiceModule.onSpeechPartialResults = (e: any) => {
        const text = e?.value?.[0] || '';
        if (text && isMountedRef.current) {
          setTranscript(text);
        }
      };

      voiceModule.onSpeechError = (e: any) => {
        const msg = e?.error?.message || e?.message || 'Speech error';
        console.error('❌ Speech error:', msg);
        if (isMountedRef.current) {
          setError(msg);
          setIsListening(false);
          setStatus('');
        }
      };

      listenersSetupRef.current = true;
      console.log('✅ Listeners setup complete');
    } catch (err: any) {
      console.error('❌ Setup listeners error:', err);
      listenersSetupRef.current = false;
    }
  };

  const requestMicPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      // अभी primary support Android build के लिए ही
      return false;
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

      return result === PermissionsAndroid.RESULTS.GRANTED;
    } catch (e) {
      console.error('Permission error:', e);
      return false;
    }
  }, []);

  const startListening = useCallback(async () => {
    try {
      console.log('🎤 Starting...');
      setError(null);
      setTranscript('');
      setStatus('');

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
            setTranscript(text);
          }
          setIsListening(false);
        };

        recognition.start();
        return;
      }

      // Mobile (Android app build)
      let voiceModule = getVoiceModule();
      
      if (!voiceModule) {
        // Expo Go / dev client में यहाँ आएगा – button disabled रहेगा
        const errorMsg = 'Voice search is only available in the installed Android app build.';
        setError(errorMsg);
        setIsAvailable(false);
        return;
      }

      // Verify module is still valid
      if (!voiceModule || typeof voiceModule !== 'object') {
        throw new Error('Voice module is invalid');
      }

      // Setup listeners if needed
      if (!listenersSetupRef.current) {
        setupListeners(voiceModule);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Re-verify after setup
        const currentModule = getVoiceModule();
        if (!currentModule || typeof currentModule !== 'object') {
          throw new Error('Voice module became invalid after listener setup');
        }
        voiceModule = currentModule;
      }

      // Request permission
      const hasPermission = await requestMicPermission();
      if (!hasPermission) {
        setError('Microphone permission required');
        Alert.alert('Permission Required', 'Please allow microphone permission in settings.', [{ text: 'OK' }]);
        return;
      }

      // Final verification before starting
      if (!voiceModule || typeof voiceModule !== 'object') {
        voiceModule = getVoiceModule();
        if (!voiceModule || typeof voiceModule !== 'object') {
          throw new Error('Voice module not available');
        }
      }

      // Start listening
      console.log('🎤 Calling start...');
      console.log('Voice module keys:', Object.keys(voiceModule));
      
      // Try start method first, then startSpeech
      let startMethod = voiceModule.start || voiceModule.startSpeech;
      
      if (!startMethod || typeof startMethod !== 'function') {
        console.error('Available methods:', Object.keys(voiceModule));
        throw new Error('Start method not found in Voice module');
      }

      console.log('Using start method:', startMethod.name || 'anonymous');
      
      // Call start - handle both sync and async
      try {
        const result = startMethod.call(voiceModule, 'en-IN');
        
        // Wait if it's a promise
        if (result && typeof result.then === 'function') {
          await result;
        }
      } catch (callError: any) {
        console.error('Error calling start method:', callError);
        throw new Error(`Failed to start: ${callError?.message || 'Unknown error'}`);
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsListening(true);
      setIsAvailable(true);
      setStatus('Listening...');
      console.log('✅ Started successfully');
    } catch (err: any) {
      console.error('❌ Start error:', err);
      const errorMsg = err?.message || 'Failed to start voice recognition';
      setError(errorMsg);
      setIsListening(false);
      setStatus('');
      
      if (errorMsg.includes('null') || errorMsg.includes('not linked')) {
        Alert.alert(
          'Voice Recognition',
          'Please rebuild the APK: npm run build:apk',
          [{ text: 'OK' }]
        );
      }
    }
  }, [requestMicPermission]);

  const stopListening = useCallback(async () => {
    try {
      console.log('🎤 Stopping...');

      if (Platform.OS === 'web') {
        // Web handling if needed
        return;
      }

      const voiceModule = getVoiceModule();
      if (voiceModule && typeof voiceModule.stop === 'function') {
        await voiceModule.stop();
      }

      setIsListening(false);
      setStatus('');
      console.log('✅ Stopped');
    } catch (err) {
      console.error('❌ Stop error:', err);
      setIsListening(false);
      setStatus('');
    }
  }, []);

  const cleanup = useCallback(() => {
    console.log('🧹 Cleaning up...');
    
    if (Platform.OS !== 'web') {
      const voiceModule = getVoiceModule();
      if (voiceModule) {
        try {
          if (isListening && typeof voiceModule.stop === 'function') {
            voiceModule.stop().catch(() => {});
          }
          if (typeof voiceModule.removeAllListeners === 'function') {
            voiceModule.removeAllListeners();
          }
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      listenersSetupRef.current = false;
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
