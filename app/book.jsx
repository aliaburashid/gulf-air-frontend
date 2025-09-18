// Import React hooks and components for flight booking functionality
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { flightsAPI, bookingsAPI, testAPIConnection, getAuthToken } from '../utils/api';

/**
 * BookScreen Component - Gulf Air App Flight Booking
 * 
 * This component provides a comprehensive flight search and booking interface.
 * It integrates with the FastAPI backend to search flights and create bookings.
 * 
 * Features:
 * - One-way flight booking only
 * - Origin and destination selection with airport codes
 * - Date selection for departure
 * - Passenger count and class selection
 * - Real-time flight search with backend integration
 * - Flight results display with booking functionality
 * 
 * @returns {JSX.Element} A complete flight booking interface
 */
export default function BookScreen() {
  // Get URL parameters for reschedule functionality
  const { departure, arrival, reschedule, bookingId } = useLocalSearchParams();
  
  // State management for flight search
  const [flightType, setFlightType] = useState('oneway'); // 'oneway' only
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [seatClass, setSeatClass] = useState('economy');
  
  // State for search results and UI
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [noFlightsForSelectedDate, setNoFlightsForSelectedDate] = useState(false);
  const [showAirportModal, setShowAirportModal] = useState(false);
  const [airportType, setAirportType] = useState('origin'); // 'origin' or 'destination'
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarType, setCalendarType] = useState('departure'); // 'departure' or 'return'
  const [showClassModal, setShowClassModal] = useState(false);
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  
  // Booking form state
  const [passengerName, setPassengerName] = useState('');
  const [passengerEmail, setPassengerEmail] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  
  // Passenger counts state
  const [passengerCounts, setPassengerCounts] = useState({
    adults: 1,
    children: 0,
    infants: 0,
    youth: 0
  });

  // Available airports based on actual Gulf Air routes from backend
  const airports = [
    // Middle East routes
    { code: 'BAH', name: 'Bahrain International Airport', city: 'Bahrain' },
    { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai' },
    { code: 'DOH', name: 'Hamad International Airport', city: 'Doha' },
    { code: 'KWI', name: 'Kuwait International Airport', city: 'Kuwait' },
    { code: 'RUH', name: 'King Khalid International Airport', city: 'Riyadh' },
    { code: 'JED', name: 'King Abdulaziz International Airport', city: 'Jeddah' },
    { code: 'CAI', name: 'Cairo International Airport', city: 'Cairo' },
    { code: 'BEY', name: 'Beirut Rafic Hariri International Airport', city: 'Beirut' },
    { code: 'AMM', name: 'Queen Alia International Airport', city: 'Amman' },
    
    // European routes
    { code: 'LHR', name: 'Heathrow Airport', city: 'London' },
    { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris' },
    { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt' },
    { code: 'MAD', name: 'Adolfo Suárez Madrid–Barajas Airport', city: 'Madrid' },
    { code: 'FCO', name: 'Leonardo da Vinci International Airport', city: 'Rome' },
    { code: 'ATH', name: 'Athens International Airport', city: 'Athens' },
    
    // Asian routes
    { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai' },
    { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'Delhi' },
    { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok' },
    { code: 'KUL', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur' },
    { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore' },
    { code: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong' },
    
    // African routes
    { code: 'NBO', name: 'Jomo Kenyatta International Airport', city: 'Nairobi' },
    { code: 'JNB', name: 'O.R. Tambo International Airport', city: 'Johannesburg' },
    { code: 'ADD', name: 'Addis Ababa Bole International Airport', city: 'Addis Ababa' },
  ];

  // Handle reschedule parameters on component mount
  useEffect(() => {
    if (reschedule === 'true' && departure && arrival) {
      console.log('Reschedule mode detected:', { departure, arrival, bookingId });
      setOrigin(departure);
      setDestination(arrival);
      
      // Set departure date to tomorrow for reschedule
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      // Use local date format to avoid timezone issues
      const year = tomorrow.getFullYear();
      const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const day = String(tomorrow.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      setDepartureDate(formattedDate);
      
      // Show reschedule notification
      Alert.alert(
        'Reschedule Mode',
        `You are rescheduling a flight from ${departure} to ${arrival}. Please select your new departure date and search for available flights.`,
        [{ text: 'OK' }]
      );
    }
  }, [reschedule, departure, arrival, bookingId]);

  /**
   * Handle Flight Type Selection
   * Updates the flight type (one-way only)
   */
  const handleFlightTypeChange = (type) => {
    setFlightType(type);
  };

  /**
   * Handle Airport Selection
   * Opens modal for selecting origin or destination airport
   */
  const handleAirportSelect = (type) => {
    setAirportType(type);
    setShowAirportModal(true);
  };

  /**
   * Select Airport from Modal
   * Updates the selected airport and closes modal
   */
  const selectAirport = (airport) => {
    if (airportType === 'origin') {
      setOrigin(airport.code);
    } else {
      setDestination(airport.code);
    }
    setShowAirportModal(false);
  };

  /**
   * Get Airport Name from Code
   * Returns the full airport name for display
   */
  const getAirportName = (code) => {
    const airport = airports.find(a => a.code === code);
    return airport ? `${airport.city} (${airport.code})` : code;
  };

  /**
   * Format Date for Display
   * Converts date to readable format
   */
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T12:00:00'); // Add time to avoid timezone issues
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  /**
   * Format Full Date for Display
   * Converts date to readable format like "9 OCT 2025"
   */
  const formatFullDate = (dateString) => {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateString);
        return 'N/A';
      }

      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
                      'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    } catch (error) {
      console.error('Error formatting full date:', dateString, error);
      return 'N/A';
    }
  };

  /**
   * Group flights by date
   * Returns an object with dates as keys and arrays of flights as values
   */
  const groupFlightsByDate = (flights) => {
    const grouped = {};
    flights.forEach(flight => {
      const dateKey = new Date(flight.departureTime).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(flight);
    });
    return grouped;
  };

  /**
   * Handle Date Selection
   * Opens calendar modal for date selection
   */
  const handleDateSelect = () => {
    setCalendarType('departure');
    setShowCalendarModal(true);
  };

  /**
   * Select Date from Calendar
   * Updates the selected date and closes modal
   */
  const selectDate = (date) => {
    // Use local date format to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`; // YYYY-MM-DD format
    
    console.log('Date selected:', date);
    console.log('Formatted date:', formattedDate);
    console.log('Date day:', date.getDate());
    console.log('Formatted day:', day);
    
    setDepartureDate(formattedDate);
    setShowCalendarModal(false);
  };

  /**
   * Generate Calendar Data
   * Creates calendar data for the current and next few months
   */
  const generateCalendarData = () => {
    const today = new Date();
    const months = [];
    
    // Generate next 6 months
    for (let i = 0; i < 6; i++) {
      const month = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const monthData = {
        year: month.getFullYear(),
        month: month.getMonth(),
        monthName: month.toLocaleDateString('en-US', { month: 'long' }),
        days: generateMonthDays(month)
      };
      months.push(monthData);
    }
    
    return months;
  };

  /**
   * Generate Days for a Specific Month
   * Creates calendar grid for a month
   */
  const generateMonthDays = (monthDate) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    const days = [];
    // Use consistent date for today comparison
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      // Create date at noon to avoid timezone issues
      const date = new Date(year, month, day, 12, 0, 0);
      const dateStart = new Date(year, month, day);
      const isPast = dateStart < todayStart;
      const isToday = dateStart.getTime() === todayStart.getTime();
      
      days.push({
        day,
        date,
        isPast,
        isToday,
        isSelectable: !isPast
      });
    }
    
    return days;
  };

  /**
   * Available Seat Classes
   * Defines the seat class options that match the backend
   */
  const seatClasses = [
    { value: 'economy', label: 'Economy' },
    { value: 'falcon_gold', label: 'Falcon Gold' },
  ];

  /**
   * Select Seat Class
   * Updates the selected seat class and closes modal
   */
  const selectSeatClass = (classValue) => {
    setSeatClass(classValue);
    setShowClassModal(false);
  };

  /**
   * Handle Passenger Count Changes
   * Updates passenger counts with validation
   */
  const updatePassengerCount = (type, delta) => {
    setPassengerCounts(prev => {
      const newCounts = { ...prev };
      newCounts[type] = Math.max(0, Math.min(9, newCounts[type] + delta));
      
      // Ensure at least 1 adult
      if (type === 'adults' && newCounts[type] < 1) {
        newCounts[type] = 1;
      }
      
      return newCounts;
    });
  };

  /**
   * Get Total Passenger Count
   * Calculates total number of passengers
   */
  const getTotalPassengers = () => {
    return passengerCounts.adults + passengerCounts.children + passengerCounts.infants + passengerCounts.youth;
  };

  /**
   * Get Remaining Passenger Slots
   * Calculates how many more passengers can be added
   */
  const getRemainingPassengers = () => {
    return 9 - getTotalPassengers();
  };

  /**
   * Generate Seat Map
   * Creates a seat map with available, unavailable, and selected seats
   * Based on aircraft type (A320 for short-haul, Boeing 787 for long-haul)
   */
  const generateSeatMap = () => {
    const seats = [];
    
    // Get the current selected flight from state
    const currentFlight = selectedFlight;
    
    
    // Determine aircraft type based on selected flight
    // If no flight data, default to short-haul (A320)
    const isLongHaul = currentFlight && currentFlight.arrivalAirport && 
      ['LHR', 'CDG', 'FRA', 'BKK', 'KUL', 'SIN', 'HKG', 'JNB'].includes(currentFlight.arrivalAirport);
    
    // If no flight data available, show a default seat map
    if (!currentFlight) {
      // Default to A320 layout
    }
    
    if (seatClass === 'falcon_gold') {
      if (isLongHaul) {
        // Boeing 787 Falcon Gold seats (2-2-2 configuration, 30 seats total)
        for (let row = 1; row <= 5; row++) {
          const rowSeats = [
            { id: `${row}A`, status: 'available' },
            { id: `${row}C`, status: 'available' },
            { id: `${row}D`, status: 'available' },
            { id: `${row}F`, status: 'available' },
            { id: `${row}G`, status: 'available' },
            { id: `${row}K`, status: 'available' }
          ];
          
          // Mark selected seat
          rowSeats.forEach(seat => {
            if (selectedSeat === seat.id) {
              seat.status = 'selected';
            }
            // Randomly make some seats unavailable (20% chance)
            else if (Math.random() < 0.2) {
              seat.status = 'unavailable';
            }
          });
          
          seats.push(...rowSeats);
        }
      } else {
        // Airbus A320 Falcon Gold seats (2-2 configuration, 12 seats total)
        for (let row = 1; row <= 3; row++) {
          const rowSeats = [
            { id: `${row}A`, status: 'available' },
            { id: `${row}C`, status: 'available' },
            { id: `${row}D`, status: 'available' },
            { id: `${row}F`, status: 'available' }
          ];
          
          // Mark selected seat
          rowSeats.forEach(seat => {
            if (selectedSeat === seat.id) {
              seat.status = 'selected';
            }
            // Randomly make some seats unavailable (20% chance)
            else if (Math.random() < 0.2) {
              seat.status = 'unavailable';
            }
          });
          
          seats.push(...rowSeats);
        }
      }
    } else {
      if (isLongHaul) {
        // Boeing 787 Economy seats (3-3-3 configuration, 252 seats total)
        for (let row = 8; row <= 28; row++) {
          const rowSeats = [
            { id: `${row}A`, status: 'available' },
            { id: `${row}B`, status: 'available' },
            { id: `${row}C`, status: 'available' },
            { id: `${row}D`, status: 'available' },
            { id: `${row}E`, status: 'available' },
            { id: `${row}F`, status: 'available' },
            { id: `${row}G`, status: 'available' },
            { id: `${row}H`, status: 'available' },
            { id: `${row}K`, status: 'available' }
          ];
          
          // Mark selected seat
          rowSeats.forEach(seat => {
            if (selectedSeat === seat.id) {
              seat.status = 'selected';
            }
            // Randomly make some seats unavailable (30% chance)
            else if (Math.random() < 0.3) {
              seat.status = 'unavailable';
            }
          });
          
          seats.push(...rowSeats);
        }
      } else {
        // Airbus A320 Economy seats (3-3 configuration, 132 seats total)
        for (let row = 8; row <= 28; row++) {
          const rowSeats = [
            { id: `${row}A`, status: 'available' },
            { id: `${row}B`, status: 'available' },
            { id: `${row}C`, status: 'available' },
            { id: `${row}D`, status: 'available' },
            { id: `${row}E`, status: 'available' },
            { id: `${row}F`, status: 'available' }
          ];
          
          // Mark selected seat
          rowSeats.forEach(seat => {
            if (selectedSeat === seat.id) {
              seat.status = 'selected';
            }
            // Randomly make some seats unavailable (30% chance)
            else if (Math.random() < 0.3) {
              seat.status = 'unavailable';
            }
          });
          
          seats.push(...rowSeats);
        }
      }
    }
    
    return seats;
  };

  /**
   * Generate Aircraft Seat Map
   * Creates a proper aircraft seat layout based on aircraft type and seat class
   */
  const generateAircraftSeatMap = () => {
    const rows = [];
    
    // Get the current selected flight from state
    const currentFlight = selectedFlight;
    
    // Determine aircraft type based on selected flight
    const isLongHaul = currentFlight && currentFlight.arrivalAirport && 
      ['LHR', 'CDG', 'FRA', 'BKK', 'KUL', 'SIN', 'HKG', 'JNB'].includes(currentFlight.arrivalAirport);
    
    if (seatClass === 'falcon_gold') {
      if (isLongHaul) {
        // Boeing 787 Falcon Gold seats (2-2-2 configuration)
        for (let rowNum = 1; rowNum <= 5; rowNum++) {
          const seats = [
            { id: `${rowNum}A`, letter: 'A', isAisle: false },
            { id: `${rowNum}B`, letter: 'B', isAisle: false },
            { id: `${rowNum}C`, letter: 'C', isAisle: true }, // Aisle
            { id: `${rowNum}D`, letter: 'D', isAisle: false },
            { id: `${rowNum}E`, letter: 'E', isAisle: false },
            { id: `${rowNum}F`, letter: 'F', isAisle: true }, // Aisle
          ];
          rows.push({ row: rowNum, seats });
        }
      } else {
        // A320 Falcon Gold seats (2-2 configuration)
        for (let rowNum = 1; rowNum <= 10; rowNum++) {
          const seats = [
            { id: `${rowNum}A`, letter: 'A', isAisle: false },
            { id: `${rowNum}B`, letter: 'B', isAisle: false },
            { id: `${rowNum}C`, letter: 'C', isAisle: true }, // Aisle
            { id: `${rowNum}D`, letter: 'D', isAisle: false },
          ];
          rows.push({ row: rowNum, seats });
        }
      }
    } else {
      if (isLongHaul) {
        // Boeing 787 Economy seats (3-3-3 configuration)
        for (let rowNum = 1; rowNum <= 30; rowNum++) {
          const seats = [
            { id: `${rowNum}A`, letter: 'A', isAisle: false },
            { id: `${rowNum}B`, letter: 'B', isAisle: false },
            { id: `${rowNum}C`, letter: 'C', isAisle: false },
            { id: `${rowNum}D`, letter: 'D', isAisle: true }, // Aisle
            { id: `${rowNum}E`, letter: 'E', isAisle: false },
            { id: `${rowNum}F`, letter: 'F', isAisle: false },
            { id: `${rowNum}G`, letter: 'G', isAisle: false },
            { id: `${rowNum}H`, letter: 'H', isAisle: true }, // Aisle
            { id: `${rowNum}J`, letter: 'J', isAisle: false },
          ];
          rows.push({ row: rowNum, seats });
        }
      } else {
        // A320 Economy seats (3-3 configuration)
        for (let rowNum = 1; rowNum <= 25; rowNum++) {
          const seats = [
            { id: `${rowNum}A`, letter: 'A', isAisle: false },
            { id: `${rowNum}B`, letter: 'B', isAisle: false },
            { id: `${rowNum}C`, letter: 'C', isAisle: false },
            { id: `${rowNum}D`, letter: 'D', isAisle: true }, // Aisle
            { id: `${rowNum}E`, letter: 'E', isAisle: false },
            { id: `${rowNum}F`, letter: 'F', isAisle: false },
          ];
          rows.push({ row: rowNum, seats });
        }
      }
    }
    
    return rows;
  };


  /**
   * Format Price for Display
   * Formats price to 2 decimal places with proper currency formatting
   */
  const formatPrice = (price) => {
    if (typeof price !== 'number') return 'BHD 0.000';
    return `BHD ${price.toFixed(3)}`;
  };

  /**
   * Search Flights
   * Calls the backend API to search for available flights
   */
  const searchFlights = async () => {
    // Validation
    if (!origin || !destination) {
      Alert.alert('Error', 'Please select origin and destination');
      return;
    }
    if (!departureDate) {
      Alert.alert('Error', 'Please select departure date');
      return;
    }

    try {
      setIsSearching(true);
      
      // Test API connection
      const isConnected = await testAPIConnection();
      if (!isConnected) {
        Alert.alert('Connection Error', 'Cannot connect to server. Please check your internet connection.');
        return;
      }

      // Search departure flights using backend API
      const flights = await flightsAPI.searchFlights(origin, destination);
      
      // Filter flights by selected departure date
      const selectedDate = new Date(departureDate + 'T12:00:00'); // Add time to avoid timezone issues
      
      const filteredFlights = flights.filter(flight => {
        const flightDate = new Date(flight.departure_time);
        // Compare dates by extracting just the date part (YYYY-MM-DD)
        const flightDateOnly = flightDate.toISOString().split('T')[0];
        const selectedDateOnly = selectedDate.toISOString().split('T')[0];
        return flightDateOnly === selectedDateOnly;
      });
      
      // Transform flight data for display
      const transformedFlights = filteredFlights.map(flight => ({
        id: flight.id,
        flightNumber: flight.flight_number,
        departureAirport: flight.departure_airport,
        arrivalAirport: flight.arrival_airport,
        departureTime: flight.departure_time,
        arrivalTime: flight.arrival_time,
        economyPrice: flight.economy_price,
        businessPrice: flight.business_price,
        availableEconomySeats: flight.available_economy_seats,
        availableBusinessSeats: flight.available_business_seats,
        status: flight.status,
      }));

      setSearchResults(transformedFlights);
      
      if (transformedFlights.length === 0) {
        // Show all available flights for this route with clear messaging
        const allFlightsForRoute = flights.map(flight => ({
          id: flight.id,
          flightNumber: flight.flight_number,
          departureAirport: flight.departure_airport,
          arrivalAirport: flight.arrival_airport,
          departureTime: flight.departure_time,
          arrivalTime: flight.arrival_time,
          economyPrice: flight.economy_price,
          businessPrice: flight.business_price,
          availableEconomySeats: flight.available_economy_seats,
          availableBusinessSeats: flight.available_business_seats,
          status: flight.status,
        }));
        
        setSearchResults(allFlightsForRoute);
        setNoFlightsForSelectedDate(true);
      } else {
        setNoFlightsForSelectedDate(false);
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Search Error', error.message || 'Failed to search flights. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };


  /**
   * Select Departure Flight for Booking
   * Opens booking modal with selected departure flight details
   */
  const selectFlight = (flight) => {
    setSelectedFlight(flight);
    setSelectedSeat(null); // Clear any previously selected seat
    setShowBookingModal(true);
  };


  /**
   * Create Booking
   * Creates a new booking using the backend API
   */
  const createBooking = async (bookingData) => {
    try {
      console.log('Creating booking with data:', bookingData);
      console.log('Selected flight:', selectedFlight);
      console.log('Selected flight departure time:', selectedFlight?.departure_time);
      console.log('Reschedule mode:', reschedule, 'Booking ID:', bookingId);
      
      // Check if user is authenticated
      const token = await getAuthToken();
      console.log('Current auth token for booking:', token);
      console.log('Token type:', typeof token);
      console.log('Token length:', token ? token.length : 'null');
      
      if (!token) {
        console.log('No auth token found, redirecting to login');
        Alert.alert('Authentication Required', 'Please log in to create a booking.');
        router.push('/login');
        return;
      }
      
      // Note: Reschedule functionality has been moved to the manage booking page
      
      // Map frontend seat class to backend seat class
      const backendSeatClass = seatClass === 'falcon_gold' ? 'business' : 'economy';
      const price = backendSeatClass === 'economy' ? selectedFlight.economyPrice : selectedFlight.businessPrice;
      
      const bookingPayload = {
        flight_id: selectedFlight.id,
        passenger_name: bookingData.passengerName,
        passenger_email: bookingData.passengerEmail,
        passport_number: bookingData.passportNumber,
        seat_class: backendSeatClass,
        seat_number: bookingData.seatNumber,
        total_price: price,
      };
      
      console.log('Booking payload:', bookingPayload);
      
      const booking = await bookingsAPI.createBooking(bookingPayload);
      console.log('Booking created successfully:', booking);
      console.log('Booking ID:', booking.id);
      console.log('Booking response type:', typeof booking);
      console.log('Booking response keys:', Object.keys(booking));
      console.log('Booking departure time:', booking?.flight?.departure_time);
      console.log('Booking arrival time:', booking?.flight?.arrival_time);

      const successMessage = reschedule === 'true' 
        ? `Your flight has been successfully rescheduled! New booking reference: ${booking.booking_reference}`
        : `Your booking has been confirmed! Reference: ${booking.booking_reference}`;
        
      Alert.alert('Booking Confirmed', successMessage);
      setShowBookingModal(false);
      setSearchResults([]);
      
      // Small delay to ensure backend processing is complete
      setTimeout(() => {
        // Navigate to My Trips for all new bookings
        router.replace('/my-trips');
      }, 500);
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Booking Error', error.message || 'Failed to create booking. Please try again.');
    }
  };

  // Debug logging
  console.log('Book page render - selectedSeat:', selectedSeat, 'selectedFlight:', selectedFlight?.id);

  return (
    <SafeAreaView style={styles.container}>
      {/* Set status bar to dark content for white background */}
      <StatusBar style="dark" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/images/header.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>
        
        <TouchableOpacity style={styles.menuButton} onPress={() => router.push('/menu')}>
          <Ionicons name="menu" size={24} color="#A68F65" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Flight Type Selection - One-way only */}
        <View style={styles.flightTypeContainer}>
          <TouchableOpacity
            style={[styles.flightTypeButton, styles.flightTypeButtonActive]}
            onPress={() => handleFlightTypeChange('oneway')}
          >
            <Text style={[styles.flightTypeText, styles.flightTypeTextActive]}>
              One-way
            </Text>
          </TouchableOpacity>
        </View>

        {/* Origin and Destination */}
        <View style={styles.routeContainer}>
          <TouchableOpacity
            style={styles.airportButton}
            onPress={() => handleAirportSelect('origin')}
          >
            <Ionicons name="airplane" size={20} color="#A68F65" />
            <View style={styles.airportInfo}>
              <Text style={styles.airportLabel}>From</Text>
              <Text style={styles.airportValue}>
                {origin ? getAirportName(origin) : 'Your origin'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.airportButton}
            onPress={() => handleAirportSelect('destination')}
          >
            <Ionicons name="airplane" size={20} color="#A68F65" />
            <View style={styles.airportInfo}>
              <Text style={styles.airportLabel}>To</Text>
              <Text style={styles.airportValue}>
                {destination ? getAirportName(destination) : 'Your destination'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Date Selection */}
        <View style={styles.dateContainer}>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={handleDateSelect}
          >
            <Ionicons name="calendar" size={20} color="#A68F65" />
            <Text style={styles.dateText}>
              {departureDate ? formatDate(departureDate) : 'Departure Date'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Passenger and Class Selection */}
        <View style={styles.passengerContainer}>
          <TouchableOpacity 
            style={styles.passengerButton}
            onPress={() => setShowPassengerModal(true)}
          >
            <Ionicons name="person" size={20} color="#A68F65" />
            <Text style={styles.passengerText}>
              {getTotalPassengers()} Passenger{getTotalPassengers() > 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.classButton}
            onPress={() => setShowClassModal(true)}
          >
            <Text style={styles.classText}>
              {seatClasses.find(c => c.value === seatClass)?.label || 'Economy'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#8B8B8B" />
          </TouchableOpacity>
        </View>

        {/* Search Button */}
        <TouchableOpacity
          style={[styles.searchButton, isSearching && styles.searchButtonDisabled]}
          onPress={searchFlights}
          disabled={isSearching}
        >
          <Text style={styles.searchButtonText}>
            {isSearching ? 'Searching...' : 'Search flights'}
          </Text>
        </TouchableOpacity>


        {/* Promo Code Link */}
        <TouchableOpacity style={styles.promoCodeButton}>
          <Text style={styles.promoCodeText}>Do you have a promo code?</Text>
        </TouchableOpacity>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Available Flights</Text>
            
            {/* Warning message when no flights found for selected date */}
            {noFlightsForSelectedDate && (
              <View style={styles.warningContainer}>
                <View style={styles.warningHeader}>
                  <Ionicons name="information-circle" size={20} color="#FF6B35" />
                  <Text style={styles.warningTitle}>Date Not Available</Text>
                </View>
                <Text style={styles.warningText}>
                  {formatFullDate(departureDate)} isn't available for this route. Please select from these available dates:
                </Text>
              </View>
            )}
            
            {/* Group flights by date and display */}
            {Object.entries(groupFlightsByDate(searchResults)).map(([dateKey, flightsForDate]) => (
              <View key={dateKey} style={styles.dateGroup}>
                <Text style={styles.dateHeader}>{formatFullDate(flightsForDate[0].departureTime)}</Text>
                {flightsForDate.map((flight) => (
              <TouchableOpacity
                key={flight.id}
                style={styles.flightCard}
                onPress={() => selectFlight(flight)}
              >
                <View style={styles.flightHeader}>
                  <Text style={styles.flightNumber}>{flight.flightNumber}</Text>
                  <Text style={styles.flightStatus}>{flight.status}</Text>
                </View>
                
                <View style={styles.flightRoute}>
                  <View style={styles.routeInfo}>
                    <Text style={styles.airportCode}>{flight.departureAirport}</Text>
                    <Text style={styles.timeText}>{new Date(flight.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</Text>
                  </View>
                  
                  <View style={styles.flightIcon}>
                    <Ionicons name="airplane" size={24} color="#A68F65" />
                  </View>
                  
                  <View style={styles.routeInfo}>
                    <Text style={styles.airportCode}>{flight.arrivalAirport}</Text>
                    <Text style={styles.timeText}>{new Date(flight.arrivalTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</Text>
                  </View>
                </View>
                
                <View style={styles.flightPricing}>
                  <View style={styles.priceInfo}>
                    <Text style={styles.priceLabel}>
                      {seatClass === 'falcon_gold' ? 'Falcon Gold' : 'Economy'}
                    </Text>
                    <Text style={styles.priceValue}>
                      {formatPrice(seatClass === 'falcon_gold' ? flight.businessPrice : flight.economyPrice)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        )}

      </ScrollView>

      {/* Airport Selection Modal */}
      <Modal
        visible={showAirportModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Select {airportType === 'origin' ? 'Origin' : 'Destination'}
            </Text>
            <TouchableOpacity onPress={() => setShowAirportModal(false)}>
              <Ionicons name="close" size={24} color="#1A1A2E" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={airports}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.airportItem}
                onPress={() => selectAirport(item)}
              >
                <View style={styles.airportItemInfo}>
                  <Text style={styles.airportItemCode}>{item.code}</Text>
                  <View style={styles.airportItemDetails}>
                    <Text style={styles.airportItemCity}>{item.city}</Text>
                    <Text style={styles.airportItemName}>{item.name}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>

      {/* Calendar Selection Modal */}
      <Modal
        visible={showCalendarModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Ionicons name="calendar" size={20} color="#A68F65" />
            <Text style={styles.modalTitle}>Select date</Text>
            <TouchableOpacity onPress={() => setShowCalendarModal(false)}>
              <Ionicons name="close" size={24} color="#1A1A2E" />
            </TouchableOpacity>
          </View>
          
          {/* Date Selection Summary */}
          <View style={styles.dateSelectionSummary}>
            <View style={styles.dateSelectionItem}>
              <Text style={styles.dateSelectionLabel}>Outbound</Text>
              <Text style={styles.dateSelectionValue}>
                {departureDate ? formatDate(departureDate) : 'Select date'}
              </Text>
            </View>
            {flightType === 'return' && (
              <View style={styles.dateSelectionItem}>
                <Text style={styles.dateSelectionLabel}>Inbound</Text>
                <Text style={styles.dateSelectionValue}>
                  {returnDate ? formatDate(returnDate) : 'Select date'}
                </Text>
              </View>
            )}
          </View>

          {/* Calendar */}
          <ScrollView style={styles.calendarContainer}>
            {generateCalendarData().map((monthData, monthIndex) => (
              <View key={`${monthData.year}-${monthData.month}`} style={styles.monthContainer}>
                <Text style={styles.monthTitle}>
                  {monthData.monthName} {monthData.year}
                </Text>
                
                {/* Days of week header */}
                <View style={styles.daysOfWeekContainer}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <Text key={day} style={[
                      styles.dayOfWeek,
                      (day === 'Sat' || day === 'Sun') && styles.weekendDay
                    ]}>
                      {day}
                    </Text>
                  ))}
                </View>
                
                {/* Calendar grid */}
                <View style={styles.calendarGrid}>
                  {monthData.days.map((dayData, dayIndex) => (
                    <TouchableOpacity
                      key={dayIndex}
                      style={[
                        styles.calendarDay,
                        dayData && dayData.isToday && styles.todayDay,
                        dayData && dayData.isPast && styles.pastDay,
                        dayData && dayData.isSelectable && styles.selectableDay,
                      ]}
                      onPress={() => dayData && dayData.isSelectable && selectDate(dayData.date)}
                      disabled={!dayData || !dayData.isSelectable}
                    >
                      {dayData && (
                        <Text style={[
                          styles.calendarDayText,
                          dayData.isPast && styles.pastDayText,
                          dayData.isToday && styles.todayDayText,
                          dayData.isSelectable && styles.selectableDayText,
                        ]}>
                          {dayData.day}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Class Selection Modal */}
      <Modal
        visible={showClassModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Travel Class</Text>
            <TouchableOpacity onPress={() => setShowClassModal(false)}>
              <Ionicons name="close" size={24} color="#1A1A2E" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.classOptionsContainer}>
            {seatClasses.map((seatClassOption) => (
              <TouchableOpacity
                key={seatClassOption.value}
                style={[
                  styles.classOption,
                  seatClass === seatClassOption.value && styles.classOptionSelected
                ]}
                onPress={() => selectSeatClass(seatClassOption.value)}
              >
                <Text style={[
                  styles.classOptionText,
                  seatClass === seatClassOption.value && styles.classOptionTextSelected
                ]}>
                  {seatClassOption.label}
                </Text>
                {seatClass === seatClassOption.value && (
                  <Ionicons name="checkmark" size={20} color="#A68F65" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      </Modal>

      {/* Passenger Selection Modal */}
      <Modal
        visible={showPassengerModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Ionicons name="person" size={20} color="#A68F65" />
            <Text style={styles.modalTitle}>Select passengers</Text>
            <TouchableOpacity onPress={() => setShowPassengerModal(false)}>
              <Ionicons name="close" size={24} color="#1A1A2E" />
            </TouchableOpacity>
          </View>
          
          {/* Booking Limit */}
          <View style={styles.bookingLimitContainer}>
            <Text style={styles.bookingLimitText}>
              You can add up to 9 passengers per booking.
            </Text>
          </View>

          {/* Passenger Summary */}
          <View style={styles.passengerSummaryContainer}>
            <View style={styles.passengerSummaryItem}>
              <Text style={styles.passengerSummaryNumber}>{getTotalPassengers()}</Text>
              <Text style={styles.passengerSummaryLabel}>Current total</Text>
            </View>
            <View style={styles.passengerSummaryItem}>
              <Text style={styles.passengerSummaryNumber}>{getRemainingPassengers()}</Text>
              <Text style={styles.passengerSummaryLabel}>Remaining</Text>
            </View>
          </View>

          {/* Passenger Categories */}
          <ScrollView style={styles.passengerCategoriesContainer}>
            {/* Adult */}
            <View style={styles.passengerCategory}>
              <View style={styles.passengerCategoryInfo}>
                <Text style={styles.passengerCategoryTitle}>Adult</Text>
                <Text style={styles.passengerCategoryDescription}>
                  Passengers over 16 years old.
                </Text>
              </View>
              <View style={styles.passengerCountControls}>
                <TouchableOpacity
                  style={[styles.passengerCountButton, passengerCounts.adults <= 1 && styles.passengerCountButtonDisabled]}
                  onPress={() => updatePassengerCount('adults', -1)}
                  disabled={passengerCounts.adults <= 1}
                >
                  <Ionicons name="remove" size={20} color={passengerCounts.adults <= 1 ? "#CCCCCC" : "#A68F65"} />
                </TouchableOpacity>
                <Text style={styles.passengerCountText}>{passengerCounts.adults}</Text>
                <TouchableOpacity
                  style={[styles.passengerCountButton, getTotalPassengers() >= 9 && styles.passengerCountButtonDisabled]}
                  onPress={() => updatePassengerCount('adults', 1)}
                  disabled={getTotalPassengers() >= 9}
                >
                  <Ionicons name="add" size={20} color={getTotalPassengers() >= 9 ? "#CCCCCC" : "#A68F65"} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Child */}
            <View style={styles.passengerCategory}>
              <View style={styles.passengerCategoryInfo}>
                <Text style={styles.passengerCategoryTitle}>Child</Text>
                <Text style={styles.passengerCategoryDescription}>
                  Passengers between 2 - 11 years old.
                </Text>
              </View>
              <View style={styles.passengerCountControls}>
                <TouchableOpacity
                  style={[styles.passengerCountButton, passengerCounts.children <= 0 && styles.passengerCountButtonDisabled]}
                  onPress={() => updatePassengerCount('children', -1)}
                  disabled={passengerCounts.children <= 0}
                >
                  <Ionicons name="remove" size={20} color={passengerCounts.children <= 0 ? "#CCCCCC" : "#A68F65"} />
                </TouchableOpacity>
                <Text style={styles.passengerCountText}>{passengerCounts.children}</Text>
                <TouchableOpacity
                  style={[styles.passengerCountButton, getTotalPassengers() >= 9 && styles.passengerCountButtonDisabled]}
                  onPress={() => updatePassengerCount('children', 1)}
                  disabled={getTotalPassengers() >= 9}
                >
                  <Ionicons name="add" size={20} color={getTotalPassengers() >= 9 ? "#CCCCCC" : "#A68F65"} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Infant */}
            <View style={styles.passengerCategory}>
              <View style={styles.passengerCategoryInfo}>
                <Text style={styles.passengerCategoryTitle}>Infant</Text>
                <Text style={styles.passengerCategoryDescription}>
                  Passengers under 2 years old.
                </Text>
              </View>
              <View style={styles.passengerCountControls}>
                <TouchableOpacity
                  style={[styles.passengerCountButton, passengerCounts.infants <= 0 && styles.passengerCountButtonDisabled]}
                  onPress={() => updatePassengerCount('infants', -1)}
                  disabled={passengerCounts.infants <= 0}
                >
                  <Ionicons name="remove" size={20} color={passengerCounts.infants <= 0 ? "#CCCCCC" : "#A68F65"} />
                </TouchableOpacity>
                <Text style={styles.passengerCountText}>{passengerCounts.infants}</Text>
                <TouchableOpacity
                  style={[styles.passengerCountButton, getTotalPassengers() >= 9 && styles.passengerCountButtonDisabled]}
                  onPress={() => updatePassengerCount('infants', 1)}
                  disabled={getTotalPassengers() >= 9}
                >
                  <Ionicons name="add" size={20} color={getTotalPassengers() >= 9 ? "#CCCCCC" : "#A68F65"} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Youth */}
            <View style={styles.passengerCategory}>
              <View style={styles.passengerCategoryInfo}>
                <Text style={styles.passengerCategoryTitle}>Youth</Text>
                <Text style={styles.passengerCategoryDescription}>
                  Passengers between 12 - 15 years old.
                </Text>
              </View>
              <View style={styles.passengerCountControls}>
                <TouchableOpacity
                  style={[styles.passengerCountButton, passengerCounts.youth <= 0 && styles.passengerCountButtonDisabled]}
                  onPress={() => updatePassengerCount('youth', -1)}
                  disabled={passengerCounts.youth <= 0}
                >
                  <Ionicons name="remove" size={20} color={passengerCounts.youth <= 0 ? "#CCCCCC" : "#A68F65"} />
                </TouchableOpacity>
                <Text style={styles.passengerCountText}>{passengerCounts.youth}</Text>
                <TouchableOpacity
                  style={[styles.passengerCountButton, getTotalPassengers() >= 9 && styles.passengerCountButtonDisabled]}
                  onPress={() => updatePassengerCount('youth', 1)}
                  disabled={getTotalPassengers() >= 9}
                >
                  <Ionicons name="add" size={20} color={getTotalPassengers() >= 9 ? "#CCCCCC" : "#A68F65"} />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.passengerModalActions}>
            <TouchableOpacity
              style={styles.passengerCancelButton}
              onPress={() => setShowPassengerModal(false)}
            >
              <Text style={styles.passengerCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.passengerConfirmButton}
              onPress={() => setShowPassengerModal(false)}
            >
              <Text style={styles.passengerConfirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>


      {/* Booking Modal */}
      <Modal
        visible={showBookingModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Complete Booking</Text>
            <TouchableOpacity onPress={() => setShowBookingModal(false)}>
              <Ionicons name="close" size={24} color="#1A1A2E" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.bookingForm}>
            <Text style={styles.bookingFlightInfo}>
              {selectedFlight?.flightNumber} • {selectedFlight?.departureAirport} → {selectedFlight?.arrivalAirport}
            </Text>
            
            <View style={styles.bookingFormGroup}>
              <Text style={styles.bookingLabel}>Passenger Name *</Text>
              <TextInput
                style={styles.bookingInput}
                placeholder="Enter full name"
                placeholderTextColor="#8B8B8B"
                value={passengerName}
                onChangeText={setPassengerName}
              />
            </View>
            
            <View style={styles.bookingFormGroup}>
              <Text style={styles.bookingLabel}>Email Address *</Text>
              <TextInput
                style={styles.bookingInput}
                placeholder="Enter email address"
                placeholderTextColor="#8B8B8B"
                keyboardType="email-address"
                value={passengerEmail}
                onChangeText={setPassengerEmail}
              />
            </View>
            
            <View style={styles.bookingFormGroup}>
              <Text style={styles.bookingLabel}>Passport Number *</Text>
              <TextInput
                style={styles.bookingInput}
                placeholder="Enter passport number"
                placeholderTextColor="#8B8B8B"
                value={passportNumber}
                onChangeText={setPassportNumber}
              />
            </View>
            
            <View style={styles.bookingFormGroup}>
              <Text style={styles.bookingLabel}>Seat Selection</Text>
              <View style={styles.seatSelectionContainer}>
                <Text style={styles.seatSelectionLabel}>
                  {selectedSeat ? `Selected: ${selectedSeat}` : 'Choose your seat'}
                </Text>
                
                {/* Aircraft Type Info */}
                <Text style={styles.aircraftInfo}>
                  {selectedFlight && selectedFlight.arrivalAirport && 
                   ['LHR', 'CDG', 'FRA', 'BKK', 'KUL', 'SIN', 'HKG', 'JNB'].includes(selectedFlight.arrivalAirport)
                    ? 'Boeing 787 Dreamliner'
                    : 'Airbus A320'} • {seatClass === 'falcon_gold' ? 'Falcon Gold' : 'Economy'}
                </Text>
                
                {/* Seat Map with Aircraft Layout */}
                <View style={styles.seatMapContainer}>
                  {generateAircraftSeatMap().map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.seatRow}>
                      <View style={styles.seatRowContent}>
                        {row.seats.map((seat, seatIndex) => (
                          <TouchableOpacity
                            key={seatIndex}
                            style={[
                              styles.seatButton,
                              selectedSeat === seat.id && styles.seatButtonSelected,
                              seat.isAisle && styles.aisleSpace
                            ]}
                            onPress={() => setSelectedSeat(seat.id)}
                            disabled={seat.isAisle}
                          >
                            {!seat.isAisle && (
                              <Text style={[
                                styles.seatButtonText,
                                selectedSeat === seat.id && styles.seatButtonTextSelected
                              ]}>
                                {seat.letter}
                              </Text>
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
            
            <TouchableOpacity
              style={[
                styles.confirmBookingButton,
                (!passengerName.trim() || !passengerEmail.trim() || !passportNumber.trim() || !selectedSeat) && styles.disabledButton
              ]}
              onPress={() => {
                // Validate required fields
                if (!passengerName.trim()) {
                  Alert.alert('Validation Error', 'Please enter passenger name');
                  return;
                }
                if (!passengerEmail.trim()) {
                  Alert.alert('Validation Error', 'Please enter email address');
                  return;
                }
                if (!passportNumber.trim()) {
                  Alert.alert('Validation Error', 'Please enter passport number');
                  return;
                }
                if (!selectedSeat) {
                  Alert.alert('Validation Error', 'Please select a seat');
                  return;
                }

                // Email validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(passengerEmail)) {
                  Alert.alert('Validation Error', 'Please enter a valid email address');
                  return;
                }

                // Get form data from the booking modal
                const bookingData = {
                  passengerName: passengerName.trim(),
                  passengerEmail: passengerEmail.trim(),
                  passportNumber: passportNumber.trim(),
                  seatNumber: selectedSeat,
                };
                createBooking(bookingData);
              }}
              disabled={!passengerName.trim() || !passengerEmail.trim() || !passportNumber.trim() || !selectedSeat}
            >
              <Text style={[
                styles.confirmBookingButtonText,
                (!passengerName.trim() || !passengerEmail.trim() || !passportNumber.trim() || !selectedSeat) && styles.disabledButtonText
              ]}>
                Confirm Booking
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>


      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNavBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/home')}>
          <Ionicons name="home" size={24} color="#8B8B8B" />
          <Text style={styles.navItemText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/my-trips')}>
          <Ionicons name="airplane" size={24} color="#8B8B8B" />
          <Text style={styles.navItemText}>My Trips</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="calendar" size={24} color="#A68F65" />
          <Text style={styles.navItemTextActive}>Book</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/falcon-flyer')}>
          <Ionicons name="heart" size={24} color="#8B8B8B" />
          <Text style={styles.navItemText}>Falconflyer</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// StyleSheet for Book Screen - Gulf Air Brand Colors and Layout
const styles = StyleSheet.create({
  // Main container with white background to match logo
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
  // Flight type container
  flightTypeContainer: {
    flexDirection: 'row',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  // Flight type button
  flightTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  // Active flight type button
  flightTypeButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  // Flight type text
  flightTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#B8B8B8',
  },
  // Active flight type text
  flightTypeTextActive: {
    color: '#1A1A2E',
  },
  // Route container
  routeContainer: {
    gap: 12,
    marginBottom: 20,
  },
  // Airport button
  airportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  // Airport info
  airportInfo: {
    marginLeft: 12,
    flex: 1,
  },
  // Airport label
  airportLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  // Airport value
  airportValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  // Date container
  dateContainer: {
    gap: 12,
    marginBottom: 20,
  },
  // Date button
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  // Date text
  dateText: {
    fontSize: 16,
    color: '#1A1A2E',
    marginLeft: 12,
  },
  // Passenger container
  passengerContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  // Passenger button
  passengerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  // Passenger text
  passengerText: {
    fontSize: 16,
    color: '#1A1A2E',
    marginLeft: 12,
  },
  // Class button
  classButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  // Class text
  classText: {
    fontSize: 16,
    color: '#1A1A2E',
  },
  // Search button
  searchButton: {
    backgroundColor: '#A68F65',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  // Disabled search button
  searchButtonDisabled: {
    backgroundColor: '#8B8B8B',
  },
  // Search button text
  searchButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  // Promo code button
  promoCodeButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  // Promo code text
  promoCodeText: {
    fontSize: 14,
    color: '#A68F65',
    textDecorationLine: 'underline',
  },
  // Results container
  resultsContainer: {
    marginBottom: 20,
  },
  // Results title
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 16,
  },
  // Warning container for date not available
  warningContainer: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
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
  // Date group styling
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 12,
    paddingLeft: 4,
  },
  // Flight card
  flightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  // Flight header
  flightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  // Flight number
  flightNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  // Flight status
  flightStatus: {
    fontSize: 14,
    color: '#A68F65',
    fontWeight: '600',
  },
  // Flight route
  flightRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  // Route info
  routeInfo: {
    alignItems: 'center',
  },
  // Airport code
  airportCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  // Flight icon
  flightIcon: {
    flex: 1,
    alignItems: 'center',
  },
  // Flight pricing
  flightPricing: {
    alignItems: 'center',
  },
  // Price info
  priceInfo: {
    alignItems: 'center',
  },
  // Price label
  priceLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  // Price value
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#A68F65',
  },
  // Seats text
  seatsText: {
    fontSize: 12,
    color: '#8B8B8B',
  },
  // Modal container
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Modal header
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  // Modal title
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  // Airport item
  airportItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  // Airport item info
  airportItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Airport item code
  airportItemCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#A68F65',
    width: 50,
  },
  // Airport item details
  airportItemDetails: {
    flex: 1,
  },
  // Airport item city
  airportItemCity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  // Airport item name
  airportItemName: {
    fontSize: 14,
    color: '#666666',
  },
  // Date selection summary
  dateSelectionSummary: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  // Date selection item
  dateSelectionItem: {
    flex: 1,
    alignItems: 'center',
  },
  // Date selection label
  dateSelectionLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  // Date selection value
  dateSelectionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  // Calendar container
  calendarContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  // Month container
  monthContainer: {
    marginBottom: 32,
  },
  // Month title
  monthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 16,
    textAlign: 'center',
  },
  // Days of week container
  daysOfWeekContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  // Day of week
  dayOfWeek: {
    width: '14%',
    textAlign: 'center',
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
    paddingVertical: 8,
  },
  // Weekend day
  weekendDay: {
    fontWeight: 'bold',
  },
  // Calendar grid
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  // Calendar day
  calendarDay: {
    width: '14%', // Slightly less than 14.28% to account for spacing
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderRadius: 8,
    minHeight: 40,
  },
  // Today day
  todayDay: {
    backgroundColor: '#A68F65',
    borderRadius: 20,
  },
  // Past day
  pastDay: {
    opacity: 0.3,
  },
  // Selectable day
  selectableDay: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  // Calendar day text
  calendarDayText: {
    fontSize: 16,
    color: '#1A1A2E',
    fontWeight: '500',
  },
  // Past day text
  pastDayText: {
    color: '#999999',
  },
  // Today day text
  todayDayText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  // Selectable day text
  selectableDayText: {
    color: '#1A1A2E',
    fontWeight: '600',
  },
  // Class options container
  classOptionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  // Class option
  classOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  // Selected class option
  classOptionSelected: {
    backgroundColor: '#F5F5F5',
    borderColor: '#A68F65',
  },
  // Class option text
  classOptionText: {
    fontSize: 16,
    color: '#1A1A2E',
  },
  // Selected class option text
  classOptionTextSelected: {
    color: '#A68F65',
    fontWeight: '600',
  },
  // Passenger modal styles
  bookingLimitContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F8F8',
  },
  bookingLimitText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  passengerSummaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  passengerSummaryItem: {
    alignItems: 'center',
  },
  passengerSummaryNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  passengerSummaryLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  passengerCategoriesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  passengerCategory: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  passengerCategoryInfo: {
    flex: 1,
  },
  passengerCategoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  passengerCategoryDescription: {
    fontSize: 14,
    color: '#666666',
  },
  passengerCountControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passengerCountButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#A68F65',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  passengerCountButtonDisabled: {
    borderColor: '#CCCCCC',
    backgroundColor: '#F5F5F5',
  },
  passengerCountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginHorizontal: 20,
    minWidth: 20,
    textAlign: 'center',
  },
  passengerModalActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  passengerCancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
    alignItems: 'center',
  },
  passengerCancelButtonText: {
    fontSize: 16,
    color: '#1A1A2E',
    fontWeight: '600',
  },
  passengerConfirmButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: '#A68F65',
    marginLeft: 8,
    alignItems: 'center',
  },
  passengerConfirmButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Aircraft-based seat selection container
  seatSelectionContainer: {
    marginTop: 8,
  },
  seatSelectionLabel: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
    fontWeight: '500',
  },
  aircraftInfo: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  seatMapContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  seatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'center',
  },
  seatRowContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  seatButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A68F65',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatButtonSelected: {
    backgroundColor: '#A68F65',
    borderColor: '#A68F65',
  },
  seatButtonText: {
    fontSize: 12,
    color: '#A68F65',
    fontWeight: '600',
  },
  seatButtonTextSelected: {
    color: '#FFFFFF',
  },
  aisleSpace: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    width: 16,
  },
  // Seat selection modal styles
  seatModalContainer: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  seatModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#1A1A2E',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  seatModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  seatLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  aircraftVisual: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  aircraftOutline: {
    width: 200,
    height: 80,
    backgroundColor: '#2C2C2C',
    borderRadius: 40,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aircraftOutlineWide: {
    width: 250,
    height: 100,
    backgroundColor: '#2C2C2C',
    borderRadius: 50,
  },
  aircraftOutlineNarrow: {
    width: 180,
    height: 70,
    backgroundColor: '#2C2C2C',
    borderRadius: 35,
  },
  cockpitWindows: {
    position: 'absolute',
    top: 10,
    width: 60,
    height: 20,
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
  },
  cabinDivisions: {
    width: 160,
    height: 2,
    backgroundColor: '#1A1A1A',
  },
  seatClassLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  seatMapContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  seatMap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    maxWidth: '100%',
  },
  seatContainer: {
    position: 'relative',
  },
  aisleIndicator: {
    position: 'absolute',
    right: -3,
    top: '50%',
    transform: [{ translateY: -1 }],
    width: 6,
    height: 2,
    backgroundColor: '#666666',
    borderRadius: 1,
  },
  seatButton: {
    width: 45,
    height: 35,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  availableSeat: {
    backgroundColor: '#D4AF37',
  },
  selectedSeat: {
    backgroundColor: '#20B2AA',
  },
  unavailableSeat: {
    backgroundColor: '#9370DB',
  },
  seatText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  unavailableSeatText: {
    color: '#CCCCCC',
  },
  seatModalActions: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  bookSeatButton: {
    backgroundColor: '#20B2AA',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  bookSeatButtonDisabled: {
    backgroundColor: '#666666',
  },
  bookSeatButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Booking form
  bookingForm: {
    flex: 1,
    paddingHorizontal: 16,
  },
  // Booking flight info
  bookingFlightInfo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    textAlign: 'center',
    marginBottom: 24,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  // Booking form group
  bookingFormGroup: {
    marginBottom: 20,
  },
  // Booking label
  bookingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  // Booking input
  bookingInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  // Confirm booking button
  confirmBookingButton: {
    backgroundColor: '#A68F65',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  // Confirm booking button text
  confirmBookingButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
  disabledButtonText: {
    color: '#999999',
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
