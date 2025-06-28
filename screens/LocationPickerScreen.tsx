import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

type LocationPickerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'LocationPicker'>;

const { width, height } = Dimensions.get('window');

const LocationPickerScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<LocationPickerScreenNavigationProp>();
  
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 28.6139,
    longitude: 77.2090,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [selectedLocation, setSelectedLocation] = useState({
    latitude: 28.6139,
    longitude: 77.2090,
    address: 'Green Park Colony, New Delhi, Delhi 110016',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    setIsLoading(true);
    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasLocationPermission(status === 'granted');
      
      if (status === 'granted') {
        // Get current location
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        
        const { latitude, longitude } = location.coords;
        
        // Reverse geocode to get address
        const addressResponse = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        
        const address = addressResponse[0] 
          ? `${addressResponse[0].street}, ${addressResponse[0].city}, ${addressResponse[0].region}`
          : 'Current Location';
        
        setCurrentLocation({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        
        setSelectedLocation({
          latitude,
          longitude,
          address,
        });
      } else {
        Alert.alert('Permission Denied', 'Location permission is required to use this feature.');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to get current location. Using default location.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({
      latitude,
      longitude,
      address: 'Selected Location',
    });
  };

  const handleUseCurrentLocation = () => {
    if (!hasLocationPermission) {
      Alert.alert('Permission Required', 'Location permission is required to use current location.');
      return;
    }
    setSelectedLocation({
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      address: 'Current Location',
    });
  };

  const handleConfirmLocation = () => {
    navigation.navigate('AddAddress', { location: selectedLocation });
  };

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.background,
      marginRight: 16,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    mapContainer: {
      flex: 1,
    },
    map: {
      width: '100%',
      height: '100%',
    },
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.surface,
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    locationInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    locationText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.text,
      marginLeft: 8,
    },
    changeButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: theme.colors.primary,
      borderRadius: 6,
    },
    changeButtonText: {
      color: theme.colors.surface,
      fontSize: 12,
      fontWeight: '600',
    },
    confirmButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    confirmButtonText: {
      color: theme.colors.surface,
      fontSize: 16,
      fontWeight: 'bold',
    },
    useCurrentLocationButton: {
      position: 'absolute',
      top: 20,
      right: 20,
      backgroundColor: theme.colors.surface,
      padding: 12,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    useCurrentLocationText: {
      marginLeft: 8,
      fontSize: 14,
      color: theme.colors.text,
      fontWeight: '600',
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      color: theme.colors.surface,
      fontSize: 16,
      marginTop: 16,
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Location</Text>
        </View>

        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={currentLocation}
            onPress={handleMapPress}
          >
            <Marker
              coordinate={{
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
              }}
              title="Selected Location"
              description={selectedLocation.address}
            />
          </MapView>

          <TouchableOpacity
            style={styles.useCurrentLocationButton}
            onPress={handleUseCurrentLocation}
          >
            <MaterialIcons name="my-location" size={20} color={theme.colors.primary} />
            <Text style={styles.useCurrentLocationText}>Use Current Location</Text>
          </TouchableOpacity>

          {isLoading && (
            <View style={styles.loadingOverlay}>
              <MaterialIcons name="location-searching" size={48} color={theme.colors.surface} />
              <Text style={styles.loadingText}>Getting your location...</Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <View style={styles.locationInfo}>
            <MaterialIcons name="location-on" size={20} color={theme.colors.primary} />
            <Text style={styles.locationText} numberOfLines={2}>
              {selectedLocation.address}
            </Text>
            <TouchableOpacity style={styles.changeButton}>
              <Text style={styles.changeButtonText}>Change</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmLocation}>
            <Text style={styles.confirmButtonText}>Confirm Location</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LocationPickerScreen; 