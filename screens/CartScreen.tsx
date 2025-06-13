// import React from 'react';
// import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useAppContext } from '../contexts/AppContext';
// import ThemedButton from '../components/ThemedButton';
// import { useTheme } from '../contexts/ThemeContext';

// const CartScreen = () => {
//   const { cart, setCart } = useAppContext();
//   const { theme } = useTheme();

//   const updateQuantity = (id: string, change: number) => {
//     setCart(
//       cart.map((item) =>
//         item.id === id
//           ? { ...item, quantity: Math.max(0, item.quantity + change) }
//           : item
//       )
//     );
//   };

//   const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

//   const styles = StyleSheet.create({
//     container: {
//       flex: 1,
//       backgroundColor: theme.colors.background,
//       padding: theme.spacing.md,
//     },
//     cartItem: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//       padding: theme.spacing.md,
//       borderBottomWidth: 1,
//       borderBottomColor: theme.colors.surface,
//     },
//     itemName: {
//       fontSize: 16,
//       fontWeight: 'bold',
//       color: theme.colors.text,
//     },
//     itemPrice: {
//       fontSize: 16,
//       color: theme.colors.text,
//     },
//     quantityContainer: {
//       flexDirection: 'row',
//       alignItems: 'center',
//     },
//     quantityButton: {
//       fontSize: 20,
//       padding: theme.spacing.sm,
//       color: theme.colors.primary,
//     },
//     quantity: {
//       fontSize: 16,
//       marginHorizontal: theme.spacing.md,
//       color: theme.colors.text,
//     },
//     totalContainer: {
//       marginTop: theme.spacing.lg,
//       alignItems: 'center',
//     },
//     totalText: {
//       fontSize: 18,
//       fontWeight: 'bold',
//       marginBottom: theme.spacing.md,
//       color: theme.colors.text,
//     },
//   });

//   return (
//     <SafeAreaView style={styles.container}>
//       <FlatList
//         data={cart}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <View style={styles.cartItem}>
//             <Text style={styles.itemName}>{item.name}</Text>
//             <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
//             <View style={styles.quantityContainer}>
//               <TouchableOpacity onPress={() => updateQuantity(item.id, -1)}>
//                 <Text style={styles.quantityButton}>-</Text>
//               </TouchableOpacity>
//               <Text style={styles.quantity}>{item.quantity}</Text>
//               <TouchableOpacity onPress={() => updateQuantity(item.id, 1)}>
//                 <Text style={styles.quantityButton}>+</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         )}
//       />
//       <View style={styles.totalContainer}>
//         <Text style={styles.totalText}>Total: ${totalPrice.toFixed(2)}</Text>
//         <ThemedButton title="Checkout" onPress={() => {}} />
//       </View>
//     </SafeAreaView>
//   );
// };

// export default CartScreen; 

// CartScreen.tsx
import React from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useCart } from '../contexts/CartContext';
import CartItem from '../components/CartItem';
import ThemedButton from '../components/ThemedButton';

const CartScreen = () => {
  const { theme } = useTheme();
  const { 
    groceryCart, 
    pharmacyCart, 
    removeFromGroceryCart, 
    removeFromPharmacyCart 
  } = useCart();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginVertical: theme.spacing.md,
    },
    sectionContainer: {
      marginBottom: theme.spacing.lg,
    },
    emptyText: {
      color: theme.colors.secondary,
      textAlign: 'center',
      marginVertical: theme.spacing.md,
    },
    totalContainer: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: theme.spacing.md,
      marginTop: theme.spacing.md,
    },
    totalText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      textAlign: 'right',
    },
    checkoutButton: {
      marginTop: theme.spacing.lg,
    },
  });

  const calculateTotal = (items: any[]) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const groceryTotal = calculateTotal(groceryCart);
  const pharmacyTotal = calculateTotal(pharmacyCart);
  const overallTotal = groceryTotal + pharmacyTotal;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Grocery Items</Text>
          {groceryCart.length === 0 ? (
            <Text style={styles.emptyText}>No grocery items in cart</Text>
          ) : (
            <>
              <FlatList
                data={groceryCart}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <CartItem 
                    item={item} 
                    onRemove={() => removeFromGroceryCart(item.id)} 
                  />
                )}
              />
              <View style={styles.totalContainer}>
                <Text style={styles.totalText}>
                  Grocery Total: ${groceryTotal.toFixed(2)}
                </Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Pharmacy Items</Text>
          {pharmacyCart.length === 0 ? (
            <Text style={styles.emptyText}>No pharmacy items in cart</Text>
          ) : (
            <>
              <FlatList
                data={pharmacyCart}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <CartItem 
                    item={item} 
                    onRemove={() => removeFromPharmacyCart(item.id)} 
                  />
                )}
              />
              <View style={styles.totalContainer}>
                <Text style={styles.totalText}>
                  Pharmacy Total: ${pharmacyTotal.toFixed(2)}
                </Text>
              </View>
            </>
          )}
        </View>

        {overallTotal > 0 && (
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>
              Order Total: ${overallTotal.toFixed(2)}
            </Text>
          </View>
        )}
      </ScrollView>

      {overallTotal > 0 && (
        <ThemedButton 
          title="Proceed to Checkout" 
          onPress={() => {}} 
          style={styles.checkoutButton}
        />
      )}
    </SafeAreaView>
  );
};

export default CartScreen;