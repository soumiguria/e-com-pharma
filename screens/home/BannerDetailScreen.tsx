import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';

type BannerDetailScreenRouteProp = RouteProp<RootStackParamList, 'BannerDetail'>;

interface Props {
  route: BannerDetailScreenRouteProp;
}

const BannerDetailScreen: React.FC<Props> = ({ route }) => {
  const { theme } = useTheme();
  const { bannerId } = route.params;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <Text style={[styles.text, { color: theme.colors.text }]}>
        Banner Detail Screen
      </Text>
      <Text style={[styles.subText, { color: theme.colors.secondary }]}>
        Banner ID: {bannerId}
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
  },
});

export default BannerDetailScreen; 