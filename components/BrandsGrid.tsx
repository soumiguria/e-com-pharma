import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const brands = [
    { id: '1', name: 'Coca-Cola', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Coca-Cola_logo.svg/2560px-Coca-Cola_logo.svg.png' },
    { id: '2', name: 'Pepsi', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Pepsi_logo_2014.svg/2560px-Pepsi_logo_2014.svg.png' },
    { id: '3', name: 'Nestle', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Nestle_logo.svg/2560px-Nestle_logo.svg.png' },
    { id: '4', name: 'Procter & Gamble', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Procter_%26_Gamble_logo.svg/2560px-Procter_%26_Gamble_logo.svg.png' },
    { id: '5', name: 'Unilever', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_Unilever.svg/2560px-Logo_Unilever.svg.png' },
    { id: '6', name: 'Lays', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Lay%27s_logo_2019.svg/2560px-Lay%27s_logo_2019.svg.png' },
    { id: '7', name: 'Cadbury', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Cadbury_logo.svg/2560px-Cadbury_logo.svg.png' },
    { id: '8', name: 'Britannia', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Britannia_Industries_logo.svg/2560px-Britannia_Industries_logo.svg.png' },
];

const BrandsGrid = () => {
    const { theme } = useTheme();

    const renderItem = ({ item }: { item: typeof brands[0] }) => (
        <TouchableOpacity style={[styles.card, {backgroundColor: theme.colors.surface, borderColor: theme.colors.border}]}>
            <Image source={{ uri: item.image }} style={styles.image} resizeMode="contain" />
        </TouchableOpacity>
    );

    return (
        <FlatList
            data={brands}
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
        width: 60,
        height: 60,
    },
});

export default BrandsGrid; 