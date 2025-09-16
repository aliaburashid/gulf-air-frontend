// LoginScreen Component - Gulf Air App Authentication

// This component provides a dual login interface allowing users to sign in
// using either their Falcon Flyer number or email address. It includes
// form validation, API connectivity testing, and secure authentication flow.

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


export default function LoginScreen() {
  // State management for login form
  const [loginMethod, setLoginMethod] = useState('falconFlyer'); // 'falconFlyer' or 'email'
  const [falconFlyerNumber, setFalconFlyerNumber] = useState(''); // Falcon Flyer number input
  const [email, setEmail] = useState(''); // Email address input
  const [password, setPassword] = useState(''); // Password input
  const [isLoading, setIsLoading] = useState(false); // Loading state for login process

  // This function manages the complete login flow including validation,
  // API connectivity testing, authentication, and navigation.
  const handleLogin = async () => {
    // Prevent multiple login attempts while one is in progress
    if (isLoading) return;

    // Form validation based on selected login method
    if (loginMethod === 'falconFlyer' && !falconFlyerNumber.trim()) {
      Alert.alert('Error', 'Please enter your Falcon Flyer number');
      return;
    }
    if (loginMethod === 'email' && !email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    // Set loading state to show user feedback
    setIsLoading(true);
    
    try {
      // Test API connection before attempting login
      // This prevents unnecessary API calls if backend is unavailable
      const isConnected = await testAPIConnection();
      if (!isConnected) {
        Alert.alert('Connection Error', 'Cannot connect to server. Please check your internet connection and ensure the backend is running.');
        return;
      }

      // Prepare login data based on selected method
      const loginData = {
        password: password
      };

      // Add appropriate identifier based on login method
      if (loginMethod === 'falconFlyer') {
        loginData.falcon_flyer_number = falconFlyerNumber;
      } else {
        loginData.email = email;
      }

      // Authenticate user with backend API
      const response = await authAPI.login(loginData);

      // Store JWT token for authenticated API requests
      if (response.token) {
        await setAuthToken(response.token);
      }
      
      // Log success for debugging and navigate to dashboard
      console.log('Login successful:', response);
      router.push('/dashboard');
    } catch (error) {
      // Handle authentication errors and display user-friendly messages
      console.error('Login error:', error);
      Alert.alert('Error', error.message || 'Login failed. Please try again.');
    } finally {
      // Always reset loading state regardless of success or failure
      setIsLoading(false);
    }
  };

  // Handle Sign Up Navigation
  //Navigates to the signup screen when user wants to create a new account
  const handleSignUp = () => {
    router.push('/signup');
  };

  /**
   * Handle Forgot Password
   * Placeholder function for forgot password functionality
   * Currently shows an alert - can be extended to navigate to forgot password screen
   */
  const handleForgotPassword = () => {
    Alert.alert('Forgot Password', 'Navigate to forgot password screen');
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
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subtitleText}>Sign in to your account</Text>
          </View>

          {/* Main Login Form Container */}
          <View style={styles.formContainer}>
            {/* Login Method Toggle - Switch between Falcon Flyer and Email */}
            <View style={styles.loginMethodContainer}>
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  loginMethod === 'falconFlyer' && styles.methodButtonActive
                ]}
                onPress={() => setLoginMethod('falconFlyer')}
              >
                <Text style={[
                  styles.methodButtonText,
                  loginMethod === 'falconFlyer' && styles.methodButtonTextActive
                ]}>
                  Falcon Flyer
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  loginMethod === 'email' && styles.methodButtonActive
                ]}
                onPress={() => setLoginMethod('email')}
              >
                <Text style={[
                  styles.methodButtonText,
                  loginMethod === 'email' && styles.methodButtonTextActive
                ]}>
                  Email
                </Text>
              </TouchableOpacity>
            </View>

            {/* Dynamic Input Fields - Changes based on selected login method */}
            <View style={styles.inputContainer}>
              {loginMethod === 'falconFlyer' ? (
                // Falcon Flyer Number Input
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Falcon Flyer Number</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your Falcon Flyer number"
                    placeholderTextColor="#8B8B8B"
                    value={falconFlyerNumber}
                    onChangeText={setFalconFlyerNumber}
                    keyboardType="default"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              ) : (
                // Email Address Input
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
              )}

              {/* Password Input - Always visible regardless of login method */}
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
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity 
              style={styles.forgotPasswordContainer}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Primary Login Button with Loading State */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading} // Disable button during login process
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            {/* Sign Up Navigation Link */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <TouchableOpacity onPress={handleSignUp}>
                <Text style={styles.signUpLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer with Terms and Privacy Policy */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By signing in, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// StyleSheet 
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
  // Header section containing logo and welcome text with reduced spacing
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  // Logo container with reduced spacing to bring welcome text closer
  logoContainer: {
    marginBottom: 12,
    alignItems: 'center',
  },
  // Gulf Air logo styling - increased size
  logo: {
    width: 700,
    height: 350,
  },
  // Welcome text styling with reduced top margin
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    marginTop: 8,
  },
  // Subtitle text styling
  subtitleText: {
    fontSize: 16,
    color: '#B8B8B8',
    textAlign: 'center',
  },
  // Main form container with elevated background and reduced padding
  formContainer: {
    backgroundColor: '#16213E', // Slightly lighter blue for contrast
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  // Login method toggle container with reduced spacing
  loginMethodContainer: {
    flexDirection: 'row',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  // Individual method button styling
  methodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  // Active method button styling with Gulf Air gold
  methodButtonActive: {
    backgroundColor: '#A68F65', // Gulf Air gold shade
  },
  // Method button text styling
  methodButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#B8B8B8',
  },
  // Active method button text styling
  methodButtonTextActive: {
    color: '#1A1A2E',
  },
  // Input fields container with reduced spacing
  inputContainer: {
    marginBottom: 12,
  },
  // Individual input wrapper with reduced spacing
  inputWrapper: {
    marginBottom: 16,
  },
  // Input label styling
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
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
  // Forgot password link container with reduced spacing
  forgotPasswordContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  // Forgot password text styling
  forgotPasswordText: {
    fontSize: 14,
    color: '#E8B86D',
    fontWeight: '500',
  },
  // Primary login button styling
  loginButton: {
    backgroundColor: '#A68F65', // Gulf Air gold shade
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  // Disabled login button styling
  loginButtonDisabled: {
    backgroundColor: '#8B8B8B',
  },
  // Login button text styling
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  // Sign up link container
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Sign up text styling
  signUpText: {
    fontSize: 16,
    color: '#B8B8B8',
  },
  // Sign up link styling
  signUpLink: {
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
