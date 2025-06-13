import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';

const Tab = createBottomTabNavigator();

const GroceryScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Grocery Screen</Text></View>;
const PharmacyScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Pharmacy Screen</Text></View>;
const CartScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Cart Screen</Text></View>;
const OrdersScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Orders Screen</Text></View>;
const AccountScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Account Screen</Text></View>;

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Grocery"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'cart';

          if (route.name === 'Grocery') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Pharmacy') {
            iconName = focused ? 'medical' : 'medical-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'basket' : 'basket-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Account') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Grocery" component={GroceryScreen} />
      <Tab.Screen name="Pharmacy" component={PharmacyScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator; 