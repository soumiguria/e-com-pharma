import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useAppContext } from '../../contexts/AppContext';

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const { theme } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();
  const { lastVisitedStore } = useAppContext();
  const navigation = useNavigation<SplashScreenNavigationProp>();
  const { colors, typography, spacing } = theme;
  
  // Animation values
  const scaleValue = useRef(new Animated.Value(0.8)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      // Scale animation
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.elastic(1.2),
        useNativeDriver: true,
      }),
      // Fade animation
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // Rotate animation (subtle)
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigation timer - wait for auth to load
    const timer = setTimeout(() => {
      try {
        if (!isLoading) {
          if (isAuthenticated) {
            // User is logged in, navigate to main app
            if (lastVisitedStore) {
              // Navigate to last visited store
              console.log('🔄 Navigating to last visited store:', lastVisitedStore);
              navigation.replace('Main', { 
                screen: 'Home', 
                params: { 
                  screen: 'HomeRoot', 
                  params: { 
                    storeId: lastVisitedStore.id, 
                    pincode: lastVisitedStore.pincode || '110001'
                  } 
                } 
              });
            } else {
              // No last visited store, use default
              navigation.replace('Main', { 
                screen: 'Home', 
                params: { 
                  screen: 'HomeRoot', 
                  params: { storeId: 'default', pincode: '110001' } 
                } 
              });
            }
          } else {
            // User is not logged in, navigate to pincode screen
            navigation.replace('Pincode');
          }
        }
      } catch (error) {
        console.error('Navigation error:', error);
        // Fallback navigation
        navigation.replace('Pincode');
      }
    }, 2500); // Slightly longer to allow animations to complete
    
    return () => clearTimeout(timer);
  }, [navigation, isAuthenticated, isLoading]);

  const rotateInterpolate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '5deg'], // Subtle rotation
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background, // Fallback background
    },
    gradient: {
      width,
      height,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    logo: {
      width: width * 0.5,
      height: width * 0.5,
      resizeMode: 'contain',
    },
    title: {
      ...typography.h1,
      color: colors.text, // Using standard text color instead of inverted
      marginTop: spacing.lg,
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    },
    tagline: {
      ...typography.body1, // Changed from body to body1
      color: colors.text, // Using standard text color
      marginTop: spacing.sm,
      opacity: 0.8,
    },
    particles: {
      position: 'absolute',
      width: '100%',
      height: '100%',
    },
  });

  return (
    <View style={{ flex: 1 }}>
      <Image
        source={require('../../assets/splash.png')}
        style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
      />
    </View>
  );
};

export default SplashScreen;