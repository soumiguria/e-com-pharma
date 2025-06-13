import React from 'react';
import { View, StyleSheet, ScrollView, Animated } from 'react-native';
import { Text, Card, Button, Divider } from 'react-native-paper';
import { useAppTheme } from '../hooks/useAppTheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface CartSectionProps {
  scrollY: Animated.Value;
}

const cartItems = [
  { id: '1', name: 'Fresh Apples', price: '$1.99', quantity: 2, image: '🍎' },
  { id: '2', name: 'Organic Bananas', price: '$0.99', quantity: 3, image: '🍌' },
  { id: '3', name: 'Fresh Milk', price: '$2.49', quantity: 1, image: '🥛' },
];

const CartSection: React.FC<CartSectionProps> = ({ scrollY }) => {
  const { colors, typography, spacing, borderRadius, createStyles } = useAppTheme();

  const styles = createStyles(() => ({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: spacing.lg,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
    },
    title: {
      ...typography.h1,
      color: colors.text,
    },
    content: {
      padding: spacing.lg,
    },
    card: {
      marginBottom: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
    },
    cardContent: {
      padding: spacing.md,
    },
    itemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    itemImage: {
      fontSize: 40,
      marginRight: spacing.md,
    },
    itemDetails: {
      flex: 1,
    },
    itemName: {
      ...typography.body1,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    itemPrice: {
      ...typography.body2,
      color: colors.primary,
      fontWeight: 'bold',
    },
    quantityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.sm,
    },
    quantityButton: {
      marginHorizontal: spacing.sm,
    },
    quantityText: {
      ...typography.body1,
      color: colors.text,
    },
    summary: {
      marginTop: spacing.xl,
      padding: spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    summaryText: {
      ...typography.body1,
      color: colors.text,
    },
    summaryTotal: {
      ...typography.h2,
      color: colors.primary,
      fontWeight: 'bold',
    },
    checkoutButton: {
      marginTop: spacing.lg,
    },
  }));

  const total = cartItems.reduce((sum, item) => sum + (parseFloat(item.price.slice(1)) * item.quantity), 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View style={[styles.header, {
        transform: [{
          translateY: scrollY.interpolate({
            inputRange: [0, 100],
            outputRange: [0, -100],
            extrapolate: 'clamp',
          }),
        }],
      }]}>
        <Text style={styles.title}>Shopping Cart</Text>
      </Animated.View>
      <ScrollView style={styles.content}>
        {cartItems.map((item) => (
          <Card key={item.id} style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.itemContainer}>
                <Text style={styles.itemImage}>{item.image}</Text>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>{item.price}</Text>
                  <View style={styles.quantityContainer}>
                    <Button
                      mode="outlined"
                      onPress={() => {}}
                      style={styles.quantityButton}
                      theme={{ roundness: borderRadius.md }}
                    >
                      -
                    </Button>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <Button
                      mode="outlined"
                      onPress={() => {}}
                      style={styles.quantityButton}
                      theme={{ roundness: borderRadius.md }}
                    >
                      +
                    </Button>
                  </View>
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}

        <Card style={styles.summary}>
          <Card.Content>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>Subtotal</Text>
              <Text style={styles.summaryText}>${total.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>Delivery Fee</Text>
              <Text style={styles.summaryText}>$2.99</Text>
            </View>
            <Divider style={{ marginVertical: spacing.md }} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotal}>Total</Text>
              <Text style={styles.summaryTotal}>${(total + 2.99).toFixed(2)}</Text>
            </View>
            <Button
              mode="contained"
              onPress={() => {}}
              style={styles.checkoutButton}
              theme={{ roundness: borderRadius.md }}
            >
              Proceed to Checkout
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CartSection; 