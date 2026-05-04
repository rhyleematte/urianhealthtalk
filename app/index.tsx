import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { Colors, Typography, Shadows } from '../constants/Theme';
import { Lightbulb, Lock, Leaf } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function LandingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#f0f7ff', '#ffffff']}
        style={StyleSheet.absoluteFill}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Hero Section */}
          <View style={styles.heroContainer}>
            <View style={styles.imageWrapper}>
              <Image
                source={require('@/assets/images/ai_face_hero.png')}
                style={styles.heroImage}
                resizeMode="cover"
              />
              {/* Floating Pills */}
              <View style={[styles.pill, styles.topPill]}>
                <Text style={styles.pillEmoji}>😊</Text>
                <Text style={styles.pillText}>Feeling peaceful</Text>
              </View>
              <View style={[styles.pill, styles.bottomPill]}>
                <Lightbulb size={16} color={Colors.primary} />
                <Text style={[styles.pillText, { marginLeft: 8 }]}>Daily calm tip</Text>
              </View>
            </View>
          </View>

          {/* Branding */}
          <View style={styles.brandContainer}>
            <Leaf size={32} color={Colors.primary} style={styles.logo} />
            <Text style={styles.brandName}>Urian Solace AI</Text>
          </View>

          {/* Text Content */}
          <View style={styles.textContainer}>
            <Text style={styles.heading}>Your safe space to talk, anytime.</Text>
            <Text style={styles.description}>
              Connect with an AI companion that listens without judgment. Start your journey towards mental clarity and inner peace today.
            </Text>
          </View>

          {/* CTAs */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => router.push('/(auth)/login')}
            >
              <Text style={styles.primaryButtonText}>Start Chatting</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Learn How It Works</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Lock size={14} color={Colors.textMuted} />
            <Text style={styles.footerText}>Private & Secure Conversations</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  imageWrapper: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 40,
    overflow: 'visible',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    position: 'absolute',
    ...Shadows.medium,
  },
  topPill: {
    top: 20,
    right: -20,
  },
  bottomPill: {
    bottom: 40,
    left: -20,
  },
  pillEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  pillText: {
    ...Typography.caption,
    color: Colors.text,
    fontWeight: '600',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    marginRight: 8,
  },
  brandName: {
    ...Typography.h2,
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  heading: {
    ...Typography.h1,
    textAlign: 'center',
    marginBottom: 16,
    color: Colors.text,
  },
  description: {
    ...Typography.body,
    textAlign: 'center',
    color: Colors.textMuted,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 40,
    alignItems: 'center',
    width: '100%',
  },
  primaryButtonText: {
    ...Typography.subtitle,
    color: Colors.onPrimary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 18,
    borderRadius: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    width: '100%',
  },
  secondaryButtonText: {
    ...Typography.subtitle,
    color: Colors.text,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginLeft: 6,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
