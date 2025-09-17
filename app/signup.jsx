// Import React hooks and components for signup functionality
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { authAPI, setAuthToken, testAPIConnection } from '../utils/api';

/**
 * SignupScreen Component - Gulf Air App Registration
 * 
 * This component provides a user registration interface allowing new users
 * to create an account with Gulf Air. It includes form validation, API
 * connectivity testing, and secure registration flow.
 * 
 * Features:
 * - User registration with email and password
 * - Form validation and error handling
 * - Loading states during registration
 * - Automatic navigation to login on success
 * - Responsive design with keyboard avoidance
 * 
 * @returns {JSX.Element} A complete signup form with Gulf Air branding
 */
export default function SignupScreen() {
  // State management for signup form
  const [firstName, setFirstName] = useState(''); // User's first name
  const [lastName, setLastName] = useState(''); // User's last name
  const [email, setEmail] = useState(''); // Email address
  const [phoneNumber, setPhoneNumber] = useState(''); // Phone number (optional)
  const [password, setPassword] = useState(''); // Password
  const [confirmPassword, setConfirmPassword] = useState(''); // Password confirmation
  const [isLoading, setIsLoading] = useState(false); // Loading state for signup process

  /**
   * Handle Signup Process
   * 
   * This function manages the complete signup flow including validation,
   * API connectivity testing, registration, and navigation.
   * 
   * Process:
   * 1. Prevent multiple simultaneous signup attempts
   * 2. Validate form inputs
   * 3. Test API connectivity before attempting registration
   * 4. Prepare and send registration request
   * 5. Navigate to login screen on success
   * 6. Handle and display errors appropriately
   */
  const handleSignup = async () => {
    // Prevent multiple signup attempts while one is in progress
    if (isLoading) return;

    // Form validation
    if (!firstName.trim()) {
      Alert.alert('Error', 'Please enter your first name');
      return;
    }
    if (!lastName.trim()) {
      Alert.alert('Error', 'Please enter your last name');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Set loading state to show user feedback
    setIsLoading(true);
    
    try {
      // Test API connection before attempting registration
      const isConnected = await testAPIConnection();
      if (!isConnected) {
        Alert.alert('Connection Error', 'Cannot connect to server. Please check your internet connection and ensure the backend is running.');
        return;
      }

      // Prepare registration data
      // Generate username from email (user-friendly approach)
      const emailUsername = email.trim().split('@')[0];
      const signupData = {
        username: emailUsername, // Auto-generate username from email
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone_number: phoneNumber.trim() || null, // Include phone number if provided
        password: password,
      };

      // Debug: Log the data being sent
      console.log('Signup data being sent:', signupData);

      // Register user with backend API
      const response = await authAPI.register(signupData);
      
      // Log success for debugging and navigate to login
      console.log('Registration successful:', response);
      Alert.alert('Success', 'Account created successfully! Please sign in.');
      router.push('/login');
    } catch (error) {
      // Handle registration errors and display user-friendly messages
      console.error('Registration error:', error);
      Alert.alert('Error', error.message || 'Registration failed. Please try again.');
    } finally {
      // Always reset loading state regardless of success or failure
      setIsLoading(false);
    }
  };

  /**
   * Handle Back to Login Navigation
   * Navigates back to the login screen
   */
  const handleBackToLogin = () => {
    router.push('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Set status bar to light content for better visibility on dark background */}
      <StatusBar style="light" />
      
      {/* Keyboard avoiding view to prevent keyboard from covering form inputs */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header Section with Gulf Air Logo and Welcome Text */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('../assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.welcomeText}>Create Account</Text>
            <Text style={styles.subtitleText}>Join Gulf Air today</Text>
          </View>

          {/* Main Signup Form Container */}
          <View style={styles.formContainer}>

            {/* Name Input Fields */}
            <View style={styles.nameContainer}>
              <View style={styles.nameInputWrapper}>
                <Text style={styles.inputLabel}>First Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your first name"
                  placeholderTextColor="#8B8B8B"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
              <View style={styles.nameInputWrapper}>
                <Text style={styles.inputLabel}>Last Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your last name"
                  placeholderTextColor="#8B8B8B"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Email Input Field */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your email address"
                placeholderTextColor="#8B8B8B"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Phone Number Input Field (Optional) */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Phone Number (Optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your phone number"
                placeholderTextColor="#8B8B8B"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password Input Field */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your password"
                placeholderTextColor="#8B8B8B"
                value={password}
                onChangeText={setPassword}
                secureTextEntry // Hide password characters
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Confirm Password Input Field */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Confirm your password"
                placeholderTextColor="#8B8B8B"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry // Hide password characters
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Primary Signup Button with Loading State */}
            <TouchableOpacity
              style={[styles.signupButton, isLoading && styles.signupButtonDisabled]}
              onPress={handleSignup}
              disabled={isLoading} // Disable button during signup process
            >
              <Text style={styles.signupButtonText}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            {/* Back to Login Navigation Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={handleBackToLogin}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer with Terms and Privacy Policy */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// StyleSheet for Signup Screen - Gulf Air Brand Colors and Layout
const styles = StyleSheet.create({
  // Main container with Gulf Air dark blue background
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E', // Gulf Air dark blue
  },
  // Keyboard avoiding view container
  keyboardAvoidingView: {
    flex: 1,
  },
  // Scroll view content container with top-aligned layout to reduce empty space
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  // Header section containing logo and welcome text with minimal spacing
  header: {
    alignItems: 'center',
  },
  // Logo container with minimal spacing to bring welcome text very close
  logoContainer: {
    marginBottom: 4,
    alignItems: 'center',
  },
  // Gulf Air logo styling - much larger size
  logo: {
    width: 800,
    height: 400,
  },
  // Welcome text styling with minimal margins to bring subtitle closer
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
    marginTop: 2,
  },
  // Subtitle text styling with increased bottom margin to create more space
  subtitleText: {
    fontSize: 16,
    color: '#B8B8B8',
    textAlign: 'center',
    marginBottom: 24,
  },
  // Main form container with elevated background and reduced padding
  formContainer: {
    backgroundColor: '#16213E', // Slightly lighter blue for contrast
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  // Name input container for side-by-side layout
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  // Individual name input wrapper
  nameInputWrapper: {
    flex: 1,
    marginHorizontal: 4,
  },
  // Input fields container with reduced spacing
  inputContainer: {
    marginBottom: 12,
  },
  // Individual input wrapper with reduced spacing
  inputWrapper: {
    marginBottom: 16,
  },
  // Input label styling with increased spacing
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  // Text input styling with dark theme
  textInput: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  // Primary signup button styling
  signupButton: {
    backgroundColor: '#A68F65', // Gulf Air gold shade
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  // Disabled signup button styling
  signupButtonDisabled: {
    backgroundColor: '#8B8B8B',
  },
  // Signup button text styling
  signupButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  // Login link container
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Login text styling
  loginText: {
    fontSize: 16,
    color: '#B8B8B8',
  },
  // Login link styling
  loginLink: {
    fontSize: 16,
    color: '#A68F65',
    fontWeight: '600',
  },
  // Footer container
  footer: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  // Footer text styling
  footerText: {
    fontSize: 12,
    color: '#8B8B8B',
    textAlign: 'center',
    lineHeight: 18,
  },
});
