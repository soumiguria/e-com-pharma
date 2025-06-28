import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { RootStackParamList } from '../navigation/types';
import ThemeToggle from './ThemeToggle';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface DrawerProps {
  onClose: () => void;
}

const Drawer: React.FC<DrawerProps> = ({ onClose }) => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

  const handleChangeStore = () => {
    onClose();
    navigation.navigate('Pincode' as any);
  };

  const handleProfilePress = () => {
    onClose();
    navigation.navigate('Profile' as any);
  };

  const handleOrdersPress = () => {
    onClose();
    navigation.navigate('Orders' as any);
  };

  const handleHelpPress = () => {
    onClose();
    navigation.navigate('HelpCenter' as any);
  };

  const menuItems = [
    {
      icon: 'store' as const,
      label: 'Change Store',
      onPress: handleChangeStore,
    },
    {
      icon: 'account' as const,
      label: 'Profile',
      onPress: handleProfilePress,
    },
    {
      icon: 'clipboard-list' as const,
      label: 'Orders',
      onPress: handleOrdersPress,
    },
    {
      icon: 'help-circle' as const,
      label: 'Help Center',
      onPress: handleHelpPress,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>Menu</Text>
      </View>

      <View style={styles.themeToggleContainer}>
        <Text style={[styles.themeLabel, { color: theme.colors.text }]}>Theme</Text>
        <ThemeToggle />
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuItem, { borderBottomColor: theme.colors.surface }]}
            onPress={item.onPress}
          >
            <MaterialCommunityIcons name={item.icon} size={24} color={theme.colors.primary} />
            <Text style={[styles.menuText, { color: theme.colors.text }]}>{item.label}</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  themeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuContainer: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
  },
});

export default Drawer;