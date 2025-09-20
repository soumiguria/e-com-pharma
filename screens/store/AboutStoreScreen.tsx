import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import deepLinkingService from '../../services/deepLinkingService';
import storeService, { formatStoreAddress } from '../../services/api/storeService';

const AboutStoreScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const [storeData, setStoreData] = useState<any>(null);
  const [formattedStoreAddress, setFormattedStoreAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // Debug route parameters
  console.log('🏪 AboutStoreScreen: Route params:', route.params);
  console.log('🏪 AboutStoreScreen: Route name:', route.name);
  
  // Check if store data is available
  const params = route.params as any;
  const storeId = params?.storeId;
  
  useEffect(() => {
    if (storeId) {
      console.log('🏪 AboutStoreScreen: Store ID from params:', storeId);
      console.log('🏪 AboutStoreScreen: Store data from params:', params?.store);
      
      // If we have store data from deep link, use it
      if (params?.store) {
        console.log('🏪 AboutStoreScreen: Using store data from deep link');
        setStoreData(params.store);
      } else {
        // Fetch store details using storeId
        console.log('🏪 AboutStoreScreen: Fetching store details for ID:', storeId);
        fetchStoreDetails(storeId);
      }
    }
  }, [storeId, params?.store]);

  const fetchStoreDetails = async (storeId: string) => {
    setLoading(true);
    try {
      console.log('🔍 Fetching store details for deep link storeId:', storeId);
      const response = await storeService.getStoreDetailsById(storeId);
      
           if (response.success && response.data) {
             console.log('✅ Store details fetched for deep link:', response.data);
             const storeData = (response.data as any).data || response.data;
             setStoreData(storeData);
             
             // Format the address with coordinates if available
             const coordinates = storeData.location?.coordinates;
             if (storeData.address || coordinates) {
               const formattedAddress = formatStoreAddress(storeData.address || {}, coordinates);
               setFormattedStoreAddress(formattedAddress);
             }
           } else {
        console.log('❌ Store not found for deep link storeId:', storeId);
        Alert.alert(
          'Store Not Found',
          'The store you\'re looking for could not be found.',
          [
            { text: 'Go Back', onPress: () => navigation.goBack() }
          ]
        );
      }
    } catch (error) {
      console.error('💥 Error fetching store details for deep link:', error);
      Alert.alert(
        'Error',
        'Failed to load store details.',
        [
          { text: 'Go Back', onPress: () => navigation.goBack() }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {storeData?.name || 'About Store'}
        </Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={[styles.section, { backgroundColor: theme.colors.surface, alignItems: 'center', padding: 20 }]}>
            <Text style={[styles.description, { color: theme.colors.text }]}>Loading store details...</Text>
          </View>
        ) : (
          <>
            <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Store Information</Text>
              <Text style={[styles.description, { color: theme.colors.text }]}>
                {storeData?.description || 'Welcome to our store! We are committed to providing fresh, high-quality products to our customers.'}
              </Text>
       {(formattedStoreAddress || storeData?.address) && (
         <Text style={[styles.description, { color: theme.colors.text, marginTop: 10 }]}>
           📍 Address: {formattedStoreAddress || 'Address not available'}
         </Text>
       )}
              {storeData?.phone && (
                <Text style={[styles.description, { color: theme.colors.text, marginTop: 5 }]}>
                  📞 Phone: {storeData.phone}
                </Text>
              )}
            </View>
          </>
        )}

        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Our Mission</Text>
          <Text style={[styles.description, { color: theme.colors.text }]}>
            To provide fresh, quality groceries and household essentials at competitive prices, 
            while ensuring excellent customer service and convenience.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Store Hours</Text>
          <Text style={[styles.description, { color: theme.colors.text }]}>
            Monday - Friday: 7:00 AM - 10:00 PM{'\n'}
            Saturday - Sunday: 8:00 AM - 9:00 PM
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Services</Text>
          <Text style={[styles.description, { color: theme.colors.text }]}>
            • Home Delivery{'\n'}
            • Online Ordering{'\n'}
            • Fresh Produce{'\n'}
            • Quality Assurance{'\n'}
            • Customer Support
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
});

export default AboutStoreScreen; 