import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Text } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Button } from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import deepLinkingService from '../../services/deepLinkingService';

interface QRScannerProps {
  onClose?: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onClose }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const theme = useTheme();

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    console.log('📱 QR Code scanned:', data);
    
    try {
      // Extract store ID from various QR formats
      const storeId = extractStoreIdFromQR(data);
      
      if (storeId) {
        console.log('🏪 Store ID extracted from QR:', storeId);
        
        // Fetch store details
        const storeResponse = await deepLinkingService.fetchStoreDetails(storeId);
        
        if (storeResponse.success && storeResponse.data) {
          // Navigate directly to store
          navigation.reset({
            index: 0,
            routes: [
              { name: 'Main' },
              { 
                name: 'AboutStore', 
                params: {
                  store: storeResponse.data,
                  storeId: storeId,
                  fromQR: true
                }
              }
            ],
          });
          
          Alert.alert(
            'Store Found!',
            `Opening ${storeResponse.data.name || 'Store'}`,
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Store Not Found',
            'This QR code is not valid. Please scan a valid store QR code.',
            [
              { text: 'Try Again', onPress: () => setScanned(false) },
              { text: 'Cancel', onPress: onClose }
            ]
          );
        }
      } else {
        Alert.alert(
          'Invalid QR Code',
          'This QR code is not a valid store QR code.',
          [
            { text: 'Try Again', onPress: () => setScanned(false) },
            { text: 'Cancel', onPress: onClose }
          ]
        );
      }
    } catch (error) {
      console.error('❌ Error processing QR code:', error);
      Alert.alert(
        'Error',
        'Failed to process QR code. Please try again.',
        [
          { text: 'Try Again', onPress: () => setScanned(false) },
          { text: 'Cancel', onPress: onClose }
        ]
      );
    }
  };

  const extractStoreIdFromQR = (data: string): string | null => {
    try {
      console.log('🔍 Parsing QR data:', data);
      
      // Handle direct store ID
      if (data.match(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i)) {
        console.log('✅ Direct store ID found');
        return data;
      }
      
      // Handle ecomm://store/{storeId}
      if (data.startsWith('ecomm://store/')) {
        const storeId = data.replace('ecomm://store/', '');
        if (storeId && storeId.length > 10) {
          console.log('✅ ecomm:// store ID found:', storeId);
          return storeId;
        }
      }
      
      // Handle https://stores.yourdomain.com/store/{storeId}
      if (data.includes('/store/')) {
        const match = data.match(/\/store\/([^/?]+)/);
        if (match && match[1]) {
          console.log('✅ HTTPS store ID found:', match[1]);
          return match[1];
        }
      }
      
      // Handle https://qr.ecomm.com/s/{storeId}
      if (data.includes('/s/')) {
        const match = data.match(/\/s\/([^/?]+)/);
        if (match && match[1]) {
          console.log('✅ QR domain store ID found:', match[1]);
          return match[1];
        }
      }
      
      // Handle https://marg-api.thelocalsandbox.dev/dl/{storeId}
      if (data.includes('/dl/')) {
        const match = data.match(/\/dl\/([^/?]+)/);
        if (match && match[1]) {
          console.log('✅ API domain store ID found:', match[1]);
          return match[1];
        }
      }
      
      console.log('❌ No valid store ID found in QR data');
      return null;
    } catch (error) {
      console.error('❌ Error extracting store ID from QR:', error);
      return null;
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>No access to camera</Text>
        <Button mode="contained" onPress={onClose}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={styles.overlay}>
        <View style={styles.scanArea}>
          <Text style={styles.instruction}>
            Point camera at store QR code
          </Text>
        </View>
        
        <Button 
          mode="contained" 
          onPress={onClose}
          style={styles.closeButton}
        >
          Close Scanner
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  instruction: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  message: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
});

export default QRScanner;
