import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Image,
  Platform,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../contexts/ThemeContext';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import orderService from '../../services/api/orderService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'UploadPrescription'>;
type RouteProp = { params: { orderId: string } };

const UploadPrescriptionScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute() as unknown as RouteProp;
  const orderId = route.params?.orderId;
  const { theme } = useTheme();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  // Voice recognition removed from this screen; available on Search only

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Camera and photo library permissions are required to upload prescriptions.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleChooseFromGallery = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error choosing from gallery:', error);
      Alert.alert('Error', 'Failed to select image from gallery. Please try again.');
    }
  };

  const handleCallPharmacist = () => {
    Alert.alert(
      'Call Pharmacist',
      'This will open your phone dialer to call our pharmacist.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => {
          const phoneNumber = 'tel:+1234567890'; // Replace with actual pharmacist number
          Linking.openURL(phoneNumber).catch(err => {
            console.error('Error opening phone dialer:', err);
            Alert.alert('Error', 'Unable to open phone dialer. Please call manually.');
          });
        }}
      ]
    );
  };

  // No voice handlers here

  const handleUpload = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select an image before uploading');
      return;
    }
    if (!orderId) {
      // Alert.alert('Missing Order', 'Order ID is missing. Open this screen from an order context.');
      Alert.alert('This feature is not available in this version.');
      return;
    }
    
    setIsUploading(true);
    
    try {
      const res = await orderService.uploadPrescription(orderId, selectedImage);
      if (!res.success) throw new Error(res.error || 'Upload failed');

      const signedUrl = (res.data as any)?.signedPresciptionUrl || (res.data as any)?.signedPrescriptionUrl;

      Alert.alert('Upload Prescription', 'Uploaded successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', 'Failed to upload prescription. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const themedStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    backButton: {
      padding: 8,
      marginRight: 8,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 100, // Extra padding to ensure upload button is visible
    },
    actionButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    actionButton: {
      flex: 1,
      marginHorizontal: 4,
      paddingVertical: 16,
      paddingHorizontal: 12,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    actionButtonText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.text,
      marginTop: 8,
      textAlign: 'center',
    },
    selectedImageContainer: {
      marginBottom: 24,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    selectedImage: {
      width: '100%',
      height: 200,
      resizeMode: 'cover',
    },
    removeImageButton: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: 'rgba(0,0,0,0.6)',
      borderRadius: 15,
      padding: 8,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 12,
    },
    guidelineItem: {
      flexDirection: 'row',
      marginBottom: 8,
      paddingLeft: 8,
    },
    guidelineNumber: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginRight: 12,
      minWidth: 20,
    },
    guidelineText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.text,
      lineHeight: 20,
    },
    dosDontsContainer: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    dosColumn: {
      flex: 1,
      marginRight: 8,
    },
    dontsColumn: {
      flex: 1,
      marginLeft: 8,
    },
    dosDontsTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: 8,
    },
    dosDontsItem: {
      flexDirection: 'row',
      marginBottom: 6,
    },
    dosDontsNumber: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginRight: 8,
      minWidth: 16,
    },
    dosDontsText: {
      flex: 1,
      fontSize: 13,
      color: theme.colors.text,
      lineHeight: 18,
    },
    processStepsContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    processStep: {
      flexDirection: 'row',
      marginBottom: 12,
      alignItems: 'flex-start',
    },
    processStepNumber: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginRight: 12,
      minWidth: 20,
    },
    processStepText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.text,
      lineHeight: 20,
    },
    uploadButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 16,
    },
    uploadButtonDisabled: {
      backgroundColor: theme.colors.border,
      opacity: 0.6,
    },
    uploadButtonText: {
      color: theme.colors.surface,
      fontSize: 16,
      fontWeight: 'bold',
    },
    // voice-related styles removed from this screen
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: 16,
    },
  });

  const prescriptionGuidelines = [
    'Ensure the prescription is clearly visible and readable',
    'Make sure all text and numbers are not blurred or cut off',
    'Include both sides if the prescription is double-sided',
    'Ensure good lighting when taking the photo'
  ];

  const dos = [
    'Use good lighting',
    'Keep prescription flat',
    'Include all text',
    'Check image clarity'
  ];

  const donts = [
    'Avoid shadows',
    'Don\'t fold prescription',
    'Don\'t cut off text',
    'Avoid blurry images'
  ];

  const processSteps = [
    'Upload your prescription image using camera or gallery',
    'Our pharmacist will review your prescription within 2-4 hours',
    'You will receive a call or SMS with medicine availability and pricing',
    'Confirm your order and make payment to complete the process'
  ];

  return (
    <SafeAreaView style={themedStyles.container}>
      <View style={themedStyles.header}>
        <TouchableOpacity 
          style={themedStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={themedStyles.headerTitle}>Upload Prescription</Text>
      </View>

      <ScrollView 
        style={themedStyles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={themedStyles.scrollContent}
      >
        {/* Action Buttons */}
        <View style={themedStyles.actionButtonsContainer}>
          <TouchableOpacity style={themedStyles.actionButton} onPress={handleTakePhoto}>
            <MaterialIcons name="camera-alt" size={32} color={theme.colors.primary} />
            <Text style={themedStyles.actionButtonText}>Take Photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={themedStyles.actionButton} onPress={handleChooseFromGallery}>
            <MaterialIcons name="photo-library" size={32} color={theme.colors.primary} />
            <Text style={themedStyles.actionButtonText}>Choose From Gallery</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={themedStyles.actionButton} onPress={handleCallPharmacist}>
            <MaterialIcons name="phone" size={32} color={theme.colors.primary} />
            <Text style={themedStyles.actionButtonText}>Call Pharmacist</Text>
          </TouchableOpacity>
        </View>

        {/* Voice input is only on Search screen */}

        {/* Selected Image */}
        {selectedImage && (
          <View style={themedStyles.selectedImageContainer}>
            <Image source={{ uri: selectedImage }} style={themedStyles.selectedImage} />
            <TouchableOpacity 
              style={themedStyles.removeImageButton}
              onPress={() => setSelectedImage(null)}
            >
              <MaterialIcons name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>
        )}

        {/* Prescription Guidelines */}
        <View style={themedStyles.section}>
          <Text style={themedStyles.sectionTitle}>Prescription Guidelines</Text>
          {prescriptionGuidelines.map((guideline, index) => (
            <View key={index} style={themedStyles.guidelineItem}>
              <Text style={themedStyles.guidelineNumber}>{index + 1}.</Text>
              <Text style={themedStyles.guidelineText}>{guideline}</Text>
            </View>
          ))}
        </View>

        <View style={themedStyles.divider} />

        {/* Do's & Don'ts */}
        <View style={themedStyles.section}>
          <Text style={themedStyles.sectionTitle}>Do's & Don'ts</Text>
          <View style={themedStyles.dosDontsContainer}>
            <View style={themedStyles.dosColumn}>
              <Text style={themedStyles.dosDontsTitle}>Do's</Text>
              {dos.map((item, index) => (
                <View key={index} style={themedStyles.dosDontsItem}>
                  <Text style={themedStyles.dosDontsNumber}>{index + 1}.</Text>
                  <Text style={themedStyles.dosDontsText}>{item}</Text>
                </View>
              ))}
            </View>
            <View style={themedStyles.dontsColumn}>
              <Text style={themedStyles.dosDontsTitle}>Don'ts</Text>
              {donts.map((item, index) => (
                <View key={index} style={themedStyles.dosDontsItem}>
                  <Text style={themedStyles.dosDontsNumber}>{index + 1}.</Text>
                  <Text style={themedStyles.dosDontsText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={themedStyles.divider} />

        {/* What happens after upload */}
        <View style={themedStyles.section}>
          <Text style={themedStyles.sectionTitle}>What happens after you upload Prescription</Text>
          <View style={themedStyles.processStepsContainer}>
            {processSteps.map((step, index) => (
              <View key={index} style={themedStyles.processStep}>
                <Text style={themedStyles.processStepNumber}>{index + 1}.</Text>
                <Text style={themedStyles.processStepText}>{step}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Upload Button */}
        {selectedImage && (
          <TouchableOpacity 
            style={[themedStyles.uploadButton, isUploading && themedStyles.uploadButtonDisabled]} 
            onPress={handleUpload}
            disabled={isUploading}
          >
            <Text style={themedStyles.uploadButtonText}>
              {isUploading ? 'Uploading...' : 'Upload Prescription'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default UploadPrescriptionScreen;


