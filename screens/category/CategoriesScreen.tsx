import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Box, HStack, Text, IconButton } from 'native-base';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppContext } from '../../contexts/AppContext';
import storeService from '../../services/api/storeService';
import { storeProductService } from '../../services/api/storeProductService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: screenWidth } = Dimensions.get('window');
// Calculate card width: screen width - section padding (32) - row padding (32) - margins (24) = screenWidth - 88
// Then divide by 4 for 4 columns
const CARD_WIDTH = Math.floor((screenWidth - 88) / 4);

// const categorySections = [
//   {
//     id: '1',
//     title: 'Grocery & Kitchen',
//     categories: [
//       { id: '1', name: 'Fruits', image: 'https://images.pexels.com/photos/2093087/pexels-photo-2093087.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '2', name: 'Vegetables', image: 'https://images.pexels.com/photos/2518893/pexels-photo-2518893.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '3', name: 'Dairy', image: 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '4', name: 'Meat', image: 'https://images.pexels.com/photos/3997388/pexels-photo-3997388.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '5', name: 'Bakery', image: 'https://images.pexels.com/photos/1721934/pexels-photo-1721934.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '6', name: 'Spices', image: 'https://images.pexels.com/photos/5945763/pexels-photo-5945763.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '7', name: 'Rice & Grains', image: 'https://images.pexels.com/photos/4110225/pexels-photo-4110225.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '8', name: 'Cooking Oil', image: 'https://images.pexels.com/photos/4110225/pexels-photo-4110225.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '9', name: 'Pulses', image: 'https://images.pexels.com/photos/4110225/pexels-photo-4110225.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '10', name: 'Nuts & Dry Fruits', image: 'https://images.pexels.com/photos/2093087/pexels-photo-2093087.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '11', name: 'Condiments', image: 'https://images.pexels.com/photos/5945763/pexels-photo-5945763.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '12', name: 'Frozen Foods', image: 'https://images.pexels.com/photos/3997388/pexels-photo-3997388.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//     ],
//   },
//   {
//     id: '2',
//     title: 'Snacks & Drinks',
//     categories: [
//       { id: '13', name: 'Snacks', image: 'https://images.pexels.com/photos/5638597/pexels-photo-5638597.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '14', name: 'Drinks', image: 'https://images.pexels.com/photos/338713/pexels-photo-338713.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '15', name: 'Beverages', image: 'https://images.pexels.com/photos/2789328/pexels-photo-2789328.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '16', name: 'Energy Drinks', image: 'https://images.pexels.com/photos/2789328/pexels-photo-2789328.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '17', name: 'Juices', image: 'https://images.pexels.com/photos/2789328/pexels-photo-2789328.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '18', name: 'Soft Drinks', image: 'https://images.pexels.com/photos/2789328/pexels-photo-2789328.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '19', name: 'Tea & Coffee', image: 'https://images.pexels.com/photos/2789328/pexels-photo-2789328.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '20', name: 'Water', image: 'https://images.pexels.com/photos/2789328/pexels-photo-2789328.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '21', name: 'Chocolates', image: 'https://images.pexels.com/photos/5638597/pexels-photo-5638597.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '22', name: 'Chips & Namkeen', image: 'https://images.pexels.com/photos/5638597/pexels-photo-5638597.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//     ],
//   },
//   {
//     id: '3',
//     title: 'Personal Care',
//     categories: [
//       { id: '23', name: 'Personal Care', image: 'https://images.pexels.com/photos/3762465/pexels-photo-3762465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '24', name: 'Baby Care', image: 'https://images.pexels.com/photos/3875217/pexels-photo-3875217.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '25', name: 'Hair Care', image: 'https://images.pexels.com/photos/3762465/pexels-photo-3762465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '26', name: 'Skin Care', image: 'https://images.pexels.com/photos/3762465/pexels-photo-3762465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '27', name: 'Oral Care', image: 'https://images.pexels.com/photos/3762465/pexels-photo-3762465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '28', name: 'Feminine Care', image: 'https://images.pexels.com/photos/3762465/pexels-photo-3762465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '29', name: 'Men\'s Grooming', image: 'https://images.pexels.com/photos/3762465/pexels-photo-3762465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '30', name: 'Fragrances', image: 'https://images.pexels.com/photos/3762465/pexels-photo-3762465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '31', name: 'Makeup', image: 'https://images.pexels.com/photos/3762465/pexels-photo-3762465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '32', name: 'Health Supplements', image: 'https://images.pexels.com/photos/3762465/pexels-photo-3762465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//     ],
//   },
//   {
//     id: '4',
//     title: 'Home & Cleaning',
//     categories: [
//       { id: '33', name: 'Cleaning', image: 'https://images.pexels.com/photos/4239031/pexels-photo-4239031.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '34', name: 'Pets', image: 'https://images.pexels.com/photos/5749792/pexels-photo-5749792.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '35', name: 'Kitchen & Dining', image: 'https://images.pexels.com/photos/4239031/pexels-photo-4239031.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '36', name: 'Bathroom', image: 'https://images.pexels.com/photos/4239031/pexels-photo-4239031.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '37', name: 'Laundry', image: 'https://images.pexels.com/photos/4239031/pexels-photo-4239031.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '38', name: 'Paper & Disposables', image: 'https://images.pexels.com/photos/4239031/pexels-photo-4239031.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '39', name: 'Home Care', image: 'https://images.pexels.com/photos/4239031/pexels-photo-4239031.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '40', name: 'Stationery', image: 'https://images.pexels.com/photos/4239031/pexels-photo-4239031.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '41', name: 'Home Decor', image: 'https://images.pexels.com/photos/4239031/pexels-photo-4239031.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '42', name: 'Gardening', image: 'https://images.pexels.com/photos/4239031/pexels-photo-4239031.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//     ],
//   },
// ];

// Pharmacy category sections
// const pharmacyCategorySections = [
//   {
//     id: '1',
//     title: 'Medicines & Healthcare',
//     categories: [
//       { id: '1', name: 'Pain Relief', image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '2', name: 'Cold & Flu', image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '3', name: 'Fever & Headache', image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '4', name: 'Digestive Health', image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '5', name: 'Vitamins & Supplements', image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '6', name: 'Diabetes Care', image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '7', name: 'Heart Health', image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '8', name: 'Skin Care', image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//     ],
//   },
//   {
//     id: '2',
//     title: 'Personal Care & Hygiene',
//     categories: [
//       { id: '9', name: 'Oral Care', image: 'https://images.pexels.com/photos/3762465/pexels-photo-3762465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '10', name: 'Hair Care', image: 'https://images.pexels.com/photos/3762465/pexels-photo-3762465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '11', name: 'Baby Care', image: 'https://images.pexels.com/photos/3875217/pexels-photo-3875217.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '12', name: 'Feminine Care', image: 'https://images.pexels.com/photos/3762465/pexels-photo-3762465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '13', name: 'Men\'s Grooming', image: 'https://images.pexels.com/photos/3762465/pexels-photo-3762465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '14', name: 'Fragrances', image: 'https://images.pexels.com/photos/3762465/pexels-photo-3762465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '15', name: 'Makeup', image: 'https://images.pexels.com/photos/3762465/pexels-photo-3762465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '16', name: 'Health Supplements', image: 'https://images.pexels.com/photos/3762465/pexels-photo-3762465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//     ],
//   },
//   {
//     id: '3',
//     title: 'Medical Devices & Equipment',
//     categories: [
//       { id: '17', name: 'Blood Pressure Monitors', image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '18', name: 'Thermometers', image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '19', name: 'First Aid', image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '20', name: 'Mobility Aids', image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '21', name: 'Respiratory Care', image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '22', name: 'Diabetes Monitoring', image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '23', name: 'Hearing Aids', image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//       { id: '24', name: 'Orthopedic Support', image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
//     ],
//   },
// ];

const CategoriesScreen = () => {
  const { theme, section } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { selectedStore, lastVisitedStore, lastVisitedGroceryStore, lastVisitedPharmacyStore } = useAppContext();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // Get the effective store to use (selectedStore or fallback to last visited stores)
  const effectiveStore = selectedStore || lastVisitedStore || lastVisitedGroceryStore || lastVisitedPharmacyStore;

  // Show first 8 categories when collapsed, all when expanded
  const displayedCategories = isExpanded ? categories : categories.slice(0, 8);
  const hasMoreCategories = categories.length > 8;

  // Fetch categories (and subcategories for pharmacy) from API only - no hardcoded data
  useEffect(() => {
    const fetchCategories = async () => {
      if (!effectiveStore?.id) {
        console.log('   No store available, showing empty categories');
        setCategories([]);
        setLoading(false);
        return;
      }

      try {
        console.log(`🔄 Fetching ${section} categories for store:`, effectiveStore.id);
        
        // Fetch categories from the new API endpoint
        const response = await storeService.getStoreCategories(effectiveStore.id, section);
        
        console.log(`🔍 ${section} API response:`, JSON.stringify(response, null, 2));
        
        if (response.success && response.data) {
          // Handle nested data structure: response.data.data or response.data
          const categoriesData = Array.isArray(response.data) ? response.data : ((response.data as any)?.data || response.data);
          
          if (Array.isArray(categoriesData)) {
            console.log(`✅ ${section} categories loaded from API:`, categoriesData.length);
            console.log(`📊 Categories data:`, JSON.stringify(categoriesData, null, 2));
            setCategories(categoriesData);
          } else {
            console.log(`❌ ${section} API returned non-array data:`, typeof categoriesData);
            setCategories([]);
          }
          
          // Note: Subcategories will be fetched individually when user clicks on a category
          // This avoids fetching all subcategories upfront as requested
        } else {
          console.log(`❌ ${section} API failed, showing empty categories`);
          setCategories([]);
        }
      } catch (error) {
        console.log(`  Error fetching ${section} categories:`, error);
        console.log('   Showing empty categories');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [effectiveStore?.id, section]);

  const renderCategoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.dark ? '#4B3F1D' : '#FFF9E5',
          borderColor: theme.colors.border,
          shadowColor: theme.dark ? '#000' : '#FFD700',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 2,
        },
      ]}
      onPress={async () => {
        try {
          console.log('🔍 Category clicked:', item.name, 'ID:', item.categoryId);
          
          // Fetch category details from API
          const categoryResponse = await storeService.getCategoryDetails(effectiveStore?.id || '', item.categoryId);
          console.log('🔍 Category details API response:', JSON.stringify(categoryResponse, null, 2));
          
          if (categoryResponse.success && categoryResponse.data) {
            // Handle nested data structure: response.data.data or response.data
            const categoryData = Array.isArray(categoryResponse.data) ? categoryResponse.data : ((categoryResponse.data as any)?.data || categoryResponse.data);
            console.log('✅ Category details fetched:', JSON.stringify(categoryData, null, 2));
            
            navigation.navigate('CategoryDetail', { 
              category: { 
                id: item.categoryId,
                name: item.name,
                description: item.description,
                image: item.signedImage || item.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop&crop=center',
                subCategories: categoryData.subcategories || [],
                products: categoryData.products || []
              } 
            });
          } else {
            // Fallback - navigate with empty subcategories, CategoryDetailScreen will fetch them
            navigation.navigate('CategoryDetail', { 
              category: { 
                id: item.categoryId,
                name: item.name,
                description: item.description,
                image: item.signedImage || item.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop&crop=center',
                subCategories: [] // Empty - CategoryDetailScreen will fetch subcategories for this specific category
              } 
            });
          }
        } catch (error) {
          console.error('❌ Error fetching category details:', error);
          // Fallback - navigate with empty subcategories, CategoryDetailScreen will fetch them
          navigation.navigate('CategoryDetail', { 
            category: { 
              id: item.categoryId,
              name: item.name,
              description: item.description,
              image: item.signedImage || item.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop&crop=center',
              subCategories: [] // Empty - CategoryDetailScreen will fetch subcategories for this specific category
            } 
          });
        }
      }}
      activeOpacity={0.8}
    >
      <Image 
        source={{ 
          uri: item.image || item.signedImage || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop&crop=center' 
        }} 
        style={styles.image} 
      />
      <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={2}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
        <Box bg={theme.colors.card} px={4} py={3} pt={20} flexDirection="row" alignItems="center">
          <IconButton
            icon={<MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />}
            onPress={() => navigation.goBack()}
            variant="ghost"
            size="sm"
          />
          <Text color={theme.colors.text} fontSize="lg" fontWeight="bold" flex={1} textAlign="center">
            All Categories
          </Text>
        </Box>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 16, color: theme.colors.text }}>Loading categories...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (categories.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
        <Box bg={theme.colors.card} px={4} py={3} pt={20} flexDirection="row" alignItems="center">
          <IconButton
            icon={<MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />}
            onPress={() => navigation.goBack()}
            variant="ghost"
            size="sm"
          />
          <Text color={theme.colors.text} fontSize="lg" fontWeight="bold" flex={1} textAlign="center">
            All Categories
          </Text>
        </Box>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: theme.colors.text, fontSize: 16, textAlign: 'center' }}>
            No categories available for this store.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <Box bg={theme.colors.card} px={4} py={3} flexDirection="row" alignItems="center">
        <IconButton
          icon={<MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />}
          onPress={() => navigation.goBack()}
          variant="ghost"
          size="sm"
        />
        <Text color={theme.colors.text} fontSize="lg" fontWeight="bold" flex={1} textAlign="center">
          All Categories
        </Text>
      </Box>
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {section === 'pharma' ? 'Pharmacy Categories' : 'Grocery Categories'}
          </Text>
          <FlatList
            data={displayedCategories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.categoryId || item.id}
            numColumns={4}
            columnWrapperStyle={styles.row}
            scrollEnabled={false}
          />
          {hasMoreCategories && (
            <TouchableOpacity
              style={styles.viewMoreButton}
              onPress={() => setIsExpanded(!isExpanded)}
            >
              <Text style={[styles.viewMoreText, { color: theme.colors.primary }]}>
                {isExpanded ? 'View Less' : 'View More'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  card: {
    width: CARD_WIDTH,
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginBottom: 8,
  },
  name: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
  viewMoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CategoriesScreen;