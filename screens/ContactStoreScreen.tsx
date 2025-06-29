import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';

const ContactStoreScreen = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();

    const contactInfo = [
        {
            title: 'Store Address',
            value: '123 Main Street, City Center, State - 123456',
            icon: '📍'
        },
        {
            title: 'Phone Number',
            value: '+91 98765 43210',
            icon: '📞'
        },
        {
            title: 'Email',
            value: 'contact@passkidukaan.com',
            icon: '📧'
        },
        {
            title: 'Working Hours',
            value: 'Monday - Sunday: 8:00 AM - 10:00 PM',
            icon: '🕒'
        }
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={[styles.backText, { color: theme.colors.primary }]}>← Back</Text>
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.colors.text }]}>Contact Store</Text>
            </View>
            
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.infoContainer}>
                    {contactInfo.map((info, index) => (
                        <View key={index} style={[styles.infoCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                            <Text style={styles.icon}>{info.icon}</Text>
                            <View style={styles.infoContent}>
                                <Text style={[styles.infoTitle, { color: theme.colors.text }]}>{info.title}</Text>
                                <Text style={[styles.infoValue, { color: theme.colors.secondary }]}>{info.value}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.actionsContainer}>
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}>
                        <Text style={[styles.actionButtonText, { color: '#fff' }]}>Call Store</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary, borderWidth: 1 }]}>
                        <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>Send Email</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        marginRight: 16,
    },
    backText: {
        fontSize: 16,
        fontWeight: '600',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    container: {
        flex: 1,
        padding: 16,
    },
    infoContainer: {
        marginBottom: 24,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    icon: {
        fontSize: 24,
        marginRight: 16,
    },
    infoContent: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 14,
        lineHeight: 20,
    },
    actionsContainer: {
        gap: 12,
    },
    actionButton: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ContactStoreScreen; 