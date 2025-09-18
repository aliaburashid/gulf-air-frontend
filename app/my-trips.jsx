// Import React hooks and components for My Trips functionality
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
import { bookingsAPI, testAPIConnection, getAuthToken } from '../utils/api';

/**
 * MyTripsScreen Component - Gulf Air App Trip Management
 * 
 * This component displays user's active flight bookings with the same UI structure
 * as the Book page, including Gulf Air logo, side navigation, and dynamic
 * booking cards that show all active (non-cancelled) bookings.
 * 
 * Features:
 * - Same header structure as Book page with Gulf Air logo
 * - Dynamic booking cards based on user's active bookings only
 * - Automatically filters out cancelled bookings from display
 * - Check-in and manage booking functionality
 * - Login prompt for non-authenticated users
 * - Trip status and booking reference display
 * 
 * @returns {JSX.Element} A complete trip management interface
 */
export default function MyTripsScreen() {
  // State management for trips and user authentication
  const [bookings, setBookings] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load user bookings on component mount and when page becomes focused
  useEffect(() => {
    checkAuthAndLoadBookings();
  }, []);

  /**
   * Check Authentication and Load Bookings
   * First checks if user has a valid token, then loads bookings
   */
  const checkAuthAndLoadBookings = async () => {
    try {
      setIsLoading(true);
      const token = await getAuthToken();
      console.log('Checking authentication on page load, token:', token);
      
      if (!token) {
        console.log('No token found, showing login prompt');
        setIsLoggedIn(false);
        setIsLoading(false);
        return;
      }
      
      // User has token, load bookings
      await loadUserBookings();
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsLoggedIn(false);
      setIsLoading(false);
    }
  };

  // Reload bookings when the page is focused (e.g., when navigating back from Book page)
  useFocusEffect(
    React.useCallback(() => {
      console.log('My Trips page focused, reloading bookings...');
      // Force a complete reload by resetting state first
      setBookings([]);
      setIsLoading(true);
      checkAuthAndLoadBookings();
    }, [])
  );

  /**
   * Load User Bookings from Backend
   * Fetches all bookings for the authenticated user from the API
   */
  const loadUserBookings = async () => {
    try {
      console.log('Loading user bookings...');
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      // Test API connection first
      const isConnected = await Promise.race([
        testAPIConnection(),
        timeoutPromise
      ]);
      console.log('API connection test result:', isConnected);
      if (!isConnected) {
        console.log('API not connected, showing empty state');
        setBookings([]);
        setIsLoggedIn(false);
        setIsLoading(false);
        return;
      }

      // Check if user is authenticated
      const token = await getAuthToken();
      console.log('Current auth token:', token);
      
      // If no token, user is not logged in
      if (!token) {
        console.log('No auth token found, user needs to login');
        setIsLoggedIn(false);
        setBookings([]);
        return;
      }
      
      // Fetch user's bookings from backend with timestamp to prevent caching
      console.log('Fetching bookings from API...');
      const userBookings = await Promise.race([
        bookingsAPI.getBookings(),
        timeoutPromise
      ]);
      console.log('Raw bookings from API:', userBookings);
      
      // Filter out cancelled bookings and transform backend data to frontend format
      const activeBookings = userBookings.filter(booking => 
        booking.booking_status !== 'cancelled'
      );
      
      console.log('Total bookings from API:', userBookings.length);
      console.log('Active bookings (excluding cancelled):', activeBookings.length);
      
      const transformedBookings = activeBookings.map(booking => {
        console.log('Processing booking:', {
          id: booking.id,
          reference: booking.booking_reference,
          departure_time: booking.flight?.departure_time,
          formatted_date: formatDate(booking.flight?.departure_time),
          status: booking.booking_status
        });
        
        return {
          id: booking.id.toString(),
          destination: getDestinationName(booking.flight?.arrival_airport || 'Unknown'),
          date: formatDate(booking.flight?.departure_time),
          bookingReference: booking.booking_reference,
          image: require('../assets/images/plane.jpg'),
          canCheckIn: canCheckIn(booking.flight?.departure_time, booking.booking_status),
          checkInMessage: getCheckInMessage(booking.flight?.departure_time, booking.booking_status),
          bookingStatus: booking.booking_status,
          seatClass: booking.seat_class,
          seatNumber: booking.seat_number,
          passengerName: booking.passenger_name,
          totalPrice: booking.total_price,
          flight: booking.flight,
        };
      });

      console.log('Transformed active bookings:', transformedBookings);
      console.log('Setting bookings state with', transformedBookings.length, 'bookings');
      setBookings(transformedBookings);
      setIsLoggedIn(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading bookings:', error);
      console.log('Error message:', error.message);
      
      // Check if it's an authentication error
      if (error.message.includes('401') || error.message.includes('403') || 
          error.message.includes('unauthorized') || error.message.includes('Not authenticated') ||
          error.message.includes('Authentication failed')) {
        console.log('Authentication error detected, user needs to login');
        setIsLoggedIn(false);
        setBookings([]);
      } else {
        console.log('Non-authentication error, user is logged in but no bookings');
        // Other errors (like network issues), assume user is logged in but show empty state
        setIsLoggedIn(true);
        setBookings([]);
      }
    } finally {
      // Loading state is managed by parent function
    }
  };

  /**
   * Get Destination Name from Airport Code
   * Converts airport codes to readable city names
   */
  const getDestinationName = (airportCode) => {
    const airportMap = {
      // Middle East routes
      'BAH': 'Bahrain',
      'DXB': 'Dubai',
      'DOH': 'Doha',
      'KWI': 'Kuwait',
      'RUH': 'Riyadh',
      'JED': 'Jeddah',
      'CAI': 'Cairo',
      'BEY': 'Beirut',
      'AMM': 'Amman',
      
      // European routes
      'LHR': 'London',
      'CDG': 'Paris',
      'FRA': 'Frankfurt',
      'MAD': 'Madrid',
      'FCO': 'Rome',
      'ATH': 'Athens',
      
      // Asian routes
      'BOM': 'Mumbai',
      'DEL': 'Delhi',
      'BKK': 'Bangkok',
      'KUL': 'Kuala Lumpur',
      'SIN': 'Singapore',
      'HKG': 'Hong Kong',
      
      // African routes
      'NBO': 'Nairobi',
      'JNB': 'Johannesburg',
      'ADD': 'Addis Ababa',
    };
    return airportMap[airportCode] || airportCode;
  };

  /**
   * Format Date for Display
   * Converts date to readable format like "24 SEP"
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    try {
      // Normalize string: trim microseconds to milliseconds if present
      let input = dateString;
      if (!(dateString instanceof Date)) {
        input = String(dateString).replace(/\.(\d{3})\d+$/, '.$1');
        if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
          input = `${input}T12:00:00`;
        }
      }
      const date = dateString instanceof Date ? dateString : new Date(input);

      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateString);
        return 'N/A';
      }

      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
                      'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const day = date.getDate();
      const month = months[date.getMonth()];
      return `${day} ${month}`;
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'N/A';
    }
  };

  /**
   * Format Price for Display
   * Formats price to 3 decimal places with BHD currency
   */
  const formatPrice = (price) => {
    if (typeof price !== 'number') return 'BHD 0.000';
    return `BHD ${price.toFixed(3)}`;
  };

  /**
   * Check if User Can Check In
   * Determines if check-in is available (24h before departure)
   */
  const canCheckIn = (departureTime, bookingStatus) => {
    if (bookingStatus !== 'confirmed') return false;
    const normalized = typeof departureTime === 'string'
      ? departureTime.replace(/\.(\d{3})\d+$/, '.$1')
      : departureTime;
    const departure = new Date(normalized);
    const now = new Date();
    const hoursUntilDeparture = (departure - now) / (1000 * 60 * 60);
    
    return hoursUntilDeparture <= 24 && hoursUntilDeparture > 0;
  };

  /**
   * Get Check-in Message
   * Returns appropriate message based on booking status and timing
   */
  const getCheckInMessage = (departureTime, bookingStatus) => {
    if (bookingStatus === 'checked_in') {
      return 'You have already checked in for this flight.';
    }
    
    if (bookingStatus === 'cancelled') {
      return 'This booking has been cancelled.';
    }

    const normalized = typeof departureTime === 'string'
      ? departureTime.replace(/\.(\d{3})\d+$/, '.$1')
      : departureTime;
    const departure = new Date(normalized);
    const now = new Date();
    const hoursUntilDeparture = (departure - now) / (1000 * 60 * 60);
    
    if (hoursUntilDeparture <= 0) {
      return 'This flight has already departed.';
    }
    
    if (hoursUntilDeparture > 24) {
      const daysUntilDeparture = Math.floor(hoursUntilDeparture / 24);
      const hoursUntilCheckIn = hoursUntilDeparture - 24;
      const daysUntilCheckIn = Math.floor(hoursUntilCheckIn / 24);
      
      if (daysUntilCheckIn > 0) {
        return `Check-in opens in ${daysUntilCheckIn} day${daysUntilCheckIn > 1 ? 's' : ''} (24 hours before departure).`;
      } else {
        return `Check-in opens in ${Math.ceil(hoursUntilCheckIn)} hours.`;
      }
    }
    
    return 'You can check-in now!';
  };

  /**
   * Handle Check In
   * Processes check-in for a specific booking and shows loyalty rewards
   */
  const handleCheckIn = async (bookingId) => {
    try {
      const response = await bookingsAPI.checkIn(bookingId);
      
      // Show success message with loyalty rewards
      if (response.data && response.data.loyalty_rewards) {
        const rewards = response.data.loyalty_rewards;
        const tierUpgrade = response.data.tier_upgrade;
        
        let message = `You've earned ${rewards.miles_earned} miles and ${rewards.points_earned} points!\n\n` +
          `Flight: ${rewards.flight_distance} miles\n` +
          `Seat Class: ${rewards.seat_class.charAt(0).toUpperCase() + rewards.seat_class.slice(1)}\n` +
          `Loyalty Tier: ${rewards.loyalty_tier}\n\n` +
          `Total Miles: ${rewards.total_miles}\n` +
          `Total Points: ${rewards.total_points}`;
        
        let title = 'Check-in Successful! 🎉';
        
        // Add tier upgrade message if user was upgraded
        if (tierUpgrade && tierUpgrade.upgraded) {
          title = '🎉 TIER UPGRADE! 🎉';
          message = `CONGRATULATIONS! You've been upgraded to ${tierUpgrade.new_tier} tier!\n\n` +
            `Previous Tier: ${tierUpgrade.old_tier}\n` +
            `New Tier: ${tierUpgrade.new_tier}\n\n` +
            `You earned ${rewards.miles_earned} miles and ${rewards.points_earned} points!\n` +
            `Total Miles: ${rewards.total_miles}\n\n` +
            `Enjoy your new ${tierUpgrade.new_tier} benefits!`;
        } else if (tierUpgrade && tierUpgrade.next_tier_threshold) {
          // Show progress to next tier
          const pointsToNext = tierUpgrade.next_tier_threshold - rewards.total_points;
          message += `\n\nPoints to next tier: ${pointsToNext}`;
        }
        
        Alert.alert(
          title,
          message,
          [
            {
              text: 'View Falconflyer',
              onPress: () => router.push('/falcon-flyer')
            },
            {
              text: 'OK',
              style: 'default'
            }
          ]
        );
      } else {
        Alert.alert('Success', 'Check-in completed successfully!');
      }
      
      // Reload bookings to update status
      loadUserBookings();
    } catch (error) {
      console.error('Check-in error:', error);
      Alert.alert('Error', error.message || 'Check-in failed. Please try again.');
    }
  };


  /**
   * Handle Manage Booking
   * Opens booking management for a specific trip
   */
  const handleManageBooking = (bookingId) => {
    console.log('Managing booking with ID:', bookingId);
    // Navigate to booking management page
    router.push(`/manage-booking?bookingId=${bookingId}`);
  };

  /**
   * Handle Refresh
   * Reloads user bookings from the backend with force refresh
   */
  const handleRefresh = () => {
    console.log('Manual refresh triggered');
    // Force a complete reload by resetting state first
    setBookings([]);
    setIsLoading(true);
    checkAuthAndLoadBookings();
  };

  /**
   * Handle Login
   * Navigates to login screen
   */
  const handleLogin = () => {
    router.push('/login');
  };

  /**
   * Handle Add Booking
   * Navigates to booking screen
   */
  const handleAddBooking = () => {
    router.push('/book');
  };

  // Debug logging
  console.log('My Trips render - bookings count:', bookings.length, 'isLoading:', isLoading, 'isLoggedIn:', isLoggedIn);

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
      
      {/* Header Section - Same as Book page */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/images/header.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <Ionicons name="refresh" size={20} color="#A68F65" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuButton} onPress={handleMenu}>
            <Ionicons name="menu" size={24} color="#A68F65" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading your trips...</Text>
          </View>
        ) : isLoggedIn ? (
          <>
            {/* Bookings Section */}
            {bookings.length > 0 ? (
              <View style={styles.bookingsSection}>
                {bookings.map((booking) => (
                  <View key={booking.id} style={styles.bookingCard}>
                    {/* Trip Image */}
                    <View style={styles.tripImageContainer}>
                      <Image 
                        source={booking.image}
                        style={styles.tripImage}
                        resizeMode="cover"
                      />
                      <View style={styles.imageDots}>
                        <View style={styles.dot} />
                        <View style={styles.dot} />
                        <View style={styles.dot} />
                      </View>
                    </View>

                    {/* Trip Details */}
                    <View style={styles.tripDetails}>
                      <View style={styles.tripInfo}>
                        <View style={styles.tripLeft}>
                          <Text style={styles.tripDate}>{booking.date}</Text>
                          <Text style={styles.tripDestination}>{booking.destination}</Text>
                          <Text style={styles.seatInfo}>
                            {booking.seatClass === 'business' ? 'Falcon Gold' : 'Economy'} • Seat {booking.seatNumber}
                          </Text>
                          <Text style={styles.priceInfo}>{formatPrice(booking.totalPrice)}</Text>
                        </View>
                        <View style={styles.tripRight}>
                          <Text style={styles.bookingLabel}>Booking Reference</Text>
                          <View style={styles.bookingRef}>
                            <Ionicons name="document-text" size={16} color="#A68F65" />
                            <Text
                              style={styles.bookingCode}
                              numberOfLines={1}
                              ellipsizeMode="tail"
                            >
                              {booking.bookingReference}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Action Buttons */}
                      <View style={styles.actionButtons}>
                        <TouchableOpacity 
                          style={[styles.actionButton, styles.checkInButton, !booking.canCheckIn && styles.disabledButton]}
                          onPress={() => handleCheckIn(booking.id)}
                          disabled={!booking.canCheckIn}
                        >
                          <Text style={[styles.actionButtonText, !booking.canCheckIn && styles.disabledButtonText]}>
                            Check in
                          </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={[styles.actionButton, styles.manageButton]}
                          onPress={() => handleManageBooking(booking.id)}
                        >
                          <Text style={styles.actionButtonText}>Manage</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Check-in Message */}
                      <Text style={styles.checkInMessage}>{booking.checkInMessage}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.noBookingsContainer}>
                <Text style={styles.noBookingsText}>No active trips</Text>
                <Text style={styles.noBookingsSubtext}>You don't have any active bookings. Start planning your next trip!</Text>
                <TouchableOpacity style={styles.addBookingButton} onPress={handleAddBooking}>
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.addBookingButtonText}>Book a flight</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          /* Login Prompt for Non-Authenticated Users */
          <View style={styles.loginPrompt}>
            <View style={styles.loginPromptIcon}>
              <Ionicons name="airplane" size={48} color="#A68F65" />
            </View>
            <Text style={styles.loginPromptTitle}>Welcome to My Trips</Text>
            <Text style={styles.loginPromptText}>
              Log in to view your bookings and manage your trips. Your flight bookings will appear here once you're signed in.
            </Text>
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Log in</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.signupButton} onPress={() => router.push('/signup')}>
              <Text style={styles.signupButtonText}>Don't have an account? Sign up</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNavBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/home')}>
          <Ionicons name="home" size={24} color="#8B8B8B" />
          <Text style={styles.navItemText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="airplane" size={24} color="#A68F65" />
          <Text style={styles.navItemTextActive}>My Trips</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/book')}>
          <Ionicons name="calendar" size={24} color="#8B8B8B" />
          <Text style={styles.navItemText}>Book</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/falcon-flyer')}>
          <Ionicons name="heart" size={24} color="#8B8B8B" />
          <Text style={styles.navItemText}>Falconflyer</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// StyleSheet for My Trips Screen - Same structure as Book page
const styles = StyleSheet.create({
  // Main container with white background
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Header section - Same as Book page
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
  // Logo container
  logoContainer: {
    flex: 1,
  },
  // Header logo styling
  headerLogo: {
    width: 200,
    height: 60,
  },
  // Header buttons styling
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refreshButton: {
    padding: 4,
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
    alignItems: 'center',
    paddingVertical: 40,
  },
  // Loading text styling
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  // Bookings section styling
  bookingsSection: {
    marginTop: 16,
  },
  // Booking card styling
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  // Trip image container
  tripImageContainer: {
    position: 'relative',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  // Trip image styling
  tripImage: {
    width: '100%',
    height: '100%',
  },
  // Image dots indicator
  imageDots: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 4,
  },
  // Individual dot styling
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  // Trip details container
  tripDetails: {
    padding: 16,
    overflow: 'hidden',
  },
  // Trip info section
  tripInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  // Trip left section
  tripLeft: {
    flex: 1,
  },
  // Trip date styling
  tripDate: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  // Trip destination styling
  tripDestination: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  // Passenger info styling
  passengerInfo: {
    fontSize: 16,
    color: '#1A1A2E',
    marginBottom: 4,
  },
  // Seat info styling
  seatInfo: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  // Price info styling
  priceInfo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A68F65',
  },
  // Trip right section
  tripRight: {
    alignItems: 'flex-end',
    maxWidth: '35%',
    flexShrink: 1,
  },
  // Booking label styling
  bookingLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  // Booking reference container
  bookingRef: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '100%',
  },
  // Booking code styling
  bookingCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    textAlign: 'right',
    flexShrink: 1,
  },
  // Action buttons container
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  // Action button base styling
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  // Check-in button styling
  checkInButton: {
    backgroundColor: '#E0E0E0',
  },
  // Manage button styling
  manageButton: {
    backgroundColor: '#1A1A2E',
  },
  // Disabled button styling
  disabledButton: {
    backgroundColor: '#F0F0F0',
  },
  // Action button text styling
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Disabled button text styling
  disabledButtonText: {
    color: '#999999',
  },
  // Check-in message styling
  checkInMessage: {
    fontSize: 14,
    color: '#FF6B35',
    textAlign: 'center',
  },
  // No bookings container
  noBookingsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  // No bookings text styling
  noBookingsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  // No bookings subtext styling
  noBookingsSubtext: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
  },
  // Add booking button styling
  addBookingButton: {
    backgroundColor: '#A68F65',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  // Add booking button text styling
  addBookingButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Login prompt container
  loginPrompt: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  // Login prompt icon
  loginPromptIcon: {
    marginBottom: 24,
  },
  // Login prompt title styling
  loginPromptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 12,
  },
  // Login prompt text styling
  loginPromptText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  // Login button styling
  loginButton: {
    backgroundColor: '#A68F65',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  // Login button text styling
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Signup button styling
  signupButton: {
    marginTop: 8,
  },
  // Signup button text styling
  signupButtonText: {
    fontSize: 14,
    color: '#A68F65',
    textDecorationLine: 'underline',
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