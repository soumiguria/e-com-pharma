import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAppContext } from '../../contexts/AppContext';
import { bannerService } from '../../services/api/bannerService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Banner {
  id: string;
  image: string;
  link: string;
}

// Fallback banners data
const fallbackBanners: Banner[] = [
  {
    id: '1',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    link: 'banner1',
  },
  {
    id: '2',
    image: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    link: 'banner2',
  },
  {
    id: '3',
    image: 'https://images.pexels.com/photos/2983101/pexels-photo-2983101.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    link: 'banner3',
  },
];

const { width } = Dimensions.get('window');

const BannerSlider = () => {
  const navigation = useNavigation<NavigationProp>();
  const { selectedStore } = useAppContext();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [banners, setBanners] = useState<Banner[]>(fallbackBanners);
  const [loading, setLoading] = useState(false);

  // Lazy loading: Fetch banners in background after screen renders
  useEffect(() => {
    const fetchBanners = async () => {
      if (!selectedStore?.id) {
        console.log('   No store selected, keeping fallback mock data for banners');
        return;
      }

      try {
        setLoading(true);
        console.log('🔄 Fetching banners for store:', selectedStore.id);
        
        const response = await bannerService.getBanners(selectedStore.id);
        if (response.success && response.data) {
          console.log('Banners loaded from API');
          setBanners(response.data);
        } else {
          console.log('   Banners API failed, keeping fallback mock data');
        }
      } catch (error) {
        console.log('  Error fetching banners:', error);
        console.log('   Keeping fallback mock data');
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to let the screen render first
    const timer = setTimeout(() => {
      fetchBanners();
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedStore?.id]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentIndex < banners.length - 1) {
        flatListRef.current?.scrollToIndex({
          index: currentIndex + 1,
          animated: true,
        });
      } else {
        flatListRef.current?.scrollToIndex({
          index: 0,
          animated: true,
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [currentIndex, banners.length]);

  const handleBannerPress = (link: string) => {
    navigation.navigate('BannerDetail', { bannerId: link });
  };

  const renderItem = ({ item }: { item: Banner }) => (
    <TouchableOpacity
      style={styles.bannerContainer}
      onPress={() => handleBannerPress(item.link)}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.image }} style={styles.bannerImage} />
    </TouchableOpacity>
  );

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / width);
    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={banners}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
      <View style={styles.paginationContainer}>
        {banners.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentIndex && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 220,
    marginVertical: 16,
  },
  bannerContainer: {
    width: width,
    height: 220,
    paddingHorizontal: 16,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  paginationContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#fff',
  },
});

export default BannerSlider; 