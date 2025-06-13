// HomeScreen.tsx
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import GrocerySection from '../components/GrocerySection';
import PharmacySection from '../components/PharmacySection';
import Drawer from '../components/ProfileDrawer';
import ThemeToggle from '../components/ThemeToggle';

const Tab = createBottomTabNavigator();

const Header = ({ onProfilePress }: { onProfilePress: () => void }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
      <ThemeToggle />
      <TouchableOpacity onPress={onProfilePress}>
        <MaterialCommunityIcons 
          name="account-circle" 
          size={32} 
          color={theme.colors.text} 
        />
      </TouchableOpacity>
    </View>
  );
};

const HomeScreen = () => {
  const { theme, setSection } = useTheme();
  const [scrollY] = useState(new Animated.Value(0));
  const [drawerVisible, setDrawerVisible] = useState(false);

  const toggleDrawer = () => setDrawerVisible(!drawerVisible);

  const tabBarStyle = {
    ...styles.tabBar,
    backgroundColor: theme.colors.surface,
    transform: [{
      translateY: scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [0, 100],
        extrapolate: 'clamp',
      }),
    }],
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />
      <Header onProfilePress={toggleDrawer} />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.text + '80', // Adds 50% opacity to text color
          tabBarShowLabel: true,
          tabBarLabelStyle: styles.tabLabel,
        }}
      >
        <Tab.Screen
          name="Grocery"
          listeners={{
            focus: () => {
              setSection('grocery');
            },
          }}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons 
                name="basket" 
                size={size} 
                color={color} 
                style={styles.tabBarIcon} 
              />
            ),
          }}
        >
          {() => <GrocerySection scrollY={scrollY} />}
        </Tab.Screen>
        <Tab.Screen
          name="Pharmacy"
          listeners={{
            focus: () => {
              setSection('pharmacy');
            },
          }}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons 
                name="medical-bag" 
                size={size} 
                color={color} 
                style={styles.tabBarIcon} 
              />
            ),
          }}
        >
          {() => <PharmacySection scrollY={scrollY} />}
        </Tab.Screen>
      </Tab.Navigator>

      {drawerVisible && <Drawer onClose={toggleDrawer} />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    paddingBottom: 10,
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabBarIcon: {
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
});

export default HomeScreen;