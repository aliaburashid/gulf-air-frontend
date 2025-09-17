// Import React hooks and components for home page functionality
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

/**
 * HomeScreen Component - Gulf Air App Main Landing Page
 * 
 * This component serves as the main landing page after the splash screen.
 * It provides navigation options for login/signup and promotes the Falcon Flyer
 * loyalty program with the same Gulf Air branding and styling.
 * 
 * Features:
 * - Gulf Air logo and branding
 * - Navigation cards for login and signup
 * - Falcon Flyer promotion section
 * - Consistent styling with other pages
 * 
 * @returns {JSX.Element} A complete home page with navigation options
 */
export default function HomeScreen() {
  /**
   * Handle Login Navigation
   * Navigates to the login screen
   */
  const handleLogin = () => {
    router.push('/login');
  };

  /**
   * Handle Signup Navigation
   * Navigates to the signup screen
   */
  const handleSignup = () => {
    router.push('/signup');
  };

  /**
   * Handle Falcon Flyer Navigation
   * Navigates to the falcon flyer page (to be implemented later)
   */
  const handleFalconFlyer = () => {
    router.push('/falcon-flyer');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Set status bar to dark content for white background */}
      <StatusBar style="dark" />
      
      {/* Top Navigation Bar */}
      <View style={styles.topNavBar}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/images/header.png')}
            style={styles.topLogo}
            resizeMode="contain"
          />
        </View>
        
        <TouchableOpacity style={styles.topNavRight} onPress={() => router.push('/menu')}>
          <Ionicons name="menu" size={24} color="#1A1A2E" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Plane Image Section with Overlay */}
        <View style={styles.planeImageContainer}>
          <Image 
            source={require('../assets/images/plane.jpg')}
            style={styles.planeImage}
            resizeMode="cover"
          />
          {/* Overlay Content */}
          <View style={styles.planeOverlay}>
            <Text style={styles.planeTitle}>Discover new horizons</Text>
            <TouchableOpacity
              style={styles.bookNowButton}
              onPress={() => router.push('/book')}
            >
              <Text style={styles.bookNowButtonText}>Book now</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Navigation Cards Container */}
        <View style={styles.cardsContainer}>
          {/* Login/Signup Navigation Card */}
          <View style={styles.navigationCard}>
            <Text style={styles.cardTitle}>Start earning rewards today</Text>
            <Text style={styles.cardSubtitle}>Join Falconflyer or login if you are an existing member</Text>
            
            {/* Login and Signup Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
              >
                <Text style={styles.loginButtonText}>Log in</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.signupButton}
                onPress={handleSignup}
              >
                <Text style={styles.signupButtonText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Falcon Flyer Promotion Card */}
          <View style={styles.falconCard}>
            <Text style={styles.falconTitle}>Not a Member? Join Falconflyer Program</Text>
            <Text style={styles.falconSubtitle}>and start reaping the rewards</Text>
            
            <TouchableOpacity
              style={styles.falconButton}
              onPress={handleFalconFlyer}
            >
              <Text style={styles.falconButtonText}>Join Today</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNavBar}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color="#A68F65" />
          <Text style={styles.navItemTextActive}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/my-trips')}>
          <Ionicons name="airplane" size={24} color="#8B8B8B" />
          <Text style={styles.navItemText}>My Trips</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/book')}>
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

// StyleSheet for Home Screen - Gulf Air Brand Colors and Layout
const styles = StyleSheet.create({
  // Main container with white background
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Top navigation bar styling - adjusted height for smaller logo
  topNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    minHeight: 100,
  },
  // Top nav right section
  topNavRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Logo container - positioned to the left with no flex constraints
  logoContainer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    flex: 0,
    minWidth: 200,
  },
  // Top logo styling - a bit smaller for better fit
  topLogo: {
    width: 200,
    height: 60,
  },
  // Scroll view content container
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  // Plane image container
  planeImageContainer: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  // Plane image styling
  planeImage: {
    width: '100%',
    height: 200,
  },
  // Plane overlay content
  planeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    alignItems: 'center',
  },
  // Plane title styling
  planeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  // Plane subtitle styling
  planeSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  // Book now button styling
  bookNowButton: {
    backgroundColor: '#A68F65',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  // Book now button text styling
  bookNowButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  // Cards container for navigation and promotion cards
  cardsContainer: {
    gap: 20,
  },
  // Main navigation card styling
  navigationCard: {
    backgroundColor: '#16213E', // Slightly lighter blue for contrast
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  // Card title styling
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  // Card subtitle styling
  cardSubtitle: {
    fontSize: 16,
    color: '#B8B8B8',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  // Button container for side-by-side layout
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  // Login button styling
  loginButton: {
    flex: 1,
    backgroundColor: '#A68F65', // Gulf Air gold
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  // Login button text styling
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  // Signup button styling
  signupButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#A68F65', // Gulf Air gold border
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  // Signup button text styling
  signupButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#A68F65',
  },
  // Falcon Flyer promotion card styling
  falconCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  // Falcon card title styling
  falconTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A2E',
    textAlign: 'center',
    marginBottom: 8,
  },
  // Falcon card subtitle styling
  falconSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  // Falcon Flyer button styling
  falconButton: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '100%',
  },
  // Falcon Flyer button text styling
  falconButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
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