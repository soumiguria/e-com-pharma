import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
  const { toggleTheme, theme } = useTheme();

  return (
    <TouchableOpacity onPress={toggleTheme}>
      <Ionicons
        name={theme.dark ? 'sunny' : 'moon'}
        size={24}
        color={theme.colors.text}
      />
    </TouchableOpacity>
  );
};

export default ThemeToggle;