import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';

interface BannerSliderProps {
  banners: { id: string; image: string; title: string }[];
}

const BannerSlider: React.FC<BannerSliderProps> = ({ banners }) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      {banners.map((banner) => (
        <View key={banner.id} style={styles.bannerContainer}>
          <Image source={{ uri: banner.image }} style={styles.bannerImage} />
          <Text style={styles.bannerTitle}>{banner.title}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  bannerContainer: {
    marginRight: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  bannerImage: {
    width: 300,
    height: 150,
    borderRadius: 10,
  },
  bannerTitle: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BannerSlider; 