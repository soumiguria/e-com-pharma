import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';

type EditProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EditProfile'>;

const { width } = Dimensions.get('window');

const EditProfileScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<EditProfileScreenNavigationProp>();
  
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    mobileNumber: '+91 98765 43210',
    email: 'john.doe@example.com',
    alternateNumber: '+91 98765 43211',
    birthday: '15/03/1990',
    anniversary: '20/06/2015',
  });

  const [specialDates, setSpecialDates] = useState([
    { id: '1', name: 'Wife Birthday', date: '10/08/1988' },
    { id: '2', name: 'Son Birthday', date: '25/12/2010' },
  ]);

  const handleSave = () => {
    // Save profile data logic here
    navigation.goBack();
  };

  const addSpecialDate = () => {
    const newDate = {
      id: Date.now().toString(),
      name: 'New Special Date',
      date: '01/01/2024',
    };
    setSpecialDates([...specialDates, newDate]);
  };

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.background,
      marginRight: 16,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    saveButton: {
      marginLeft: 'auto',
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
    },
    saveButtonText: {
      color: theme.colors.surface,
      fontWeight: '600',
    },
    scrollContent: {
      padding: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 16,
    },
    inputContainer: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 14,
      color: theme.colors.secondary,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.colors.text,
      backgroundColor: theme.colors.surface,
    },
    specialDateItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
    },
    specialDateText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.text,
    },
    addSpecialDateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      marginTop: 8,
    },
    addSpecialDateText: {
      color: theme.colors.surface,
      marginLeft: 8,
      fontWeight: '600',
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContent}>
          {/* Personal Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput
                style={styles.input}
                value={profileData.firstName}
                onChangeText={(text) => setProfileData({...profileData, firstName: text})}
                placeholder="Enter first name"
                placeholderTextColor={theme.colors.secondary}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={profileData.lastName}
                onChangeText={(text) => setProfileData({...profileData, lastName: text})}
                placeholder="Enter last name"
                placeholderTextColor={theme.colors.secondary}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <TextInput
                style={styles.input}
                value={profileData.mobileNumber}
                onChangeText={(text) => setProfileData({...profileData, mobileNumber: text})}
                placeholder="Enter mobile number"
                placeholderTextColor={theme.colors.secondary}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={profileData.email}
                onChangeText={(text) => setProfileData({...profileData, email: text})}
                placeholder="Enter email"
                placeholderTextColor={theme.colors.secondary}
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Alternate Number</Text>
              <TextInput
                style={styles.input}
                value={profileData.alternateNumber}
                onChangeText={(text) => setProfileData({...profileData, alternateNumber: text})}
                placeholder="Enter alternate number"
                placeholderTextColor={theme.colors.secondary}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Special Dates Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Dates</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Birthday</Text>
              <TextInput
                style={styles.input}
                value={profileData.birthday}
                onChangeText={(text) => setProfileData({...profileData, birthday: text})}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={theme.colors.secondary}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Anniversary</Text>
              <TextInput
                style={styles.input}
                value={profileData.anniversary}
                onChangeText={(text) => setProfileData({...profileData, anniversary: text})}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={theme.colors.secondary}
              />
            </View>

            {specialDates.map((date) => (
              <View key={date.id} style={styles.specialDateItem}>
                <Text style={styles.specialDateText}>{date.name}: {date.date}</Text>
                <TouchableOpacity>
                  <MaterialIcons name="edit" size={20} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity style={styles.addSpecialDateButton} onPress={addSpecialDate}>
              <MaterialIcons name="add" size={20} color={theme.colors.surface} />
              <Text style={styles.addSpecialDateText}>Add Special Date</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default EditProfileScreen; 