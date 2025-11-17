import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
// Voice feature disabled temporarily
// import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';

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

  // Voice feature disabled - removed all voice recognition logic
  // const { isListening, transcript, partialTranscript, error, startListening, stopListening, isAvailable } = useVoiceRecognition();

  useEffect(() => {
    if (value !== undefined) {
      setSearchQuery(value);
    }
  }, [value]);

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

  // Voice feature disabled
  const handleVoicePress = () => {
    // Do nothing - feature is disabled
  };

  const handleClear = () => {
    setSearchQuery('');
    onSearch('');
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
            style={styles.iconButton}
            disabled={true}
          >
            <MaterialCommunityIcons
              name="microphone-outline"
              size={24}
              color={`${colors.text}40`}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default SearchBar; 