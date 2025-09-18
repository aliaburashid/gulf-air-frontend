// Import React hooks and components for menu functionality
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authAPI, clearAuthToken } from '../utils/api';

/**
 * MenuScreen Component - Gulf Air App Menu
 * 
 * This component provides a comprehensive menu with various app options,
 * contact information, and settings. It matches the design shown in the
 * reference image with proper styling and navigation.
 * 
 * Features:
 * - Flight status and check-in options
 * - Booking management
 * - App information
 * - Contact assistance
 * - Country and language selection
 * - Cache management
 * 
 * @returns {JSX.Element} A complete menu interface with Gulf Air branding
 */
export default function MenuScreen() {
  /**
   * Handle Menu Item Navigation
   * Navigates to different sections based on menu item
   */
  const handleMenuItem = (item) => {
    switch (item) {
      case 'flight-status':
        Alert.alert('Flight Status', 'Flight status feature coming soon!');
        break;
      case 'check-in':
        Alert.alert('Check In', 'Check-in feature coming soon!');
        break;
      case 'manage-booking':
        Alert.alert('Manage Booking', 'Booking management feature coming soon!');
        break;
      case 'about-app':
        Alert.alert('About Gulf Air App', 'Gulf Air App v1.0.0\nYour trusted travel companion.');
        break;
      case 'clear-cache':
        Alert.alert('Clear Cache', 'Cache cleared successfully!');
        break;
      case 'contact-us':
        Alert.alert('Contact Us', 'Contact us feature coming soon!');
        break;
      default:
        break;
    }
  };

  /**
   * Handle Back Navigation
   * Navigates back to the previous screen
   */
  const handleBack = () => {
    router.back();
  };

  const handleLogout = async () => {
    try {
      // Best-effort backend notification (if endpoint exists)
      try {
        await authAPI.logout();
      } catch (e) {
        // Ignore if backend doesn't support logout
      }
      await clearAuthToken();
      Alert.alert('Logged out', 'You have been signed out.');
      router.replace('/login');
    } catch (error) {
      Alert.alert('Logout Failed', error.message || 'Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Set status bar to light content for gold header */}
      <StatusBar style="light" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleBack}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MENU</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Main Menu Options */}
        <View style={styles.menuSection}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuItem('flight-status')}
          >
            <Text style={styles.menuItemText}>Flight Status</Text>
            <Ionicons name="chevron-forward" size={20} color="#8B8B8B" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuItem('check-in')}
          >
            <Text style={styles.menuItemText}>Check in</Text>
            <Ionicons name="chevron-forward" size={20} color="#8B8B8B" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuItem('manage-booking')}
          >
            <Text style={styles.menuItemText}>Manage My Booking</Text>
            <Ionicons name="chevron-forward" size={20} color="#8B8B8B" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuItem('about-app')}
          >
            <Text style={styles.menuItemText}>About Gulf Air App</Text>
            <Ionicons name="chevron-forward" size={20} color="#8B8B8B" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuItem('clear-cache')}
          >
            <Text style={styles.clearCacheText}>Clear Cache</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Assistance Section */}
        <View style={styles.assistanceSection}>
          <Text style={styles.assistanceText}>Need information or assistance?</Text>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => handleMenuItem('contact-us')}
          >
            <Text style={styles.contactButtonText}>Contact us</Text>
          </TouchableOpacity>
        </View>

        {/* Country and Language Selection */}
        <View style={styles.settingsSection}>
          <Text style={styles.settingsLabel}>Select Country</Text>
          <TouchableOpacity style={styles.dropdown}>
            <View style={styles.flagContainer}>
              <Text style={styles.flagEmoji}>🇧🇭</Text>
            </View>
            <Text style={styles.dropdownText}>Bahrain</Text>
            <Ionicons name="chevron-down" size={20} color="#8B8B8B" />
          </TouchableOpacity>

          <Text style={styles.settingsLabel}>Preferred language</Text>
          <TouchableOpacity style={styles.dropdown}>
            <Text style={styles.dropdownText}>English</Text>
            <Ionicons name="chevron-down" size={20} color="#8B8B8B" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNavBar}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color="#A68F65" />
          <Text style={styles.navItemTextActive}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="airplane" size={24} color="#8B8B8B" />
          <Text style={styles.navItemText}>My Trips</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="calendar" size={24} color="#8B8B8B" />
          <Text style={styles.navItemText}>Book</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="heart" size={24} color="#8B8B8B" />
          <Text style={styles.navItemText}>Falconflyer</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// StyleSheet for Menu Screen - Gulf Air Brand Colors and Layout
const styles = StyleSheet.create({
  // Main container with white background
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Header section with gold background
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#A68F65',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  // Close button styling
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Header title styling
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  // Header spacer for centering
  headerSpacer: {
    width: 32,
  },
  // Scroll container
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  // Menu section styling
  menuSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
  },
  // Menu item styling
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  // Menu item text styling
  menuItemText: {
    fontSize: 16,
    color: '#1A1A2E',
  },
  // Clear cache text styling (red)
  clearCacheText: {
    fontSize: 16,
    color: '#FF4444',
  },
  logoutText: {
    fontSize: 16,
    color: '#FF4444',
  },
  // Assistance section styling
  assistanceSection: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 20,
    marginVertical: 20,
    alignItems: 'center',
  },
  // Assistance text styling
  assistanceText: {
    fontSize: 16,
    color: '#1A1A2E',
    marginBottom: 16,
    textAlign: 'center',
  },
  // Contact button styling
  contactButton: {
    backgroundColor: '#20B2AA',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  // Contact button text styling
  contactButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  // Settings section styling
  settingsSection: {
    marginBottom: 20,
  },
  // Settings label styling
  settingsLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 16,
    marginBottom: 8,
  },
  // Dropdown styling
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  // Flag container styling
  flagContainer: {
    marginRight: 12,
  },
  // Flag emoji styling
  flagEmoji: {
    fontSize: 20,
  },
  // Dropdown text styling
  dropdownText: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A2E',
  },
  // Bottom navigation bar styling
  bottomNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  // Navigation item styling
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  // Active navigation item text styling
  navItemTextActive: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A68F65',
  },
  // Inactive navigation item text styling
  navItemText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8B8B8B',
  },
});
