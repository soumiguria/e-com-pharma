import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import ProductCard from './ProductCard';
import CategoryCard from './CategoryCard';

interface Product {
  id: string;
  name: string;
  price: number;
}

interface SubCategory {
  id: string;
  name: string;
  products: Product[];
}

interface Category {
  id: string;
  name: string;
  subCategories: SubCategory[];
}

const groceryData: Category[] = [
  {
    id: '1',
    name: 'Fresh Produce',
    subCategories: [
      {
        id: '1-1',
        name: 'Fruits',
        products: [
          { id: '1-1-1', name: 'Apples', price: 2.99 },
          { id: '1-1-2', name: 'Bananas', price: 1.99 },
        ],
      },
      {
        id: '1-2',
        name: 'Vegetables',
        products: [
          { id: '1-2-1', name: 'Carrots', price: 1.49 },
          { id: '1-2-2', name: 'Broccoli', price: 2.49 },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Dairy & Eggs',
    subCategories: [
      {
        id: '2-1',
        name: 'Milk & Cream',
        products: [
          { id: '2-1-1', name: 'Whole Milk', price: 3.49 },
          { id: '2-1-2', name: 'Heavy Cream', price: 2.99 },
        ],
      },
      {
        id: '2-2',
        name: 'Cheese',
        products: [
          { id: '2-2-1', name: 'Cheddar Cheese', price: 4.99 },
          { id: '2-2-2', name: 'Mozzarella Cheese', price: 5.49 },
        ],
      },
    ],
  },
];

const GrocerySection = () => {
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(groceryData[0]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      margin: theme.spacing.md,
    },
    subCategoryTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      margin: theme.spacing.md,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Grocery</Text>
      <FlatList
        data={groceryData}
        renderItem={({ item }) => (
          <CategoryCard
            category={item}
            isSelected={selectedCategory?.id === item.id}
            onPress={() => setSelectedCategory(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
      {selectedCategory && (
        <View>
          {selectedCategory.subCategories.map((subCategory) => (
            <View key={subCategory.id}>
              <Text style={styles.subCategoryTitle}>{subCategory.name}</Text>
              <FlatList
                data={subCategory.products}
                renderItem={({ item }) => <ProductCard product={item} onPress={() => {}} />}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
              />
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default GrocerySection;
