# 🎤 Voice Search - Usage Examples

## Quick Start

### Example 1: Using VoiceSearchInput Component

```typescript
import React, { useState } from 'react';
import { View, FlatList } from 'react-native';
import VoiceSearchInput from '../components/voice/VoiceSearchInput';

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    // Your search logic here
    console.log('Searching for:', text);
  };

  return (
    <View>
      <VoiceSearchInput
        onSearch={handleSearch}
        placeholder="Search products..."
        value={searchQuery}
      />
      {/* Your search results */}
    </View>
  );
};
```

### Example 2: Using useVoiceSearch Hook Directly

```typescript
import React, { useEffect } from 'react';
import { View, Button, Text } from 'react-native';
import { useVoiceSearch } from '../hooks/useVoiceSearch';

const CustomVoiceSearch = () => {
  const { 
    isListening, 
    result, 
    partialResult, 
    error,
    startListening, 
    stopListening,
    isAvailable 
  } = useVoiceSearch();

  useEffect(() => {
    if (result) {
      console.log('Final result:', result);
      // Perform search with result
    }
  }, [result]);

  return (
    <View>
      <Button
        title={isListening ? 'Stop' : 'Start Voice Search'}
        onPress={isListening ? stopListening : startListening}
        disabled={!isAvailable}
      />
      {isListening && (
        <Text>Listening... {partialResult || 'Waiting for speech...'}</Text>
      )}
      {result && <Text>Result: {result}</Text>}
      {error && <Text style={{ color: 'red' }}>Error: {error}</Text>}
    </View>
  );
};
```

---

## Integration with Existing SearchBar

Your existing `SearchBar` component already uses voice recognition and will continue to work with the improved features:

- ✅ Auto-stop after 5 seconds of silence
- ✅ Real-time partial results
- ✅ Better error handling

**No changes needed to existing SearchBar!**

---

## Features

### ✅ Real-time Transcription
- See text appear as you speak
- Partial results update in real-time

### ✅ Auto-stop After Silence
- Automatically stops after 5 seconds of no speech
- Uses last partial result as final result

### ✅ Permission Handling
- Automatic permission request
- Clear error messages if denied

### ✅ EAS Build Compatible
- Works with production builds
- Optimized for native modules

---

## Files Created

1. **`hooks/useVoiceSearch.ts`** - Enhanced voice search hook
2. **`components/voice/VoiceSearchInput.tsx`** - Complete voice search component
3. **`hooks/useVoiceRecognition.ts`** - Improved existing hook (auto-stop added)

---

## Build & Test

```bash
# Build with EAS
npx eas build --platform android --profile production

# Or development build
npx eas build --platform android --profile development
```

---

**Everything is ready! Your voice search will work seamlessly in EAS builds!** 🚀

