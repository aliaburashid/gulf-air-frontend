import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';

export default function DashboardScreen() {
  const [user] = useState({
    name: 'Ahmed Al-Rashid',
    falconFlyerNumber: 'FF123456',
    tier: 'Silver',
    points: 1250,
  });

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => router.replace('/login'),
        },
      ]
    );
  };

  const handleBookFlight = () => {
    Alert.alert('Book Flight', 'Navigate to flight booking');
  };

  const handleMyBookings = () => {
    Alert.alert('My Bookings', 'Navigate to bookings');
  };

  const handleFalconFlyer = () => {
    Alert.alert('Falcon Flyer', 'Navigate to loyalty program');
  };

  const handleCheckIn = () => {
    Alert.alert('Check In', 'Navigate to check-in');
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
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.falconFlyerText}>Falcon Flyer: {user.falconFlyerNumber}</Text>
        </View>

        {/* Falcon Flyer Status */}
        <View style={styles.loyaltyCard}>
          <View style={styles.loyaltyHeader}>
            <Text style={styles.loyaltyTitle}>Falcon Flyer Status</Text>
            <View style={[styles.tierBadge, styles[`${user.tier.toLowerCase()}Tier`]]}>
              <Text style={styles.tierText}>{user.tier}</Text>
            </View>
          </View>
          <Text style={styles.pointsText}>{user.points.toLocaleString()} Points</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '45%' }]} />
          </View>
          <Text style={styles.progressText}>1,250 / 2,500 points to Gold</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={handleBookFlight}>
              <Text style={styles.actionIcon}>✈️</Text>
              <Text style={styles.actionTitle}>Book Flight</Text>
              <Text style={styles.actionDescription}>Search and book your next flight</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={handleMyBookings}>
              <Text style={styles.actionIcon}>📋</Text>
              <Text style={styles.actionTitle}>My Bookings</Text>
              <Text style={styles.actionDescription}>View and manage your bookings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={handleCheckIn}>
              <Text style={styles.actionIcon}>✅</Text>
              <Text style={styles.actionTitle}>Check In</Text>
              <Text style={styles.actionDescription}>Check in for your upcoming flight</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={handleFalconFlyer}>
              <Text style={styles.actionIcon}>🏆</Text>
              <Text style={styles.actionTitle}>Falcon Flyer</Text>
              <Text style={styles.actionDescription}>Manage your loyalty account</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.recentActivity}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Text style={styles.activityEmoji}>✈️</Text>
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Flight Booked</Text>
              <Text style={styles.activityDescription}>BAH → LHR on Dec 15, 2024</Text>
              <Text style={styles.activityDate}>2 days ago</Text>
            </View>
            <Text style={styles.activityPoints}>+250 pts</Text>
          </View>

          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Text style={styles.activityEmoji}>🏆</Text>
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Tier Upgrade</Text>
              <Text style={styles.activityDescription}>Congratulations! You're now Silver</Text>
              <Text style={styles.activityDate}>1 week ago</Text>
            </View>
          </View>
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
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 50,
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A68F65',
  },
  logoutText: {
    color: '#A68F65',
    fontSize: 14,
    fontWeight: '600',
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 18,
    color: '#B8B8B8',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  falconFlyerText: {
    fontSize: 16,
    color: '#A68F65',
    fontWeight: '600',
  },
  loyaltyCard: {
    backgroundColor: '#16213E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  loyaltyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  loyaltyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  silverTier: {
    backgroundColor: '#C0C0C0',
  },
  tierText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  pointsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#A68F65',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#2A2A3E',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#A68F65',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#B8B8B8',
  },
  quickActions: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: '#16213E',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 12,
    color: '#B8B8B8',
    textAlign: 'center',
    lineHeight: 16,
  },
  recentActivity: {
    marginBottom: 24,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A3E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityEmoji: {
    fontSize: 18,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: 14,
    color: '#B8B8B8',
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 12,
    color: '#8B8B8B',
  },
  activityPoints: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A68F65',
  },
});

