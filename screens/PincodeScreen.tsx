import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Button, Text, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import { RootStackParamList } from '../navigation/types';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Pincode'>;

const PincodeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { colors, typography, spacing, borderRadius } = theme;
  const [pincode, setPincode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        const pincode = await reverseGeocode(location.coords);
        setCurrentLocation(pincode);
      }
    } catch (error) {
      console.log('Location error:', error);
      setLocationError('Could not access location');
    }
  };

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const handleUseCurrentLocation = async () => {
    if (!currentLocation) {
      setIsLoading(true);
      try {
        await checkLocationPermission();
        if (currentLocation) {
          navigation.navigate('StoreList' as any, { pincode: currentLocation });
        }
      } catch (error) {
        Alert.alert('Error', 'Could not get your current location');
      } finally {
        setIsLoading(false);
      }
    } else {
      navigation.navigate('Main' as any, {
        screen: 'Home',
        params: { screen: 'HomeRoot', params: { storeId: '123', pincode: currentLocation } },
      });
    }
  };

  const handleSubmit = () => {
    if (/^\d{6}$/.test(pincode)) {
      navigation.navigate('StoreList' as any, { pincode });
    } else {
      Alert.alert('Invalid Pincode', 'Please enter a valid 6-digit pincode');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    gradient: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg,
    },
    content: {
      width: '100%',
      maxWidth: 400,
      backgroundColor: colors.surface,
      padding: spacing.xl,
      borderRadius: borderRadius.xl,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    header: {
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    icon: {
      marginBottom: spacing.lg,
    },
    title: {
      ...typography.h2,
      color: colors.text,
      marginBottom: spacing.md,
      textAlign: 'center',
    },
    subtitle: {
      ...typography.body1,
      color: colors.text,
      opacity: 0.7,
      marginBottom: spacing.xl,
      textAlign: 'center',
      lineHeight: typography.body1.fontSize * 1.5,
    },
    input: {
      width: '100%',
      marginBottom: spacing.lg,
      backgroundColor: colors.surface,
    },
    button: {
      width: '100%',
      marginTop: spacing.md,
      borderRadius: borderRadius.md,
    },
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: spacing.lg,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.outline,
    },
    dividerText: {
      ...typography.body2,
      color: colors.text,
      opacity: 0.7,
      marginHorizontal: spacing.md,
    },
    errorText: {
      ...typography.body2,
      color: colors.error,
      textAlign: 'center',
      marginTop: spacing.sm,
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <LinearGradient
          colors={[colors.primary, colors.background]}
          style={styles.gradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <MaterialCommunityIcons
                name="map-marker-radius"
                size={48}
                color={colors.primary}
                style={styles.icon}
              />
              <Text style={styles.title}>Select Your Location</Text>
              <Text style={styles.subtitle}>
                Get accurate delivery options and availability for your area
              </Text>
            </View>
            
            <Button
              mode="contained"
              onPress={handleUseCurrentLocation}
              loading={isLoading}
              disabled={isLoading}
              style={styles.button}
              theme={{ roundness: borderRadius.md }}
              icon="crosshairs-gps"
            >
              {currentLocation ? `Use ${currentLocation}` : 'Use Current Location'}
            </Button>

            {locationError && <Text style={styles.errorText}>{locationError}</Text>}

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TextInput
              mode="outlined"
              label="Enter Pincode"
              value={pincode}
              onChangeText={setPincode}
              keyboardType="numeric"
              maxLength={6}
              style={styles.input}
              theme={{ roundness: borderRadius.md }}
            />

            <Button
              mode="contained"
              onPress={handleSubmit}
              disabled={!pincode || pincode.length !== 6}
              style={styles.button}
              theme={{ roundness: borderRadius.md }}
            >
              Continue
            </Button>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

async function reverseGeocode(coords: { latitude: number; longitude: number }): Promise<string> {
  try {
    const addressResponse = await Location.reverseGeocodeAsync(coords);
    if (addressResponse.length > 0) {
      const address = addressResponse[0];
      return address.postalCode || '110001'; // Default to Delhi pincode
    }
    return '110001'; // Default fallback
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return '110001'; // Default fallback
  }
}

export default PincodeScreen;