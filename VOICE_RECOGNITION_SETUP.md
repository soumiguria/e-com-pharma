# Voice Recognition Setup Guide

## Current Status
Voice recognition is partially implemented but requires a development build to work fully.

## What's Already Configured

### 1. Permissions Added to app.json
- **iOS**: Microphone and Speech Recognition permissions
- **Android**: RECORD_AUDIO and MODIFY_AUDIO_SETTINGS permissions

### 2. Dependencies
- `@react-native-voice/voice` - For voice recognition (requires dev build)
- `expo-speech` - For text-to-speech (no config plugin needed)

### 3. EAS Configuration
- Development build profile already configured in `eas.json`

### 4. Current Implementation
- Graceful fallback for managed workflow
- Clear user messaging about development build requirement
- Proper error handling and platform detection

## To Enable Full Voice Recognition

### Step 1: Create Development Build
```bash
# Install EAS CLI if not already installed
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Create development build
eas build --profile development --platform android
# or for iOS
eas build --profile development --platform ios
```

### Step 2: Install Development Build
- Download and install the generated APK/IPA on your device
- This build includes native modules needed for voice recognition

### Step 3: Alternative Implementation Options

#### Option A: Use Web Speech API (Web Only)
```typescript
// For web platform, you can use browser's Speech Recognition API
if (Platform.OS === 'web' && 'webkitSpeechRecognition' in window) {
  const recognition = new webkitSpeechRecognition();
  // Implementation...
}
```

#### Option B: Use Expo Speech with Custom Implementation
```typescript
// Implement custom voice recognition using expo-speech
// This would require additional setup and may have limitations
```

#### Option C: Third-party Services
- Google Cloud Speech-to-Text API
- Azure Speech Services
- AWS Transcribe

## Current Implementation

The current implementation:
1. ✅ Checks for speech availability
2. ✅ Shows appropriate error messages
3. ✅ Gracefully disables voice button when not available
4. ✅ Provides visual feedback
5. ✅ Works in managed workflow (with limitations)

## Testing Voice Recognition

### In Development Build:
1. Run `eas build --profile development`
2. Install the generated build
3. Voice recognition should work with proper permissions

### In Managed Workflow:
1. Voice button will be disabled
2. Clear error message shown to user
3. Search still works by typing

## Next Steps

1. **For Production**: Create development build with voice recognition
2. **For Testing**: Current implementation provides good UX fallback
3. **For Web**: Implement Web Speech API for web platform
4. **For Advanced**: Consider third-party speech recognition services

## Troubleshooting

### Common Issues:
- **"Voice recognition not available"**: Normal in managed workflow
- **Permission denied**: Check device microphone permissions
- **Build fails**: Ensure all dependencies are compatible
- **"expo-speech plugin error"**: expo-speech doesn't have a config plugin (fixed)

### Solutions:
- Use development build for full functionality
- Implement web-specific solution for web platform
- Consider cloud-based speech recognition services

### Important Notes:
- `expo-speech` is for text-to-speech, not speech-to-text
- Voice recognition requires `@react-native-voice/voice` with development build
- Permissions are configured but plugin is not needed for expo-speech
