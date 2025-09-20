import React, { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import deepLinkingService from '../../services/deepLinkingService';
import { storeService } from '../../services/api/storeService';

interface DeepLinkHandlerProps {
  children: React.ReactNode;
}

const DeepLinkHandler: React.FC<DeepLinkHandlerProps> = ({ children }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isProcessingRef = useRef(false);

  useEffect(() => {
    console.log('🔗 DeepLinkHandler: Setting up deep link listener');
    
    // Handle initial deep link when app starts
    handleInitialDeepLink();

    // Add listener for deep links when app is running
    const unsubscribe = deepLinkingService.addDeepLinkListener(handleDeepLink);
    console.log('🔗 DeepLinkHandler: Deep link listener added');

    // Test if listener is working - this should show in console
    console.log('🔗 DeepLinkHandler: Listener setup complete');

    return () => {
      console.log('🔗 DeepLinkHandler: Cleaning up deep link listener');
      unsubscribe();
    };
  }, []);

  const handleInitialDeepLink = async () => {
    try {
      const initialUrl = await deepLinkingService.getInitialURL();
      if (initialUrl) {
        console.log('🔗 Processing initial deep link:', initialUrl);
        
        // Check if it's actually a deep link we support
        const deepLinkResult = deepLinkingService.parseDeepLink(initialUrl);
        if (deepLinkResult.type !== 'unknown') {
          await processDeepLink(initialUrl);
        } else {
          console.log('🔗 Ignoring unsupported initial URL:', initialUrl);
        }
      }
    } catch (error) {
      console.error('  Error handling initial deep link:', error);
    }
  };

  const handleDeepLink = async (url: string) => {
    try {
      console.log('🔗 DeepLinkHandler: Processing deep link:', url);
      await processDeepLink(url);
    } catch (error) {
      console.error('  DeepLinkHandler: Error handling deep link:', error);
    }
  };

  const processDeepLink = async (url: string) => {
    // Prevent multiple simultaneous deep link processing
    if (isProcessingRef.current) {
      console.log('🔗 Deep link already being processed, ignoring:', url);
      return;
    }

    isProcessingRef.current = true;

    try {
      const deepLinkResult = deepLinkingService.parseDeepLink(url);
      console.log('🔗 Deep link result:', deepLinkResult);

      if (deepLinkResult.type === 'store' && deepLinkResult.params) {
        await handleStoreDeepLink(deepLinkResult.params);
      } else if (deepLinkResult.type === 'unknown') {
        console.log('🔗 Unknown deep link type, ignoring:', deepLinkResult.type);
        // Don't show alert for unknown URLs, just log and ignore
      } else {
        console.log('🔗 Unsupported deep link type:', deepLinkResult.type);
        Alert.alert(
          'Invalid Link',
          'This link is not supported by the app.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('  Error processing deep link:', error);
      Alert.alert(
        'Error',
        'Failed to process the link. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      isProcessingRef.current = false;
    }
  };

  const handleStoreDeepLink = async (params: { storeId: string; storeType?: 'grocery' | 'pharma'; storeName?: string }) => {
    try {
      console.log('🏪 Processing store deep link:', params);

      // First fetch store details to get proper store information
      const storeDetails = await fetchStoreDetails(params.storeId);
      
      if (storeDetails) {
        console.log('✅ Store details fetched, navigating to HomeScreen with store:', storeDetails);
        console.log('🏪 Passing storeName to HomeScreen:', storeDetails.name || params.storeName);
        
        // Navigate directly to HomeScreen (Main tab) with store data
        navigation.reset({
          index: 0,
          routes: [
            { 
              name: 'Main',
              params: {
                screen: 'HomeRoot',
                params: {
                  storeId: params.storeId,
                  storeType: storeDetails.type || params.storeType,
                  storeName: storeDetails.name || params.storeName,
                  pincode: storeDetails.pincode
                }
              }
            }
          ],
        });
      } else {
        console.log('⚠️ Store details not found, using fallback navigation');
        console.log('🏪 Passing fallback storeName to HomeScreen:', params.storeName || 'Selected Store');
        
        // Fallback: Navigate to HomeScreen with basic store info
        navigation.reset({
          index: 0,
          routes: [
            { 
              name: 'Main',
              params: {
                screen: 'HomeRoot',
                params: {
                  storeId: params.storeId,
                  storeType: params.storeType || 'grocery',
                  storeName: params.storeName || 'Selected Store'
                }
              }
            }
          ],
        });
      }

      console.log('🏠 Navigated to HomeScreen with storeId:', params.storeId);

    } catch (error) {
      console.error('❌ Error handling store deep link:', error);
      Alert.alert(
        'Error',
        'Failed to open the store. Please try again.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Browse Stores', 
            onPress: () => navigation.navigate('StoreList' as any)
          }
        ]
      );
    }
  };

  const fetchStoreDetails = async (storeId: string) => {
    try {
      console.log('🔍 Fetching store details for ID:', storeId);
      
      // Try to get store details from the deep linking service
      const response = await deepLinkingService.fetchStoreDetails(storeId);
      
      if (response.success && response.data) {
        console.log('✅ Store details fetched:', response.data);
        return response.data;
      } else {
        console.log('⚠️ Store not found or error fetching store details:', response.error);
        return null;
      }
    } catch (error) {
      console.error('❌ Error fetching store details:', error);
      return null;
    }
  };

  return <>{children}</>;
};

export default DeepLinkHandler;
