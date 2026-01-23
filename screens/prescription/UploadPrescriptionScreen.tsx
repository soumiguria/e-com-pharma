import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../contexts/ThemeContext';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import orderService from '../../services/api/orderService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'UploadPrescription'>;
type RouteProp = { params: { orderId: string; storeId?: string } };

const UploadPrescriptionScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute() as unknown as RouteProp;
  const orderId = route.params?.orderId;
  const storeId = route.params?.storeId;
  const { theme } = useTheme();
  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name?: string;
    mimeType?: string | null;
    isImage?: boolean;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  // Voice recognition removed from this screen; available on Search only

  // Reload/refresh order data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Optionally refresh order data when screen is focused
      // This ensures users see the latest order status
      console.log('📋 UploadPrescription screen focused');
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Reload order data if needed
    // Navigate to OrderSelection to refresh order list
    try {
      navigation.navigate('OrderSelection' as any);
      // Wait a bit before returning to allow navigation
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      setRefreshing(false);
    }
  }, [navigation]);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (cameraStatus !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Camera permission is required to take prescription photos.',
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
        allowsEditing: false,
        quality: 0.8,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Extract filename from URI or use default
        const uriParts = asset.uri.split('/');
        const rawFileName = asset.fileName || uriParts[uriParts.length - 1] || `prescription_${Date.now()}`;
        
        // Detect mimeType from file extension (similar to documents feature)
        let mimeType: string | null = null;
        let finalFileName = rawFileName;
        
        // Check if filename has extension
        if (/\.(jpg|jpeg)$/i.test(rawFileName)) {
          mimeType = 'image/jpeg';
        } else if (/\.(png)$/i.test(rawFileName)) {
          mimeType = 'image/png';
        } else if (/\.(gif)$/i.test(rawFileName)) {
          mimeType = 'image/gif';
        } else if (/\.(webp)$/i.test(rawFileName)) {
          mimeType = 'image/webp';
        } else {
          // No extension found - add .jpg and set mimeType to image/jpeg (camera photos are usually JPEG)
          finalFileName = `${rawFileName}.jpg`;
          mimeType = 'image/jpeg';
        }
        
        // Fallback: if mimeType is still null, default to image/jpeg
        if (!mimeType) {
          mimeType = 'image/jpeg';
        }
        
        console.log('📸 Camera photo selected:', { uri: asset.uri, fileName: finalFileName, mimeType });
        
        setSelectedFile({
          uri: asset.uri,
          name: finalFileName,
          mimeType: mimeType,
          isImage: true,
        });
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleChooseFromDocuments = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'], // Allow both images and PDFs
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) {
        return;
      }

      // New API shape: result.assets
      const asset = (result as any).assets?.[0] || (result as any);
      if (asset && asset.uri) {
        const mimeType: string | null =
          asset.mimeType || asset.type || null;

        const isImage =
          mimeType?.startsWith('image/') ||
          /\.(jpg|jpeg|png|gif|webp)$/i.test(asset.name || asset.uri);

        setSelectedFile({
          uri: asset.uri,
          name: asset.name || (isImage ? 'Prescription image' : 'Prescription document'),
          mimeType,
          isImage,
        });
      }
    } catch (error) {
      console.error('Error choosing from documents:', error);
      Alert.alert('Error', 'Failed to select file from documents. Please try again.');
    }
  };


  // No voice handlers here

  const handleUpload = async () => {
    if (!selectedFile?.uri) {
      Alert.alert('No File', 'Please select a prescription file or image before uploading');
      return;
    }
    if (!orderId) {
      Alert.alert('Missing Order', 'Order ID is missing. Open this screen from an order context.');
      return;
    }
    
    setIsUploading(true);
    
    try {
      console.log('📄 Uploading prescription for order:', orderId, 'file:', selectedFile);
      // Pass the mimeType from selected file to ensure correct type detection
      const res = await orderService.uploadPrescription(orderId, selectedFile.uri, selectedFile.mimeType);
      console.log('📄 Upload response:', res);
      
      if (!res.success) {
        throw new Error(res.error || 'Upload failed');
      }

      // Handle both possible field names from API response
      const signedUrl = (res.data as any)?.signedPresciptionUrl || (res.data as any)?.signedPrescriptionUrl;
      console.log('📄 Prescription uploaded successfully, signed URL:', signedUrl);

      Alert.alert('Upload Successful', 'Prescription uploaded successfully.', [
        { text: 'View Order', onPress: () => navigation.navigate('OrderDetail', { orderId }) },
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      const message = (error?.message as string) || 'Failed to upload prescription. Please try again.';
      console.error('📄 Upload error:', message, error);
      Alert.alert('Upload Failed', message);
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
      paddingTop: 20, // Add more top padding to bring header down
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    backButton: {
      padding: 8,
      marginRight: 8,
    },
    headerTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      textAlign: 'center',
    },
    reloadButton: {
      padding: 8,
      marginLeft: 8,
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
      backgroundColor: '#4285F4',
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
    'Upload your prescription image using camera or documents',
    'Our pharmacist will review your prescription within 2-4 hours',
    'You will receive a call or SMS with medicine availability and pricing',
    'Confirm your order and make payment to complete the process'
  ];

  return (
    <SafeAreaView style={themedStyles.container} edges={['top']}>
      <View style={themedStyles.header}>
        <TouchableOpacity 
          style={themedStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={themedStyles.headerTitle}>Upload Prescription</Text>
        <TouchableOpacity 
          style={themedStyles.reloadButton}
          onPress={onRefresh}
          disabled={refreshing}
        >
          <Ionicons 
            name="reload" 
            size={22} 
            color={refreshing ? theme.colors.secondary : theme.colors.primary} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={themedStyles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={themedStyles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Action Buttons */}
        <View style={themedStyles.actionButtonsContainer}>
          <TouchableOpacity style={themedStyles.actionButton} onPress={handleTakePhoto}>
            <MaterialIcons name="camera-alt" size={32} color={theme.colors.primary} />
            <Text style={themedStyles.actionButtonText}>Take Photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={themedStyles.actionButton} onPress={handleChooseFromDocuments}>
            <MaterialIcons name="insert-drive-file" size={32} color={theme.colors.primary} />
            <Text style={themedStyles.actionButtonText}>Documents (PDF/Image)</Text>
          </TouchableOpacity>
        </View>

        {/* Voice input is only on Search screen */}

        {/* Selected File Preview */}
        {selectedFile && (
          <View style={themedStyles.selectedImageContainer}>
            {selectedFile.isImage ? (
              <Image source={{ uri: selectedFile.uri }} style={themedStyles.selectedImage} />
            ) : (
              <View
                style={{
                  height: 200,
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 16,
                }}
              >
                <MaterialIcons name="picture-as-pdf" size={48} color={theme.colors.primary} />
                <Text
                  style={{
                    marginTop: 8,
                    color: theme.colors.text,
                    fontSize: 14,
                    textAlign: 'center',
                  }}
                  numberOfLines={2}
                >
                  {selectedFile.name || 'Selected document'}
                </Text>
              </View>
            )}
            <TouchableOpacity 
              style={themedStyles.removeImageButton}
              onPress={() => setSelectedFile(null)}
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
        {selectedFile && (
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


