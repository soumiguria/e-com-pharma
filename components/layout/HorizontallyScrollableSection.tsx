import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import ProductCard from '../product/ProductCard';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAppContext } from '../../contexts/AppContext';
import { storeProductService } from '../../services/api/storeProductService';

// Fallback data for grocery
const groceryRecentlyBoughtItems = [
    { id: '1', name: 'Fresh Organic Apples', price: 3.99, image: 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: '2', name: 'Organic Carrots', price: 1.29, image: 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: '3', name: 'Whole Wheat Bread', price: 2.49, image: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: '4', name: 'Free-Range Eggs', price: 4.99, image: 'https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
];

const groceryGrandOffersItems = [
    { id: '1', name: 'Family Snack Pack', price: 9.99, image: 'https://images.pexels.com/photos/212936/pexels-photo-212936.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: '2', name: 'Breakfast Essentials Combo', price: 15.99, image: 'https://images.pexels.com/photos/2641886/pexels-photo-2641886.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: '3', name: 'Organic Veggie Box', price: 22.49, image: 'https://images.pexels.com/photos/2255935/pexels-photo-2255935.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: '4', name: 'Gourmet Cheese Platter', price: 18.99, image: 'https://images.pexels.com/photos/1482803/pexels-photo-1482803.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
];

// Fallback data for pharmacy
const pharmacyRecentlyBoughtItems = [
    { id: '1', name: 'Ibuprofen 400mg', price: 5.99, image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: '2', name: 'Vitamin C Tablets', price: 8.99, image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: '3', name: 'Cold Syrup', price: 12.49, image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: '4', name: 'Blood Pressure Monitor', price: 45.99, image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
];

const pharmacyGrandOffersItems = [
    { id: '1', name: 'First Aid Kit', price: 25.99, image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: '2', name: 'Health Supplements Pack', price: 35.99, image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: '3', name: 'Diabetes Care Kit', price: 42.49, image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: '4', name: 'Heart Health Supplements', price: 28.99, image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
];

interface Item {
    id: string;
    name: string;
    price: number;
    image: string;
}

interface HorizontallyScrollableSectionProps {
    title: string;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HorizontallyScrollableSection: React.FC<HorizontallyScrollableSectionProps> = ({ title }) => {
    const { theme, section } = useTheme();
    const navigation = useNavigation<NavigationProp>();
    const { selectedStore } = useAppContext();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Initialize with fallback data immediately
    useEffect(() => {
        const fallbackItems = section === 'pharma' 
            ? (title === 'Recently Bought' ? pharmacyRecentlyBoughtItems : pharmacyGrandOffersItems)
            : (title === 'Recently Bought' ? groceryRecentlyBoughtItems : groceryGrandOffersItems);
        setItems(fallbackItems);
    }, [section, title]);

    // Lazy loading: Fetch API data in background after screen renders
    useEffect(() => {
        const fetchProducts = async () => {
            if (!selectedStore?.id) {
                console.log('📊 No store selected, keeping fallback mock data for products');
                return;
            }

            try {
                setLoading(true);
                console.log(`🔄 Fetching ${section} products for store:`, selectedStore.id, 'Title:', title);
                
                if (section === 'pharma') {
                    const response = await storeProductService.getPharmaProducts(selectedStore.id);
                    if (response.success && response.data) {
                        console.log('✅ Pharma products loaded from API');
                        setItems(response.data.slice(0, 4)); // Take first 4 items
                    } else {
                        console.log('📊 Pharma API failed, keeping fallback mock data');
                    }
                } else {
                    const response = await storeProductService.getGroceryProducts(selectedStore.id);
                    if (response.success && response.data) {
                        console.log('✅ Grocery products loaded from API');
                        setItems(response.data.slice(0, 4)); // Take first 4 items
                    } else {
                        console.log('📊 Grocery API failed, keeping fallback mock data');
                    }
                }
            } catch (error) {
                console.log(`❌ Error fetching ${section} products:`, error);
                console.log('📊 Keeping fallback mock data');
            } finally {
                setLoading(false);
            }
        };

        // Add a small delay to let the screen render first
        const timer = setTimeout(() => {
            fetchProducts();
        }, 200);

        return () => clearTimeout(timer);
    }, [selectedStore?.id, section, title]);

    const handleProductPress = (product: any) => {
        navigation.navigate('ProductDetail', { product });
    };

    const renderItem = ({ item }: { item: Item }) => (
        <View style={[
            styles.card,
            {
                backgroundColor: theme.dark ? '#4B3F1D' : '#FFF9E5',
                borderRadius: 10,
                shadowColor: theme.dark ? '#000' : '#FFD700',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 2,
            }
        ]}>
            <ProductCard product={item} onPress={() => handleProductPress(item)} style={{ width: Dimensions.get('window').width / 3.5, height: 200, backgroundColor: 'transparent' }}/>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.list}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    viewAll: {
        fontWeight: 'bold',
    },
    list: {
        paddingHorizontal: 4,
    },
    card: {
        marginRight: 6,
    }
});

export default HorizontallyScrollableSection; 