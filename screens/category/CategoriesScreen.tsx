import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
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
const pharmacyCategorySections = [
  {
    id: '1',
    title: 'Medicines & Healthcare',
    categories: [
      { id: '1', name: 'Pain Relief', image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
      { id: '2', name: 'Cold & Flu', image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
      { id: '3', name: 'Fever & Headache', image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
      { id: '4', name: 'Digestive Health', image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
      { id: '5', name: 'Vitamins & Supplements', image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
      { id: '6', name: 'Diabetes Care', image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
      { id: '7', name: 'Heart Health', image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
      { id: '8', name: 'Skin Care', image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    ],
  },
  {
    id: '2',
    title: 'Personal Care & Hygiene',
    categories: [
      { id: '9', name: 'Oral Care', image: 'https://images.pexels.com/photos/3762465/pexels-photo-3762465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
      { id: '10', name: 'Hair Care', image: 'https://images.pexels.com/photos/3762465/pexels-photo-3762465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
      { id: '11', name: 'Baby Care', image: 'https://images.pexels.com/photos/3875217/pexels-photo-3875217.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
      { id: '12', name: 'Feminine Care', image: 'https://images.pexels.com/photos/3762465/pexels-photo-3762465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
      { id: '13', name: 'Men\'s Grooming', image: 'https://images.pexels.com/photos/3762465/pexels-photo-3762465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
      { id: '14', name: 'Fragrances', image: 'https://images.pexels.com/photos/3762465/pexels-photo-3762465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
      { id: '15', name: 'Makeup', image: 'https://images.pexels.com/photos/3762465/pexels-photo-3762465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
      { id: '16', name: 'Health Supplements', image: 'https://images.pexels.com/photos/3762465/pexels-photo-3762465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    ],
  },
  {
    id: '3',
    title: 'Medical Devices & Equipment',
    categories: [
      { id: '17', name: 'Blood Pressure Monitors', image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
      { id: '18', name: 'Thermometers', image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
      { id: '19', name: 'First Aid', image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
      { id: '20', name: 'Mobility Aids', image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
      { id: '21', name: 'Respiratory Care', image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
      { id: '22', name: 'Diabetes Monitoring', image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
      { id: '23', name: 'Hearing Aids', image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
      { id: '24', name: 'Orthopedic Support', image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    ],
  },
];

const CategoriesScreen = () => {
  const { theme, section } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { selectedStore } = useAppContext();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories (and subcategories for pharmacy) from API only - no hardcoded data
  useEffect(() => {
    const fetchCategories = async () => {
      if (!selectedStore?.id) {
        console.log('   No store selected, showing empty categories');
        setCategories([]);
        setLoading(false);
        return;
      }

      try {
        console.log(`🔄 Fetching ${section} categories for store:`, selectedStore.id);
        
        // Fetch categories from the new API endpoint
        const response = await storeService.getStoreCategories(selectedStore.id, section);
        
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
  }, [selectedStore?.id, section]);

  const renderCategoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
      onPress={async () => {
        try {
          console.log('🔍 Category clicked:', item.name, 'ID:', item.categoryId);
          
          // Fetch category details from API
          const categoryResponse = await storeService.getCategoryDetails(selectedStore?.id || '', item.categoryId);
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
          uri: item.signedImage || item.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop&crop=center' 
        }} 
        style={styles.image} 
      />
      <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={2}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderSection = ({ item }: { item: any }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{item.title}</Text>
      <FlatList
        data={item.categories.slice(0, 8)}
        renderItem={renderCategoryItem}
        keyExtractor={(category) => category.id}
        numColumns={4}
        columnWrapperStyle={styles.row}
        scrollEnabled={false}
      />
      {item.categories.length > 8 && (
        <TouchableOpacity
          style={styles.showMoreButton}
          onPress={() =>
            navigation.navigate('AllProducts', {
              title: item.title,
              products: item.categories.map((cat: any) => ({
                id: cat.id,
                name: cat.name,
                price: 0, // Placeholder price
                image: cat.image,
                category: 'grocery' as const,
              })),
            })
          }
        >
          <Text style={[styles.showMoreText, { color: theme.colors.primary }]}>View More</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Build sections for UI rendering - only show API data
  const computedSections = [{ id: section, title: section === 'pharma' ? 'Pharmacy Categories' : 'Grocery Categories', categories }];

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
      <FlatList
        data={computedSections}
        renderItem={renderSection}
        keyExtractor={(item) => item.title}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingHorizontal: 6,
  },
  row: {
    flex: 1,
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  card: {
    width: '22%',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginBottom: 8,
  },
  name: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  showMoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CategoriesScreen;