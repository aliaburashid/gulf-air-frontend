// This is the main layout file that defines the navigation structure for the entire app.
// It's like the "master template" that wraps all your screens and sets up navigation.

import { Stack } from "expo-router";

// This function defines the root layout of the app. It's the first component
// that gets rendered when the app starts, and it sets up the navigation structure.
export default function RootLayout() {
  return (
    // Stack creates a stack based navigation where screens are pushed on top
    // of each other. Users can navigate forward and backward through the stack.
    <Stack
      screenOptions={{
        // Hide the default header for all screens as eacg screen has its own custom header design
        headerShown: false,
        // Enable swipe gestures for navigation
        gestureEnabled: true,
        // Set the animation style for screen transitions creates a smooth slide-in effect from the right
        animation: 'slide_from_right',
      }}
    >
  
      {/* /Each <Stack.Screen> defines a route in the app. */}
      <Stack.Screen name="index" />
      <Stack.Screen name="splash" />
      <Stack.Screen name="home" />
      <Stack.Screen name="menu" />
      <Stack.Screen name="my-trips" />
      <Stack.Screen name="manage-booking" />
      <Stack.Screen name="book" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="falcon-flyer" />
    </Stack>
  );
}

