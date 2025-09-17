// SplashScreen Component - Gulf Air App Loading Screen
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';


export default function SplashScreen() {
  // Effect hook to handle automatic navigation after splash display
  useEffect(() => {
    // Show splash screen for 3 seconds, then navigate to home
    // This gives users time to see the branding and provides smooth UX
    const timer = setTimeout(() => {
      // Navigate to home screen using router.replace to prevent back navigation
      router.replace('/home');
    }, 3000);

    // Cleanup function to clear the timer if component unmounts
    // This prevents memory leaks and navigation issues
    return () => clearTimeout(timer);
  }, []); // Empty dependency array ensures this runs only once on mount

  // Render the splash screen with background image
  return (
    <SafeAreaView style={styles.container}>
      {/* Set status bar to light content for better visibility on dark background */}
      <StatusBar style="light" />
      
      {/* Background Image - Custom loading page image */}
      <Image 
        source={require('../assets/images/loadingpage.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover" // Ensures image covers entire screen 
      />
    </SafeAreaView>
  );
}

// StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1, // Take up full screen height
    backgroundColor: '#1A1A2E', 
  },
  backgroundImage: {
    position: 'absolute', // Position absolutely to cover entire screen
    top: -50, 
    left: 0, 
    right: 0,
    bottom: -50,
    width: '100%', 
    height: '120%',
  }
});

