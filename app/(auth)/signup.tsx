import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform, Modal } from 'react-native';
import { X } from 'lucide-react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography } from '../../constants/Theme';
import { Leaf, Mail, Lock, User, Calendar, Users, ChevronRight, Eye, EyeOff } from 'lucide-react-native';
import { supabase } from '../../config/supabase';
import { useRouter, Link } from 'expo-router';

export default function SignupScreen() {
  const [fullName, setFullName] = useState('');
  const [birthday, setBirthday] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState('');
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const router = useRouter();

  async function signUpWithEmail() {
    if (!email || !password || !fullName || !birthday || !gender) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          birthday: birthday.toLocaleDateString(),
          gender: gender,
        },
        emailRedirectTo: 'https://urianhealthtalk.vercel.app',
      },
    });

    if (error) {
      Alert.alert('Signup Failed', error.message);
      setLoading(false);
    } else {
      setLoading(false);
      setShowSuccessModal(true);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Leaf size={40} color={Colors.primary} style={styles.logo} />
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Begin your mental wellness journey</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputContainer}>
                <User size={20} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. John Doe"
                  placeholderTextColor={Colors.textMuted}
                  value={fullName}
                  onChangeText={setFullName}
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Birthday</Text>
              <View style={styles.inputContainer}>
                <Calendar size={20} color={Colors.textMuted} style={styles.inputIcon} />
                <TouchableOpacity 
                  style={{ flex: 1, height: 56, justifyContent: 'center' }} 
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={{ color: birthday ? Colors.text : Colors.textMuted }}>
                    {birthday ? birthday.toLocaleDateString() : "Select Birthday"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <Modal visible={showDatePicker} transparent animationType="fade">
              <View style={styles.modalOverlay}>
                <View style={styles.datePickerContainer}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Birthday</Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <X size={20} color={Colors.text} />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.pickerWrapper}>
                    {Platform.OS === 'web' ? (
                      <input 
                        type="date" 
                        value={birthday.toISOString().split('T')[0]}
                        onChange={(e) => setBirthday(new Date(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '12px',
                          border: '1px solid #e9ecef',
                          fontSize: '16px',
                          outline: 'none'
                        }}
                      />
                    ) : (
                      <DateTimePicker
                        value={birthday || new Date()}
                        mode="date"
                        display="spinner"
                        textColor="#000000"
                        themeVariant="light"
                        onChange={(event, selectedDate) => {
                          if (selectedDate) setBirthday(selectedDate);
                        }}
                        maximumDate={new Date()}
                      />
                    )}
                  </View>

                  <TouchableOpacity 
                    style={styles.confirmBtn} 
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.confirmBtnText}>Confirm Date</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <View style={styles.genderContainer}>
              <Text style={styles.genderLabel}>Gender</Text>
              <TouchableOpacity 
                style={styles.selectTrigger} 
                onPress={() => setShowGenderModal(true)}
              >
                <Text style={[styles.selectValue, !gender && { color: Colors.textMuted }]}>
                  {gender || "Select Gender"}
                </Text>
                <ChevronRight size={20} color={Colors.textMuted} style={{ transform: [{ rotate: '90deg' }] }} />
              </TouchableOpacity>
            </View>

            <Modal visible={showGenderModal} transparent animationType="fade">
              <View style={styles.modalOverlay}>
                <View style={styles.datePickerContainer}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Gender</Text>
                    <TouchableOpacity onPress={() => setShowGenderModal(false)}>
                      <X size={20} color={Colors.text} />
                    </TouchableOpacity>
                  </View>
                  <View style={{ gap: 12, marginVertical: 20 }}>
                    {['Male', 'Female', 'Non-binary', 'Other'].map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={[
                          styles.genderBox,
                          gender === option && styles.genderBoxSelected
                        ]}
                        onPress={() => {
                          setGender(option);
                          setShowGenderModal(false);
                        }}
                      >
                        <Text style={[
                          styles.genderBoxText,
                          gender === option && styles.genderBoxTextSelected
                        ]}>
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </Modal>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputContainer}>
                <Mail size={20} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor={Colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputContainer}>
                <Lock size={20} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={signUpWithEmail}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={20} color={Colors.textMuted} />
                  ) : (
                    <Eye size={20} color={Colors.textMuted} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <Modal visible={showSuccessModal} transparent animationType="fade">
              <View style={styles.modalOverlay}>
                <View style={styles.datePickerContainer}>
                  <View style={styles.successIconContainer}>
                    <View style={styles.successCircle}>
                      <Leaf size={40} color="#ffffff" />
                    </View>
                  </View>
                  <Text style={styles.successTitle}>Verify Your Email</Text>
                  <Text style={styles.successSubtitle}>
                    We've sent a confirmation link to your email. Please verify your account to proceed to login.
                  </Text>
                  <TouchableOpacity 
                    style={styles.submitBtn} 
                    onPress={() => {
                      setShowSuccessModal(false);
                      router.replace('/(auth)/login');
                    }}
                  >
                    <Text style={styles.submitBtnText}>Go to Login</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <TouchableOpacity 
              style={styles.signupButton} 
              onPress={signUpWithEmail}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.signupButtonText}>Sign Up</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.loginText}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    marginBottom: 16,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textMuted,
  },
  form: {
    gap: 16,
  },
  inputWrapper: {
    marginBottom: 4,
  },
  inputLabel: {
    ...Typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
  },
  signupButton: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  signupButtonText: {
    ...Typography.subtitle,
    color: '#fff',
  },
  doneButton: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: Colors.primary + '20',
    borderRadius: 10,
    marginTop: 5,
  },
  doneButtonText: {
    color: Colors.primary,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  datePickerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  pickerWrapper: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  confirmBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  confirmBtnText: {
    ...Typography.subtitle,
    color: '#ffffff',
    fontWeight: '700',
  },
  selectTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectValue: {
    ...Typography.body,
    color: Colors.text,
  },
  genderBox: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  genderBoxSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
    borderWidth: 2,
  },
  genderBoxText: {
    ...Typography.body,
    color: Colors.text,
  },
  genderBoxTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  successTitle: {
    ...Typography.h2,
    textAlign: 'center',
    color: Colors.text,
    marginBottom: 12,
  },
  successSubtitle: {
    ...Typography.body,
    textAlign: 'center',
    color: Colors.textMuted,
    lineHeight: 22,
    marginBottom: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    ...Typography.body,
    color: Colors.textMuted,
  },
  loginText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '700',
  },
});
