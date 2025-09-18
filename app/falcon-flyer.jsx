// Import React hooks and components for Falconflyer Dashboard
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { loyaltyAPI, getAuthToken } from '../utils/api';

/**
 * FalconflyerDashboardScreen Component - Gulf Air Loyalty Program
 * 
 * This component displays the user's Falconflyer loyalty program information including:
 * - User's miles balance
 * - Loyalty points
 * - Membership tier and card status
 * - Action buttons for loyalty features (UI only)
 * - Gulf Air branding and consistent header
 * 
 * @returns {JSX.Element} A complete loyalty program dashboard
 */
export default function FalconflyerDashboardScreen() {
  // State management for loyalty data and UI
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Load loyalty data when component mounts and when page becomes focused
  useFocusEffect(
    React.useCallback(() => {
      loadLoyaltyData();
    }, [])
  );

  /**
   * Load Loyalty Data
   * Fetches user's loyalty program information from the backend
   */
  const loadLoyaltyData = async () => {
    try {
      setIsLoading(true);
      
      const token = getAuthToken();
      if (!token) {
        setIsLoggedIn(false);
        setIsLoading(false);
        return;
      }

      setIsLoggedIn(true);
      const response = await loyaltyAPI.getLoyaltyData();
      console.log('Loyalty data loaded:', response);
      setLoyaltyData(response);
    } catch (error) {
      console.error('Error loading loyalty data:', error);
      Alert.alert('Error', 'Failed to load loyalty data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle Action Button Press
   * Shows placeholder alert for non-functional buttons
   */
  const handleActionPress = (action) => {
    Alert.alert(
      'Coming Soon',
      `${action} feature will be available soon!`,
      [{ text: 'OK' }]
    );
  };

  /**
   * Get Card Color Based on Tier
   * Returns appropriate color for the loyalty tier
   */
  const getCardColor = (tier) => {
    switch (tier?.toUpperCase()) {
      case 'PLATINUM':
        return '#E5E4E2'; // Platinum
      case 'GOLD':
        return '#FFD700'; // Gold
      case 'SILVER':
        return '#C0C0C0'; // Silver
      case 'BLUE':
      default:
        return '#007AFF'; // Blue
    }
  };

  /**
   * Format Number with Commas
   * Adds commas to large numbers for better readability
   */
  const formatNumber = (num) => {
    return num?.toLocaleString() || '0';
  };

  // Show login prompt if not authenticated
  if (!isLoggedIn && !isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/header.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
          </View>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => router.push('/menu')}
          >
            <Ionicons name="menu" size={24} color="#1A1A2E" />
          </TouchableOpacity>
        </View>

        <View style={styles.loginPrompt}>
          <Ionicons name="person-circle-outline" size={80} color="#A68F65" />
          <Text style={styles.loginTitle}>Sign In Required</Text>
          <Text style={styles.loginMessage}>
            Please sign in to view your Falconflyer loyalty program details.
          </Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/header.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
          </View>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => router.push('/menu')}
          >
            <Ionicons name="menu" size={24} color="#1A1A2E" />
          </TouchableOpacity>
        </View>

        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your loyalty data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/header.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => router.push('/menu')}
        >
          <Ionicons name="menu" size={24} color="#1A1A2E" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {loyaltyData?.first_name?.[0]}{loyaltyData?.last_name?.[0]}
              </Text>
            </View>
          </View>
          <Text style={styles.welcomeText}>Welcome back to Falconflyer</Text>
          <Text style={styles.userName}>
            {loyaltyData?.first_name ? `Ms. ${loyaltyData.first_name}` : 'Member'}
          </Text>
        </View>

        {/* Loyalty Card */}
        <View style={styles.loyaltyCard}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={styles.brandSection}>
              <Image
                source={require('../assets/images/logo.png')}
                style={styles.cardLogo}
                resizeMode="contain"
              />
              <Text style={styles.brandText}>GULF AIR</Text>
            </View>
            <View style={styles.memberSection}>
              <Text style={styles.memberName}>
                {loyaltyData?.first_name ? `Ms. ${loyaltyData.first_name}` : 'Member'}
              </Text>
              <View style={styles.membershipNumberContainer}>
                <Ionicons name="card-outline" size={16} color="#FFFFFF" />
                <Text style={styles.membershipNumber}>
                  {loyaltyData?.membership_number || 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          {/* Miles Section */}
          <View style={styles.milesSection}>
            <Text style={styles.sectionLabel}>Your miles</Text>
            <Text style={styles.milesValue}>
              {formatNumber(loyaltyData?.loyalty_miles)}
            </Text>
            <Text style={styles.expiryText}>
              1,577 Miles will expire on 30/04/2026
            </Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Loyalty Points Section */}
          <View style={styles.pointsSection}>
            <Text style={styles.sectionLabel}>Loyalty Points</Text>
            <Text style={styles.pointsValue}>
              {formatNumber(loyaltyData?.loyalty_points)}
            </Text>
            <Text style={styles.expiryText}>
              200 Points will expire on 30/09/2025
            </Text>
          </View>

          {/* Card Tier */}
          <View style={[styles.tierSection, { backgroundColor: getCardColor(loyaltyData?.loyalty_tier) }]}>
            <Text style={styles.tierText}>
              {loyaltyData?.loyalty_tier || 'BLUE'} CARD
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {/* Redeem Flights Button */}
          <TouchableOpacity 
            style={styles.redeemButton}
            onPress={() => handleActionPress('Redeem Flights')}
          >
            <Text style={styles.redeemButtonText}>Redeem Flights</Text>
          </TouchableOpacity>

          {/* Secondary Action Buttons */}
          <View style={styles.secondaryButtons}>
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => handleActionPress('Buy Miles')}
            >
              <Ionicons name="card-outline" size={20} color="#FFFFFF" />
              <Text style={styles.secondaryButtonText}>Buy Miles</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => handleActionPress('Claim Miles')}
            >
              <Ionicons name="arrow-back-outline" size={20} color="#FFFFFF" />
              <Text style={styles.secondaryButtonText}>Claim Miles</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.secondaryButtons}>
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => handleActionPress('Transfer Miles')}
            >
              <Ionicons name="swap-horizontal-outline" size={20} color="#FFFFFF" />
              <Text style={styles.secondaryButtonText}>Transfer Miles</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => handleActionPress('Mileage Calculator')}
            >
              <Ionicons name="location-outline" size={20} color="#FFFFFF" />
              <Text style={styles.secondaryButtonText}>Mileage Calculator</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.secondaryButtons}>
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => handleActionPress('My Activity')}
            >
              <Ionicons name="chatbubble-outline" size={20} color="#FFFFFF" />
              <Text style={styles.secondaryButtonText}>My Activity</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => handleActionPress('Invite & Earn')}
            >
              <Ionicons name="share-outline" size={20} color="#FFFFFF" />
              <Text style={styles.secondaryButtonText}>Invite & Earn</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNavBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/home')}>
          <Ionicons name="home" size={24} color="#8B8B8B" />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/my-trips')}>
          <Ionicons name="ticket" size={24} color="#8B8B8B" />
          <Text style={styles.navLabel}>My Trips</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/book')}>
          <Ionicons name="airplane" size={24} color="#8B8B8B" />
          <Text style={styles.navLabel}>Book</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <Ionicons name="heart" size={24} color="#A68F65" />
          <Text style={[styles.navLabel, styles.activeNavLabel]}>Falconflyer</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// StyleSheet for Falconflyer Dashboard - Gulf Air Brand Colors and Layout
const styles = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Header styling
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  logoContainer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerLogo: {
    width: 200,
    height: 60,
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
  // Loading container
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  // Login prompt styling
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginTop: 16,
    marginBottom: 8,
  },
  loginMessage: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  loginButton: {
    backgroundColor: '#A68F65',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Welcome section
  welcomeSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  welcomeText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#A68F65',
  },
  // Loyalty card styling
  loyaltyCard: {
    backgroundColor: '#2C2C2C',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  brandSection: {
    alignItems: 'flex-start',
  },
  cardLogo: {
    width: 40,
    height: 40,
    marginBottom: 4,
  },
  brandText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  memberSection: {
    alignItems: 'flex-end',
  },
  memberName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  membershipNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  membershipNumber: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 4,
  },
  // Miles section
  milesSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
  },
  milesValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  expiryText: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  // Divider
  divider: {
    height: 1,
    backgroundColor: '#444444',
    marginVertical: 16,
  },
  // Points section
  pointsSection: {
    marginBottom: 16,
  },
  pointsValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  // Tier section
  tierSection: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  tierText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Action buttons
  actionButtons: {
    marginBottom: 24,
  },
  redeemButton: {
    backgroundColor: '#A68F65',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  redeemButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#20B2AA',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  // Bottom navigation
  bottomNavBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeNavItem: {
    // Active state styling
  },
  navLabel: {
    fontSize: 12,
    color: '#8B8B8B',
    marginTop: 4,
  },
  activeNavLabel: {
    color: '#A68F65',
    fontWeight: '600',
  },
});