import { useState, useEffect } from 'react';
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';

export const useVoiceRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Voice.onSpeechStart = () => setIsListening(true);
    Voice.onSpeechEnd = () => setIsListening(false);
    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      if (e.value && e.value[0]) {
        setTranscript(e.value[0]);
      }
    };
    Voice.onSpeechError = (e: SpeechErrorEvent) => {
      setError(e.error?.message || 'Something went wrong');
      setIsListening(false);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startListening = async () => {
    try {
      setError(null);
      setTranscript('');
      await Voice.start('en-US');
    } catch (e) {
      setError('Failed to start voice recognition');
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
    } catch (e) {
      setError('Failed to stop voice recognition');
    }
  };

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
  };
}; 