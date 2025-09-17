// Import React hooks and components for dashboard functionality
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

/**
 * DashboardScreen Component - Gulf Air App User Dashboard
 * 
 * This component serves as the main dashboard after successful login.
 * It provides quick access to key features and user information.
 * 
 * Features:
 * - Welcome message with user information
 * - Quick access to My Trips, Book Flights, and Falcon Flyer
 * - Recent activity and notifications
 * - Navigation to all main app features
 * 
 * @returns {JSX.Element} A complete dashboard interface
 */
export default function DashboardScreen() {
  /**
   * Handle Navigation to My Trips
   * Navigates to the My Trips page
   */
  const handleMyTrips = () => {
    router.push('/my-trips');
  };

  /**
   * Handle Navigation to Book Flights
   * Navigates to the Book page
   */
  const handleBookFlights = () => {
    router.push('/book');
  };

  /**
   * Handle Navigation to Falcon Flyer
   * Navigates to the Falcon Flyer page
   */
  const handleFalconFlyer = () => {
    router.push('/falcon-flyer');
  };

  /**
   * Handle Menu Navigation
   * Opens the menu screen
   */
  const handleMenu = () => {
    router.push('/menu');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Set status bar to dark content for white background */}
      <StatusBar style="dark" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.timeText}>7:46</Text>
          <Ionicons name="notifications-outline" size={20} color="#1A1A2E" />
        </View>
        
        <Text style={styles.headerTitle}>Dashboard</Text>
        
        <TouchableOpacity style={styles.menuButton} onPress={handleMenu}>
          <Ionicons name="menu" size={24} color="#A68F65" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome back!</Text>
          <Text style={styles.welcomeSubtitle}>Ready for your next adventure?</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={handleMyTrips}>
              <View style={styles.actionIcon}>
                <Ionicons name="airplane" size={32} color="#A68F65" />
              </View>
              <Text style={styles.actionTitle}>My Trips</Text>
              <Text style={styles.actionSubtitle}>View your bookings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={handleBookFlights}>
              <View style={styles.actionIcon}>
                <Ionicons name="calendar" size={32} color="#A68F65" />
              </View>
              <Text style={styles.actionTitle}>Book Flights</Text>
              <Text style={styles.actionSubtitle}>Search and book</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={handleFalconFlyer}>
              <View style={styles.actionIcon}>
                <Ionicons name="heart" size={32} color="#A68F65" />
              </View>
              <Text style={styles.actionTitle}>Falcon Flyer</Text>
              <Text style={styles.actionSubtitle}>Loyalty program</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View style={styles.actionIcon}>
                <Ionicons name="settings" size={32} color="#A68F65" />
              </View>
              <Text style={styles.actionTitle}>Settings</Text>
              <Text style={styles.actionSubtitle}>Account preferences</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.recentActivityContainer}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          <View style={styles.activityCard}>
            <View style={styles.activityIcon}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Login Successful</Text>
              <Text style={styles.activitySubtitle}>Welcome to Gulf Air</Text>
            </View>
            <Text style={styles.activityTime}>Just now</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNavBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/home')}>
          <Ionicons name="home" size={24} color="#8B8B8B" />
          <Text style={styles.navItemText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={handleMyTrips}>
          <Ionicons name="airplane" size={24} color="#8B8B8B" />
          <Text style={styles.navItemText}>My Trips</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={handleBookFlights}>
          <Ionicons name="calendar" size={24} color="#8B8B8B" />
          <Text style={styles.navItemText}>Book</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={handleFalconFlyer}>
          <Ionicons name="heart" size={24} color="#8B8B8B" />
          <Text style={styles.navItemText}>Falconflyer</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// StyleSheet for Dashboard Screen - Gulf Air Brand Colors and Layout
const styles = StyleSheet.create({
  // Main container with light gray background
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  // Header section styling
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#F5F5F5',
  },
  // Header left section
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // Time text styling
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  // Header title styling
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  // Menu button styling
  menuButton: {
    padding: 4,
  },
  // Scroll container
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  // Welcome section
  welcomeSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  // Welcome title
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  // Welcome subtitle
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  // Quick actions container
  quickActionsContainer: {
    marginBottom: 20,
  },
  // Section title
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 16,
  },
  // Actions grid
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  // Action card
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '48%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  // Action icon
  actionIcon: {
    marginBottom: 12,
  },
  // Action title
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  // Action subtitle
  actionSubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  // Recent activity container
  recentActivityContainer: {
    marginBottom: 20,
  },
  // Activity card
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  // Activity icon
  activityIcon: {
    marginRight: 12,
  },
  // Activity content
  activityContent: {
    flex: 1,
  },
  // Activity title
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  // Activity subtitle
  activitySubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  // Activity time
  activityTime: {
    fontSize: 12,
    color: '#8B8B8B',
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
  // Navigation item text styling
  navItemText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8B8B8B',
  },
});