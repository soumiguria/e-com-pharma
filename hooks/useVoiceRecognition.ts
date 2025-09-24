import { useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';

// Gemini API configuration
const GEMINI_API_KEY = 'AIzaSyBqJhQJhQJhQJhQJhQJhQJhQJhQJhQJhQJhQ'; // Replace with your actual API key
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export const useVoiceRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  useEffect(() => {
    checkAvailability();
    return () => {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
    };
  }, []);

  const checkAvailability = async () => {
    try {
      if (Platform.OS === 'web') {
        // Check for MediaRecorder support
        if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
          setIsAvailable(true);
        } else {
          setError('Voice recognition is not supported on this browser');
          setIsAvailable(false);
        }
      } else {
        // For mobile, we'll use a simple text input fallback
        setError('Voice recognition requires a web browser. Please type your search.');
        setIsAvailable(false);
      }
    } catch (err) {
      console.error('Voice availability check failed:', err);
      setError('Failed to check voice recognition availability');
      setIsAvailable(false);
    }
  };

  const startListening = async () => {
    if (!isAvailable) {
      Alert.alert(
        'Voice Recognition',
        'Voice recognition is not available. Please type your search.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setError(null);
      setTranscript('');
      setAudioChunks([]);
      
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create MediaRecorder
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(prev => [...prev, event.data]);
        }
      };
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsListening(true);
    } catch (err: any) {
      console.error('Voice recognition error:', err);
      setError(err.message || 'Failed to start voice recognition');
      setIsListening(false);
    }
  };

  const stopListening = async () => {
    try {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        setMediaRecorder(null);
        setIsListening(false);
      }
    } catch (err) {
      console.error('Error stopping voice recognition:', err);
      setIsListening(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      setError(null);
      
      // Convert audio to base64
      const base64Audio = await blobToBase64(audioBlob);
      
      // Call Gemini API for speech-to-text
      const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "Please transcribe the following audio to text. Return only the transcribed text without any additional formatting or explanation.",
              inlineData: {
                mimeType: "audio/webm",
                data: base64Audio
              }
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            topK: 32,
            topP: 1,
            maxOutputTokens: 4096,
          }
        })
      });

      if (!geminiResponse.ok) {
        const errorData = await geminiResponse.text();
        console.error('Gemini API error:', errorData);
        throw new Error(`Gemini API error: ${geminiResponse.status} - ${errorData}`);
      }

      const data = await geminiResponse.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const transcribedText = data.candidates[0].content.parts[0].text;
        setTranscript(transcribedText.trim());
      } else {
        throw new Error('No transcription result from Gemini API');
      }
    } catch (err: any) {
      console.error('Transcription error:', err);
      setError(err.message || 'Failed to transcribe audio');
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix to get just the base64 string
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
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