import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';

export default function FalconFlyerScreen() {
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  const handleEnroll = () => {
    if (!agreeToTerms) {
      Alert.alert('Error', 'Please agree to the terms and conditions');
      return;
    }

    Alert.alert(
      'Success',
      'Welcome to Falcon Flyer! You can now start earning points.',
      [
        {
          text: 'OK',
          onPress: () => router.push('/home')
        }
      ]
    );
  };

  const handleBackToSignup = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Join Falcon Flyer</Text>
          <Text style={styles.subtitle}>Gulf Air's Loyalty Program</Text>
        </View>

        {/* Benefits Section */}
        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>Falcon Flyer Benefits</Text>
          
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>✈️</Text>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>Earn Points</Text>
              <Text style={styles.benefitDescription}>Earn points on every flight and redeem for rewards</Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>🏆</Text>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>Tier Benefits</Text>
              <Text style={styles.benefitDescription}>Enjoy exclusive benefits as you climb the tiers</Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>🎁</Text>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>Exclusive Offers</Text>
              <Text style={styles.benefitDescription}>Access to special promotions and partner benefits</Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>⭐</Text>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>Priority Services</Text>
              <Text style={styles.benefitDescription}>Priority check-in, boarding, and customer service</Text>
            </View>
          </View>
        </View>

        {/* Terms and Conditions */}
        <View style={styles.termsContainer}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setAgreeToTerms(!agreeToTerms)}
          >
            <View style={[
              styles.checkbox,
              agreeToTerms && styles.checkboxChecked
            ]}>
              {agreeToTerms && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.termsText}>
              I agree to the <Text style={styles.termsLink}>Falcon Flyer Terms and Conditions</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setMarketingOptIn(!marketingOptIn)}
          >
            <View style={[
              styles.checkbox,
              marketingOptIn && styles.checkboxChecked
            ]}>
              {marketingOptIn && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.termsText}>
              I would like to receive marketing communications and special offers
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.enrollButton, !agreeToTerms && styles.enrollButtonDisabled]}
            onPress={handleEnroll}
            disabled={!agreeToTerms}
          >
            <Text style={styles.enrollButtonText}>Join Falcon Flyer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleBackToSignup}
          >
            <Text style={styles.skipButtonText}>Skip for Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E', // Gulf Air dark blue
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 100,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#B8B8B8',
    textAlign: 'center',
  },
  benefitsContainer: {
    backgroundColor: '#16213E',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 40,
    textAlign: 'center',
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#B8B8B8',
    lineHeight: 20,
  },
  termsContainer: {
    marginBottom: 32,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#A68F65',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#A68F65',
  },
  checkmark: {
    color: '#1A1A2E',
    fontSize: 12,
    fontWeight: 'bold',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#B8B8B8',
    lineHeight: 20,
  },
  termsLink: {
    color: '#A68F65',
    fontWeight: '600',
  },
  buttonContainer: {
    gap: 16,
  },
  enrollButton: {
    backgroundColor: '#A68F65',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  enrollButtonDisabled: {
    backgroundColor: '#8B8B8B',
  },
  enrollButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A68F65',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A68F65',
  },
});

