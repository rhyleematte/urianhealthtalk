import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography } from '../../constants/Theme';
import { CheckCircle, Leaf, Shield, XCircle, Heart, FileText } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';

import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';

export default function PlansScreen() {
  const { user, profile, refreshProfile } = useAuth();
  
  const freeFeatures = [
    'Limited daily AI tokens',
    'Basic Journal access',
    'Daily Calm Tips',
  ];

  const premiumFeatures = [
    'Unlimited AI tokens',
    'Advanced Emotional Analytics',
    'Personalized Therapy Plans',
    'Priority Specialist Access',
    'Document Analysis (.txt, .docx)',
  ];

  const handleDocumentCheck = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        Alert.alert(
          'Document Analyzed',
          `Successfully processed: ${result.assets[0].name}\n\nThis is a premium feature to extract therapy notes, journaling records, or business model canvases.`
        );
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick document.');
    }
  };

  const handleUpgrade = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to upgrade.');
      return;
    }
    
    // Simulate payment process and update database
    const { error } = await supabase
      .from('profiles')
      .update({ plan_type: 'premium', tokens: 999999 })
      .eq('id', user.id);
      
    if (error) {
      Alert.alert('Upgrade Failed', error.message);
    } else {
      Alert.alert('Success!', 'You are now a Premium member.');
      await refreshProfile();
    }
  };

  const isPremium = profile?.plan_type === 'premium';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Leaf size={24} color={Colors.primary} />
          <Text style={styles.headerTitle}>Serene Dialogue</Text>
        </View>
        <Image 
          source={require('@/assets/images/user_avatar.png')} 
          style={styles.avatar} 
        />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.introText}>
          Choose the plan that best supports your mental well-being and personal growth.
        </Text>

        {/* Free Plan */}
        <View style={styles.planCard}>
          <View style={styles.planHeader}>
            <View style={styles.badge}><Text style={styles.badgeText}>BASIC</Text></View>
            <Text style={styles.planName}>Free Plan</Text>
            <View style={styles.priceRow}>
              <Text style={styles.currency}>$</Text>
              <Text style={styles.price}>0</Text>
              <Text style={styles.period}>/forever</Text>
            </View>
            <Text style={styles.planDescription}>
              Essential support for your daily mindfulness practice.
            </Text>
          </View>
          <View style={styles.featuresList}>
            {freeFeatures.map((feature, i) => (
              <View key={i} style={styles.featureItem}>
                <CheckCircle size={18} color={Colors.primary} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.currentPlanButton} disabled>
            <Text style={styles.currentPlanButtonText}>{isPremium ? 'Downgrade' : 'Current Plan'}</Text>
          </TouchableOpacity>
        </View>

        {/* Premium Plan */}
        <View style={[styles.planCard, styles.premiumCard]}>
          <View style={styles.planHeader}>
            <View style={[styles.badge, styles.recommendedBadge]}>
              <Text style={[styles.badgeText, { color: '#ffffff' }]}>RECOMMENDED</Text>
            </View>
            <Text style={[styles.planName, { color: '#ffffff' }]}>Premium Plan</Text>
            <View style={styles.priceRow}>
              <Text style={[styles.currency, { color: '#ffffff' }]}>$</Text>
              <Text style={[styles.price, { color: '#ffffff' }]}>12</Text>
              <Text style={[styles.period, { color: '#ffffff' }]}>/month</Text>
            </View>
            <Text style={[styles.planDescription, { color: '#e0e0e0' }]}>
              Unlock the full power of Serene Dialogue for deeper insights.
            </Text>
          </View>
          <View style={styles.featuresList}>
            {premiumFeatures.map((feature, i) => (
              <View key={i} style={styles.featureItem}>
                <CheckCircle size={18} color="#ffffff" />
                <Text style={[styles.featureText, { color: '#ffffff' }]}>{feature}</Text>
              </View>
            ))}
          </View>
          
          {isPremium && (
            <TouchableOpacity style={styles.docTestButton} onPress={handleDocumentCheck}>
              <FileText size={20} color="#ffffff" />
              <Text style={styles.docTestButtonText}>Test Document Analysis (.txt, .docx)</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.upgradeButton, isPremium && { opacity: 0.5 }]} 
            onPress={handleUpgrade}
            disabled={isPremium}
          >
            <Text style={styles.upgradeButtonText}>{isPremium ? 'Current Plan' : 'Upgrade Now'}</Text>
          </TouchableOpacity>
          <CheckCircle size={100} color="rgba(255,255,255,0.1)" style={styles.bgIcon} />
        </View>

        {/* Trust Badges */}
        <View style={styles.trustGrid}>
          <View style={styles.trustItem}>
            <Shield size={24} color={Colors.primary} />
            <Text style={styles.trustText}>100% Private & Secure</Text>
          </View>
          <View style={styles.trustItem}>
            <XCircle size={24} color={Colors.primary} />
            <Text style={styles.trustText}>Cancel Anytime</Text>
          </View>
          <View style={styles.trustItem}>
            <Heart size={24} color={Colors.primary} />
            <Text style={styles.trustText}>Scientifically Grounded</Text>
          </View>
        </View>

        {/* Footer Image */}
        <View style={styles.footerContainer}>
          <Image 
            source={require('@/assets/images/landscape.png')} 
            style={styles.footerImage}
          />
          <View style={styles.overlay}>
            <Text style={styles.quoteText}>
              "Investing in your peace of mind is the greatest gift."
            </Text>
          </View>
        </View>
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
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.h2,
    marginLeft: 10,
    color: Colors.primary,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 24,
  },
  introText: {
    ...Typography.body,
    textAlign: 'center',
    color: Colors.textMuted,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  planCard: {
    backgroundColor: '#ffffff',
    borderRadius: 30,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  premiumCard: {
    backgroundColor: Colors.primary,
    overflow: 'hidden',
  },
  planHeader: {
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  badge: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  recommendedBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
  },
  planName: {
    ...Typography.h2,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  currency: {
    ...Typography.h2,
    marginBottom: 4,
    marginRight: 2,
  },
  price: {
    fontSize: 40,
    fontWeight: '800',
    fontFamily: 'Manrope-Bold',
  },
  period: {
    ...Typography.body,
    marginBottom: 6,
    marginLeft: 4,
    color: Colors.textMuted,
  },
  planDescription: {
    ...Typography.body,
    color: Colors.textMuted,
  },
  featuresList: {
    gap: 16,
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    ...Typography.body,
    color: Colors.text,
  },
  currentPlanButton: {
    backgroundColor: '#e9ecef',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  currentPlanButtonText: {
    ...Typography.subtitle,
    color: Colors.textMuted,
  },
  docTestButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    zIndex: 1,
  },
  docTestButtonText: {
    ...Typography.subtitle,
    color: '#ffffff',
  },
  upgradeButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    zIndex: 1,
  },
  upgradeButtonText: {
    ...Typography.subtitle,
    color: Colors.primary,
  },
  bgIcon: {
    position: 'absolute',
    top: 20,
    right: -20,
  },
  trustGrid: {
    gap: 12,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef6f9',
    padding: 16,
    borderRadius: 16,
    gap: 16,
  },
  trustText: {
    ...Typography.subtitle,
    fontSize: 14,
    color: Colors.primary,
  },
  footerContainer: {
    width: '100%',
    height: 200,
    borderRadius: 30,
    overflow: 'hidden',
    position: 'relative',
    marginTop: 8,
    marginBottom: 20,
  },
  footerImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    padding: 30,
  },
  quoteText: {
    ...Typography.subtitle,
    color: '#ffffff',
    textAlign: 'left',
    lineHeight: 24,
  },
});
