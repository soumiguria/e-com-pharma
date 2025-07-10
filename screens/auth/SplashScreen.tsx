import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { RootStackParamList } from '../../navigation/types';
import SvgUri from 'react-native-svg-uri';

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<SplashScreenNavigationProp>();
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
      try {
        navigation.replace('Pincode' as any);
      } catch (error) {
        console.error('Navigation error:', error);
        // Fallback navigation
        navigation.replace('Pincode' as any);
      }
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
      backgroundColor: '#FFF8EC', // Light cream background
    },
    logoContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    logo: {
      width: width * 0.5,
      height: width * 0.5,
    },
    title: {
      fontSize: 36,
      fontWeight: 'bold',
      color: '#18404A',
      marginTop: 32,
      textAlign: 'center',
    },
    tagline: {
      fontSize: 22,
      color: '#18404A',
      marginTop: 12,
      textAlign: 'center',
      opacity: 0.8,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
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
        <SvgUri
          width={width * 0.5}
          height={width * 0.5}
          source={require('../../assets/logo.svg')}
          style={styles.logo}
        />
        <Animated.Text style={[styles.title, { opacity: opacityValue }]}>Paas Ki Dukaan</Animated.Text>
        <Animated.Text style={[styles.tagline, { opacity: opacityValue }]}>Aapki Apni Dukaan</Animated.Text>
      </Animated.View>
    </SafeAreaView>
  );
};

export default SplashScreen;