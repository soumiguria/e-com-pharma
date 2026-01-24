// import React, { useState } from 'react';
// import { View, StyleSheet, ScrollView, Platform, TouchableOpacity, Image } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Card, Text, Button, Badge } from 'native-base';
// import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
// import { StackNavigationProp } from '@react-navigation/stack';
// import { useTheme } from '../../contexts/ThemeContext';
// import { RootStackParamList } from '../../navigation/types';
// import { LinearGradient } from 'expo-linear-gradient';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { useAppContext } from '../../contexts/AppContext';
// import { MaterialIcons } from '@expo/vector-icons';

// type NavigationProp = StackNavigationProp<RootStackParamList, 'StoreList'>;
// type StoreListRouteProp = RouteProp<RootStackParamList, 'StoreList'>;

// interface Store {
//   id: string;
//   name: string;
//   type: 'grocery' | 'pharmacy';
//   address: string;
//   distance: string;
//   rating: number;
//   image?: string;
//   totalItems?: number;
// }

// const mockedStores: Store[] = [
//   {
//     id: '1',
//     name: 'Fresh Grocery Store',
//     type: 'grocery',
//     address: '123 Main Street, Downtown',
//     distance: '0.5 km',
//     rating: 4.5,
//     image: 'https://randomuser.me/api/portraits/men/1.jpg',
//     totalItems: 120,
//   },
//   {
//     id: '2',
//     name: 'Quick Pharmacy',
//     type: 'pharmacy',
//     address: '456 Park Avenue, Downtown',
//     distance: '1.2 km',
//     rating: 4.2,
//     image: 'https://randomuser.me/api/portraits/women/2.jpg',
//     totalItems: 80,
//   },
//   {
//     id: '3',
//     name: 'Neighborhood Market',
//     type: 'grocery',
//     address: '789 Oak Road, Westside',
//     distance: '2.0 km',
//     rating: 4.0,
//     image: 'https://randomuser.me/api/portraits/men/3.jpg',
//     totalItems: 95,
//   },
//   {
//     id: '4',
//     name: 'City Pharmacy',
//     type: 'pharmacy',
//     address: '321 Pine Street, Eastside',
//     distance: '1.8 km',
//     rating: 4.3,
//     image: 'https://randomuser.me/api/portraits/women/4.jpg',
//     totalItems: 60,
//   },
//   {
//     id: '5',
//     name: 'Health First Pharmacy',
//     type: 'pharmacy',
//     address: '567 Elm Street, Northside',
//     distance: '0.8 km',
//     rating: 4.7,
//     image: 'https://randomuser.me/api/portraits/men/5.jpg',
//     totalItems: 150,
//   },
//   {
//     id: '6',
//     name: 'MediCare Pharmacy',
//     type: 'pharmacy',
//     address: '890 Maple Drive, Southside',
//     distance: '1.5 km',
//     rating: 4.4,
//     image: 'https://randomuser.me/api/portraits/women/6.jpg',
//     totalItems: 90,
//   },
//   {
//     id: '7',
//     name: 'Organic Foods Market',
//     type: 'grocery',
//     address: '234 Green Street, Central',
//     distance: '1.0 km',
//     rating: 4.6,
//     image: 'https://randomuser.me/api/portraits/men/7.jpg',
//     totalItems: 85,
//   },
//   {
//     id: '8',
//     name: 'Wellness Pharmacy',
//     type: 'pharmacy',
//     address: '456 Wellness Blvd, Westside',
//     distance: '2.2 km',
//     rating: 4.1,
//     image: 'https://randomuser.me/api/portraits/women/8.jpg',
//     totalItems: 75,
//   },
// ];

// const StoreListScreen = () => {
//   const navigation = useNavigation<NavigationProp>();
//   const route = useRoute<StoreListRouteProp>();
//   const { theme, section } = useTheme();
//   const { colors, typography, spacing, borderRadius, shadows } = theme;
//   const { pincode } = route.params;
//   const [activeTab, setActiveTab] = useState<'grocery' | 'pharmacy'>(section === 'pharmacy' ? 'pharmacy' : 'grocery');
//   const { setSelectedStore } = useAppContext();

//   const handleStoreSelect = (store: Store) => {
//     setSelectedStore(store);
//     navigation.navigate('Main', {
//       screen: 'Home',
//       params: {
//         screen: 'HomeRoot',
//         params: {
//           storeId: store.id,
//           pincode: pincode,
//         },
//       },
//     });    
//   };

//   const filteredStores = mockedStores.filter(store => store.type === activeTab);

//   const getGradientColors = () => {
//     if (activeTab === 'grocery') {
//       return [colors.grocery.primary, colors.grocery.secondary];
//     } else {
//       return [colors.pharmacy.primary, colors.pharmacy.secondary];
//     }
//   };

//   const getTabColors = () => {
//     if (activeTab === 'grocery') {
//       return {
//         activeTab: colors.grocery.primary,
//         activeText: colors.surface,
//         inactiveText: colors.text,
//       };
//     } else {
//       return {
//         activeTab: colors.pharmacy.primary,
//         activeText: colors.surface,
//         inactiveText: colors.text,
//       };
//     }
//   };

//   const tabColors = getTabColors();

//   const styles = StyleSheet.create({
//     container: {
//       flex: 1,
//       backgroundColor: colors.background,
//     },
//     gradient: {
//       flex: 1,
//     },
//     content: {
//       padding: spacing.lg,
//     },
//     header: {
//       marginBottom: spacing.lg,
//     },
//     title: {
//       ...typography.h1,
//       color: colors.surface,
//       marginBottom: spacing.xs,
//     },
//     subtitle: {
//       ...typography.body1,
//       color: colors.surface,
//       opacity: 0.7,
//     },
//     tabContainer: {
//       flexDirection: 'row',
//       marginBottom: spacing.lg,
//       backgroundColor: colors.surface,
//       borderRadius: borderRadius.lg,
//       padding: 4,
//       ...Platform.select({
//         ios: {
//           shadowColor: colors.text,
//           shadowOffset: { width: 0, height: 2 },
//           shadowOpacity: 0.1,
//           shadowRadius: 8,
//         },
//         android: {
//           elevation: 4,
//         },
//       }),
//     },
//     tab: {
//       flex: 1,
//       paddingVertical: spacing.sm,
//       alignItems: 'center',
//       borderRadius: borderRadius.md,
//     },
//     activeTab: {
//       backgroundColor: tabColors.activeTab,
//     },
//     tabText: {
//       fontSize: 16,
//       fontWeight: '600',
//       color: tabColors.inactiveText,
//     },
//     activeTabText: {
//       color: tabColors.activeText,
//     },
//     card: {
//       marginBottom: spacing.md,
//       backgroundColor: colors.surface,
//       borderRadius: borderRadius.lg,
//       ...Platform.select({
//         ios: {
//           shadowColor: colors.text,
//           shadowOffset: { width: 0, height: 2 },
//           shadowOpacity: 0.1,
//           shadowRadius: 8,
//         },
//         android: {
//           elevation: 4,
//         },
//       }),
//     },
//     cardContent: {
//       padding: spacing.lg,
//     },
//     storeHeader: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//       marginBottom: spacing.sm,
//     },
//     storeName: {
//       ...typography.h2,
//       color: colors.text,
//       flex: 1,
//     },
//     storeType: {
//       marginLeft: spacing.sm,
//     },
//     storeAddress: {
//       ...typography.body1,
//       color: colors.text,
//       opacity: 0.7,
//       marginBottom: spacing.sm,
//     },
//     storeInfo: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       marginBottom: spacing.md,
//     },
//     storeDistance: {
//       ...typography.body2,
//       color: activeTab === 'grocery' ? colors.grocery.primary : colors.pharmacy.primary,
//       marginRight: spacing.md,
//     },
//     storeRating: {
//       flexDirection: 'row',
//       alignItems: 'center',
//     },
//     button: {
//       marginTop: spacing.sm,
//     },
//   });

//   return (
//     <SafeAreaView style={styles.container}>
//       <LinearGradient
//         colors={getGradientColors()}
//         style={styles.gradient}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//       >
//         <ScrollView 
//           style={styles.content}
//           contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
//           showsVerticalScrollIndicator={false}
//         >
//           <View style={styles.header}>
//             <Text style={styles.title}>Stores Near You</Text>
//             <Text style={styles.subtitle}>Pincode: {pincode}</Text>
//           </View>

//           <View style={styles.tabContainer}>
//             <TouchableOpacity
//               style={[
//                 styles.tab,
//                 activeTab === 'grocery' && styles.activeTab
//               ]}
//               onPress={() => setActiveTab('grocery')}
//             >
//               <Text style={[
//                 styles.tabText,
//                 activeTab === 'grocery' && styles.activeTabText
//               ]}>
//                 Grocery Stores
//               </Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[
//                 styles.tab,
//                 activeTab === 'pharmacy' && styles.activeTab
//               ]}
//               onPress={() => setActiveTab('pharmacy')}
//             >
//               <Text style={[
//                 styles.tabText,
//                 activeTab === 'pharmacy' && styles.activeTabText
//               ]}>
//                 Pharmacy Stores
//               </Text>
//             </TouchableOpacity>
//           </View>
          
//           {filteredStores.map((store) => (
//             <Card key={store.id} style={styles.card}>
//               <Card.Content style={styles.cardContent}>
//                 <View style={styles.storeHeader}>
//                   <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
//                     <Image
//                       source={store.image ? { uri: store.image } : require('../../assets/icon.png')}
//                       style={{ width: 32, height: 32, borderRadius: 16, marginRight: 10 }}
//                     />
//                     <Text style={styles.storeName}>{store.name}</Text>
//                   </View>
//                   <MaterialIcons name="call" size={20} color={colors.primary} />
//                 </View>
//                 <Text style={styles.storeAddress}>{store.address}</Text>
//                 <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
//                     <Text style={{ color: colors.secondary, fontSize: 13, marginRight: 4 }}>Total items:</Text>
//                     <Text style={{ color: colors.secondary, fontSize: 13, marginRight: 12 }}>{store.totalItems || 0}</Text>
//                 </View>
//                 <View style={styles.storeInfo}>
//                   <Text style={styles.storeDistance}>{store.distance}</Text>
//                   <View style={styles.storeRating}>
//                     <MaterialCommunityIcons
//                       name="star"
//                       size={16}
//                       color={store.type === 'grocery' ? colors.grocery.primary : colors.pharmacy.primary}
//                     />
//                     <Text style={{ marginLeft: 4 }}>{store.rating}</Text>
//                   </View>
//                 </View>
//                 <Button
//                   mode="contained"
//                   onPress={() => handleStoreSelect(store)}
//                   style={styles.button}
//                   theme={{
//                     roundness: borderRadius.md,
//                     colors: {
//                       primary: store.type === 'grocery' ? colors.grocery.primary : colors.pharmacy.primary,
//                     },
//                   }}
//                 >
//                   Select Store
//                 </Button>
//               </Card.Content>
//             </Card>
//           ))}
//         </ScrollView>
//       </LinearGradient>
//     </SafeAreaView>
//   );
// };

// export default StoreListScreen; 


import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform, TouchableOpacity, Image, ActivityIndicator, Linking, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Text, Button } from 'native-base';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../../contexts/ThemeContext';
import { RootStackParamList } from '../../navigation/types';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useAppContext } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import * as Location from 'expo-location';
import storeService, { formatStoreAddress, createAddressFromCoordinates } from '../../services/api/storeService';

type NavigationProp = StackNavigationProp<RootStackParamList, 'StoreList'>;
type StoreListRouteProp = RouteProp<RootStackParamList, 'StoreList'>;

interface Store {
  id: string;
  name: string;
  type: 'grocery' | 'pharma';
  address: string;
  distance: string;
  rating: number;
  image?: string;
  pincode?: string;
  mobile?: string;
  totalItems?: number;
}

const StoreListScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<StoreListRouteProp>();
  const { theme, section, setSection } = useTheme();
  const { colors, typography, spacing, borderRadius } = theme;
  const { pincode, latitude, longitude, address } = route.params;
  const [activeTab, setActiveTab] = useState<'grocery' | 'pharma'>(
    route.params?.storeType ?? section
  );
  const { setSelectedStore, saveLastVisitedStore } = useAppContext();
  const { isAuthenticated } = useAuth();

  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Keep StoreList tab in sync with navbar selection / route param
  useEffect(() => {
    const desiredTab: 'grocery' | 'pharma' = route.params?.storeType ?? section;
    if (desiredTab !== activeTab) {
      setActiveTab(desiredTab);
    }
  }, [route.params?.storeType, section, activeTab]);

  const handleStoreSelect = (store: Store) => {
    // Ensure store has proper type based on activeTab
    const storeWithType = {
      ...store,
      type: store.type || activeTab,
      pincode: store.pincode || pincode,
    };
    
    setSelectedStore(storeWithType);
    // Always save as last visited store (both grocery and pharmacy separately)
    console.log('💾 Saving store as last visited in StoreListScreen:', storeWithType);
    saveLastVisitedStore(storeWithType);
    
    // Set section based on store type to ensure correct categories are shown
    if (storeWithType.type === 'pharma') {
      setSection('pharma');
    } else if (storeWithType.type === 'grocery') {
      setSection('grocery');
    }
    
    navigation.navigate('Main', {
      screen: 'Home',
      params: {
        screen: 'HomeRoot',
        params: {
          storeId: storeWithType.id,
          pincode: pincode || address || storeWithType.pincode,
          storeType: storeWithType.type,
          storeName: storeWithType.name,
        },
      },
    });    
  };

  const handleCallStore = (phoneNumber: string) => {
    const phoneUrl = `tel:${phoneNumber}`;
    Linking.openURL(phoneUrl).catch(err => {
      console.error('Failed to open phone dialer:', err);
    });
  };

  // Helper: map backend shape to UI Store shape
  const mapStore = (raw: any): Store => {
    const type = (raw.type || raw.storeType || activeTab) as 'grocery' | 'pharma';
    return {
      id: raw.storeId || raw.id || String(Math.random()),
      name: raw.name || raw.storeName || 'Store',
      type,
      address: raw.address || raw.location?.address || '—',
      distance: raw.distance ? `${parseFloat(raw.distance).toFixed(1)} km away from your location` : '',
      // rating: Number(raw.rating ?? raw.avgRating ?? 4.2),
      image: raw.image || raw.logo || undefined,
      pincode: raw.pincode || raw.address?.pincode || pincode,
      mobile: raw.mobile,
      // totalItems: raw.totalItems || raw.itemCount || 0,
    } as Store;
  };

  // Helper: fetch detailed store information and update address
  const fetchStoreDetails = async (store: Store): Promise<Store> => {
    try {
      console.log('🏪 Fetching detailed store info for:', store.id);
      const response = await storeService.getStoreDetailsById(store.id);
      if (response.success && response.data) {
        // API wrapper: { status, message, data: { ...store } } OR direct store
        const payload: any = response.data;
        const detailedStore = payload.data || payload;

        const coordinates = detailedStore.location?.coordinates as [number, number] | undefined;
        const apiAddress =
          detailedStore.address ||
          detailedStore.config?.address ||
          null;

        let finalAddress = store.address;

        // 1) Try formatted API address ONLY if there is at least some address data
        const hasAnyAddressField =
          !!apiAddress &&
          [
            apiAddress.address1,
            apiAddress.address2,
            apiAddress.city,
            apiAddress.state,
            apiAddress.pincode,
            apiAddress.country,
          ].some((part: any) => typeof part === 'string' && part.trim().length > 0);

        if (hasAnyAddressField && coordinates) {
          finalAddress = formatStoreAddress(apiAddress, coordinates);
        }
        // 2) If no address fields but we have coordinates, reverse geocode on device
        else if (coordinates && coordinates.length === 2) {
          try {
            const [latitude, longitude] = coordinates;
            console.log('🗺️ Reverse geocoding coordinates for store:', {
              id: store.id,
              latitude,
              longitude,
            });

            const results = await Location.reverseGeocodeAsync({
              latitude,
              longitude,
            });

            if (results && results.length > 0) {
              const r = results[0];
              const parts = [
                r.name,
                r.street,
                r.city || r.subregion,
                r.region,
                r.postalCode,
                r.country,
              ].filter(Boolean);

              if (parts.length > 0) {
                finalAddress = parts.join(', ');
              } else {
                finalAddress = createAddressFromCoordinates(latitude, longitude);
              }
            } else {
              finalAddress = createAddressFromCoordinates(latitude, longitude);
            }
          } catch (geoError) {
            console.warn('⚠️ Reverse geocoding failed for store', store.id, geoError);
            if (coordinates && coordinates.length === 2) {
              const [lat, lng] = coordinates;
              finalAddress = createAddressFromCoordinates(lat, lng);
            }
          }
        }

        console.log('🏪 Store address updated:', finalAddress);

        // Extract pincode from API response
        const storePincode = apiAddress?.pincode || detailedStore.pincode || store.pincode || pincode;

        return {
          ...store,
          address: finalAddress || 'Store address not available',
          pincode: storePincode,
          mobile: String(detailedStore.mobile || store.mobile || ''),
        };
      }
    } catch (error) {
      console.error('❌ Error fetching store details for', store.id, ':', error);
    }
    return store;
  };

  // Fetch data from API based on active tab (type)
  const fetchStores = async (isRefresh = false) => {
    if (!isRefresh) {
      setLoading(true);
    }
    try {
      let response;
      // Use location-based API if coordinates are available, otherwise fall back to pincode
      if (latitude && longitude) {
        console.log('📍 Using location-based API:', { latitude, longitude, activeTab });
        response = await storeService.exploreStoresByLocation(latitude, longitude, activeTab);
      } else if (pincode) {
        console.log('📮 Using pincode-based API:', { pincode, activeTab });
        response = await storeService.exploreStores(pincode || '110001', activeTab);
      } else {
        throw new Error('No location data available');
      }
      
      // Log API response (success or failure)
      console.log('📦 StoreListScreen - API Response Received:');
      console.log('   Success:', response.success);
      console.log('   Error:', response.error || 'None');
      console.log('   Response Data:', JSON.stringify(response.data, null, 2));
      console.log('   Full Response:', JSON.stringify(response, null, 2));
      
      const raw: any = response.data;
      const list: any[] = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
      const mapped: Store[] = (list as any[]).map(mapStore).filter((s: Store) => s.type === activeTab);
      
      // Fetch detailed store information for each store to get proper addresses
      const storesWithDetails = await Promise.all(
        mapped.map(store => fetchStoreDetails(store))
      );
      
      setStores(storesWithDetails.length > 0 ? storesWithDetails : []);
    } catch (error: any) {
      console.error('❌ Error fetching stores in StoreListScreen:');
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      console.error('❌ Error response data:', JSON.stringify(error.response?.data, null, 2));
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Full error object:', JSON.stringify(error, null, 2));
      setStores([]);
    } finally {
      if (!isRefresh) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchStores();
  }, [pincode, latitude, longitude, activeTab]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStores(true);
    setRefreshing(false);
  };

  const filteredStores = stores; // already filtered by type

  const getGradientColors = (): [string, string] => {
    return activeTab === 'grocery'
      ? [colors.grocery.primary, colors.grocery.secondary]
      : [colors.pharma.primary, colors.pharma.secondary];
  };

  const getTabColors = () => {
    return activeTab === 'grocery'
      ? { activeTab: colors.grocery.primary, activeText: colors.surface, inactiveText: colors.text }
      : { activeTab: colors.pharma.primary, activeText: colors.surface, inactiveText: colors.text };
  };

  const tabColors = getTabColors();

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    gradient: { flex: 1 },
    content: { padding: spacing.md },
    header: { marginBottom: spacing.lg },
    title: { ...typography.h1, color: colors.surface, marginBottom: spacing.xs },
    subtitle: { ...typography.body1, color: colors.surface, opacity: 0.7 },
    tabContainer: {
      flexDirection: 'row',
      marginBottom: spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: 4,
      ...Platform.select({
        ios: { shadowColor: colors.text, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
        android: { elevation: 4 },
      }),
    },
    tab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: borderRadius.md },
    activeTab: { backgroundColor: tabColors.activeTab },
    tabText: { fontSize: 16, fontWeight: '600', color: tabColors.inactiveText },
    activeTabText: { color: tabColors.activeText },
    card: {
      marginBottom: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      ...Platform.select({
        ios: { shadowColor: colors.text, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
        android: { elevation: 4 },
      }),
    },
    cardContent: { padding: spacing.md },
    storeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
    storeName: { ...typography.h2, color: colors.text, flex: 1 },
    storeAddress: { ...typography.body1, color: colors.text, opacity: 0.7, marginBottom: spacing.sm },
    storeInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
    storeDistance: {
      ...typography.body2,
      color: activeTab === 'grocery' ? colors.grocery.primary : colors.pharma.primary,
      marginRight: spacing.md,
    },
    storeRating: { flexDirection: 'row', alignItems: 'center' },
    button: { marginTop: spacing.sm },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xl,
    },
    emptyStateTitle: {
      ...typography.h2,
      color: colors.text,
      marginTop: spacing.md,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    emptyStateSubtitle: {
      ...typography.body1,
      color: colors.surface,
      textAlign: 'center',
      marginBottom: spacing.sm,
      lineHeight: 24,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={getGradientColors()} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <ScrollView 
            style={styles.content} 
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }} 
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <View style={styles.header}>
              <Text style={styles.title}>Stores Near You</Text>
              <Text style={styles.subtitle}>
                {address || (pincode ? `Pincode: ${pincode}` : 'Location not available')}
              </Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'pharma' && styles.activeTab]}
              onPress={() => {
                setActiveTab('pharma');
                setSection('pharma');
                navigation.setParams({ storeType: 'pharma' } as any);
              }}
            >
                <Text style={[styles.tabText, activeTab === 'pharma' && styles.activeTabText]}>Pharmacy Stores</Text>
            </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'grocery' && styles.activeTab]}
                onPress={() => {
                  setActiveTab('grocery');
                  setSection('grocery');
                  navigation.setParams({ storeType: 'grocery' } as any);
                }}
              >
                <Text style={[styles.tabText, activeTab === 'grocery' && styles.activeTabText]}>Grocery Stores</Text>
            </TouchableOpacity>
          </View>
          
            {/* Store Cards */}
            {filteredStores.length > 0 ? (
              filteredStores.map((store) => (
                <Card key={store.id} style={styles.card}>
                  <View style={styles.cardContent}>
                    <View style={styles.storeHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <Image
                          source={store.image ? { uri: store.image } : require('../../assets/icon.png')}
                          style={{ width: 32, height: 32, borderRadius: 16, marginRight: 10 }}
                        />
                        <Text style={styles.storeName}>{store.name}</Text>
                      </View>
                      <TouchableOpacity onPress={() => store.mobile && handleCallStore(store.mobile)}>
                        <MaterialIcons name="call" size={20} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.storeAddress}>{store.address}</Text>
                    {/* <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <Text style={{ color: colors.secondary, fontSize: 13, marginRight: 4 }}>Total items:</Text>
                        <Text style={{ color: colors.secondary, fontSize: 13, marginRight: 12 }}>{store.totalItems || 0}</Text>
                    </View> */}
                    <View style={styles.storeInfo}>
                      <Text style={styles.storeDistance}>{store.distance}</Text>
                      {/* <View style={styles.storeRating}>
                        <MaterialCommunityIcons
                          name="star"
                          size={16}
                          color={store.type === 'grocery' ? colors.grocery.primary : colors.pharma.primary}
                        />
                        <Text style={{ marginLeft: 4 }}>{store.rating}</Text>
                      </View> */}
                    </View>
                    <Button
                      onPress={() => handleStoreSelect(store)}
                      style={[styles.button, { backgroundColor: store.type === 'grocery' ? colors.grocery.primary : colors.pharma.primary }]}
                      colorScheme="primary"
                      size="lg"
                    >
                      Select Store
                    </Button>
                  </View>
                </Card>
              ))
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="store-off" size={64} color="#FFFFFF" />
                <Text style={styles.emptyStateTitle}>No Stores Found</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Sorry, we couldn't find any {activeTab === 'grocery' ? 'grocery' : 'pharmacy'} stores in your area.
                </Text>
                <Text style={styles.emptyStateSubtitle}>
                  Please try a different location or check back later.
                </Text>
              </View>
            )}
        </ScrollView>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

export default StoreListScreen; 
