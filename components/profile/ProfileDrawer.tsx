import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import ThemeToggle from '../ui/ThemeToggle';

interface DrawerProps {
  onClose: () => void;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Drawer: React.FC<DrawerProps> = ({ onClose }) => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const slideAnim = useRef(new Animated.Value(-320)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: -320,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

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

  // Grouped menu sections
  const menuSections = [
    {
      key: 'main',
      items: [
        { icon: 'clipboard-list', label: 'My Orders', onPress: handleMyOrdersPress },
        { icon: 'map-marker', label: 'Address List', onPress: handleAddressListPress },
        { icon: 'account', label: 'My Profile', onPress: handleMyProfilePress },
        { icon: 'heart', label: 'My Wishlist', onPress: handleMyWishlistPress },
      ],
    },
    {
      key: 'store',
      items: [
        { icon: 'store', label: 'About Store', onPress: handleAboutStorePress },
        { icon: 'phone', label: 'Contact Store', onPress: handleContactStorePress },
        { icon: 'map-marker-radius', label: 'Locate this Store', onPress: handleLocateStorePress },
      ],
    },
    {
      key: 'app',
      items: [
        { icon: 'share-variant', label: 'Share this App', onPress: handleShareAppPress },
        { icon: 'information', label: 'About Pass ki Dukaan', onPress: handleAboutPassKiDukaanPress },
      ],
    },
    {
      key: 'settings',
      items: [
        { icon: 'cog', label: 'Settings', onPress: handleSettingsPress },
        { icon: 'bell', label: 'Notifications', onPress: handleNotificationsPress },
        { icon: 'logout', label: 'Logout', onPress: handleLogoutPress },
      ],
    },
  ];

  const renderMenuSection = (section: any, idx: number) => (
    <View
      key={section.key}
      style={[
        styles.sectionContainer,
        { backgroundColor: theme.colors.surface },
        idx > 0 && { marginTop: 18 },
      ]}
    >
      {section.items.map((item: any, index: number) => (
        <TouchableOpacity
          key={item.label}
          style={[
            styles.menuItem,
            // Remove borderBottom for a cleaner look
            // index !== section.items.length - 1 && { borderBottomColor: '#F2F2F2', borderBottomWidth: 1 },
          ]}
          onPress={item.onPress}
        >
          <MaterialCommunityIcons name={item.icon} size={24} color={theme.colors.primary} />
          <Text style={[styles.menuText, { color: theme.colors.text }]}>{item.label}</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.colors.background,
          transform: [{ translateX: slideAnim }]
        }
      ]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>Menu</Text>
      </View>

      <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
        {menuSections.map(renderMenuSection)}
      </ScrollView>

      <View style={[styles.themeToggleBottomContainer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}> 
        <Text style={[styles.themeLabel, { color: theme.colors.text }]}>Theme</Text>
        <ThemeToggle />
      </View>
    </Animated.View>
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
  menuContainer: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    // No borderBottom for a cleaner look
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
  themeToggleBottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionContainer: {
    borderRadius: 12,
    marginHorizontal: 12,
    paddingVertical: 4,
    overflow: 'hidden',
    // backgroundColor set dynamically
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
});

export default Drawer;