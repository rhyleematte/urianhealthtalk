import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography } from '../constants/Theme';
import { ChevronLeft, Edit3, Mail, Calendar, Languages, Shield, LogOut, CreditCard, Coins } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';

export default function AccountScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const InfoRow = ({ icon: Icon, label, value, isLast }: any) => (
    <View style={[styles.infoRow, isLast && styles.noBorder]}>
      <View style={styles.infoLeft}>
        <Icon size={20} color={Colors.primary} />
        <View style={styles.textContainer}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
      </View>
      <ChevronRight size={20} color={Colors.border} />
    </View>
  );

  // Re-defining ChevronRight locally as it's used in the row
  const ChevronRight = ({ size, color }: any) => (
    <View><Text style={{ color, fontSize: size }}>›</Text></View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Information</Text>
        <TouchableOpacity style={styles.editHeaderButton}>
          <Edit3 size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <Image 
              source={require('@/assets/images/user_avatar.png')} 
              style={styles.avatar} 
            />
          </View>
          <Text style={styles.userName}>{profile?.full_name || (profile?.plan_type === 'premium' ? 'Premium Member' : 'Basic Member')}</Text>
          <Text style={styles.userStatus}>{user?.email}</Text>
        </View>

        {/* Profile Details Card */}
        <View style={styles.card}>
          <InfoRow 
            icon={User} 
            label="Full Name" 
            value={profile?.full_name || "Not set"} 
          />
          <InfoRow 
            icon={Mail} 
            label="Email Address" 
            value={user?.email || "No Email"} 
          />
          <InfoRow 
            icon={Calendar} 
            label="Date of Birth" 
            value={profile?.birthday || "Not set"} 
          />
          <InfoRow 
            icon={Users} 
            label="Gender" 
            value={profile?.gender || "Not set"} 
          />
          <InfoRow 
            icon={Languages} 
            label="Language Preference" 
            value="English (US)" 
            isLast 
          />
        </View>

        {/* Subscription Card */}
        <Text style={styles.sectionTitle}>Subscription</Text>
        <View style={styles.card}>
          <InfoRow 
            icon={CreditCard} 
            label="Plan Type" 
            value={profile?.plan_type?.toUpperCase() || "BASIC"} 
          />
          <InfoRow 
            icon={Coins} 
            label="AI Tokens Remaining" 
            value={profile?.plan_type === 'premium' ? "Unlimited" : (profile?.tokens?.toString() || "0")} 
            isLast 
          />
        </View>

        {/* Security Section */}
        <Text style={styles.sectionTitle}>Security</Text>
        <View style={styles.card}>
          <InfoRow 
            icon={Shield} 
            label="Change Password" 
            value="••••••••••••" 
            isLast 
          />
        </View>

        {/* Sign Out Section */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut size={20} color="#E53E3E" />
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    ...Typography.subtitle,
    color: Colors.text,
  },
  editHeaderButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f7ff',
    padding: 4,
    marginBottom: 16,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  userName: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: 4,
  },
  userStatus: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    marginLeft: 16,
  },
  label: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  value: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
  },
  sectionTitle: {
    ...Typography.subtitle,
    color: Colors.text,
    marginBottom: 12,
    paddingLeft: 4,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F5',
    padding: 16,
    borderRadius: 16,
    marginTop: 10,
    marginBottom: 40,
    gap: 8,
  },
  signOutButtonText: {
    ...Typography.subtitle,
    color: '#E53E3E',
  },
});
