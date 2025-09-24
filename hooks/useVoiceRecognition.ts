// import { useState, useEffect, useRef } from 'react';
// import { Platform, Alert, PermissionsAndroid } from 'react-native';

// // On mobile, use native voice; on web, fall back to MediaRecorder + manual transcription (browser engine)
// let Voice: any = null;
// if (Platform.OS !== 'web') {
//   try {
//     // Lazy require to avoid bundling issues on web
//     // eslint-disable-next-line @typescript-eslint/no-var-requires
//     Voice = require('@react-native-voice/voice').default;
//   } catch (_e) {
//     Voice = null;
//   }
// }

// export const useVoiceRecognition = () => {
//   const [isListening, setIsListening] = useState(false);
//   const [transcript, setTranscript] = useState('');
//   const [error, setError] = useState<string | null>(null);
//   const [isAvailable, setIsAvailable] = useState(true);
//   const [status, setStatus] = useState<string>('');

//   // Web-only state
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
//   const audioChunksRef = useRef<Blob[]>([]);

//   useEffect(() => {
//     checkAvailability();
//     return () => {
//       // Cleanup mobile listeners
//       if (Platform.OS !== 'web' && Voice) {
//         Voice.destroy().catch(() => undefined);
//         Voice.removeAllListeners?.();
//       }
//       // Cleanup web recorder
//       if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
//         mediaRecorderRef.current.stop();
//       }
//     };
//   }, []);

//   const registerMobileListeners = () => {
//     // Only register listeners if Voice is fully available and working
//     if (!Voice || typeof Voice.onSpeechStart === 'undefined' || Voice.onSpeechStart === null) {
//       console.log('Voice module not ready for listener registration');
//       return;
//     }
    
//     try {
//       Voice.removeAllListeners?.();
//       Voice.onSpeechStart = () => {
//         setIsListening(true);
//         setError(null);
//         setTranscript('');
//         setStatus('Listening...');
//       };
//       Voice.onSpeechEnd = () => {
//         setIsListening(false);
//         setStatus('');
//       };
//       Voice.onSpeechResults = (event: { value?: string[] }) => {
//         const text = event?.value?.[0] ?? '';
//         if (text) setTranscript(text);
//       };
//       Voice.onSpeechError = (event: { error?: { message?: string } }) => {
//         const message = event?.error?.message || 'Speech recognition error';
//         setError(message);
//         setIsListening(false);
//         setStatus('');
//       };
//     } catch (err) {
//       console.log('Error registering mobile listeners:', err);
//     }
//   };

//   const checkAvailability = async () => {
//     try {
//       if (Platform.OS === 'web') {
//         if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
//           setIsAvailable(true);
//         } else {
//           setError('Voice recognition is not supported on this browser');
//           setIsAvailable(false);
//         }
//       } else {
//         // In Expo Go, Voice will be null, so we disable voice recognition gracefully
//         if (!Voice) {
//           console.log('Voice module not available in Expo Go - voice recognition disabled');
//           setIsAvailable(false);
//           setError(null); // Don't show error, just disable silently
//           return;
//         }
//         try {
//           const available = await Voice.isAvailable?.();
//           setIsAvailable(!!available);
//           if (available && Voice && Voice.onSpeechStart) {
//             registerMobileListeners();
//           }
//         } catch (voiceErr) {
//           console.log('Voice availability check failed:', voiceErr);
//           setIsAvailable(false);
//           setError(null); // Don't show error, just disable silently
//         }
//       }
//     } catch (err) {
//       console.error('Voice availability check failed:', err);
//       setError(null); // Don't show error, just disable silently
//       setIsAvailable(false);
//     }
//   };

//   const requestAndroidMicPermission = async (): Promise<boolean> => {
//     if (Platform.OS !== 'android') return true;
//     try {
//       const granted = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
//         {
//           title: 'Microphone Permission',
//           message: 'This app requires microphone access for voice search.',
//           buttonPositive: 'OK',
//         }
//       );
//       return granted === PermissionsAndroid.RESULTS.GRANTED;
//     } catch (e) {
//       return false;
//     }
//   };

//   const startListening = async () => {
//     if (!isAvailable) {
//       // Don't show alert, just silently fail
//       console.log('Voice recognition not available');
//       return;
//     }
//     try {
//       setError(null);
//       setTranscript('');
//       setStatus('');

//       if (Platform.OS === 'web') {
//         const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
//         if (!SpeechRecognition) {
//           setError('Web Speech API not supported');
//           setIsListening(false);
//           return;
//         }
//         const recognition = new SpeechRecognition();
//         recognition.lang = 'en-IN';
//         recognition.interimResults = false;
//         recognition.maxAlternatives = 1;
//         recognition.onstart = () => {
//           setIsListening(true);
//           setStatus('Listening...');
//         };
//         recognition.onerror = (e: any) => {
//           setError(e?.error || 'Web speech error');
//           setIsListening(false);
//           setStatus('');
//         };
//         recognition.onend = () => {
//           setIsListening(false);
//           setStatus('');
//         };
//         recognition.onresult = (e: any) => {
//           const text = e.results?.[0]?.[0]?.transcript || '';
//           if (text) setTranscript(text);
//         };
//         // Store recognition instance to stop later via `any` typed ref
//         (mediaRecorderRef as unknown as { current: any }).current = recognition;
//         recognition.start();
//         return;
//       }

//       // Mobile (native)
//       if (!Voice || !Voice.start) {
//         console.log('Voice module not available in Expo Go');
//         return;
//       }
//       const permissionOk = await requestAndroidMicPermission();
//       if (!permissionOk) {
//         setError('Microphone permission denied');
//         return;
//       }
//       await Voice.start('en-IN');
//       setIsListening(true);
//       setStatus('Listening...');
//     } catch (err: any) {
//       console.error('Voice recognition error:', err);
//       setError(err.message || 'Failed to start voice recognition');
//       setIsListening(false);
//       setStatus('');
//     }
//   };

//   const stopListening = async () => {
//     try {
//       if (Platform.OS === 'web') {
//         const recognition: any = mediaRecorderRef.current;
//         if (recognition && typeof recognition.stop === 'function') {
//           recognition.stop();
//         }
//         setIsListening(false);
//         setStatus('');
//         return;
//       }
//       if (Voice && Voice.stop) {
//         await Voice.stop();
//       }
//       setIsListening(false);
//       setStatus('');
//     } catch (err) {
//       console.error('Error stopping voice recognition:', err);
//       setIsListening(false);
//       setStatus('');
//     }
//   };

//   return {
//     isListening,
//     transcript,
//     error,
//     startListening,
//     stopListening,
//     isAvailable,
//     status,
//   };
// };


import { useState, useEffect, useRef } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';

// On mobile, use native voice; on web, fall back to browser SpeechRecognition
let Voice: any = null;
if (Platform.OS !== 'web') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    Voice = require('@react-native-voice/voice').default;
  } catch (_e) {
    Voice = null;
  }
}

export const useVoiceRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [status, setStatus] = useState<string>('');

  // Web-only state
  const mediaRecorderRef = useRef<any>(null);

  useEffect(() => {
    checkAvailability();
    return () => {
      // Cleanup mobile listeners
      if (Platform.OS !== 'web' && Voice) {
        try {
          if (typeof Voice.destroy === 'function') {
            Voice.destroy().catch(() => undefined);
          }
          if (typeof Voice.removeAllListeners === 'function') {
            Voice.removeAllListeners();
          }
        } catch (err) {
          console.log('Voice cleanup error:', err);
        }
      }
      // Cleanup web recognition
      try {
        const recorder: any = mediaRecorderRef.current;
        if (recorder && typeof recorder.stop === 'function') {
          recorder.stop();
        }
        mediaRecorderRef.current = null;
      } catch (err) {
        console.log('Web recorder cleanup error:', err);
      }
    };
  }, []);

  const registerMobileListeners = () => {
    if (!Voice || typeof Voice !== 'object') {
      console.log('Voice module not ready for listener registration');
      return;
    }

    try {
      if (typeof Voice.removeAllListeners === 'function') {
        Voice.removeAllListeners();
      }

      if ('onSpeechStart' in Voice) {
        Voice.onSpeechStart = () => {
          setIsListening(true);
          setError(null);
          setTranscript('');
          setStatus('Listening...');
        };
      }

      if ('onSpeechEnd' in Voice) {
        Voice.onSpeechEnd = () => {
          setIsListening(false);
          setStatus('');
        };
      }

      if ('onSpeechResults' in Voice) {
        Voice.onSpeechResults = (event: { value?: string[] }) => {
          const text = event?.value?.[0] ?? '';
          if (text) setTranscript(text);
        };
      }

      if ('onSpeechError' in Voice) {
        Voice.onSpeechError = (event: { error?: { message?: string } }) => {
          const message = event?.error?.message || 'Speech recognition error';
          setError(message);
          setIsListening(false);
          setStatus('');
        };
      }
    } catch (err) {
      console.log('Error registering mobile listeners:', err);
    }
  };

  const checkAvailability = async () => {
    try {
      if (Platform.OS === 'web') {
        if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
          setIsAvailable(true);
        } else {
          setError('Voice recognition is not supported on this browser');
          setIsAvailable(false);
        }
      } else {
        if (!Voice) {
          console.log('Voice module not available in Expo Go - voice recognition disabled');
          setIsAvailable(false);
          setError(null);
          return;
        }
        try {
          const available = await Voice.isAvailable?.();
          setIsAvailable(!!available);
          if (available) {
            registerMobileListeners();
          }
        } catch (voiceErr) {
          console.log('Voice availability check failed:', voiceErr);
          setIsAvailable(false);
          setError(null);
        }
      }
    } catch (err) {
      console.error('Voice availability check failed:', err);
      setError(null);
      setIsAvailable(false);
    }
  };

  const requestAndroidMicPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'This app requires microphone access for voice search.',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (e) {
      return false;
    }
  };

  const startListening = async () => {
    if (!isAvailable) {
      console.log('Voice recognition not available');
      return;
    }
    try {
      setError(null);
      setTranscript('');
      setStatus('');

      if (Platform.OS === 'web') {
        const SpeechRecognition =
          (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
          setError('Web Speech API not supported');
          setIsListening(false);
          return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-IN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.onstart = () => {
          setIsListening(true);
          setStatus('Listening...');
        };
        recognition.onerror = (e: any) => {
          setError(e?.error || 'Web speech error');
          setIsListening(false);
          setStatus('');
        };
        recognition.onend = () => {
          setIsListening(false);
          setStatus('');
        };
        recognition.onresult = (e: any) => {
          const text = e.results?.[0]?.[0]?.transcript || '';
          if (text) setTranscript(text);
        };
        mediaRecorderRef.current = recognition;
        recognition.start();
        return;
      }

      // Mobile
      if (!Voice || typeof Voice.start !== 'function') {
        console.log('Voice module not available in Expo Go');
        return;
      }
      const permissionOk = await requestAndroidMicPermission();
      if (!permissionOk) {
        setError('Microphone permission denied');
        return;
      }
      await Voice.start('en-IN');
      setIsListening(true);
      setStatus('Listening...');
    } catch (err: any) {
      console.error('Voice recognition error:', err);
      setError(err.message || 'Failed to start voice recognition');
      setIsListening(false);
      setStatus('');
    }
  };

  const stopListening = async () => {
    try {
      if (Platform.OS === 'web') {
        const recognition: any = mediaRecorderRef.current;
        if (recognition && typeof recognition.stop === 'function') {
          recognition.stop();
        }
        setIsListening(false);
        setStatus('');
        return;
      }
      if (Voice && typeof Voice.stop === 'function') {
        await Voice.stop();
      }
      setIsListening(false);
      setStatus('');
    } catch (err) {
      console.error('Error stopping voice recognition:', err);
      setIsListening(false);
      setStatus('');
    }
  };

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
