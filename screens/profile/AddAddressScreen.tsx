import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Speech from 'expo-speech-recognition';

type AddAddressScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddAddress'>;

const { width, height } = Dimensions.get('window');

interface AddressFormData {
  name: string;
  houseNumber: string;
  apartment: string;
  directions: string;
  voiceDirections: string;
  saveAs: 'home' | 'work' | 'friends' | 'other';
}

const AddAddressScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<AddAddressScreenNavigationProp>();
  const route = useRoute();
  const { location } = route.params as { location?: { latitude: number; longitude: number; address: string } };
  
  const [formData, setFormData] = useState<AddressFormData>({
    name: '',
    houseNumber: '',
    apartment: '',
    directions: '',
    voiceDirections: '',
    saveAs: 'home',
  });

  const [isRecording, setIsRecording] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  const maxWords = 200;

  const saveAsOptions = [
    { key: 'home', label: 'Home', icon: 'home' },
    { key: 'work', label: 'Work', icon: 'work' },
    { key: 'friends', label: 'Friends & Family', icon: 'people' },
    { key: 'other', label: 'Other', icon: 'location-on' },
  ];

  React.useEffect(() => {
    // For now, we'll assume permission is granted
    // In a real app, you would implement proper permission handling
    setHasPermission(true);
  }, []);

  const handleTextChange = (field: keyof AddressFormData, value: string) => {
    if (field === 'directions') {
      const words = value.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
      if (words.length <= maxWords) {
        setFormData({ ...formData, [field]: value });
      }
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleVoiceRecord = async () => {
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please grant microphone permission to record voice directions.');
      return;
    }

    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      // Note: expo-speech-recognition doesn't have stopListeningAsync in current version
      // We'll simulate stopping
    } else {
      // Start recording
      setIsRecording(true);
      try {
        // Simulate voice recording since expo-speech-recognition API is limited
        setTimeout(() => {
          setFormData({ ...formData, voiceDirections: 'Voice directions recorded successfully' });
          setIsRecording(false);
          Alert.alert('Recording Complete', 'Voice directions have been recorded.');
        }, 3000);
      } catch (error) {
        Alert.alert('Recording Error', 'Failed to start recording. Please try again.');
        setIsRecording(false);
      }
    }
  };

  const handleSaveAddress = () => {
    if (!formData.houseNumber.trim()) {
      Alert.alert('Error', 'House/Flat/Block No. is required');
      return;
    }

    // In a real app, you would save this to your backend/storage
    const newAddress = {
      id: Date.now().toString(),
      type: formData.saveAs,
      name: saveAsOptions.find(option => option.key === formData.saveAs)?.label || 'Address',
      houseNumber: formData.houseNumber,
      apartment: formData.apartment,
      directions: formData.directions,
      voiceDirections: formData.voiceDirections,
      location: location || {
        latitude: 28.6139,
        longitude: 77.2090,
        address: 'Default Location',
      },
    };

    Alert.alert(
      'Success',
      'Address saved successfully!',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('MyAddresses'),
        },
      ]
    );
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
    scrollContent: {
      padding: 16,
    },
    mapContainer: {
      height: 150,
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 24,
    },
    map: {
      width: '100%',
      height: '100%',
    },
    locationText: {
      fontSize: 14,
      color: theme.colors.secondary,
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    inputContainer: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 14,
      color: theme.colors.secondary,
      marginBottom: 8,
      fontWeight: '500',
    },
    requiredLabel: {
      color: theme.colors.error,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.colors.text,
      backgroundColor: theme.colors.surface,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    voiceRecordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    voiceRecordButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: isRecording ? theme.colors.error : theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    voiceRecordText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.secondary,
    },
    wordCount: {
      fontSize: 12,
      color: wordCount > maxWords ? theme.colors.error : theme.colors.secondary,
      textAlign: 'right',
      marginTop: 4,
    },
    saveAsContainer: {
      marginBottom: 24,
    },
    saveAsLabel: {
      fontSize: 14,
      color: theme.colors.secondary,
      marginBottom: 12,
      fontWeight: '500',
    },
    saveAsButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    saveAsButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      minWidth: (width - 48) / 2 - 4,
    },
    saveAsButtonSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    saveAsButtonText: {
      marginLeft: 8,
      fontSize: 14,
      fontWeight: '500',
    },
    saveAsButtonTextSelected: {
      color: theme.colors.surface,
    },
    saveAsButtonTextUnselected: {
      color: theme.colors.text,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 16,
    },
    saveButtonText: {
      color: theme.colors.surface,
      fontSize: 16,
      fontWeight: 'bold',
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
          <Text style={styles.headerTitle}>Add New Address</Text>
        </View>

        <ScrollView style={styles.scrollContent}>
          {/* Map Preview */}
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: location?.latitude || 28.6139,
                longitude: location?.longitude || 77.2090,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude: location?.latitude || 28.6139,
                  longitude: location?.longitude || 77.2090,
                }}
                title="Selected Location"
              />
            </MapView>
          </View>

          <Text style={styles.locationText}>
            {location?.address || 'Selected Location'}
          </Text>

          {/* Name input at the top of the form */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Name (e.g. John Doe)"
              value={formData.name}
              onChangeText={text => handleTextChange('name', text)}
            />
          </View>

          {/* Address Form */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, styles.requiredLabel]}>
              House/Flat/Block No. *
            </Text>
            <TextInput
              style={styles.input}
              value={formData.houseNumber}
              onChangeText={(text) => handleTextChange('houseNumber', text)}
              placeholder="Enter house/flat/block number"
              placeholderTextColor={theme.colors.secondary}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Apartment/Road/Area</Text>
            <TextInput
              style={styles.input}
              value={formData.apartment}
              onChangeText={(text) => handleTextChange('apartment', text)}
              placeholder="Enter apartment/road/area (optional)"
              placeholderTextColor={theme.colors.secondary}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Directions to Reach</Text>
            
            <View style={styles.voiceRecordContainer}>
              <TouchableOpacity
                style={styles.voiceRecordButton}
                onPress={handleVoiceRecord}
              >
                <MaterialIcons
                  name={isRecording ? 'stop' : 'mic'}
                  size={24}
                  color={theme.colors.surface}
                />
              </TouchableOpacity>
              <Text style={styles.voiceRecordText}>
                TAP TO RECORD VOICE DIRECTIONS
              </Text>
            </View>

            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.directions}
              onChangeText={(text) => handleTextChange('directions', text)}
              placeholder="e.g. Ring the bell on the red gate"
              placeholderTextColor={theme.colors.secondary}
              multiline
              numberOfLines={4}
            />
            <Text style={styles.wordCount}>
              {wordCount}/{maxWords} words
            </Text>
          </View>

          {/* Save As Section */}
          <View style={styles.saveAsContainer}>
            <Text style={styles.saveAsLabel}>Save as</Text>
            <View style={styles.saveAsButtons}>
              {saveAsOptions.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.saveAsButton,
                    formData.saveAs === option.key && styles.saveAsButtonSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, saveAs: option.key as any })}
                >
                  <MaterialIcons
                    name={option.icon as any}
                    size={20}
                    color={
                      formData.saveAs === option.key
                        ? theme.colors.surface
                        : theme.colors.primary
                    }
                  />
                  <Text
                    style={[
                      styles.saveAsButtonText,
                      formData.saveAs === option.key
                        ? styles.saveAsButtonTextSelected
                        : styles.saveAsButtonTextUnselected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveAddress}>
            <Text style={styles.saveButtonText}>Save Address</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default AddAddressScreen; 