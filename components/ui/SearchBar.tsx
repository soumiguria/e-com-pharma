import React, { useEffect, useState } from 'react';
import {
  View,
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
  placeholder?: string;
  autoFocus?: boolean;
  onInputFocus?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search products...',
  autoFocus = false,
  onInputFocus,
}) => {
  const { createStyles, colors } = useAppTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const { isListening, transcript, error, startListening, stopListening } = useVoiceRecognition();
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    if (transcript) {
      setSearchQuery(transcript);
      onSearch(transcript);
    }
  }, [transcript, onSearch]);

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
    if (isListening) {
      await stopListening();
    } else {
      await startListening();
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
            setSearchQuery(text);
          }}
          autoFocus={autoFocus}
          returnKeyType="search"
          onSubmitEditing={() => onSearch(searchQuery)}
          onFocus={onInputFocus}
        />
        <View style={styles.rightContainer}>
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClear} style={styles.iconButton}>
              <Ionicons name="close-circle" size={22} color={colors.text} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleVoicePress} style={styles.iconButton}>
            <Animated.View style={isListening ? pulseStyle : undefined}>
              <MaterialCommunityIcons
                name={isListening ? 'microphone' : 'microphone-outline'}
                size={24}
                color={isListening ? colors.primary : colors.text}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default SearchBar; 