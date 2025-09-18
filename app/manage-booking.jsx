// Import React hooks and components for Booking Management functionality
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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { bookingsAPI, flightsAPI, getAuthToken } from '../utils/api';

/**
 * ManageBookingScreen Component - Gulf Air App Booking Management
 * 
 * This component provides detailed booking management functionality including:
 * - Flight details display
 * - Edit passenger details
 * - Change flight time/date
 * - Cancel booking with refund request
 * - Same UI structure as other pages with Gulf Air branding
 * 
 * @returns {JSX.Element} A complete booking management interface
 */
export default function ManageBookingScreen() {
  // Get booking ID from navigation parameters
  const { bookingId } = useLocalSearchParams();
  
  // State management for booking data and UI
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  
  // Reschedule state
  const [availableFlights, setAvailableFlights] = useState([]);
  const [selectedNewFlight, setSelectedNewFlight] = useState(null);
  const [selectedSeatClass, setSelectedSeatClass] = useState(null);
  const [selectedSeatNumber, setSelectedSeatNumber] = useState(null);
  const [isLoadingFlights, setIsLoadingFlights] = useState(false);

  // Load booking details on component mount
  useEffect(() => {
    if (bookingId) {
      loadBookingDetails();
    } else {
      console.log('No booking ID provided');
      setIsLoading(false);
    }
  }, [bookingId]);

  // Reload booking details when page becomes focused (for reschedule updates)
  useFocusEffect(
    React.useCallback(() => {
      if (bookingId) {
        console.log('Manage booking page focused, reloading booking details for ID:', bookingId);
        loadBookingDetails();
      }
    }, [bookingId])
  );

  /**
   * Load Booking Details
   * Fetches detailed booking information from the backend
   */
  const loadBookingDetails = async () => {
    try {
      setIsLoading(true);
      console.log('Loading booking details for ID:', bookingId);
      console.log('Booking ID type:', typeof bookingId);
      
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
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response));
      
      // Response is already the data (due to response interceptor)
      const bookingData = response;
      console.log('Setting booking data:', bookingData);
      console.log('Booking departure time:', bookingData?.flight?.departure_time);
      console.log('Booking arrival time:', bookingData?.flight?.arrival_time);
      setBooking(bookingData);
    } catch (error) {
      console.error('Error loading booking details:', error);
      console.error('Error details:', error.response?.data);
      Alert.alert('Error', `Failed to load booking details: ${error.message || 'Unknown error'}`);
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle Edit Field
   * Opens modal to edit specific booking field
   */
  const handleEditField = (field, currentValue) => {
    setEditingField(field);
    setEditValue(currentValue);
    setShowEditModal(true);
  };

  /**
   * Handle Change Flight
   * Opens reschedule modal to select a new flight
   */
  const handleChangeFlight = () => {
    // Check if booking is already cancelled
    if (booking?.booking_status === 'cancelled') {
      Alert.alert(
        'Cannot Reschedule',
        'This booking has been cancelled and cannot be rescheduled.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Check if booking is already checked in
    if (booking?.booking_status === 'checked_in') {
      Alert.alert(
        'Cannot Reschedule',
        'This booking has been checked in and cannot be rescheduled.',
        [{ text: 'OK' }]
      );
      return;
    }

    setShowRescheduleModal(true);
  };


  /**
   * Save Edit
   * Saves the edited field value
   */
  const saveEdit = async () => {
    try {
      // Here you would typically call an API to update the booking
      // For now, we'll just update the local state
      setBooking(prev => ({
        ...prev,
        [editingField]: editValue
      }));
      
      setShowEditModal(false);
      setEditingField(null);
      setEditValue('');
      
      Alert.alert('Success', 'Booking details updated successfully!');
    } catch (error) {
      console.error('Error updating booking:', error);
      Alert.alert('Error', 'Failed to update booking. Please try again.');
    }
  };


  /**
   * Handle Cancel & Refund Button
   * Shows confirmation dialog for cancellation
   */
  const handleCancelAndRefund = () => {
    // Navigate to dedicated cancel booking page
    router.push(`/cancel-booking?bookingId=${booking.id}`);
  };

  /**
   * Load Available Flights for Reschedule
   * Fetches flights on the same route for rescheduling
   */
  const loadAvailableFlights = async () => {
    if (!booking?.flight) return;
    
    setIsLoadingFlights(true);
    try {
      const flights = await flightsAPI.searchFlights(
        booking.flight.departure_airport,
        booking.flight.arrival_airport
      );
      
      // Filter out the current flight and only show future flights
      const currentDate = new Date();
      const availableFlights = flights.filter(flight => {
        const flightDate = new Date(flight.departure_time);
        return flight.id !== booking.flight.id && flightDate > currentDate;
      });
      
      setAvailableFlights(availableFlights);
    } catch (error) {
      console.error('Error loading available flights:', error);
      Alert.alert('Error', 'Failed to load available flights. Please try again.');
    } finally {
      setIsLoadingFlights(false);
    }
  };

  /**
   * Handle Reschedule Booking
   * Reschedules the booking to a new flight
   */
  const handleRescheduleBooking = async () => {
    if (!selectedNewFlight) {
      Alert.alert('Error', 'Please select a new flight.');
      return;
    }

    try {
      const response = await bookingsAPI.rescheduleBooking(
        booking.id,
        selectedNewFlight.id,
        selectedSeatClass || booking.seat_class,
        selectedSeatNumber || booking.seat_number
      );
      const newBooking = response?.new_booking;
      
      Alert.alert(
        'Reschedule Successful',
        `Your booking has been rescheduled successfully! New flight: ${selectedNewFlight.flight_number}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setShowRescheduleModal(false);
              setSelectedNewFlight(null);
              setSelectedSeatClass(null);
              setSelectedSeatNumber(null);
              setAvailableFlights([]);
              // Navigate to the new booking if available, otherwise reload
              if (newBooking?.id) {
                router.replace(`/manage-booking?bookingId=${newBooking.id}`);
              } else {
                loadBookingDetails();
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error rescheduling booking:', error);
      // If booking already cancelled, inform the user and refresh trips
      const msg = String(error?.message || '');
      if (msg.toLowerCase().includes('already cancelled') || msg.toLowerCase().includes('cannot reschedule a cancelled')) {
        Alert.alert(
          'Booking Updated',
          'This booking was already rescheduled or cancelled. Returning to My Trips to refresh your bookings.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/my-trips')
            }
          ]
        );
      } else {
        Alert.alert('Reschedule Error', error.message || 'Failed to reschedule booking. Please try again.');
      }
    }
  };

  /**
   * Format Date for Display
   * Converts date string to readable format
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = parseDate(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  /**
   * Format Time for Display
   * Converts time string to readable format
   */
  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = parseDate(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  /**
   * Format Compact Date and Time
   * Creates a clean, compact date and time display
   */
  const formatCompactDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      // Handle both Date objects and date strings
      const date = parseDate(dateString);
      
      // Check if date is valid
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

  /**
   * Parse date safely (handles strings and Date objects)
   */
  const parseDate = (dateInput) => {
    if (!dateInput) return null;
    if (dateInput instanceof Date) return dateInput;
    let str = String(dateInput);
    // If backend provides microseconds (e.g., 2025-09-18T19:31:52.601155),
    // trim to milliseconds so JS Date can parse it reliably
    str = str.replace(/\.(\d{3})\d+$/, '.$1');
    // If it's date-only, anchor to noon to avoid timezone day-shift
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      str = `${str}T12:00:00`;
    }
    const d = new Date(str);
    return isNaN(d) ? null : d;
  };

  /**
   * Compute flight duration in Hh Mm
   */
  const getFlightDuration = (startStr, endStr) => {
    const start = parseDate(startStr);
    const end = parseDate(endStr);
    if (!start || !end || isNaN(start) || isNaN(end)) return 'N/A';
    const diffMs = Math.max(0, end.getTime() - start.getTime());
    const totalMinutes = Math.round(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  // Debug logging
  console.log('Manage booking render - isLoading:', isLoading, 'booking:', booking, 'bookingId:', bookingId);

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
      
      {/* Header with Gulf Air Logo */}
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
        {/* Page Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.pageTitle}>Manage Booking</Text>
          <Text style={styles.bookingRef}>Reference: {booking.booking_reference}</Text>
        </View>

        {/* Flight Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Flight Details</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => handleEditField('flightDetails', 'Edit flight details')}
            >
              <Ionicons name="create-outline" size={20} color="#A68F65" />
            </TouchableOpacity>
          </View>

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
                <Text style={styles.detailLabel}>Duration:</Text>
                <Text style={styles.detailValue}>
                  {getFlightDuration(booking.flight?.departure_time, booking.flight?.arrival_time)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Seat Class:</Text>
                <Text style={styles.detailValue}>
                  {booking.seat_class === 'business' ? 'Falcon Gold' : 'Economy'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Seat Number:</Text>
                <Text style={styles.detailValue}>{booking.seat_number}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total Price:</Text>
                <Text style={styles.detailValue}>BHD {booking.total_price?.toFixed(3)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Passenger Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Passenger Details</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => handleEditField('passengerName', booking.passengerName)}
            >
              <Ionicons name="create-outline" size={20} color="#A68F65" />
            </TouchableOpacity>
          </View>

          <View style={styles.passengerInfo}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Name:</Text>
              <Text style={styles.detailValue}>{booking.passenger_name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email:</Text>
              <Text style={styles.detailValue}>{booking.passenger_email}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Passport:</Text>
              <Text style={styles.detailValue}>{booking.passport_number}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Booking Date:</Text>
              <Text style={styles.detailValue}>{formatCompactDateTime(booking.booking_date)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <Text style={[
                styles.detailValue, 
                styles.statusText,
                booking.booking_status === 'cancelled' && styles.cancelledStatusText
              ]}>
                {booking.booking_status === 'cancelled' ? 'Cancelled' : booking.booking_status}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={handleChangeFlight}
          >
            <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Change Flight</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.actionButton, 
              styles.cancelButton,
              booking?.booking_status === 'cancelled' && styles.disabledButton
            ]}
            onPress={booking?.booking_status === 'cancelled' ? null : handleCancelAndRefund}
            disabled={booking?.booking_status === 'cancelled'}
          >
            <Ionicons 
              name="close-circle-outline" 
              size={20} 
              color={booking?.booking_status === 'cancelled' ? "#CCCCCC" : "#FFFFFF"} 
            />
            <Text style={[
              styles.actionButtonText,
              booking?.booking_status === 'cancelled' && styles.disabledButtonText
            ]}>
              {booking?.booking_status === 'cancelled' ? 'Already Cancelled' : 'Cancel & Refund'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit {editingField}</Text>
            <TextInput
              style={styles.modalInput}
              value={editValue}
              onChangeText={setEditValue}
              placeholder={`Enter new ${editingField}`}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveModalButton]}
                onPress={saveEdit}
              >
                <Text style={styles.saveModalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>



      {/* Reschedule Modal */}
      <Modal
        visible={showRescheduleModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowRescheduleModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Ionicons name="airplane" size={20} color="#A68F65" />
            <Text style={styles.modalTitle}>Reschedule Flight</Text>
            <TouchableOpacity onPress={() => setShowRescheduleModal(false)}>
              <Ionicons name="close" size={24} color="#1A1A2E" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalDescription}>
              Select a new flight for the same route. Your current booking will be automatically cancelled and a new one will be created.
            </Text>

            <View style={styles.currentFlightInfo}>
              <Text style={styles.currentFlightTitle}>Current Flight:</Text>
              <Text style={styles.currentFlightDetails}>
                {booking?.flight?.flight_number} • {formatCompactDateTime(booking?.flight?.departure_time)}
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.loadFlightsButton}
              onPress={loadAvailableFlights}
              disabled={isLoadingFlights}
            >
              <Ionicons name="search" size={20} color="#FFFFFF" />
              <Text style={styles.loadFlightsButtonText}>
                {isLoadingFlights ? 'Loading Flights...' : 'Load Available Flights'}
              </Text>
            </TouchableOpacity>

            {availableFlights.length > 0 && (
              <View style={styles.flightsList}>
                <Text style={styles.flightsListTitle}>Available Flights:</Text>
                {availableFlights.map((flight) => (
                  <TouchableOpacity
                    key={flight.id}
                    style={[
                      styles.flightOption,
                      selectedNewFlight?.id === flight.id && styles.selectedFlightOption
                    ]}
                    onPress={() => setSelectedNewFlight(flight)}
                  >
                    <View style={styles.flightInfo}>
                      <Text style={styles.flightNumber}>{flight.flight_number}</Text>
                      <Text style={styles.flightTime}>
                        {formatCompactDateTime(flight.departure_time)}
                      </Text>
                      <Text style={styles.flightPrice}>Economy: BHD {flight.economy_price?.toFixed(3)}</Text>
                      <Text style={styles.flightPrice}>Falcon Gold: BHD {flight.business_price?.toFixed(3)}</Text>
                    </View>
                    {selectedNewFlight?.id === flight.id && (
                      <Ionicons name="checkmark-circle" size={24} color="#A68F65" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {selectedNewFlight && (
              <View style={styles.selectedFlightInfo}>
                <Text style={styles.selectedFlightTitle}>Selected Flight:</Text>
                <Text style={styles.selectedFlightDetails}>
                  {selectedNewFlight.flight_number} • {formatCompactDateTime(selectedNewFlight.departure_time)}
                </Text>
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.selectedFlightTitle}>Choose Seat Class:</Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                    <TouchableOpacity
                      onPress={() => setSelectedSeatClass('economy')}
                      style={[styles.flightOption, selectedSeatClass === 'economy' && styles.selectedFlightOption]}
                    >
                      <Text>Economy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setSelectedSeatClass('business')}
                      style={[styles.flightOption, selectedSeatClass === 'business' && styles.selectedFlightOption]}
                    >
                      <Text>Falcon Gold</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.selectedFlightTitle}>Seat Number (optional):</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder={`e.g. ${booking?.seat_number || '12A'}`}
                    value={selectedSeatNumber || ''}
                    onChangeText={setSelectedSeatNumber}
                  />
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.cancelRescheduleButton}
              onPress={() => {
                setShowRescheduleModal(false);
                setSelectedNewFlight(null);
                setAvailableFlights([]);
              }}
            >
              <Text style={styles.cancelRescheduleButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.confirmRescheduleButton,
                !selectedNewFlight && styles.disabledButton
              ]}
              onPress={handleRescheduleBooking}
              disabled={!selectedNewFlight}
            >
              <Text style={[
                styles.confirmRescheduleButtonText,
                !selectedNewFlight && styles.disabledButtonText
              ]}>
                Confirm Reschedule
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNavBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/home')}>
          <Ionicons name="home" size={24} color="#8B8B8B" />
          <Text style={styles.navItemText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/my-trips')}>
          <Ionicons name="airplane" size={24} color="#A68F65" />
          <Text style={styles.navItemTextActive}>My Trips</Text>
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

// StyleSheet for Manage Booking Screen - Gulf Air Brand Colors and Layout
const styles = StyleSheet.create({
  // Main container with white background
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Header section styling
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  // Logo container
  logoContainer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    flex: 0,
    minWidth: 200,
  },
  // Header logo styling
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
  // Details card styling
  detailsCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  editButton: {
    padding: 8,
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
  statusText: {
    color: '#28A745',
    textTransform: 'capitalize',
  },
  cancelledStatusText: {
    color: '#F44336',
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
    opacity: 0.6,
  },
  disabledButtonText: {
    color: '#9E9E9E',
  },
  // Passenger info styling
  passengerInfo: {
    gap: 12,
  },
  // Action buttons container
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  editButton: {
    backgroundColor: '#A68F65',
  },
  cancelButton: {
    backgroundColor: '#DC3545',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styling
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 480,
  },
  // Full-screen cancel modal header
  modalTopBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  modalBrandLogo: {
    width: 200,
    height: 60,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalTitleLarge: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalDescriptionCentered: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 24,
  },
  modalFieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalTextArea: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  // New bottom action bar and buttons
  modalActions: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalBottomBar: {
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  modalBottomBarInner: {
    flexDirection: 'row',
    gap: 12,
  },
  modalActionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalSecondaryButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  modalDangerButton: {
    backgroundColor: '#DC3545',
  },
  modalSecondaryText: {
    color: '#1A1A2E',
    fontSize: 16,
    fontWeight: '600',
  },
  modalDangerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  // Reschedule modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
    marginBottom: 20,
  },
  currentFlightInfo: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  currentFlightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  currentFlightDetails: {
    fontSize: 16,
    color: '#666666',
  },
  loadFlightsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A68F65',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  loadFlightsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  flightsList: {
    marginBottom: 20,
  },
  flightsListTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 12,
  },
  flightOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  selectedFlightOption: {
    backgroundColor: '#FFF8E1',
    borderColor: '#A68F65',
  },
  flightInfo: {
    flex: 1,
  },
  flightNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  flightTime: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  flightPrice: {
    fontSize: 14,
    color: '#A68F65',
    fontWeight: '500',
  },
  selectedFlightInfo: {
    backgroundColor: '#E8F5E8',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  selectedFlightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  selectedFlightDetails: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    gap: 12,
  },
  cancelRescheduleButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  cancelRescheduleButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmRescheduleButton: {
    flex: 1,
    backgroundColor: '#A68F65',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmRescheduleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#E9ECEF',
  },
  disabledButtonText: {
    color: '#999999',
  },
  // Bottom navigation bar
  bottomNavBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    paddingVertical: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navItemText: {
    fontSize: 12,
    color: '#8B8B8B',
    marginTop: 4,
  },
  navItemTextActive: {
    fontSize: 12,
    color: '#A68F65',
    marginTop: 4,
    fontWeight: '600',
  },
});
