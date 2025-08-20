import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { Store, storeService } from '../../services/api/storeService';
import { useTheme } from '../../contexts/ThemeContext';
import StoreCard from '../../components/store/StoreCard';

type StoreListRouteProp = RouteProp<RootStackParamList, 'StoreList'>;

const StoreListScreen = () => {
  const route = useRoute<StoreListRouteProp>();
  const { pincode, storeType } = route.params;
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    loadStores();
  }, [pincode, storeType]);

  const loadStores = async () => {
    try {
      setLoading(true);
      const response = await storeService.exploreStores(pincode, storeType);
      
      if (response.success && response.data) {
        setStores(response.data);
      } else {
        Alert.alert('Error', response.error || 'Failed to load stores');
      }
    } catch (error) {
      console.error('Error loading stores:', error);
      Alert.alert('Error', 'Failed to load stores. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FlatList
        data={stores}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <StoreCard
            store={item}
            onPress={() => {
              // Navigate to store detail or handle store selection
            }}
          />
        )}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
};

export default StoreListScreen;