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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import LoadingOverlay from '../../components/ui/LoadingOverlay';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PhoneAuth'>;
type PhoneAuthRouteProp = RouteProp<RootStackParamList, 'PhoneAuth'>;

const PhoneAuthScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PhoneAuthRouteProp>();
  const { cartType } = route.params;
  const { theme } = useTheme();
  const { sendOTP } = useAuth();
  const [mobileNumber, setMobileNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    // Clean mobile number - remove +91 if present
    let cleanNumber = mobileNumber.replace(/^\+91/, '').replace(/\D/g, '');
    
    // Validate mobile number - allow 10 to 13 digits
    if (cleanNumber.length < 10 || cleanNumber.length > 13) {
      Alert.alert('Invalid Mobile Number', 'Please enter a valid mobile number (10-13 digits)');
      return;
    }
    
    // Use the cleaned number
    const finalMobileNumber = cleanNumber;

    setIsLoading(true);

    try {
      // First, try to send OTP to check if user exists
      const response = await sendOTP(finalMobileNumber);
      
      if (response.success) {
        // User exists, navigate to OTP verification screen
        console.log('User exists, navigating to OTP verification');
        // Extract otpKey from response
        const otpKey = response.data?.otpKey || '';
        console.log('OTP Key received:', otpKey);
        navigation.replace('OTPVerification', { 
          phoneNumber: finalMobileNumber,
          cartType,
          isRegistration: false,
          otpKey: otpKey // Pass otpKey to OTP verification screen
        });
      } else {
        // Check if error indicates customer not found
        if (response.error && (
          response.error.toLowerCase().includes('customer not found') ||
          response.error.toLowerCase().includes('user not found') ||
          response.error.toLowerCase().includes('not registered')
        )) {
          console.log('Customer not found, redirecting to registration');
          // Customer not found, redirect to registration
          navigation.replace('Register', { 
            phoneNumber: finalMobileNumber,
            cartType
          });
        } else {
          Alert.alert('Error', response.error || 'Failed to send OTP. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      // On any error, assume user doesn't exist and go to registration
      navigation.replace('Register', { 
        phoneNumber: mobileNumber,
        cartType
      });
    } finally {
      setIsLoading(false);
    }
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
      backgroundColor: theme.colors.surface,
    },
    countryCode: {
      fontSize: 16,
      color: theme.colors.text,
      marginRight: theme.spacing.sm,
      fontWeight: '500',
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
      paddingVertical: theme.spacing.md,
    },
    continueButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
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
      lineHeight: 20,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Enter your mobile number</Text>
          <Text style={styles.subtitle}>
            We'll send you a verification code to verify your number
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.phoneInput}>
            <Text style={styles.countryCode}>+91</Text>
            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              keyboardType="phone-pad"
              maxLength={15}
              value={mobileNumber}
              onChangeText={setMobileNumber}
              placeholderTextColor={theme.colors.secondary}
              autoComplete="tel"
              textContentType="telephoneNumber"
              importantForAutofill="yes"
              autoFocus={true}
              returnKeyType="done"
              dataDetectorTypes="phoneNumber"
              enablesReturnKeyAutomatically={true}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            (mobileNumber.replace(/^\+91/, '').replace(/\D/g, '').length < 10 || mobileNumber.replace(/^\+91/, '').replace(/\D/g, '').length > 13) && styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={(mobileNumber.replace(/^\+91/, '').replace(/\D/g, '').length < 10 || mobileNumber.replace(/^\+91/, '').replace(/\D/g, '').length > 13) || isLoading}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>

        <Text style={styles.termsText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </KeyboardAvoidingView>

      <LoadingOverlay 
        visible={isLoading} 
        message="Sending OTP..." 
      />
    </SafeAreaView>
  );
};

export default PhoneAuthScreen; 