// Import React hooks and components for Cancel Booking functionality
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { bookingsAPI, getAuthToken } from '../utils/api';

/**
 * CancelBookingScreen Component - Gulf Air App Booking Cancellation
 * 
 * This component provides a dedicated page for cancelling bookings with:
 * - Gulf Air branding and consistent header
 * - Booking details display
 * - Cancellation reason input
 * - Confirmation and refund information
 * - Proper navigation back to trips
 * 
 * @returns {JSX.Element} A complete booking cancellation interface
 */
export default function CancelBookingScreen() {
  // Get booking ID from navigation parameters
  const { bookingId } = useLocalSearchParams();
  
  // State management for booking data and UI
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [refundReason, setRefundReason] = useState('');

  // Load booking details on component mount
  useEffect(() => {
    if (bookingId) {
      loadBookingDetails();
    } else {
      console.log('No booking ID provided');
      setIsLoading(false);
    }
  }, [bookingId]);

  /**
   * Load Booking Details
   * Fetches detailed booking information from the backend
   */
  const loadBookingDetails = async () => {
    try {
      setIsLoading(true);
      console.log('Loading booking details for ID:', bookingId);
      
      const token = getAuthToken();
      if (!token) {
        Alert.alert('Authentication Required', 'Please log in to manage your booking.');
        router.replace('/login');
        return;
      }

      // Convert bookingId to number if it's a string
      const numericBookingId = parseInt(bookingId);
      console.log('Numeric booking ID:', numericBookingId);
      
      const response = await bookingsAPI.getBooking(numericBookingId);
      console.log('Booking response:', response);
      
      setBooking(response);
    } catch (error) {
      console.error('Error loading booking details:', error);
      Alert.alert('Error', `Failed to load booking details: ${error.message || 'Unknown error'}`);
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle Cancel Booking
   * Processes booking cancellation with refund request
   */
  const handleCancelBooking = async () => {
    // Check if booking is already cancelled
    if (booking?.booking_status === 'cancelled') {
      Alert.alert(
        'Already Cancelled',
        'This booking has already been cancelled.',
        [{ text: 'OK', onPress: () => router.replace('/my-trips') }]
      );
      return;
    }

    try {
      setIsCancelling(true);
      
      await bookingsAPI.cancelBooking(booking.id);
      
      Alert.alert(
        'Booking Cancelled',
        'Your booking has been cancelled successfully. Refund will be processed within 5-7 business days.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/my-trips')
          }
        ]
      );
    } catch (error) {
      console.error('Error cancelling booking:', error);
      
      // Handle specific error messages
      let errorMessage = 'Failed to cancel booking. Please try again.';
      
      if (error.message && error.message.includes('already cancelled')) {
        errorMessage = 'This booking has already been cancelled.';
        Alert.alert('Already Cancelled', errorMessage, [
          { text: 'OK', onPress: () => router.replace('/my-trips') }
        ]);
        return;
      } else if (error.message && error.message.includes('not found')) {
        errorMessage = 'Booking not found. It may have already been cancelled.';
      } else if (error.message && error.message.includes('cannot be cancelled')) {
        errorMessage = 'This booking cannot be cancelled at this time.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsCancelling(false);
    }
  };

  /**
   * Format Compact Date and Time
   * Creates a clean, compact date and time display
   */
  const formatCompactDateTime = (dateString) => {
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
        console.warn('Invalid date in formatCompactDateTime:', dateString);
        return 'N/A';
      }

      const day = date.toLocaleDateString('en-US', { day: 'numeric' });
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const time = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      
      return `${day} ${month} • ${time}`;
    } catch (error) {
      console.error('Error formatting compact date time:', dateString, error);
      return 'N/A';
    }
  };

  // Debug logging
  console.log('Cancel booking render - isLoading:', isLoading, 'booking:', booking, 'bookingId:', bookingId);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading booking details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!booking && !isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Booking not found</Text>
          <Text style={styles.errorSubtext}>
            Booking ID: {bookingId || 'Not provided'}
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header with Gulf Air Logo - Same as other pages */}
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
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1A1A2E" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Page Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.pageTitle}>Cancel Booking</Text>
          <Text style={styles.bookingRef}>Reference: {booking.booking_reference}</Text>
        </View>

        {/* Warning Card */}
        <View style={styles.warningCard}>
          <View style={styles.warningHeader}>
            <Ionicons name="warning" size={24} color="#FF6B35" />
            <Text style={styles.warningTitle}>Important Notice</Text>
          </View>
          <Text style={styles.warningText}>
            Cancelling this booking will remove it from your trips and process a refund within 5-7 business days. This action cannot be undone.
          </Text>
        </View>

        {/* Flight Details Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Flight Details</Text>
          
          <View style={styles.flightInfo}>
            <View style={styles.routeInfo}>
              <Text style={styles.airportCode}>{booking.flight?.departure_airport}</Text>
              <View style={styles.flightLine}>
                <View style={styles.flightDot} />
                <View style={styles.flightLineConnector} />
                <Ionicons name="airplane" size={16} color="#A68F65" />
                <View style={styles.flightLineConnector} />
                <View style={styles.flightDot} />
              </View>
              <Text style={styles.airportCode}>{booking.flight?.arrival_airport}</Text>
            </View>

            <View style={styles.flightDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Flight Number:</Text>
                <Text style={styles.detailValue}>{booking.flight?.flight_number}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Departure:</Text>
                <Text style={styles.detailValue}>
                  {formatCompactDateTime(booking.flight?.departure_time)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Arrival:</Text>
                <Text style={styles.detailValue}>
                  {formatCompactDateTime(booking.flight?.arrival_time)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Seat Class:</Text>
                <Text style={styles.detailValue}>
                  {booking.seat_class === 'business' ? 'Falcon Gold' : 'Economy'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total Price:</Text>
                <Text style={styles.detailValue}>BHD {booking.total_price?.toFixed(3)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Cancellation Reason */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Cancellation Reason (Optional)</Text>
          <Text style={styles.fieldLabel}>Help us improve by telling us why you're cancelling:</Text>
          <TextInput
            style={styles.reasonInput}
            value={refundReason}
            onChangeText={setRefundReason}
            placeholder="Tell us why you are cancelling this booking..."
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Refund Information */}
        <View style={styles.refundCard}>
          <View style={styles.refundHeader}>
            <Ionicons name="card" size={20} color="#A68F65" />
            <Text style={styles.refundTitle}>Refund Information</Text>
          </View>
          <Text style={styles.refundText}>
            • Refund amount: BHD {booking.total_price?.toFixed(3)}
          </Text>
          <Text style={styles.refundText}>
            • Processing time: 5-7 business days
          </Text>
          <Text style={styles.refundText}>
            • Refund method: Original payment method
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={styles.keepBookingButton}
          onPress={() => router.back()}
        >
          <Text style={styles.keepBookingText}>Keep Booking</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.cancelBookingButton,
            booking?.booking_status === 'cancelled' && styles.disabledButton
          ]}
          onPress={handleCancelBooking}
          disabled={booking?.booking_status === 'cancelled' || isCancelling}
        >
          <Ionicons 
            name="close-circle" 
            size={20} 
            color={booking?.booking_status === 'cancelled' ? "#CCCCCC" : "#FFFFFF"} 
          />
          <Text style={[
            styles.cancelBookingText,
            booking?.booking_status === 'cancelled' && styles.disabledButtonText
          ]}>
            {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// StyleSheet for Cancel Booking Screen - Gulf Air Brand Colors and Layout
const styles = StyleSheet.create({
  // Main container with white background
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Header section styling - Same as other pages
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
    alignItems: 'flex-start',
    justifyContent: 'center',
    flex: 0,
    minWidth: 200,
  },
  // Header logo styling - Same size as other pages
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
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  // Error container
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#DC3545',
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#A68F65',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Title container
  titleContainer: {
    marginBottom: 24,
    marginTop: 16,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  bookingRef: {
    fontSize: 16,
    color: '#666666',
  },
  // Warning card styling
  warningCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginLeft: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#E65100',
    lineHeight: 20,
  },
  // Details card styling
  detailsCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 16,
  },
  // Flight info styling
  flightInfo: {
    marginTop: 8,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  airportCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  flightLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  flightDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#A68F65',
  },
  flightLineConnector: {
    width: 20,
    height: 2,
    backgroundColor: '#A68F65',
  },
  // Flight details styling
  flightDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#1A1A2E',
    fontWeight: '600',
  },
  // Field styling
  fieldLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  // Refund card styling
  refundCard: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  refundHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  refundTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginLeft: 8,
  },
  refundText: {
    fontSize: 14,
    color: '#388E3C',
    marginBottom: 4,
  },
  // Bottom actions styling
  bottomActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  keepBookingButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  keepBookingText: {
    color: '#1A1A2E',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelBookingButton: {
    flex: 1,
    backgroundColor: '#DC3545',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cancelBookingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
    opacity: 0.6,
  },
  disabledButtonText: {
    color: '#9E9E9E',
  },
});
