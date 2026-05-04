import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography } from '../../constants/Theme';
import { CheckCircle, Leaf, Shield, XCircle, Heart, Clock, AlertCircle, Check, X } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';

type SubscriptionRequest = {
  id: string;
  type: 'upgrade' | 'cancel';
  status: 'pending' | 'approved' | 'declined';
  created_at: string;
};

export default function PlansScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [request, setRequest] = useState<SubscriptionRequest | null>(null);
  
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
  ];

  useEffect(() => {
    if (user) {
      fetchActiveRequest();
    }
  }, [user, profile]); // Refresh when profile changes (approved via email)

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshProfile(),
        fetchActiveRequest()
      ]);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  const fetchActiveRequest = async () => {
    const { data, error } = await supabase
      .from('subscription_requests')
      .select('*')
      .eq('user_id', user?.id)
      .eq('status', 'pending')
      .single();

    if (data) setRequest(data);
    else setRequest(null);
  };

  const handleCreateRequest = async (type: 'upgrade' | 'cancel') => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to manage your plan.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('subscription_requests')
        .insert([{ user_id: user.id, type, status: 'pending' }]);

      if (error) throw error;

      Alert.alert(
        'Request Sent',
        `A verification email has been sent to ${user.email}. Please click the "Confirm" button in your email to ${type === 'upgrade' ? 'activate Premium' : 'confirm cancellation'}.`
      );
      await fetchActiveRequest();
      await refreshProfile();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const isPremium = profile?.plan_type === 'premium';
  const hasPendingRequest = !!request;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Leaf size={24} color={Colors.primary} />
          <Text style={styles.headerTitle}>Serene Dialogue</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {hasPendingRequest && (
          <View style={styles.pendingCard}>
            <Clock size={20} color={Colors.primary} />
            <View style={styles.pendingTextContainer}>
              <Text style={styles.pendingTitle}>Pending {request.type === 'upgrade' ? 'Upgrade' : 'Cancellation'}</Text>
              <Text style={styles.pendingSubtitle}>Please verify this action via the email we sent you.</Text>
            </View>
          </View>
        )}

        {isPremium && profile?.plan_expires_at && (
          <View style={styles.expirationCard}>
            <AlertCircle size={20} color="#ffffff" />
            <Text style={styles.expirationText}>
              Premium access expires on: {new Date(profile.plan_expires_at).toLocaleDateString()}
            </Text>
          </View>
        )}

        <Text style={styles.introText}>
          Choose the plan that best supports your mental well-being and personal growth.
        </Text>

        {/* Basic Plan */}
        <View style={styles.planCard}>
          <View style={styles.planHeader}>
            <View style={styles.badge}><Text style={styles.badgeText}>BASIC</Text></View>
            <Text style={styles.planName}>Free Plan</Text>
            <View style={styles.priceRow}>
              <Text style={styles.currency}>$</Text>
              <Text style={styles.price}>0</Text>
              <Text style={styles.period}>/forever</Text>
            </View>
          </View>
          <View style={styles.featuresList}>
            {freeFeatures.map((feature, i) => (
              <View key={i} style={styles.featureItem}>
                <CheckCircle size={18} color={Colors.primary} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
          
          {isPremium ? (
            <View style={styles.currentPlanButton}>
              <Text style={styles.currentPlanButtonText}>Downgraded to Basic</Text>
            </View>
          ) : (
            <View style={styles.currentPlanButton}>
              <Text style={styles.currentPlanButtonText}>Current Plan</Text>
            </View>
          )}
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
          </View>
          <View style={styles.featuresList}>
            {premiumFeatures.map((feature, i) => (
              <View key={i} style={styles.featureItem}>
                <CheckCircle size={18} color="#ffffff" />
                <Text style={[styles.featureText, { color: '#ffffff' }]}>{feature}</Text>
              </View>
            ))}
          </View>
          
          <TouchableOpacity 
            style={[
              isPremium ? styles.cancelButton : styles.upgradeButton, 
              hasPendingRequest && { opacity: 0.5 }
            ]} 
            onPress={() => isPremium ? handleCreateRequest('cancel') : handleCreateRequest('upgrade')}
            disabled={hasPendingRequest}
          >
            {loading ? <ActivityIndicator color={isPremium ? '#ffffff' : Colors.primary} /> : (
              <Text style={isPremium ? styles.cancelButtonText : styles.upgradeButtonText}>
                {isPremium ? 'Cancel Plan' : 'Upgrade Now'}
              </Text>
            )}
          </TouchableOpacity>
          <CheckCircle size={100} color="rgba(255,255,255,0.1)" style={styles.bgIcon} />
        </View>

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

        <View style={{ height: 40 }} />
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
    gap: 20,
  },
  pendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryContainer,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  pendingTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  pendingTitle: {
    ...Typography.subtitle,
    fontSize: 14,
    color: Colors.primary,
  },
  pendingSubtitle: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  expirationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34a853',
    padding: 16,
    borderRadius: 20,
    gap: 12,
  },
  expirationText: {
    ...Typography.caption,
    color: '#ffffff',
    fontWeight: '700',
  },
  introText: {
    ...Typography.body,
    textAlign: 'center',
    color: Colors.textMuted,
    paddingHorizontal: 20,
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
    marginBottom: 20,
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
    marginBottom: 8,
  },
  currency: {
    ...Typography.h2,
    marginBottom: 4,
    marginRight: 2,
  },
  price: {
    fontSize: 40,
    fontWeight: '800',
  },
  period: {
    ...Typography.body,
    marginBottom: 6,
    marginLeft: 4,
    color: Colors.textMuted,
  },
  featuresList: {
    gap: 12,
    marginBottom: 24,
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
    backgroundColor: '#f1f3f5',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  currentPlanButtonText: {
    ...Typography.subtitle,
    color: Colors.textMuted,
  },
  downgradeButton: {
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  downgradeButtonText: {
    ...Typography.subtitle,
    color: Colors.primary,
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
  cancelButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    zIndex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cancelButtonText: {
    ...Typography.subtitle,
    color: '#ffffff',
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
    backgroundColor: '#f0f7ff',
    padding: 16,
    borderRadius: 16,
    gap: 16,
  },
  trustText: {
    ...Typography.subtitle,
    fontSize: 14,
    color: Colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  simModal: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    width: '100%',
    padding: 24,
  },
  simHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  simTitle: {
    ...Typography.h3,
  },
  simContent: {
    gap: 20,
  },
  simText: {
    ...Typography.body,
    lineHeight: 22,
  },
  simActions: {
    gap: 12,
  },
  simButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 10,
  },
  approveBtn: {
    backgroundColor: '#34a853',
  },
  declineBtn: {
    backgroundColor: '#ea4335',
  },
  simButtonText: {
    ...Typography.subtitle,
    color: '#ffffff',
  },
});

