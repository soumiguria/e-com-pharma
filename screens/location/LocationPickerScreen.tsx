import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
  TextInput,
  FlatList,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { googleMapsService, ReverseGeocodeResult } from '../../services/api/googleMapsService';
import { API_CONFIG } from '../../services/api/config';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');
  const [is3DEnabled, setIs3DEnabled] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

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
        
        // Reverse geocode to get address using Google Maps
        const addressResult = await googleMapsService.reverseGeocode(latitude, longitude);
        
        let address = 'Current Location';
        if (addressResult) {
          address = addressResult.formattedAddress;
        } else {
          // Fallback to expo location
          const addressResponse = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
          });
          
          address = addressResponse[0] 
            ? `${addressResponse[0].street}, ${addressResponse[0].city}, ${addressResponse[0].region}`
            : 'Current Location';
        }
        
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

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    
    // Get address for selected location using Google Maps
    const addressResult = await googleMapsService.reverseGeocode(latitude, longitude);
    
    let address = 'Selected Location';
    if (addressResult) {
      address = addressResult.formattedAddress;
    }
    
    setSelectedLocation({
      latitude,
      longitude,
      address,
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

  const handleSearch = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await googleMapsService.searchPlaces(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = async (place: any) => {
    const placeDetails = await googleMapsService.getPlaceDetails(place.place_id);
    if (placeDetails) {
      const { lat, lng } = placeDetails.geometry.location;
      setSelectedLocation({
        latitude: lat,
        longitude: lng,
        address: placeDetails.formatted_address,
      });
      setCurrentLocation({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const handleConfirmLocation = () => {
    navigation.navigate('AddAddress', { location: selectedLocation });
  };

  const testGoogleMapsAPI = async () => {
    try {
      console.log('🧪 Testing Google Maps API...');
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=Delhi,India&key=${API_CONFIG.GOOGLE_MAPS.API_KEY}`
      );
      const data = await response.json();
      console.log('🧪 Google Maps API Test Result:', data);
      
      if (data.status === 'OK') {
        Alert.alert('✅ Google Maps API', 'API is working correctly!');
      } else {
        Alert.alert('❌ Google Maps API', `API Error: ${data.status} - ${data.error_message}`);
      }
    } catch (error) {
      console.error('🧪 Google Maps API Test Error:', error);
      Alert.alert('❌ Google Maps API', 'Failed to connect to Google Maps API');
    }
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
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    searchInput: {
      flex: 1,
      height: 40,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 20,
      paddingHorizontal: 16,
      marginRight: 12,
      fontSize: 16,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
    },
    searchResultsContainer: {
      position: 'absolute',
      top: 100,
      left: 16,
      right: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      maxHeight: 200,
      zIndex: 1000,
    },
    searchResultsList: {
      maxHeight: 200,
    },
    searchResultItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    searchResultText: {
      flex: 1,
      marginLeft: 12,
    },
    searchResultName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    searchResultAddress: {
      fontSize: 14,
      color: theme.colors.secondary,
      marginTop: 2,
    },
    mapControlsContainer: {
      position: 'absolute',
      top: 20,
      left: 20,
      flexDirection: 'column',
      gap: 8,
    },
    mapControlButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    mapControlButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    mapErrorContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      backgroundColor: theme.colors.background,
    },
    mapErrorText: {
      fontSize: 16,
      color: theme.colors.text,
      textAlign: 'center',
      marginTop: 16,
      marginBottom: 20,
    },
    retryButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    retryButtonText: {
      color: theme.colors.surface,
      fontSize: 16,
      fontWeight: '600',
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

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a place..."
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              handleSearch(text);
            }}
            placeholderTextColor={theme.colors.secondary}
          />
          <MaterialIcons name="search" size={24} color={theme.colors.primary} />
        </View>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <View style={styles.searchResultsContainer}>
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.place_id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.searchResultItem}
                  onPress={() => handleSelectSearchResult(item)}
                >
                  <MaterialIcons name="location-on" size={20} color={theme.colors.primary} />
                  <View style={styles.searchResultText}>
                    <Text style={styles.searchResultName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.searchResultAddress} numberOfLines={1}>
                      {item.formatted_address}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              style={styles.searchResultsList}
            />
          </View>
        )}

        <View style={styles.mapContainer}>
          {mapError ? (
            <View style={styles.mapErrorContainer}>
              <MaterialIcons name="error-outline" size={48} color={theme.colors.error} />
              <Text style={styles.mapErrorText}>{mapError}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  setMapError(null);
                  getCurrentLocation();
                }}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <MapView
            style={styles.map}
            initialRegion={currentLocation}
            onPress={handleMapPress}
            mapType={mapType}
            showsUserLocation={true}
            showsMyLocationButton={true}
            showsCompass={true}
            showsScale={true}
            showsBuildings={true}
            showsIndoors={true}
            showsTraffic={false}
            showsPointsOfInterest={true}
            rotateEnabled={true}
            scrollEnabled={true}
            zoomEnabled={true}
            pitchEnabled={true}
            loadingEnabled={true}
            loadingIndicatorColor={theme.colors.primary}
            loadingBackgroundColor={theme.colors.background}
            moveOnMarkerPress={false}
            followsUserLocation={false}
            maxZoomLevel={20}
            minZoomLevel={3}
            region={currentLocation}
            onRegionChangeComplete={(region) => {
              setCurrentLocation(region);
            }}
            onMapReady={() => {
              console.log('🗺️ Map is ready');
              setMapError(null);
            }}
            onMapLoaded={() => {
              console.log('🗺️ Map loaded successfully');
              setMapError(null);
            }}
            onError={(error) => {
              console.error('🗺️ Map error:', error);
              setMapError('Map failed to load. Please check your internet connection.');
            }}
          >
            <Marker
              coordinate={{
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
              }}
              title="Selected Location"
              description={selectedLocation.address}
              pinColor={theme.colors.primary}
              draggable={true}
              onDragEnd={(event) => {
                const { latitude, longitude } = event.nativeEvent.coordinate;
                handleMapPress({ nativeEvent: { coordinate: { latitude, longitude } } });
              }}
            />
          </MapView>
          )}

          <TouchableOpacity
            style={styles.useCurrentLocationButton}
            onPress={handleUseCurrentLocation}
          >
            <MaterialIcons name="my-location" size={20} color={theme.colors.primary} />
            <Text style={styles.useCurrentLocationText}>Use Current Location</Text>
          </TouchableOpacity>

          {/* Map Controls */}
          <View style={styles.mapControlsContainer}>
            <TouchableOpacity
              style={[styles.mapControlButton, mapType === 'standard' && styles.mapControlButtonActive]}
              onPress={() => setMapType('standard')}
            >
              <MaterialIcons name="map" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.mapControlButton, mapType === 'satellite' && styles.mapControlButtonActive]}
              onPress={() => setMapType('satellite')}
            >
              <MaterialIcons name="satellite" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.mapControlButton, mapType === 'hybrid' && styles.mapControlButtonActive]}
              onPress={() => setMapType('hybrid')}
            >
              <MaterialIcons name="layers" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.mapControlButton, is3DEnabled && styles.mapControlButtonActive]}
              onPress={() => setIs3DEnabled(!is3DEnabled)}
            >
              <MaterialIcons name="3d-rotation" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.mapControlButton}
              onPress={testGoogleMapsAPI}
            >
              <MaterialIcons name="bug-report" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

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