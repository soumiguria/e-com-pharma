import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import ProductCard from './ProductCard';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

const recentlyBoughtItems = [
    { id: '1', name: 'Fresh Organic Apples', price: 3.99, image: 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: '2', name: 'Organic Carrots', price: 1.29, image: 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: '3', name: 'Whole Wheat Bread', price: 2.49, image: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: '4', name: 'Free-Range Eggs', price: 4.99, image: 'https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
];

const grandOffersItems = [
    { id: '1', name: 'Family Snack Pack', price: 9.99, image: 'https://images.pexels.com/photos/212936/pexels-photo-212936.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: '2', name: 'Breakfast Essentials Combo', price: 15.99, image: 'https://images.pexels.com/photos/2641886/pexels-photo-2641886.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: '3', name: 'Organic Veggie Box', price: 22.49, image: 'https://images.pexels.com/photos/2255935/pexels-photo-2255935.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: '4', name: 'Gourmet Cheese Platter', price: 18.99, image: 'https://images.pexels.com/photos/1482803/pexels-photo-1482803.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
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
    const { theme } = useTheme();
    const navigation = useNavigation<NavigationProp>();

    const items = title === 'Recently Bought' ? recentlyBoughtItems : grandOffersItems;

    const handleProductPress = (product: any) => {
        navigation.navigate('ProductDetail', { product });
    };

    const renderItem = ({ item }: { item: Item }) => (
        <View style={styles.card}>
            <ProductCard product={item} onPress={() => handleProductPress(item)} style={{ width: Dimensions.get('window').width / 3.5, height: 200 }}/>
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
        paddingHorizontal: 16,
    },
    card: {
        marginRight: 12,
    }
});

export default HorizontallyScrollableSection; 