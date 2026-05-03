import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Switch, Modal, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform, Image 
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography } from '../../constants/Theme';
import { 
  User, Mail, Calendar, Languages, 
  Lock, Fingerprint, 
  HelpCircle, ShieldCheck, MessageCircle,
  LogOut, Edit3, ChevronRight, Bell, Leaf, X, LogIn, Users, Eye, EyeOff
} from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';



export default function ProfileScreen() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState('');
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBirthday, setEditBirthday] = useState(new Date());
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);
  const [editGender, setEditGender] = useState('');
  const [showEditGenderModal, setShowEditGenderModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [biometricEnabled, setBiometricEnabled] = React.useState(true);



  const handleAuth = async () => {
    if (!email || !password || (!isLoginMode && (!name || !birthday || !gender))) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setAuthLoading(true);
    try {
      if (isLoginMode) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setAuthModalVisible(false);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              birthday: birthday.toLocaleDateString(),
              gender: gender,
            }
          }
        });
        if (error) throw error;
        if (data.session) {
          setAuthModalVisible(false);
        } else {
          Alert.alert("Success", "Check your email for the confirmation link!");
          setAuthModalVisible(false);
        }
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Authentication failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: async () => {
        await supabase.auth.signOut();
      }}
    ]);
  };

  const handleUpdateProfile = async () => {
    if (!editName || !editBirthday || !editGender) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editName,
          birthday: editBirthday.toLocaleDateString(),
          gender: editGender,
        })
        .eq('id', user?.id);

      if (error) throw error;
      
      await refreshProfile();
      setEditModalVisible(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to update profile.");
    } finally {
      setUpdating(false);
    }
  };

  const openEditModal = () => {
    setEditName(profile?.full_name || '');
    // Try to parse existing birthday string back to Date
    const birthDate = profile?.birthday ? new Date(profile.birthday) : new Date();
    setEditBirthday(isNaN(birthDate.getTime()) ? new Date() : birthDate);
    setEditGender(profile?.gender || '');
    setEditModalVisible(true);
  };

  const SettingRow = ({ icon: Icon, title, value, badge, isLast, onPress, showToggle }: any) => (
    <TouchableOpacity 
      style={[styles.settingRow, isLast && styles.noBorder]}
      onPress={onPress}
      disabled={showToggle}
    >
      <View style={styles.settingLeft}>
        <View style={styles.iconWrapper}>
          <Icon size={20} color={Colors.primary} />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          {value && <Text style={styles.settingValue}>{value}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        {showToggle ? (
          <Switch 
            value={biometricEnabled} 
            onValueChange={setBiometricEnabled}
            trackColor={{ false: '#e9ecef', true: Colors.primary }}
            thumbColor={'#ffffff'}
          />
        ) : (
          <ChevronRight size={20} color={Colors.border} />
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authContainer}>
          <View style={styles.authHero}>
            <View style={styles.authIconCircle}>
              <Leaf size={60} color={Colors.primary} />
            </View>
            <Text style={styles.authTitle}>Urian Solace AI</Text>
            <Text style={styles.authSubtitle}>Your personal sanctuary for mental wellness and dialogue.</Text>
          </View>

          <View style={styles.authActions}>
            <TouchableOpacity 
              style={styles.primaryAuthBtn}
              onPress={() => { setIsLoginMode(false); setAuthModalVisible(true); }}
            >
              <Text style={styles.primaryAuthBtnText}>Create Account</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.secondaryAuthBtn}
              onPress={() => { setIsLoginMode(true); setAuthModalVisible(true); }}
            >
              <Text style={styles.secondaryAuthBtnText}>Log In</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.authFooter}>By joining, you agree to our Terms of Service and Privacy Policy.</Text>
        </View>

        <Modal visible={authModalVisible} animationType="slide" presentationStyle="pageSheet">
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setAuthModalVisible(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{isLoginMode ? 'Welcome Back' : 'Join Us'}</Text>
              <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1 }}
            >
              <ScrollView contentContainerStyle={styles.modalContent}>
                <View style={styles.form}>
                  {!isLoginMode && (
                    <>
                      <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>Full Name</Text>
                        <TextInput 
                          style={styles.input} 
                          placeholder="e.g. John Doe"
                          value={name}
                          onChangeText={setName}
                          returnKeyType="next"
                        />
                      </View>
                      <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>Birthday</Text>
                        <TouchableOpacity 
                          style={[styles.input, { justifyContent: 'center', height: 50 }]} 
                          onPress={() => setShowDatePicker(true)}
                        >
                          <Text style={{ color: birthday ? Colors.text : Colors.textMuted }}>
                            {birthday ? birthday.toLocaleDateString() : "Select Birthday"}
                          </Text>
                        </TouchableOpacity>
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
                              style={styles.submitBtn} 
                              onPress={() => setShowDatePicker(false)}
                            >
                              <Text style={styles.submitBtnText}>Confirm Date</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </Modal>
                      <View style={styles.genderContainer}>
                        <Text style={styles.inputLabel}>Gender</Text>
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
                    </>
                  )}
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>Email Address</Text>
                    <TextInput 
                      style={styles.input} 
                      placeholder="name@example.com"
                      autoCapitalize="none"
                      keyboardType="email-address"
                      value={email}
                      onChangeText={setEmail}
                      returnKeyType="next"
                    />
                  </View>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>Password</Text>
                    <View style={styles.inputContainer}>
                      <TextInput 
                        style={styles.input} 
                        placeholder="••••••••"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                        returnKeyType="done"
                        onSubmitEditing={handleAuth}
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

                  <TouchableOpacity style={styles.submitBtn} onPress={handleAuth} disabled={authLoading}>
                    {authLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.submitBtnText}>{isLoginMode ? 'Log In' : 'Sign Up'}</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.switchModeBtn}
                    onPress={() => setIsLoginMode(!isLoginMode)}
                  >
                    <Text style={styles.switchModeText}>
                      {isLoginMode ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Leaf size={24} color={Colors.primary} />
          <Text style={styles.headerTitle}>Serene Dialogue</Text>
        </View>
        <View style={styles.headerRight}>
          <Bell size={24} color={Colors.primary} style={{ marginRight: 16 }} />
          <Image 
            source={require('@/assets/images/user_avatar.png')} 
            style={styles.avatarSmall} 
          />
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* User Profile Info */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <Image 
              source={require('@/assets/images/user_avatar.png')} 
              style={styles.avatarLarge} 
            />
            <TouchableOpacity style={styles.editButton} onPress={openEditModal}>
              <Edit3 size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{profile?.full_name || user?.email}</Text>
          <Text style={styles.userStatus}>{profile?.plan_type === 'premium' ? 'Premium' : 'Basic'} Member • {user?.email}</Text>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Account</Text>
          </View>
          <View style={styles.card}>
            <SettingRow 
              icon={Mail} 
              title="Email Address" 
              value={user?.email} 
            />
            <SettingRow 
              icon={Calendar} 
              title="Date of Birth" 
              value={profile?.birthday || "Not set"} 
            />
            <SettingRow 
              icon={Users} 
              title="Gender" 
              value={profile?.gender || "Not set"} 
              isLast={profile?.plan_type !== 'premium'}
            />
            {profile?.plan_type === 'premium' && profile?.plan_expires_at && (
              <SettingRow 
                icon={Clock} 
                title="Premium Expires" 
                value={new Date(profile.plan_expires_at).toLocaleDateString()} 
                isLast
              />
            )}
          </View>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ShieldCheck size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Security</Text>
          </View>
          <View style={styles.card}>
            <SettingRow 
              icon={Lock} 
              title="Change Password" 
              value="Last updated 3 months ago" 
            />
            <SettingRow 
              icon={Fingerprint} 
              title="Biometric Authentication" 
              showToggle
              isLast 
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <HelpCircle size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Support</Text>
          </View>
          <View style={styles.card}>
            <SettingRow 
              icon={ShieldCheck} 
              title="Privacy Policy" 
            />
            <SettingRow 
              icon={MessageCircle} 
              title="Contact Support" 
              isLast 
            />
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#ba1a1a" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editModalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <View style={{ width: 24 }} />
          </View>

          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView contentContainerStyle={styles.modalContent}>
              <View style={styles.form}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <TextInput 
                    style={styles.input} 
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Full Name"
                  />
                </View>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Birthday</Text>
                  <TouchableOpacity 
                    style={[styles.input, { justifyContent: 'center', height: 50 }]} 
                    onPress={() => setShowEditDatePicker(true)}
                  >
                    <Text style={{ color: editBirthday ? Colors.text : Colors.textMuted }}>
                      {editBirthday ? editBirthday.toLocaleDateString() : "Select Birthday"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Modal visible={showEditDatePicker} transparent animationType="fade">
                  <View style={styles.modalOverlay}>
                    <View style={styles.datePickerContainer}>
                      <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Update Birthday</Text>
                        <TouchableOpacity onPress={() => setShowEditDatePicker(false)}>
                          <X size={20} color={Colors.text} />
                        </TouchableOpacity>
                      </View>
                      
                      <View style={styles.pickerWrapper}>
                        {Platform.OS === 'web' ? (
                          <input 
                            type="date" 
                            value={editBirthday ? editBirthday.toISOString().split('T')[0] : ''}
                            onChange={(e) => setEditBirthday(new Date(e.target.value))}
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
                            value={editBirthday || new Date()}
                            mode="date"
                            display="spinner"
                            textColor="#000000"
                            themeVariant="light"
                            onChange={(event, selectedDate) => {
                              if (selectedDate) setEditBirthday(selectedDate);
                            }}
                            maximumDate={new Date()}
                          />
                        )}
                      </View>

                      <TouchableOpacity 
                        style={styles.submitBtn} 
                        onPress={() => setShowEditDatePicker(false)}
                      >
                        <Text style={styles.submitBtnText}>Confirm Date</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>
                <View style={styles.genderContainer}>
                  <Text style={styles.inputLabel}>Gender</Text>
                  <TouchableOpacity 
                    style={styles.selectTrigger} 
                    onPress={() => setShowEditGenderModal(true)}
                  >
                    <Text style={[styles.selectValue, !editGender && { color: Colors.textMuted }]}>
                      {editGender || "Select Gender"}
                    </Text>
                    <ChevronRight size={20} color={Colors.textMuted} style={{ transform: [{ rotate: '90deg' }] }} />
                  </TouchableOpacity>
                </View>

                <Modal visible={showEditGenderModal} transparent animationType="fade">
                  <View style={styles.modalOverlay}>
                    <View style={styles.datePickerContainer}>
                      <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select Gender</Text>
                        <TouchableOpacity onPress={() => setShowEditGenderModal(false)}>
                          <X size={20} color={Colors.text} />
                        </TouchableOpacity>
                      </View>
                      <View style={{ gap: 12, marginVertical: 20 }}>
                        {['Male', 'Female', 'Non-binary', 'Other'].map((option) => (
                          <TouchableOpacity
                            key={option}
                            style={[
                              styles.genderBox,
                              editGender === option && styles.genderBoxSelected
                            ]}
                            onPress={() => {
                              setEditGender(option);
                              setShowEditGenderModal(false);
                            }}
                          >
                            <Text style={[
                              styles.genderBoxText,
                              editGender === option && styles.genderBoxTextSelected
                            ]}>
                              {option}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>
                </Modal>

                <TouchableOpacity 
                  style={styles.submitBtn} 
                  onPress={handleUpdateProfile}
                  disabled={updating}
                >
                  {updating ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitBtnText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.h2,
    marginLeft: 10,
    color: Colors.primary,
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 24,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
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
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 4,
  },
  sectionTitle: {
    ...Typography.subtitle,
    color: Colors.text,
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
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f0f7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
  },
  settingValue: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: '#fff4f4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ba1a1a',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fffbfa',
    paddingVertical: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ffdad6',
    gap: 10,
    marginTop: 8,
  },
  logoutText: {
    ...Typography.body,
    color: '#ba1a1a',
    fontWeight: '600',
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
  pickerWrapper: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  genderContainer: {
    marginVertical: 12,
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
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#ffffff',
  },
  authHero: {
    alignItems: 'center',
    marginBottom: 60,
  },
  authIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  authTitle: {
    ...Typography.h1,
    fontSize: 32,
    color: Colors.primary,
    marginBottom: 12,
  },
  authSubtitle: {
    ...Typography.body,
    textAlign: 'center',
    color: Colors.textMuted,
    lineHeight: 24,
  },
  authActions: {
    gap: 16,
  },
  primaryAuthBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
  },
  primaryAuthBtnText: {
    ...Typography.subtitle,
    color: '#ffffff',
  },
  secondaryAuthBtn: {
    backgroundColor: '#ffffff',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryAuthBtnText: {
    ...Typography.subtitle,
    color: Colors.text,
  },
  authFooter: {
    ...Typography.caption,
    textAlign: 'center',
    marginTop: 40,
    color: Colors.textMuted,
    paddingHorizontal: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  modalTitle: {
    ...Typography.h2,
    color: Colors.text,
  },
  modalContent: {
    padding: 24,
  },
  form: {
    gap: 20,
  },
  inputWrapper: {
    gap: 8,
  },
  inputLabel: {
    ...Typography.caption,
    color: Colors.text,
    fontWeight: '700',
    paddingLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    ...Typography.body,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    ...Typography.subtitle,
    color: '#ffffff',
  },
  switchModeBtn: {
    alignItems: 'center',
    padding: 10,
  },
  switchModeText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '700',
  },
});
