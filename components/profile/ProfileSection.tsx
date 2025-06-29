import React from 'react';
import { View, StyleSheet, ScrollView, Animated } from 'react-native';
import { Text, Card, Button, Avatar, List } from 'react-native-paper';
import { useAppTheme } from '../../hooks/useAppTheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ProfileSectionProps {
  scrollY: Animated.Value;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ scrollY }) => {
  const { colors, typography, spacing, borderRadius, createStyles } = useAppTheme();

  const styles = createStyles(() => ({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: spacing.lg,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
    },
    title: {
      ...typography.h1,
      color: colors.text,
    },
    content: {
      padding: spacing.lg,
    },
    profileCard: {
      marginBottom: spacing.xl,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
    },
    profileContent: {
      alignItems: 'center',
      padding: spacing.xl,
    },
    avatar: {
      marginBottom: spacing.md,
      backgroundColor: colors.primary,
    },
    name: {
      ...typography.h2,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    email: {
      ...typography.body1,
      color: colors.text,
      opacity: 0.7,
    },
    menuCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
    },
    menuItem: {
      paddingVertical: spacing.sm,
    },
    menuIcon: {
      marginRight: spacing.md,
    },
    logoutButton: {
      marginTop: spacing.xl,
    },
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View style={[styles.header, {
        transform: [{
          translateY: scrollY.interpolate({
            inputRange: [0, 100],
            outputRange: [0, -100],
            extrapolate: 'clamp',
          }),
        }],
      }]}>
        <Text style={styles.title}>Profile</Text>
      </Animated.View>
      <ScrollView style={styles.content}>
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <Avatar.Text
              size={80}
              label="JD"
              style={styles.avatar}
            />
            <Text style={styles.name}>John Doe</Text>
            <Text style={styles.email}>john.doe@example.com</Text>
          </Card.Content>
        </Card>

        <Card style={styles.menuCard}>
          <List.Section>
            <List.Item
              title="My Orders"
              left={props => <List.Icon {...props} icon="package-variant" />}
              style={styles.menuItem}
              onPress={() => {}}
            />
            <List.Item
              title="Delivery Addresses"
              left={props => <List.Icon {...props} icon="map-marker" />}
              style={styles.menuItem}
              onPress={() => {}}
            />
            <List.Item
              title="Payment Methods"
              left={props => <List.Icon {...props} icon="credit-card" />}
              style={styles.menuItem}
              onPress={() => {}}
            />
            <List.Item
              title="Notifications"
              left={props => <List.Icon {...props} icon="bell" />}
              style={styles.menuItem}
              onPress={() => {}}
            />
            <List.Item
              title="Help & Support"
              left={props => <List.Icon {...props} icon="help-circle" />}
              style={styles.menuItem}
              onPress={() => {}}
            />
          </List.Section>
        </Card>

        <Button
          mode="outlined"
          onPress={() => {}}
          style={styles.logoutButton}
          theme={{ roundness: borderRadius.md }}
        >
          Log Out
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileSection; 