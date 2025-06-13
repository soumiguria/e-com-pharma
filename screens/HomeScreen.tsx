import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  TextInput,
  Platform,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
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

const SearchBar = () => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
      <Ionicons 
        name="search" 
        size={20} 
        color={theme.colors.text + '80'} 
        style={styles.searchIcon} 
      />
      <TextInput
        style={[styles.searchInput, { color: theme.colors.text }]}
        placeholder="Search products..."
        placeholderTextColor={theme.colors.text + '80'}
        value={searchQuery}
        onChangeText={setSearchQuery}
        returnKeyType="search"
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={() => setSearchQuery('')}>
          <Ionicons 
            name="close-circle" 
            size={20} 
            color={theme.colors.text + '80'} 
          />
        </TouchableOpacity>
      )}
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
      <SearchBar />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.text + '80',
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
              <View style={styles.tabIconContainer}>
                <MaterialCommunityIcons 
                  name="basket" 
                  size={size} 
                  color={color} 
                />
              </View>
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
              <View style={styles.tabIconContainer}>
                <MaterialCommunityIcons 
                  name="medical-bag" 
                  size={size} 
                  color={color} 
                />
              </View>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    borderRadius: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Platform.OS === 'ios' ? 4 : 0,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
});

export default HomeScreen;