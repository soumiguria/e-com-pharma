# Voice Search Implementation Guide

## Overview

This project implements **two different voice search approaches**:

1. **Google Cloud Speech-to-Text API** (`useVoiceSearch`) - Cloud-based, more accurate
2. **React Native Voice** (`useVoiceRecognition`) - On-device, faster, requires native modules

Both approaches are implemented with proper error handling, permissions, and user feedback.

---

## Architecture

```
┌─────────────────────────────────────────┐
│      UI Components                      │
│  SearchBar, VoiceSearchInput            │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Custom Hooks                       │
│  useVoiceSearch (Google Cloud)          │
│  useVoiceRecognition (React Native)     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Services & Libraries               │
│  speechToTextService (Google Cloud)     │
│  @react-native-voice/voice              │
│  expo-av (Audio Recording)              │
└─────────────────────────────────────────┘
```

---

## Approach 1: Google Cloud Speech-to-Text (`useVoiceSearch`)

### Technology Stack

- **Audio Recording**: `expo-av` (Expo Audio)
- **Cloud API**: Google Cloud Speech-to-Text API
- **File System**: `expo-file-system` (for audio file handling)

### How It Works

1. **Record Audio** → Using `expo-av` Audio.Recording
2. **Convert to Base64** → Read audio file as base64
3. **Send to Google Cloud** → POST request to Speech-to-Text API
4. **Get Transcript** → Receive text transcription
5. **Update Search** → Update search input with transcript

### Implementation Details

#### **Hook: `useVoiceSearch`** (`hooks/useVoiceSearch.ts`)

**State Management**:
```typescript
const [isListening, setIsListening] = useState(false);
const [result, setResult] = useState('');           // Final transcript
const [partialResult, setPartialResult] = useState(''); // Real-time feedback
const [error, setError] = useState<string | null>(null);
const [isAvailable, setIsAvailable] = useState(false);
```

**Key Features**:

1. **Audio Recording**
   ```typescript
   const { recording } = await Audio.Recording.createAsync(
     Audio.RecordingOptionsPresets.HIGH_QUALITY,
     (status) => {
       if (status.isRecording) {
         setIsListening(true);
       }
     }
   );
   ```

2. **Silence Detection**
   ```typescript
   const SILENCE_TIMEOUT = 5000; // 5 seconds
   
   const resetSilenceTimer = () => {
     clearSilenceTimer();
     silenceTimerRef.current = setTimeout(() => {
       if (isListening) {
         stopListening(); // Auto-stop after silence
       }
     }, SILENCE_TIMEOUT);
   };
   ```

3. **Base64 Conversion**
   ```typescript
   const base64Audio = await FileSystem.readAsStringAsync(uri, {
     encoding: FileSystem.EncodingType.Base64,
   });
   ```

4. **API Call**
   ```typescript
   const response = await speechToTextService.recognizeAudio(base64Audio, 16000);
   ```

5. **Cleanup**
   ```typescript
   // Delete temporary audio file
   await FileSystem.deleteAsync(uri, { idempotent: true });
   ```

#### **Service: `speechToTextService`** (`services/api/speechToTextService.ts`)

**API Configuration**:
```typescript
const requestBody = {
  config: {
    encoding: 'LINEAR16',           // WAV/PCM format
    sampleRateHertz: 16000,         // Standard for voice
    languageCode: 'en-IN',          // Indian English
    alternativeLanguageCodes: ['en-US'], // Fallback
    enableAutomaticPunctuation: true,
    model: 'default',
  },
  audio: {
    content: base64Audio,            // Base64 encoded audio
  },
};
```

**API Endpoint**:
```
POST https://speech.googleapis.com/v1/speech:recognize?key={API_KEY}
```

**Error Handling**:
- 400: Invalid audio format
- 401: Invalid API key
- 403: Permission denied
- 429: Quota exceeded
- Network errors

**Configuration** (`services/api/speechToTextConfig.ts`):
```typescript
export const SPEECH_TO_TEXT_CONFIG = {
  API_KEY: process.env.EXPO_PUBLIC_GOOGLE_SPEECH_API_KEY,
  API_URL: 'https://speech.googleapis.com/v1/speech:recognize',
  LANGUAGE_CODE: 'en-IN',
  AUDIO_CONFIG: {
    encoding: 'LINEAR16',
    sampleRateHertz: 16000,
    languageCode: 'en-IN',
    alternativeLanguageCodes: ['en-US'],
    enableAutomaticPunctuation: true,
    model: 'default',
  },
};
```

---

## Approach 2: React Native Voice (`useVoiceRecognition`)

### Technology Stack

- **Library**: `@react-native-voice/voice` (v3.2.4)
- **Platform**: Native modules (Android/iOS)
- **Note**: Requires development build or EAS build (not Expo Go)

### How It Works

1. **Initialize Voice Module** → Check if available
2. **Request Permissions** → Microphone permission
3. **Start Listening** → `Voice.start('en-IN')`
4. **Receive Events** → Real-time transcription via callbacks
5. **Stop Listening** → `Voice.stop()`

### Implementation Details

#### **Hook: `useVoiceRecognition`** (`hooks/useVoiceRecognition.ts`)

**State Management**:
```typescript
const [isListening, setIsListening] = useState(false);
const [transcript, setTranscript] = useState('');           // Final result
const [partialTranscript, setPartialTranscript] = useState(''); // Real-time
const [error, setError] = useState<string | null>(null);
const [isAvailable, setIsAvailable] = useState(false);
const [status, setStatus] = useState<string>('');
```

**Key Features**:

1. **Module Loading** (Handles Expo Go vs Development Build)
   ```typescript
   // Try multiple ways to load Voice module
   let Voice: any = null;
   try {
     if (Platform.OS !== 'web') {
       const VoiceModule = require('@react-native-voice/voice');
       Voice = VoiceModule.default || VoiceModule;
     }
   } catch (e) {
     Voice = null; // Not available in Expo Go
   }
   ```

2. **Expo Go Detection**
   ```typescript
   const isRunningInExpoGo = !Constants.appOwnership || 
                            (Constants.executionEnvironment === 'storeClient' && 
                             !(NativeModules as any).ExpoDevClient);
   
   if (isRunningInExpoGo) {
     Alert.alert('⚠️ Expo Go Not Supported', 
       'Voice recognition requires native modules...');
     return;
   }
   ```

3. **Event Listeners Setup**
   ```typescript
   Voice.onSpeechStart = () => {
     setIsListening(true);
     setStatus('Listening...');
     resetSilenceTimer();
   };
   
   Voice.onSpeechResults = (e: any) => {
     const text = e?.value?.[0] || e?.value || '';
     setTranscript(text);
   };
   
   Voice.onSpeechPartialResults = (e: any) => {
     const text = e?.value?.[0] || e?.value || '';
     setPartialTranscript(text); // Real-time updates
     resetSilenceTimer();
   };
   
   Voice.onSpeechError = (e: any) => {
     setError(e?.error?.message || 'Speech recognition error');
     setIsListening(false);
   };
   ```

4. **Start Listening**
   ```typescript
   await Voice.start('en-IN'); // Start with locale
   ```

5. **Auto-Stop on Silence**
   ```typescript
   const SILENCE_TIMEOUT = 8000; // 8 seconds
   
   const resetSilenceTimer = () => {
     clearSilenceTimer();
     silenceTimerRef.current = setTimeout(() => {
       handleAutoStop(); // Auto-stop after silence
     }, SILENCE_TIMEOUT);
   };
   ```

---

## UI Components

### 1. **SearchBar** (`components/ui/SearchBar.tsx`)

**Features**:
- Text input for manual search
- Microphone button for voice search
- Real-time transcription display
- Pulse animation while listening
- Error state display
- Loading indicator

**Usage**:
```typescript
const { 
  isListening, 
  error, 
  result, 
  partialResult, 
  startListening, 
  stopListening, 
  isAvailable 
} = useVoiceSearch();

// Mic button
<TouchableOpacity onPress={handleVoicePress}>
  <MaterialCommunityIcons
    name={isListening ? 'microphone' : 'microphone-outline'}
    color={isListening ? colors.primary : colors.text}
  />
</TouchableOpacity>
```

**Visual Feedback**:
- **Listening**: Red pulsing mic icon
- **Error**: Red static mic icon
- **Available**: Normal mic icon
- **Partial Results**: Shows in search input in real-time

### 2. **VoiceSearchInput** (`components/voice/VoiceSearchInput.tsx`)

Similar to SearchBar but dedicated voice search component.

---

## Permission Handling

### Android

```typescript
const requestMicPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
    );
    
    if (!hasPermission) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'This app needs microphone access for voice search.',
          buttonPositive: 'Allow',
        }
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  }
  return true; // iOS handled by Audio.requestPermissionsAsync
};
```

### iOS

Handled automatically by `expo-av`:
```typescript
await Audio.requestPermissionsAsync();
```

### Permission Declarations (`app.json`)

```json
{
  "ios": {
    "infoPlist": {
      "NSMicrophoneUsageDescription": "This app needs access to microphone for voice search functionality.",
      "NSSpeechRecognitionUsageDescription": "This app uses speech recognition to convert your voice to text for search."
    }
  },
  "android": {
    "permissions": [
      "android.permission.RECORD_AUDIO"
    ]
  }
}
```

---

## Error Handling

### Google Cloud Speech-to-Text Errors

```typescript
if (status === 400) {
  errorMessage = 'Invalid audio format or configuration';
} else if (status === 401) {
  errorMessage = 'Invalid API key';
} else if (status === 403) {
  errorMessage = 'API key does not have permission';
} else if (status === 429) {
  errorMessage = 'API quota exceeded';
}
```

### React Native Voice Errors

```typescript
Voice.onSpeechError = (e: any) => {
  const msg = e?.error?.message || e?.message || 'Speech recognition error';
  setError(msg);
  setIsListening(false);
};
```

### Common Error Scenarios

1. **API Key Not Configured**
   - Shows error message
   - Disables voice search button
   - Red mic icon

2. **Permission Denied**
   - Shows permission request
   - Falls back to text search

3. **Network Error** (Google Cloud)
   - Shows network error message
   - User can retry

4. **Expo Go** (React Native Voice)
   - Shows alert explaining need for development build
   - Disables voice search

---

## Performance Optimizations

### 1. **Memoization**
```typescript
const requestMicPermission = useCallback(async (): Promise<boolean> => {
  // Permission logic
}, []);

const startListening = useCallback(async () => {
  // Start logic
}, [requestMicPermission]);
```

### 2. **Cleanup**
```typescript
useEffect(() => {
  return () => {
    cleanup(); // Clean up on unmount
  };
}, []);

const cleanup = useCallback(async () => {
  // Stop recording
  // Delete temp files
  // Remove listeners
}, []);
```

### 3. **Silence Detection**
- Auto-stops after 5-8 seconds of silence
- Prevents unnecessary API calls
- Saves battery and data

### 4. **File Cleanup**
```typescript
// Delete temporary audio file after processing
await FileSystem.deleteAsync(uri, { idempotent: true });
```

---

## Configuration

### Environment Variables

```bash
# .env or .env.local
EXPO_PUBLIC_GOOGLE_SPEECH_API_KEY=your_api_key_here
```

### API Key Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Speech-to-Text API
3. Create API key
4. Set in environment variable

---

## Usage Examples

### Using `useVoiceSearch` (Google Cloud)

```typescript
import { useVoiceSearch } from '../hooks/useVoiceSearch';

const MyComponent = () => {
  const { 
    isListening, 
    result, 
    partialResult,
    startListening, 
    stopListening,
    isAvailable 
  } = useVoiceSearch();
  
  return (
    <View>
      <Button 
        title={isListening ? 'Stop' : 'Start'} 
        onPress={isListening ? stopListening : startListening}
        disabled={!isAvailable}
      />
      {partialResult && <Text>{partialResult}</Text>}
      {result && <Text>Final: {result}</Text>}
    </View>
  );
};
```

### Using `useVoiceRecognition` (React Native Voice)

```typescript
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';

const MyComponent = () => {
  const { 
    isListening, 
    transcript,
    partialTranscript,
    startListening, 
    stopListening,
    isAvailable 
  } = useVoiceRecognition();
  
  return (
    <View>
      <Button 
        title={isListening ? 'Stop' : 'Start'} 
        onPress={isListening ? stopListening : startListening}
        disabled={!isAvailable}
      />
      {partialTranscript && <Text>Speaking: {partialTranscript}</Text>}
      {transcript && <Text>Final: {transcript}</Text>}
    </View>
  );
};
```

### Using SearchBar Component

```typescript
import SearchBar from '../components/ui/SearchBar';

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <SearchBar
      onSearch={setSearchQuery}
      placeholder="Search products..."
      value={searchQuery}
    />
  );
};
```

---

## Comparison: Google Cloud vs React Native Voice

| Feature | Google Cloud (`useVoiceSearch`) | React Native Voice (`useVoiceRecognition`) |
|---------|--------------------------------|-------------------------------------------|
| **Accuracy** | ⭐⭐⭐⭐⭐ Very High | ⭐⭐⭐⭐ High |
| **Speed** | ⭐⭐⭐ Slower (network) | ⭐⭐⭐⭐⭐ Instant |
| **Offline** | ❌ Requires internet | ✅ Works offline |
| **Setup** | API key required | Native module required |
| **Cost** | Pay per use | Free |
| **Expo Go** | ✅ Works | ❌ Requires dev build |
| **Real-time** | ⭐⭐⭐ Partial results | ⭐⭐⭐⭐⭐ Full real-time |
| **Languages** | 100+ languages | Limited (device dependent) |

---

## Best Practices Implemented

### ✅ 1. **Permission Handling**
- Request permissions before recording
- Handle permission denial gracefully
- Show clear error messages

### ✅ 2. **Error Handling**
- Comprehensive error messages
- Network error handling
- API error handling
- User-friendly error display

### ✅ 3. **User Feedback**
- Visual indicators (pulsing mic)
- Loading states
- Real-time transcription
- Status messages

### ✅ 4. **Resource Management**
- Cleanup on unmount
- Delete temp files
- Stop recording properly
- Remove event listeners

### ✅ 5. **Performance**
- Auto-stop on silence
- Memoized callbacks
- Efficient file handling
- Proper state management

### ✅ 6. **Platform Support**
- Android permission handling
- iOS permission handling
- Expo Go detection
- Development build support

---

## Interview Talking Points

### 1. **Dual Implementation**
> "We implemented two voice search approaches: Google Cloud Speech-to-Text for cloud-based high-accuracy transcription, and React Native Voice for on-device real-time recognition. This gives users flexibility and ensures voice search works even without internet."

### 2. **Google Cloud Integration**
> "For Google Cloud Speech-to-Text, we record audio using expo-av, convert it to base64, and send it to the API. We handle various error scenarios like invalid API keys, quota limits, and network errors. The service is configured for Indian English (en-IN) with automatic punctuation."

### 3. **React Native Voice**
> "For on-device recognition, we use @react-native-voice/voice which provides real-time transcription. We handle Expo Go detection since it requires native modules, and set up event listeners for speech start, results, partial results, and errors."

### 4. **Permission Handling**
> "We request microphone permissions on both platforms - using PermissionsAndroid for Android and expo-av's requestPermissionsAsync for iOS. We handle permission denial gracefully and show clear error messages."

### 5. **User Experience**
> "We provide real-time feedback with partial transcription results, visual indicators like pulsing mic icons, and auto-stop after silence detection. The search input is disabled while listening to prevent conflicts."

### 6. **Error Handling**
> "We handle multiple error scenarios: API key configuration, network errors, permission denial, Expo Go detection, and API quota limits. Each error has a user-friendly message and appropriate fallback behavior."

### 7. **Performance Optimization**
> "We implement auto-stop on silence (5-8 seconds), cleanup temp files after processing, memoize callbacks to prevent unnecessary re-renders, and properly clean up resources on component unmount."

### 8. **Real-time Transcription**
> "Both implementations support real-time partial results. Google Cloud shows 'Processing...' while React Native Voice shows live transcription as the user speaks, similar to how Cursor or Google Assistant works."

---

## Code Flow

### Google Cloud Flow

```
User clicks mic
    ↓
Request permission
    ↓
Start recording (expo-av)
    ↓
User speaks (5 sec silence timeout)
    ↓
Stop recording
    ↓
Convert to base64
    ↓
POST to Google Cloud API
    ↓
Receive transcript
    ↓
Update search input
    ↓
Delete temp file
```

### React Native Voice Flow

```
User clicks mic
    ↓
Request permission
    ↓
Voice.start('en-IN')
    ↓
onSpeechStart event
    ↓
User speaks (real-time partial results)
    ↓
onSpeechPartialResults (live updates)
    ↓
onSpeechResults (final transcript)
    ↓
Update search input
    ↓
Voice.stop() (or auto-stop on silence)
```

---

## Summary

**Voice Search Implementation**:
- ✅ **Two approaches**: Google Cloud (cloud) + React Native Voice (on-device)
- ✅ **Comprehensive error handling**: API errors, network errors, permissions
- ✅ **Real-time feedback**: Partial results, visual indicators
- ✅ **Performance optimized**: Auto-stop, cleanup, memoization
- ✅ **Platform support**: Android, iOS, Expo Go detection
- ✅ **User-friendly**: Clear error messages, visual feedback

**Key Technologies**:
- `expo-av` - Audio recording
- `@react-native-voice/voice` - On-device recognition
- Google Cloud Speech-to-Text API - Cloud recognition
- `expo-file-system` - File handling

**Result**: A robust, user-friendly voice search implementation with multiple fallback options! 🎤

