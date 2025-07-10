import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, View, Animated } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import PharmacySection from '../../components/common/PharmacySection';

const PharmacyHomeScreen = () => {
  const { theme } = useTheme();
  const scrollY = React.useRef(new Animated.Value(0)).current;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView style={{ flex: 1 }}>
        <PharmacySection scrollY={scrollY} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default PharmacyHomeScreen; 