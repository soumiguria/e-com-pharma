import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PhoneAuth'>;
type PhoneAuthRouteProp = RouteProp<RootStackParamList, 'PhoneAuth'>;

const PhoneAuthScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PhoneAuthRouteProp>();
  const { cartType } = route.params;
  const { theme } = useTheme();
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleContinue = () => {
    // Validate phone number
    if (phoneNumber.length < 10) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid 10-digit phone number');
      return;
    }

    // Here you would typically make an API call to send OTP
    // For now, we'll just navigate to the OTP screen
    navigation.navigate('OTPVerification', { 
      phoneNumber,
      cartType
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.lg,
    },
    header: {
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.xl,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.secondary,
      marginBottom: theme.spacing.lg,
    },
    inputContainer: {
      marginBottom: theme.spacing.xl,
    },
    phoneInput: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      height: 56,
    },
    countryCode: {
      fontSize: 16,
      color: theme.colors.text,
      marginRight: theme.spacing.sm,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
      paddingVertical: theme.spacing.sm,
    },
    continueButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      height: 56,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: theme.spacing.xl,
    },
    continueButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    disabledButton: {
      backgroundColor: theme.colors.secondary,
      opacity: 0.5,
    },
    termsText: {
      fontSize: 14,
      color: theme.colors.text + '80',
      textAlign: 'center',
      marginTop: 20,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Enter your phone number</Text>
          <Text style={styles.subtitle}>
            We'll send you a verification code to verify your number
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.phoneInput}>
            <Text style={styles.countryCode}>+91</Text>
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              keyboardType="phone-pad"
              maxLength={10}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholderTextColor={theme.colors.secondary}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            phoneNumber.length !== 10 && styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={phoneNumber.length !== 10}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>

        <Text style={styles.termsText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PhoneAuthScreen; 