import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../contexts/ThemeContext';
import authService from '../../services/api/authService'; // Make sure this path is correct
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import { useAuth } from '../../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'OTPVerification'>;
type OTPVerificationRouteProp = RouteProp<RootStackParamList, 'OTPVerification'>;

const OTPVerificationScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<OTPVerificationRouteProp>();
  const { phoneNumber, cartType, isRegistration = false, userData, otpKey: routeOtpKey } = route.params;
  const { theme } = useTheme();
  const { login, user } = useAuth();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [otpKey, setOtpKey] = useState<string>(routeOtpKey || '');
  const inputRefs = useRef<Array<any>>([]);

  // Get the actual phone number - use user's mobile if coming from cart (logged in user)
  const actualPhoneNumber = phoneNumber || user?.mobile || '';

  // Handle OTP input change
  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Main OTP verification logic
  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }
    setIsLoading(true);

    try {
      console.log('🔐 Starting OTP verification...');
      console.log('📱 Phone Number:', actualPhoneNumber);
      console.log('🔑 OTP Key:', otpKey);
      console.log('🔢 OTP Entered:', otpString);
      console.log('📝 Is Registration:', isRegistration);
      console.log('👤 User Data:', userData);
      console.log('🔑 Route OTP Key:', routeOtpKey);
      
      // Check if otpKey looks like it's from login or registration
      if (otpKey && otpKey.includes('-login')) {
        console.log('⚠️  WARNING: OTP Key appears to be from login flow but isRegistration is:', isRegistration);
      }
      
      if (!otpKey) {
        Alert.alert('Error', 'OTP key not found. Please try again.');
        setIsLoading(false);
        return;
      }

      // Use AuthContext login method which handles everything automatically
      console.log('🔐 Using AuthContext login method...');
      const loginResult = await login(actualPhoneNumber, otpString, otpKey);
      
      if (loginResult.success) {
        console.log('✅ Login successful, navigating to main app...');
        // Navigate to main app
        navigation.replace('Main', {
          screen: 'Home',
          params: {
            screen: 'HomeRoot',
            params: { storeId: 'default', pincode: '123456' }
          }
        });
      } else {
        console.log('❌ Login failed:', loginResult.error);
        Alert.alert('Error', loginResult.error || 'Failed to verify OTP. Please try again.');
      }
    } catch (error) {
      console.error('💥 Error verifying OTP:', error);
      Alert.alert('Error', 'Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Resending OTP...');
      console.log('📱 Phone Number:', actualPhoneNumber);
      console.log('📝 Is Registration:', isRegistration);
      
      let response;
      
      if (isRegistration) {
        // For registration, call register API again to get new otpKey
        console.log('🔄 Registration flow - calling register API for new otpKey...');
        if (!userData) {
          Alert.alert('Error', 'User data not found. Please go back and try again.');
          setIsLoading(false);
          return;
        }
        
        response = await authService.registerUser({
          mobile: actualPhoneNumber,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
        });
      } else {
        // For login, call sendOTP API
        console.log('🔄 Login flow - calling sendOTP API...');
        response = await authService.sendOTP(actualPhoneNumber);
      }

      console.log('📡 Resend OTP Response:', JSON.stringify(response, null, 2));

      if (response.success && response.data?.otpKey) {
        const newOtpKey = response.data.otpKey;
        console.log('✅ New OTP Key received:', newOtpKey);
        setOtpKey(newOtpKey);
        Alert.alert('Success', 'OTP has been resent successfully!');
      } else {
        console.log('❌ Resend OTP failed:', response.error);
        Alert.alert('Error', response.error || 'Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      console.error('💥 Error resending OTP:', error);
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      padding: theme.spacing.lg,
      justifyContent: 'center',
    },
    header: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.secondary,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    phoneText: {
      fontSize: 16,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    otpContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xl,
    },
    otpInput: {
      width: 45,
      height: 55,
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      textAlign: 'center',
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      backgroundColor: theme.colors.surface,
    },
    verifyButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    verifyButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    resendContainer: {
      alignItems: 'center',
    },
    resendText: {
      fontSize: 14,
      color: theme.colors.secondary,
      marginBottom: theme.spacing.sm,
    },
    resendButton: {
      paddingVertical: theme.spacing.sm,
    },
    resendButtonText: {
      color: theme.colors.primary,
      fontSize: 14,
      fontWeight: '500',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to your mobile number
            </Text>
            <Text style={styles.phoneText}>+91 {actualPhoneNumber}</Text>
          </View>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={styles.otpInput}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="default"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.verifyButton}
            onPress={handleVerifyOTP}
            disabled={isLoading || otp.join('').length !== 6}
          >
            <Text style={styles.verifyButtonText}>
              {isRegistration ? 'Complete Registration' : 'Verify & Login'}
            </Text>
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code?</Text>
            <TouchableOpacity style={styles.resendButton} onPress={handleResendOTP}>
              <Text style={styles.resendButtonText}>Resend OTP</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <LoadingOverlay 
        visible={isLoading} 
        message={isRegistration ? "Completing registration..." : "Verifying OTP..."} 
      />
    </SafeAreaView>
  );
};

export default OTPVerificationScreen;