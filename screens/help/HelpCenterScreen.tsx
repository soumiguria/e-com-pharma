import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ThemedButton from '../../components/ui/ThemedButton';
import { useTheme } from '../../contexts/ThemeContext';

const HelpCenterScreen = () => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      padding: theme.spacing.md,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.lg,
    },
    helpText: {
      fontSize: 16,
      color: theme.colors.text,
      marginBottom: theme.spacing.lg,
      textAlign: 'center',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Help Center</Text>
      <Text style={styles.helpText}>Need help? Contact us at support@example.com</Text>
      <ThemedButton title="Contact Support" onPress={() => {}} />
    </SafeAreaView>
  );
};

export default HelpCenterScreen; 