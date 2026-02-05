import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAppContext } from '../../contexts/AppContext';
import { margBannerService } from '../../services/api/margBannerService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Banner {
  id: string;
  image: string;
  // link: string;
}

// Fallback banners data
// I want to use different banner images for grocery store and pharmacy stores
const fallbackBanners: Banner[] = [
  {
    id: '1',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    // link: 'banner1',
  },
  {
    id: '2',
    image: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    // link: 'banner2',
  },
  {
    id: '3',
    image: 'https://images.pexels.com/photos/2983101/pexels-photo-2983101.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    // link: 'banner3',
  },
];

const fallbackPharmacyBanners: Banner[] = [
  {
    id: '1',
    image: 'https://i.ibb.co/DHSpgQXh/file-00000000002471fa9e5bed97c53bd2ce.png',
    // link: 'pharmacy_banner1',
  },
  {
    id: '2',
    image: 'https://i.ibb.co/0RkqZyJq/file-000000007a9871faa17809e455b6bf0f.png',
    // link: 'pharmacy_banner2',
  },
  {
    id: '3',
    image: 'https://i.ibb.co/20JWjY0k/file-000000000df471fab228d900b1f3c2ae.png',
    // link: 'pharmacy_banner3',
  },
  // {
  //   id: '4',
  //   image: 'https://i.ibb.co/LzyTrVH2/file-000000006b8c71faa38214040f9f9993.png',
  //   // link: 'pharmacy_banner4',
  // },
];

const { width } = Dimensions.get('window');

const BannerSlider = () => {
  const navigation = useNavigation<NavigationProp>();
  const { selectedStore } = useAppContext();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);

  // Lazy loading: Fetch banners from MargERP API only - NO FALLBACK
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching banners from MargERP API');
        
        const response = await margBannerService.getBanners();
        if (response.success && response.data && response.data.length > 0) {
          console.log('✅ Banners loaded from MargERP API:', response.data.length);
          setBanners(response.data);
        } else {
          console.log('⚠️ MargERP API returned no banners - showing NO banners');
          setBanners([]);
        }
      } catch (error) {
        console.error('❌ Error fetching banners from MargERP:', error);
        console.log('   Showing NO banners');
        setBanners([]);
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to let the screen render first
    const timer = setTimeout(() => {
      fetchBanners();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

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
      // onPress={() => handleBannerPress(item.link)}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.bannerImage}
        onError={(error) => {
          console.error('🖼️ Banner image load error:');
          console.error('   Image URI:', item.image?.substring(0, 100));
          console.error('   Error:', error.nativeEvent?.error || error);
        }}
        onLoad={() => {
          console.log('✅ Banner image loaded successfully');
          console.log('   Image URI:', item.image?.substring(0, 100));
        }}
      />
    </TouchableOpacity>
  );

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / width);
    setCurrentIndex(index);
  };

  // return (
  //   <View style={styles.container}>
  //     <FlatList
  //       ref={flatListRef}
  //       data={banners}
  //       renderItem={renderItem}
  //       keyExtractor={(item) => item.id}
  //       horizontal
  //       pagingEnabled
  //       showsHorizontalScrollIndicator={false}
  //       onScroll={handleScroll}
  //       scrollEventThrottle={16}
  //     />
  //     <View style={styles.paginationContainer}>
  //       {banners.map((_, index) => (
  //         <View
  //           key={index}
  //           style={[
  //             styles.paginationDot,
  //             index === currentIndex && styles.paginationDotActive,
  //           ]}
  //         />
  //       ))}
  //     </View>
  //   </View>
  // );

  // See update the above return to show different banners for grocery and pharmacy stores
  // Show nothing if no banners from API
  if (banners.length === 0 && !loading) {
    return null;
  }

  return (
    <View style={styles.container}>
      {banners.length === 0 && loading ? (
        // Show loading indicator when fetching
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      ) : (
        <>
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
        </>
      )}
      {loading && banners.length > 0 && (
        // Show loader overlay when refetching with existing banners
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      )}
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
  loaderContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginHorizontal: 16,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
  },
});

export default BannerSlider; 