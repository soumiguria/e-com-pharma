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
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Banner {
  id: string;
  image: string;
  link: string;
}

const banners: Banner[] = [
  {
    id: '1',
    image: 'https://cdn.pixabay.com/photo/2017/01/26/02/06/platter-2009590_1280.jpg',
    link: 'banner1',
  },
  {
    id: '2',
    image: 'https://cdn.pixabay.com/photo/2016/11/06/23/31/breakfast-1804457_1280.jpg',
    link: 'banner2',
  },
  {
    id: '3',
    image: 'https://cdn.pixabay.com/photo/2017/01/11/11/33/cake-1971552_1280.jpg',
    link: 'banner3',
  },
];

const { width } = Dimensions.get('window');

const BannerSlider = () => {
  const navigation = useNavigation<NavigationProp>();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

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
  }, [currentIndex]);

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
    height: 200,
    marginVertical: 10,
  },
  bannerContainer: {
    width: width,
    height: 200,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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