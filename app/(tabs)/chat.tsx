import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography } from '../../constants/Theme';
import { Plus, Send, Star, Leaf, Trash2, Sparkles } from 'lucide-react-native';
import axios from 'axios';

import { KnowledgeBase } from '../../constants/KnowledgeBase';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

type Message = {
  id: string;
  type: 'bot' | 'user' | 'system';
  text: string;
  time: string;
  isDoctorCard?: boolean;
};

export default function ChatScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const kbString = JSON.stringify(KnowledgeBase.categories, null, 2);

  const systemPrompt = `You are Serene, a supportive mental health companion. 
Your goal is to provide a safe, non-judgmental space for users to talk.

KNOWLEDGE BASE:
${kbString}

GUIDELINES FOR INTERACTION:
1. **BE EXTREMELY CONCISE.** Limit your responses to a maximum of 2-3 sentences.
2. Identify the user's core problem or theme from the Knowledge Base categories above.
3. Base your response on the "Key Points" of the relevant category.
4. Listen actively, show empathy, and validate feelings in as few words as possible.
5. **CRITICAL: DO NOT PROVIDE MEDICAL DIAGNOSES.**
6. Focus on one single actionable step or a brief empathetic reflection.
7. Always encourage the user to share more, but keep your part short.`;

  const handleClearChat = () => {
    Alert.alert(
      "Clear Conversation",
      "Are you sure you want to delete all messages?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear", style: "destructive", onPress: () => setMessages([]) }
      ]
    );
  };

  const getBotResponse = async (userText: string, history: Message[]) => {
    setIsTyping(true);
    try {
      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...history.map(m => ({ role: m.type === 'bot' ? 'assistant' : 'user', content: m.text })),
        { role: 'user', content: userText }
      ];

      const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'llama-3.3-70b-versatile',
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 500,
      }, {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const botText = response.data.choices[0].message.content;
      
      const botMessage: Message = {
        id: Date.now().toString() + '_bot',
        type: 'bot',
        text: botText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Groq API Error:', error);
      const errorMessage: Message = {
        id: Date.now().toString() + '_error',
        type: 'bot',
        text: "I'm sorry, I'm having a bit of trouble connecting right now. Can we try again in a moment?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    // Check tokens for basic users
    if (profile?.plan_type === 'basic') {
      if ((profile.tokens || 0) <= 0) {
        Alert.alert('Out of Tokens', 'You have used all your free AI tokens. Please upgrade to Premium for unlimited access.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => { /* User could navigate to plans here */ } }
        ]);
        return;
      }
      
      // Deduct token
      const newTokens = profile.tokens - 1;
      const { error } = await supabase.from('profiles').update({ tokens: newTokens }).eq('id', user?.id);
      if (!error) {
        refreshProfile();
      }
    }

    const userText = inputText.trim();
    const userMessage: Message = {
      id: Date.now().toString() + '_user',
      type: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    
    // Call AI
    getBotResponse(userText, messages);
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Leaf size={24} color={Colors.primary} />
            <Text style={styles.headerTitle}>Serene Dialogue</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={handleClearChat} style={styles.headerIcon}>
              <Trash2 size={20} color={Colors.textMuted} />
            </TouchableOpacity>
            <Image 
              source={require('@/assets/images/user_avatar.png')} 
              style={styles.avatar} 
            />
          </View>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          style={styles.chatArea} 
          contentContainerStyle={styles.chatContent}
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Leaf size={48} color={Colors.primary} opacity={0.2} />
              </View>
              <Text style={styles.emptyTitle}>Start a new journey</Text>
              <Text style={styles.emptySubtitle}>How are you feeling today?</Text>
            </View>
          ) : (
            <>
              {/* Daily Calm Tip - BMC: Daily Calm Tips */}
              <View style={styles.tipCard}>
                <View style={styles.tipHeader}>
                  <Sparkles size={16} color={Colors.primary} />
                  <Text style={styles.tipTitle}>Daily Calm Tip</Text>
                </View>
                <Text style={styles.tipText}>
                  Take 3 deep breaths and notice 5 things you can see around you. Grounding yourself in the present moment reduces instant stress.
                </Text>
              </View>

              {messages.map((msg) => (
              <View key={msg.id} style={msg.type === 'bot' ? styles.botMessageContainer : styles.userMessageContainer}>
                <View style={msg.type === 'bot' ? styles.botMessage : styles.userMessage}>
                  <Text style={msg.type === 'bot' ? styles.botMessageText : styles.userMessageText}>
                    {msg.text}
                  </Text>
                </View>

                {msg.isDoctorCard && (
                  <View style={styles.doctorCard}>
                    <View style={styles.doctorHeader}>
                      <View style={styles.doctorAvatarWrapper}>
                        <Image 
                          source={require('@/assets/images/dr_sarah_jenkins.png')} 
                          style={styles.doctorAvatar} 
                        />
                        <View style={styles.onlineBadge} />
                      </View>
                      <View style={styles.doctorInfo}>
                        <View style={styles.nameRow}>
                          <Text style={styles.doctorName}>Dr. Sarah Jenkins</Text>
                          <View style={styles.ratingBadge}>
                            <Star size={12} color={Colors.primary} fill={Colors.primary} />
                            <Text style={styles.ratingText}>4.9</Text>
                          </View>
                        </View>
                        <Text style={styles.doctorTitle}>Clinical Psychologist • 12 years exp.</Text>
                        <View style={styles.tagsContainer}>
                          <View style={styles.tag}><Text style={styles.tagText}>Workplace Anxiety</Text></View>
                          <View style={styles.tag}><Text style={styles.tagText}>CBT</Text></View>
                          <View style={styles.tag}><Text style={styles.tagText}>Stress MGMT</Text></View>
                        </View>
                      </View>
                    </View>
                    <View style={styles.cardActions}>
                      <TouchableOpacity style={styles.bookButton}>
                        <Text style={styles.bookButtonText}>Book Consultation</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.profileButton}>
                        <Text style={styles.profileButtonText}>View Profile</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <Text style={[styles.timestamp, msg.type === 'user' && { textAlign: 'right' }]}>
                  {msg.type === 'bot' ? 'Serene Bot' : 'You'} • {msg.time}
                </Text>
              </View>
              ))}
            </>
          )}
          
          {isTyping && (
            <View style={styles.botMessageContainer}>
              <View style={[styles.botMessage, { paddingVertical: 12, paddingHorizontal: 16 }]}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
              <Text style={styles.timestamp}>Serene Bot is thinking...</Text>
            </View>
          )}
        </ScrollView>

        {/* Composer */}
        <View style={styles.composer}>
          <TouchableOpacity style={styles.iconButton}>
            <Plus size={24} color={Colors.textMuted} />
          </TouchableOpacity>
          <TextInput 
            style={styles.input} 
            placeholder="Type your response..." 
            placeholderTextColor={Colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSendMessage}
          />
          <TouchableOpacity 
            style={[styles.sendButton, (!inputText.trim() || isTyping) && { opacity: 0.5 }]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
          >
            <Send size={20} color={Colors.onPrimary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    padding: 8,
    marginRight: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: 20,
    gap: 24,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.textMuted,
  },
  tipCard: {
    backgroundColor: Colors.primaryContainer,
    padding: 16,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  tipTitle: {
    ...Typography.caption,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  tipText: {
    ...Typography.caption,
    color: Colors.text,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  botMessageContainer: {
    maxWidth: '85%',
    alignSelf: 'flex-start',
  },
  botMessage: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  botMessageText: {
    ...Typography.body,
    color: Colors.text,
    lineHeight: 22,
  },
  userMessageContainer: {
    maxWidth: '85%',
    alignSelf: 'flex-end',
  },
  userMessage: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 20,
    borderBottomRightRadius: 4,
  },
  userMessageText: {
    ...Typography.body,
    color: Colors.onPrimary,
    lineHeight: 22,
  },
  timestamp: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 8,
    marginHorizontal: 4,
  },
  doctorCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  doctorHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  doctorAvatarWrapper: {
    position: 'relative',
  },
  doctorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  onlineBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#34a853',
    borderWidth: 2,
    borderColor: '#ffffff',
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  doctorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  doctorName: {
    ...Typography.subtitle,
    color: Colors.text,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.primary,
    marginLeft: 4,
  },
  doctorTitle: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tag: {
    backgroundColor: '#f1f3f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  bookButton: {
    flex: 1.2,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookButtonText: {
    ...Typography.caption,
    color: Colors.onPrimary,
    fontWeight: '700',
  },
  profileButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  profileButtonText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '700',
  },
  composer: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  iconButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: '#f8f9fa',
    borderRadius: 24,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    ...Typography.body,
  },
  sendButton: {
    width: 48,
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
