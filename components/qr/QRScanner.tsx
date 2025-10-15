import React, { useState } from 'react';
import { View, StyleSheet, Alert, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Button } from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import deepLinkingService from '../../services/deepLinkingService';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';

interface QRScannerProps {
  onClose?: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onClose }) => {
  const [scanned, setScanned] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const theme = useTheme();

  const handleQRCode = async (data: string) => {
    if (scanned) return;
    
    try {
      setScanned(true);
      console.log('📱 QR Code scanned:', data);
      
      // Extract store ID from various QR formats
      const storeId = extractStoreIdFromQR(data);
      
      if (storeId) {
        console.log('🏪 Store ID extracted from QR:', storeId);
        
        // Fetch store details
        const storeResponse = await deepLinkingService.fetchStoreDetails(storeId);
        
        if (storeResponse.success && storeResponse.data) {
          // Navigate directly to Home with store params so HomeScreen selects it
          navigation.reset({
            index: 0,
            routes: [
              { 
                name: 'Main',
                params: {
                  screen: 'HomeRoot',
                  params: {
                    storeId: storeId,
                    storeType: storeResponse.data.type,
                    storeName: storeResponse.data.name,
                  }
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

  return (
    <View style={styles.container}>
      <QRCodeScanner
        onRead={(e) => handleQRCode(e.data)}
        flashMode={RNCamera.Constants.FlashMode.auto}
        topContent={
          <Text style={styles.centerText}>
            Point camera at store QR code
          </Text>
        }
        bottomContent={
          <Button 
            mode="contained" 
            onPress={onClose}
            style={styles.buttonTouchable}
          >
            Close Scanner
          </Button>
        }
        cameraStyle={styles.camera}
        showMarker={true}
        markerStyle={styles.marker}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777',
    textAlign: 'center',
  },
  textBold: {
    fontWeight: '500',
    color: '#000',
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)',
  },
  buttonTouchable: {
    fontSize: 16,
    backgroundColor: '#007AFF',
    marginTop: 32,
  },
  camera: {
    height: '100%',
  },
  marker: {
    borderColor: '#fff',
    borderWidth: 2,
  },
});

export default QRScanner;