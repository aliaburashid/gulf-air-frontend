// Index Component - Entry Point for the Gulf Air App
// This component serves as the initial landing page when the app starts.

import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function Index() {
  // Effect hook to handle automatic navigation to splash screen
  useEffect(() => {
    const timer = setTimeout(() => {
      // Navigate to splash screen using router.replace to prevent back navigation
      router.replace('/splash');
    }, 100);

    // Cleanup function to clear the timer if component unmounts
    return () => clearTimeout(timer);
  }, []); // Empty dependency array ensures this runs only once on mount

  // Render loading screen with centered spinner
  return (
    <View style={styles.container}>
      {/* Large loading spinner with Gulf Air brand color */}
      <ActivityIndicator size="large" color="#A68F65" />
    </View>
  );
}

// StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1, // Take up full screen height
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
    backgroundColor: '#1A1A2E', 
  },
});
