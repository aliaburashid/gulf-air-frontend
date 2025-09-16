import axios from 'axios';

// API Configuration for Gulf Air Backend
// Using localhost for local development
const API_BASE_URL = 'http://localhost:8000';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds timeout for mobile
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response.data; // Return only the data part
  },
  (error) => {
    console.error('API Error:', error);
    
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.detail || 
                     error.response.data?.message || 
                     `HTTP error! status: ${error.response.status}`;
      console.error('Server Error:', message);
      throw new Error(message);
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error - No response received');
      console.error('Request details:', error.request);
      throw new Error('Cannot connect to server. Please check your internet connection and ensure the backend is running.');
    } else {
      // Something else happened
      console.error('Request Setup Error:', error.message);
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
);

export const API_ENDPOINTS = {
  // Authentication endpoints
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  
  // User endpoints
  PROFILE: '/auth/profile',
  
  // Flight endpoints
  FLIGHTS: '/api/flights',
  SEARCH_FLIGHTS: '/api/flights/search',
  FLIGHT_STATUS: '/api/flights/status',
  
  // Booking endpoints
  BOOKINGS: '/api/bookings',
  CREATE_BOOKING: '/api/bookings',
  CHECK_IN: '/api/bookings',
  
  // Loyalty endpoints
  LOYALTY_STATUS: '/api/loyalty/status',
  LOYALTY_TIERS: '/api/loyalty/tiers',
  LOYALTY_ENROLL: '/api/loyalty/enroll',
};

// Helper function to get auth token from storage
export const getAuthToken = async () => {
  // TODO: Implement token storage (AsyncStorage)
  // For now, return null - you can implement AsyncStorage later
  return null;
};

// Helper function to store auth token
export const setAuthToken = async (token) => {
  // TODO: Implement token storage (AsyncStorage)
  // For now, just log it
  console.log('Token received:', token);
};

// Test API connectivity
export const testAPIConnection = async () => {
  try {
    console.log('Testing API connection to:', API_BASE_URL);
    const response = await apiClient.get('/');
    console.log('API connection successful:', response);
    return true;
  } catch (error) {
    console.error('API connection failed:', error.message);
    return false;
  }
};

// API service functions
export const authAPI = {
  login: (credentials) => apiClient.post(API_ENDPOINTS.LOGIN, credentials),
  register: (userData) => apiClient.post(API_ENDPOINTS.REGISTER, userData),
  logout: () => apiClient.post(API_ENDPOINTS.LOGOUT),
  getProfile: () => apiClient.get(API_ENDPOINTS.PROFILE),
};

export const flightsAPI = {
  getAllFlights: () => apiClient.get(API_ENDPOINTS.FLIGHTS),
  getFlight: (id) => apiClient.get(`${API_ENDPOINTS.FLIGHTS}/${id}`),
  searchFlights: (departure, arrival) => 
    apiClient.get(`${API_ENDPOINTS.SEARCH_FLIGHTS}/${departure}/${arrival}`),
  getFlightStatus: (flightNumber) => 
    apiClient.get(`${API_ENDPOINTS.FLIGHT_STATUS}/${flightNumber}`),
};

export const bookingsAPI = {
  getBookings: () => apiClient.get(API_ENDPOINTS.BOOKINGS),
  createBooking: (bookingData) => apiClient.post(API_ENDPOINTS.CREATE_BOOKING, bookingData),
  getBooking: (id) => apiClient.get(`${API_ENDPOINTS.BOOKINGS}/${id}`),
  cancelBooking: (id) => apiClient.delete(`${API_ENDPOINTS.BOOKINGS}/${id}`),
  checkIn: (id) => apiClient.post(`${API_ENDPOINTS.CHECK_IN}/${id}/checkin`),
};

export const loyaltyAPI = {
  getStatus: () => apiClient.get(API_ENDPOINTS.LOYALTY_STATUS),
  getTiers: () => apiClient.get(API_ENDPOINTS.LOYALTY_TIERS),
  enroll: (enrollmentData) => apiClient.post(API_ENDPOINTS.LOYALTY_ENROLL, enrollmentData),
};

// Legacy function for backward compatibility
export const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await apiClient({
      url: endpoint,
      ...options,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export default apiClient;
