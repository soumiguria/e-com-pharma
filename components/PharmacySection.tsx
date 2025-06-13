import React, { useState, useEffect } from 'react';
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

const pharmacyData: Category[] = [
  {
    id: '1',
    name: 'Medicines',
    subCategories: [
      {
        id: '1-1',
        name: 'Pain Relief',
        products: [
          { id: '1-1-1', name: 'Ibuprofen', price: 5.99 },
          { id: '1-1-2', name: 'Aspirin', price: 3.99 },
        ],
      },
      {
        id: '1-2',
        name: 'Cold & Flu',
        products: [
          { id: '1-2-1', name: 'Cold Syrup', price: 7.49 },
          { id: '1-2-2', name: 'Nasal Spray', price: 6.99 },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Vitamins',
    subCategories: [
      {
        id: '2-1',
        name: 'Multivitamins',
        products: [
          { id: '2-1-1', name: 'Men\'s Multivitamin', price: 12.99 },
          { id: '2-1-2', name: 'Women\'s Multivitamin', price: 12.99 },
        ],
      },
      {
        id: '2-2',
        name: 'Supplements',
        products: [
          { id: '2-2-1', name: 'Vitamin C', price: 8.99 },
          { id: '2-2-2', name: 'Vitamin D', price: 9.99 },
        ],
      },
    ],
  },
];

const PharmacySection = () => {
  const { theme, setSection } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(pharmacyData[0]);

  useEffect(() => {
    setSection('pharmacy');
  }, [setSection]);

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
      <Text style={styles.title}>Pharmacy</Text>
      <FlatList
        data={pharmacyData}
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

export default PharmacySection;