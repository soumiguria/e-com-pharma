import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

const categories = [
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CategoryGrid = () => {
    const { theme } = useTheme();
    const navigation = useNavigation<NavigationProp>();

    const renderItem = ({ item }: { item: typeof categories[0] }) => (
        <TouchableOpacity style={[styles.card, {backgroundColor: theme.colors.surface, borderColor: theme.colors.border}]} onPress={() => navigation.navigate('CategoryDetail', { category: item as any })}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={[styles.name, { color: theme.colors.text }]}>{item.name}</Text>
        </TouchableOpacity>
    );

    return (
        <FlatList
            data={categories}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            numColumns={4}
            columnWrapperStyle={styles.row}
            scrollEnabled={false}
        />
    );
};

const styles = StyleSheet.create({
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
});

export default CategoryGrid; 