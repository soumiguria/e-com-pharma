import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAppContext } from '../../contexts/AppContext';
import { storeProductService } from '../../services/api/storeProductService';

// Fallback categories for grocery
const groceryCategories = [
    { id: '1', name: 'Fruits', image: 'https://images.pexels.com/photos/2093087/pexels-photo-2093087.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: '2', name: 'Vegetables', image: 'https://images.pexels.com/photos/2518893/pexels-photo-2518893.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: '3', name: 'Dairy', image: 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: '4', name: 'Meat', image: 'https://images.pexels.com/photos/3997388/pexels-photo-3997388.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: '5', name: 'Bakery', image: 'https://images.pexels.com/photos/1721934/pexels-photo-1721934.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: '6', name: 'Snacks', image: 'https://images.pexels.com/photos/5638597/pexels-photo-5638597.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: '7', name: 'Drinks', image: 'https://images.pexels.com/photos/338713/pexels-photo-338713.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: '8', name: 'Spices', image: 'https://images.pexels.com/photos/5945763/pexels-photo-5945763.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: '9', name: 'Cleaning', image: 'https://images.pexels.com/photos/4239031/pexels-photo-4239031.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: '10', name: 'Personal Care', image: 'https://images.pexels.com/photos/3762465/pexels-photo-3762465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: '11', name: 'Baby Care', image: 'https://images.pexels.com/photos/3875217/pexels-photo-3875217.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: '12', name: 'Pets', image: 'https://images.pexels.com/photos/5749792/pexels-photo-5749792.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
];

// Fallback categories for pharmacy
const pharmacyCategories = [
    { id: '1', name: 'Pain Relief', image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: '2', name: 'Cold & Flu', image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: '3', name: 'Fever & Headache', image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: '4', name: 'Digestive Health', image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: '5', name: 'Vitamins & Supplements', image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: '6', name: 'Diabetes Care', image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: '7', name: 'Heart Health', image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: '8', name: 'Skin Care', image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: '9', name: 'Oral Care', image: 'https://images.pexels.com/photos/3762465/pexels-photo-3762465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: '10', name: 'Hair Care', image: 'https://images.pexels.com/photos/3762465/pexels-photo-3762465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: '11', name: 'Baby Care', image: 'https://images.pexels.com/photos/3875217/pexels-photo-3875217.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: '12', name: 'First Aid', image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
];

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: screenWidth } = Dimensions.get('window');
// Calculate card width: screen width - section padding (32) - row padding (32) - margins (24) = screenWidth - 88
// Then divide by 4 for 4 columns
const CARD_WIDTH = Math.floor((screenWidth - 88) / 4);

const CategoryGrid = () => {
    const { theme, section } = useTheme();
    const navigation = useNavigation<NavigationProp>();
    const { selectedStore, lastVisitedStore, lastVisitedGroceryStore, lastVisitedPharmacyStore } = useAppContext();
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [tapLoadingId, setTapLoadingId] = useState<string | null>(null);
    
    // Always show first 8 categories on home screen
    const displayedCategories = categories.slice(0, 8);
    const hasMoreCategories = categories.length > 8;

    // Get the effective store to use (selectedStore or fallback to last visited stores)
    const effectiveStore = selectedStore || lastVisitedStore || lastVisitedGroceryStore || lastVisitedPharmacyStore;

    // Fetch categories from API only - no hardcoded data
    useEffect(() => {
        const fetchCategories = async () => {
            if (!effectiveStore?.id) {
                console.log('   No store available, showing empty categories');
                setCategories([]);
                return;
            }

            try {
                setLoading(true);
                console.log(`🔄 Fetching ${section} categories for store:`, effectiveStore.id);
                
                if (section === 'pharma') {
                    const response = await storeProductService.getPharmaCategories(effectiveStore.id);
                    if (response.success && response.data) {
                        console.log('Pharma categories loaded from API');
                        setCategories(response.data);
                    } else {
                        console.log('   Pharma API failed, showing empty categories');
                        setCategories([]);
                    }
                } else {
                    const response = await storeProductService.getGroceryCategories(effectiveStore.id);
                    if (response.success && response.data) {
                        console.log('Grocery categories loaded from API');
                        setCategories(response.data);
                    } else {
                        console.log('   Grocery API failed, showing empty categories');
                        setCategories([]);
                    }
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

    const renderItem = ({ item }: { item: typeof categories[0] }) => (
        <TouchableOpacity style={[
            styles.card,
            {
                backgroundColor: theme.dark ? '#4B3F1D' : '#FFF9E5',
                borderColor: theme.colors.border,
                shadowColor: theme.dark ? '#000' : '#FFD700',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 2,
            }
        ]} onPress={async () => {
            if (tapLoadingId) return;
            if (section === 'pharma') {
                try {
                    setTapLoadingId(item.id);
                    // Fetch subcategories and map them into the category param
                    if (effectiveStore?.id) {
                        const subRes = await storeProductService.getPharmaSubcategories(effectiveStore.id);
                        const subCats = (subRes.success && Array.isArray(subRes.data))
                          ? subRes.data.filter((sc: any) => (sc.parentCategoryId || sc.categoryId || sc.category?.categoryId) === item.id)
                          : [];
                        navigation.navigate('CategoryDetail', { category: { ...item, subCategories: subCats } });
                    } else {
                        navigation.navigate('CategoryDetail', { category: item as any });
                    }
                } catch (e) {
                    navigation.navigate('CategoryDetail', { category: item as any });
                } finally {
                    setTapLoadingId(null);
                }
            } else {
                navigation.navigate('CategoryDetail', { category: item as any });
            }
        }}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text 
              style={[styles.name, { color: theme.colors.text }]} 
              numberOfLines={2} 
              ellipsizeMode="tail"
            >
              {item.name}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View>
            <FlatList
                data={displayedCategories}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                numColumns={4}
                columnWrapperStyle={styles.row}
                scrollEnabled={false}
            />
            {hasMoreCategories && (
                <TouchableOpacity 
                    style={styles.viewMoreButton}
                    onPress={() => navigation.navigate('Categories' as any)}
                >
                    <Text style={[styles.viewMoreText, { color: theme.colors.primary }]}>
                        View More
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    card: {
        width: CARD_WIDTH,
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4,
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
        width: '100%',
        overflow: 'hidden',
        flexWrap: 'wrap',
        paddingHorizontal: 0,
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

export default CategoryGrid; 