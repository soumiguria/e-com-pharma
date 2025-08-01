import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../hooks/useAppTheme';
import GrocerySection from '../components/GrocerySection';
import PharmacySection from '../components/PharmacySection';
import Drawer from '../components/ProfileDrawer'; // You’ll create this

const Tab = createBottomTabNavigator();

const Header = ({ onProfilePress }: { onProfilePress: () => void }) => {
  const { colors, spacing } = useAppTheme();
  return (
    <View style={{
      padding: spacing.md,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      backgroundColor: colors.background,
    }}>
      <TouchableOpacity onPress={onProfilePress}>
        <MaterialCommunityIcons name="account-circle" size={28} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
};

const HomeScreen = () => {
  const { colors, spacing, createStyles } = useAppTheme();
  const [scrollY] = useState(new Animated.Value(0));
  const [drawerVisible, setDrawerVisible] = useState(false);

  const styles = createStyles(() => ({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    tabBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.surface,
      borderTopWidth: 0,
      height: 60,
      paddingBottom: spacing.sm,
    },
    tabBarIcon: {
      marginBottom: spacing.xs,
    },
  }));

  const tabBarStyle = {
    ...styles.tabBar,
    transform: [{
      translateY: scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [0, 100],
        extrapolate: 'clamp',
      }),
    }],
  };

  const toggleDrawer = () => setDrawerVisible(!drawerVisible);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header onProfilePress={toggleDrawer} />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.text,
          tabBarShowLabel: true,
        }}
      >
        <Tab.Screen
          name="Grocery"
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="basket" size={size} color={color} style={styles.tabBarIcon} />
            ),
          }}
        >
          {() => <GrocerySection scrollY={scrollY} />}
        </Tab.Screen>
        <Tab.Screen
          name="Pharmacy"
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="medical-bag" size={size} color={color} style={styles.tabBarIcon} />
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

export default HomeScreen;
