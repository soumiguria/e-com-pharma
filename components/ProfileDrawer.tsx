import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import ThemeToggle from './ThemeToggle';

interface DrawerProps {
  onClose: () => void;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Drawer: React.FC<DrawerProps> = ({ onClose }) => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

  const handleMyOrdersPress = () => {
    onClose();
    navigation.navigate('Orders' as any);
  };

  const handleAddressListPress = () => {
    onClose();
    navigation.navigate('MyAddresses' as any);
  };

  const handleMyProfilePress = () => {
    onClose();
    navigation.navigate('Profile' as any);
  };

  const handleMyWishlistPress = () => {
    onClose();
    navigation.navigate('MyWishlist' as any);
  };

  const handleAboutStorePress = () => {
    onClose();
    navigation.navigate('AboutStore' as any);
  };

  const handleContactStorePress = () => {
    onClose();
    navigation.navigate('ContactStore' as any);
  };

  const handleLocateStorePress = () => {
    onClose();
    navigation.navigate('LocateStore' as any);
  };

  const handleShareAppPress = () => {
    onClose();
    // Share app functionality - can be implemented later
    console.log('Share app pressed');
  };

  const handleAboutPassKiDukaanPress = () => {
    onClose();
    navigation.navigate('AboutPassKiDukaan' as any);
  };

  const handleSettingsPress = () => {
    onClose();
    navigation.navigate('Settings' as any);
  };

  const handleNotificationsPress = () => {
    onClose();
    navigation.navigate('Notifications' as any);
  };

  const handleLogoutPress = () => {
    onClose();
    // Logout functionality - can be implemented later
    console.log('Logout pressed');
  };

  const menuItems = [
    // Main menu items
    {
      icon: 'clipboard-list' as const,
      label: 'My Orders',
      onPress: handleMyOrdersPress,
    },
    {
      icon: 'map-marker' as const,
      label: 'Address List',
      onPress: handleAddressListPress,
    },
    {
      icon: 'account' as const,
      label: 'My Profile',
      onPress: handleMyProfilePress,
    },
    {
      icon: 'heart' as const,
      label: 'My Wishlist',
      onPress: handleMyWishlistPress,
    },
    // Separator
    { type: 'separator' as const },
    // Store related items
    {
      icon: 'store' as const,
      label: 'About Store',
      onPress: handleAboutStorePress,
    },
    {
      icon: 'phone' as const,
      label: 'Contact Store',
      onPress: handleContactStorePress,
    },
    {
      icon: 'map-marker-radius' as const,
      label: 'Locate this Store',
      onPress: handleLocateStorePress,
    },
    // Separator
    { type: 'separator' as const },
    // App related items
    {
      icon: 'share-variant' as const,
      label: 'Share this App',
      onPress: handleShareAppPress,
    },
    {
      icon: 'information' as const,
      label: 'About Pass ki Dukaan',
      onPress: handleAboutPassKiDukaanPress,
    },
    // Separator
    { type: 'separator' as const },
    // Settings and logout
    {
      icon: 'cog' as const,
      label: 'Settings',
      onPress: handleSettingsPress,
    },
    {
      icon: 'bell' as const,
      label: 'Notifications',
      onPress: handleNotificationsPress,
    },
    {
      icon: 'logout' as const,
      label: 'Logout',
      onPress: handleLogoutPress,
    },
  ];

  const renderMenuItem = (item: any, index: number) => {
    if (item.type === 'separator') {
      return (
        <View 
          key={`separator-${index}`} 
          style={[styles.separator, { backgroundColor: theme.colors.border }]} 
        />
      );
    }

    return (
      <TouchableOpacity
        key={index}
        style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}
        onPress={item.onPress}
      >
        <MaterialCommunityIcons name={item.icon} size={24} color={theme.colors.primary} />
        <Text style={[styles.menuText, { color: theme.colors.text }]}>{item.label}</Text>
        <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.text} />
      </TouchableOpacity>
    );
  };

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

      <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
        {menuItems.map((item, index) => renderMenuItem(item, index))}
      </ScrollView>
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
    maxWidth: 320,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
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
    fontWeight: '600',
  },
  menuContainer: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16,
  },
  separator: {
    height: 1,
    marginVertical: 8,
    marginHorizontal: 16,
  },
});

export default Drawer;