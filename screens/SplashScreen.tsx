import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../contexts/ThemeContext';

type RootStackParamList = {
  Splash: undefined;
  Pincode: undefined;
};

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

interface SplashScreenProps {
  navigation: SplashScreenNavigationProp;
}

const { width, height } = Dimensions.get('window');

const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { colors, typography, spacing } = theme;
  
  // Animation values
  const scaleValue = new Animated.Value(0.8);
  const opacityValue = new Animated.Value(0);
  const rotateValue = new Animated.Value(0);

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

    // Navigation timer
    const timer = setTimeout(() => {
      navigation.replace('Pincode');
    }, 2500); // Slightly longer to allow animations to complete
    
    return () => clearTimeout(timer);
  }, [navigation]);

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
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.secondary, colors.primary]} // Removed primaryDark
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.5, 1]}
      >
        {/* Animated logo */}
        <Animated.View style={[
          styles.logoContainer,
          {
            opacity: opacityValue,
            transform: [
              { scale: scaleValue },
              { rotate: rotateInterpolate },
            ],
          }
        ]}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
          />
          <Animated.Text style={[styles.title, { opacity: opacityValue }]}>
            Your App Name
          </Animated.Text>
          <Animated.Text style={[styles.tagline, { opacity: opacityValue }]}>
            Secure. Simple. Smart.
          </Animated.Text>
        </Animated.View>
        
        {/* Optional: Add some decorative elements */}
        <View style={styles.particles}>
          {/* You could add small decorative elements here */}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default SplashScreen;