import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onSubmit?: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  onInputFocus?: () => void;
  value?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onSubmit,
  placeholder = 'Search products...',
  autoFocus = false,
  onInputFocus,
  value,
}) => {
  const { createStyles, colors } = useAppTheme();
  const [searchQuery, setSearchQuery] = useState(value || '');
  const { isListening, transcript, error, startListening, stopListening, isAvailable } = useVoiceRecognition();
  const [animation] = useState(new Animated.Value(0));
  const [voiceDisabled, setVoiceDisabled] = useState(false);

  useEffect(() => {
    if (transcript) {
      console.log('🎤 Voice transcript received:', transcript);
      setSearchQuery(transcript);
      onSearch(transcript);
      // Auto-submit voice search
      if (onSubmit) {
        onSubmit(transcript);
      }
    }
  }, [transcript, onSearch, onSubmit]);

  // Disable voice recognition if not available or there are errors
  useEffect(() => {
    if (!isAvailable || error) {
      console.log('🎤 Voice recognition not available or error, disabling:', { isAvailable, error });
      setVoiceDisabled(true);
    }
  }, [isAvailable, error]);

  useEffect(() => {
    if (value !== undefined) {
      setSearchQuery(value);
    }
  }, [value]);

  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(animation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      animation.setValue(0);
    }
  }, [isListening]);

  const styles = createStyles(theme => ({
    container: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      height: 48,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    input: {
      flex: 1,
      ...theme.typography.body1,
      color: theme.colors.text,
      marginLeft: theme.spacing.sm,
      paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    },
    rightContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    iconButton: {
      padding: theme.spacing.xs,
    },
  }));

  const handleVoicePress = async () => {
    if (voiceDisabled) {
      console.log('🎤 Voice recognition is disabled due to errors');
      return;
    }
    
    try {
      if (isListening) {
        console.log('🎤 Stopping voice recognition...');
        await stopListening();
      } else {
        console.log('🎤 Starting voice recognition...');
        setSearchQuery(''); // Clear current search when starting voice
        await startListening();
      }
    } catch (error) {
      console.error('🎤 Voice recognition error:', error);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    onSearch('');
  };

  const pulseStyle = {
    opacity: animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 1],
    }),
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={22} color={colors.text} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={`${colors.text}80`}
          value={searchQuery}
          onChangeText={(text) => {
            console.log('🔍 SearchBar onChangeText:', text);
            setSearchQuery(text);
            onSearch(text);
          }}
          autoFocus={autoFocus}
          returnKeyType="search"
          onSubmitEditing={() => {
            if (onSubmit) {
              onSubmit(searchQuery);
            } else {
              onSearch(searchQuery);
            }
          }}
          onFocus={onInputFocus}
        />
        <View style={styles.rightContainer}>
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClear} style={styles.iconButton}>
              <Ionicons name="close-circle" size={22} color={colors.text} />
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            onPress={handleVoicePress} 
            style={[styles.iconButton, voiceDisabled && { opacity: 0.3 }]}
            disabled={voiceDisabled}
          >
            <Animated.View style={isListening ? pulseStyle : undefined}>
              <MaterialCommunityIcons
                name={isListening ? 'microphone' : 'microphone-outline'}
                size={24}
                color={voiceDisabled ? colors.disabled : (isListening ? colors.primary : colors.text)}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
        {error && !voiceDisabled && (
          <View style={{ paddingHorizontal: 16, paddingTop: 4 }}>
            <Text style={{ color: colors.error, fontSize: 12 }}>
              Voice error: {error}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default SearchBar; 