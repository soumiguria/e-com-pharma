// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
// import { useTheme } from '../../contexts/ThemeContext';
// import ProductCard from '../product/ProductCard';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { RootStackParamList } from '../../navigation/types';
// import { useAppContext } from '../../contexts/AppContext';
// import { storeProductService } from '../../services/api/storeProductService';

// // Fallback data for grocery (not used - API data is used instead)
// const groceryRecentlyBoughtItems = [
//     { id: '1', name: 'Fresh Organic Apples', price: 3.99, image: '' },
//     { id: '2', name: 'Organic Carrots', price: 1.29, image: '' },
//     { id: '3', name: 'Whole Wheat Bread', price: 2.49, image: '' },
//     { id: '4', name: 'Free-Range Eggs', price: 4.99, image: '' },
// ];

// const groceryGrandOffersItems = [
//     { id: '1', name: 'Family Snack Pack', price: 9.99, image: '' },
//     { id: '2', name: 'Breakfast Essentials Combo', price: 15.99, image: '' },
//     { id: '3', name: 'Organic Veggie Box', price: 22.49, image: '' },
//     { id: '4', name: 'Gourmet Cheese Platter', price: 18.99, image: '' },
// ];

// // Fallback data for pharmacy (not used - API data is used instead)
// const pharmacyRecentlyBoughtItems = [
//     { id: '1', name: 'Ibuprofen 400mg', price: 5.99, image: '' },
//     { id: '2', name: 'Vitamin C Tablets', price: 8.99, image: '' },
//     { id: '3', name: 'Cold Syrup', price: 12.49, image: '' },
//     { id: '4', name: 'Blood Pressure Monitor', price: 45.99, image: '' },
// ];

// const pharmacyGrandOffersItems = [
//     { id: '1', name: 'First Aid Kit', price: 25.99, image: '' },
//     { id: '2', name: 'Health Supplements Pack', price: 35.99, image: '' },
//     { id: '3', name: 'Diabetes Care Kit', price: 42.49, image: '' },
//     { id: '4', name: 'Heart Health Supplements', price: 28.99, image: '' },
// ];

// interface Item {
//     id: string;
//     name: string;
//     price: number;
//     image: string;
// }

// interface HorizontallyScrollableSectionProps {
//     title: string;
//     itemsOverride?: any[]; // If provided, render these items instead of fallbacks
//     hidePercentOff?: boolean;
//     hideWishlist?: boolean;
//     showFullName?: boolean;
// }

// type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// const HorizontallyScrollableSection: React.FC<HorizontallyScrollableSectionProps> = ({ title, itemsOverride, hidePercentOff, hideWishlist, showFullName }) => {
//     const { theme, section } = useTheme();
//     const navigation = useNavigation<NavigationProp>();
//     const { selectedStore } = useAppContext();
//     const [items, setItems] = useState<any[]>([]);
//     const [loading, setLoading] = useState(false);

//     // Initialize with fallback data immediately unless overridden
//     useEffect(() => {
//         if (itemsOverride && Array.isArray(itemsOverride)) {
//             setItems(itemsOverride);
//             return;
//         }
//         const fallbackItems = section === 'pharma' 
//             ? (title === 'Recently Bought' ? pharmacyRecentlyBoughtItems : pharmacyGrandOffersItems)
//             : (title === 'Recently Bought' ? groceryRecentlyBoughtItems : groceryGrandOffersItems);
//         setItems(fallbackItems);
//     }, [section, title, itemsOverride]);

//     // Live API fetching disabled here; showing static fallback items only as requested
//     useEffect(() => {
//         setLoading(false);
//     }, [selectedStore?.id, section, title]);

//     const handleProductPress = (product: any) => {
//         navigation.navigate('ProductDetail', { product });
//     };

//     const cardWidth = Math.min(Dimensions.get('window').width * 0.32, 160);

//     const renderItem = ({ item }: { item: Item }) => (
//         <View style={[
//             styles.cardWrapper,
//             styles.card,
//             {
//                 backgroundColor: theme.dark ? '#4B3F1D' : '#FFF9E5',
//                 borderRadius: 10,
//                 shadowColor: theme.dark ? '#000' : '#FFD700',
//                 shadowOffset: { width: 0, height: 2 },
//                 shadowOpacity: 0.08,
//                 shadowRadius: 4,
//                 elevation: 2,
//             }
//         ]}>
//             <ProductCard product={item} onPress={() => handleProductPress(item)} style={{ width: cardWidth, minHeight: 240, flex: 1, backgroundColor: 'transparent' }} hidePercentOff={hidePercentOff} hideWishlist={hideWishlist} showFullName={showFullName} />
//         </View>
//     );

//     return (
//         <View style={styles.container}>
//             <FlatList
//                 data={itemsOverride && Array.isArray(itemsOverride) ? itemsOverride : items}
//                 renderItem={renderItem}
//                 keyExtractor={item => item.id}
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={[styles.list, styles.listStretch]}
//             />
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         marginBottom: 16,
//     },
//     header: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         paddingHorizontal: 16,
//         marginBottom: 10,
//     },
//     title: {
//         fontSize: 18,
//         fontWeight: 'bold',
//     },
//     viewAll: {
//         fontWeight: 'bold',
//     },
//     list: {
//         paddingHorizontal: 4,
//     },
//     listStretch: {
//         alignItems: 'stretch',
//     },
//     cardWrapper: {
//         flex: 0,
//         minHeight: 240,
//     },
//     card: {
//         marginRight: 6,
//     }
// });

// export default HorizontallyScrollableSection; 




import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Dimensions } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import ProductCard from '../product/ProductCard';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAppContext } from '../../contexts/AppContext';

// Fallback data
const groceryRecentlyBoughtItems = [
    { id: '1', name: 'Fresh Organic Apples', price: 3.99, image: '' },
    { id: '2', name: 'Organic Carrots', price: 1.29, image: '' },
    { id: '3', name: 'Whole Wheat Bread', price: 2.49, image: '' },
    { id: '4', name: 'Free-Range Eggs', price: 4.99, image: '' },
];

const groceryGrandOffersItems = [
    { id: '1', name: 'Family Snack Pack', price: 9.99, image: '' },
    { id: '2', name: 'Breakfast Essentials Combo', price: 15.99, image: '' },
    { id: '3', name: 'Organic Veggie Box', price: 22.49, image: '' },
    { id: '4', name: 'Gourmet Cheese Platter', price: 18.99, image: '' },
];

const pharmacyRecentlyBoughtItems = [
    { id: '1', name: 'Ibuprofen 400mg', price: 5.99, image: '' },
    { id: '2', name: 'Vitamin C Tablets', price: 8.99, image: '' },
    { id: '3', name: 'Cold Syrup', price: 12.49, image: '' },
    { id: '4', name: 'Blood Pressure Monitor', price: 45.99, image: '' },
];

const pharmacyGrandOffersItems = [
    { id: '1', name: 'First Aid Kit', price: 25.99, image: '' },
    { id: '2', name: 'Health Supplements Pack', price: 35.99, image: '' },
    { id: '3', name: 'Diabetes Care Kit', price: 42.49, image: '' },
    { id: '4', name: 'Heart Health Supplements', price: 28.99, image: '' },
];

interface Item {
    id: string;
    name: string;
    price: number;
    image: string;
}

interface HorizontallyScrollableSectionProps {
    title: string;
    itemsOverride?: Item[];
    hidePercentOff?: boolean;
    hideWishlist?: boolean;
    showFullName?: boolean;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HorizontallyScrollableSection: React.FC<HorizontallyScrollableSectionProps> = ({
    title,
    itemsOverride,
    hidePercentOff,
    hideWishlist,
    showFullName,
}) => {
    const { theme, section } = useTheme();
    const navigation = useNavigation<NavigationProp>();
    const { selectedStore } = useAppContext();
    const [items, setItems] = useState<Item[]>([]);

    // Set fallback or override data
    useEffect(() => {
        if (itemsOverride && Array.isArray(itemsOverride)) {
            setItems(itemsOverride);
            return;
        }

        const fallbackItems =
            section === 'pharma'
                ? title === 'Recently Bought'
                    ? pharmacyRecentlyBoughtItems
                    : pharmacyGrandOffersItems
                : title === 'Recently Bought'
                ? groceryRecentlyBoughtItems
                : groceryGrandOffersItems;

        setItems(fallbackItems);
    }, [section, title, itemsOverride, selectedStore?.id]);

    const handleProductPress = (product: Item) => {
        navigation.navigate('ProductDetail', { product });
    };

    const cardWidth = Math.min(Dimensions.get('window').width * 0.32, 160);

    const renderItem = ({ item }: { item: Item }) => (
        <ProductCard
            product={item}
            onPress={() => handleProductPress(item)}
            hidePercentOff={hidePercentOff}
            hideWishlist={hideWishlist}
            showFullName={showFullName}
            style={{
                width: cardWidth,
                minHeight: 240,
                marginRight: 6,
                borderRadius: 10,
                backgroundColor: theme.dark ? '#4B3F1D' : '#FFF9E5',
                shadowColor: theme.dark ? '#000' : '#FFD700',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 2,
            }}
        />
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
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