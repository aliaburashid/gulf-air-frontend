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
    console.log('Request interceptor - Token found:', !!token);
    console.log('Request interceptor - Token value:', token ? `${token.substring(0, 20)}...` : 'null');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header set:', config.headers.Authorization ? 'Yes' : 'No');
    } else {
      console.log('No token available for request');
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
      console.error('Full error response:', error.response);
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
      
      let message = error.response.data?.detail || 
                   error.response.data?.message || 
                   `HTTP error! status: ${error.response.status}`;
      
      // Handle specific error cases
      if (error.response.status === 400) {
        if (message.includes('already cancelled') || message.includes('cancelled')) {
          message = 'Booking already cancelled';
        } else if (message.includes('not found')) {
          message = 'Booking not found';
        } else if (message.includes('cannot be cancelled')) {
          message = 'Booking cannot be cancelled at this time';
        } else if (message.includes('Invalid credentials')) {
          message = 'Invalid credentials';
        } else if (message.includes('Please provide')) {
          message = 'Please provide email, Falcon Flyer number, or username';
        }
      } else if (error.response.status === 404) {
        message = 'Booking not found';
      } else if (error.response.status === 403) {
        message = 'Not authorized to perform this action';
      }
      
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
  try {
    // For now, we'll use a simple approach
    // In a real app, you'd use AsyncStorage
    const token = global.authToken || null;
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Helper function to store auth token
export const setAuthToken = async (token) => {
  try {
    // Store token globally for now
    // In a real app, you'd use AsyncStorage.setItem('authToken', token)
    global.authToken = token;
    console.log('Token stored:', token);
  } catch (error) {
    console.error('Error storing auth token:', error);
  }
};

// Helper function to clear auth token
export const clearAuthToken = async () => {
  try {
    global.authToken = null;
    console.log('Token cleared');
  } catch (error) {
    console.error('Error clearing auth token:', error);
  }
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
  rescheduleBooking: (bookingId, newFlightId) => apiClient.post(`${API_ENDPOINTS.BOOKINGS}/${bookingId}/reschedule`, { new_flight_id: newFlightId }),
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
