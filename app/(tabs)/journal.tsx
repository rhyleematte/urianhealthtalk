import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, 
  Modal, TextInput, Alert, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography } from '../../constants/Theme';
import { 
  BookOpen, Leaf, Plus, Calendar, ChevronRight, 
  TrendingUp, Smile, Meh, Frown, Heart, X, Save, Sparkles, RefreshCw, FileText
} from 'lucide-react-native';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

const MOOD_LIST = [
  { label: 'Great', icon: Heart, color: '#FF6B6B' },
  { label: 'Good', icon: Smile, color: '#4ECDC4' },
  { label: 'Okay', icon: Meh, color: '#FFD93D' },
  { label: 'Sad', icon: Frown, color: '#6C5CE7' },
  { label: 'Anxious', icon: Meh, color: '#A0AEC0' },
  { label: 'Peaceful', icon: Leaf, color: '#48BB78' },
  { label: 'Tired', icon: Frown, color: '#CBD5E0' },
  { label: 'Excited', icon: Sparkles, color: '#F6AD55' },
  { label: 'Angry', icon: Frown, color: '#E53E3E' },
  { label: 'Bored', icon: Meh, color: '#718096' },
  { label: 'Stressed', icon: TrendingUp, color: '#D69E2E' },
  { label: 'Inspired', icon: Sparkles, color: '#9F7AEA' },
];

type JournalEntry = {
  id: string;
  title: string;
  text: string;
  date: string;
  timestamp: number;
  mood: string;
  category: string;
  created_at?: string;
};

type ProgressReport = {
  today: string;
  week: string;
  month: string;
  overallMood: string;
};

export default function JournalScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<ProgressReport | null>(null);
  
  // Modals
  const [isNewEntryVisible, setIsNewEntryVisible] = useState(false);
  const [isViewEntryVisible, setIsViewEntryVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  // New Entry Form
  const [newTitle, setNewTitle] = useState('');
  const [newText, setNewText] = useState('');
  const [currentMood, setCurrentMood] = useState('Okay');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formatted = data.map(item => ({
          id: item.id,
          title: item.title,
          text: item.content,
          date: item.date_string,
          mood: item.mood,
          category: item.category,
          timestamp: new Date(item.created_at).getTime(),
        }));
        setEntries(formatted);
      }
    } catch (e) {
      console.error("Failed to load data", e);
    } finally {
      setLoading(false);
    }
  };

  const generateProgressReport = async () => {
    if (entries.length === 0) {
      Alert.alert("No Entries", "Write your first journal entry to generate a report!");
      return;
    }

    if (profile?.plan_type === 'basic') {
      if ((profile.tokens || 0) <= 0) {
        Alert.alert('Out of Tokens', 'You have used all your free AI tokens. Please upgrade to Premium for unlimited access.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => { /* User could navigate to plans here */ } }
        ]);
        return;
      }
      
      const newTokens = profile.tokens - 1;
      const { error } = await supabase.from('profiles').update({ tokens: newTokens }).eq('id', user?.id);
      if (!error) refreshProfile();
    }

    setAnalyzing(true);
    try {
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      const oneWeek = 7 * oneDay;
      const oneMonth = 30 * oneDay;

      const todayEntries = entries.filter(e => (now - e.timestamp) < oneDay);
      const weekEntries = entries.filter(e => (now - e.timestamp) < oneWeek);
      const monthEntries = entries.filter(e => (now - e.timestamp) < oneMonth);

      const prompt = `Analyze these journal entries for a mental health app. 
      TODAY'S ENTRIES: ${JSON.stringify(todayEntries.map(e => ({ title: e.title, text: e.text, mood: e.mood })))}
      WEEKLY ENTRIES: ${JSON.stringify(weekEntries.map(e => ({ title: e.title, text: e.text, mood: e.mood })))}
      MONTHLY ENTRIES: ${JSON.stringify(monthEntries.map(e => ({ title: e.title, text: e.text, mood: e.mood })))}

      Provide a progress report with exactly 4 sections in plain text:
      1. TODAY: A 2-sentence summary of today's state.
      2. WEEKLY: A summary of the past week's emotional trend.
      3. MONTHLY: Long-term patterns and progress noticed.
      4. OVERALL MOOD: One word describing the current state.

      FORMAT: Keep it empathetic and professional. Use a supportive tone.`;

      const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
      }, {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const fullText = response.data.choices[0].message.content;
      
      // Simple parsing of the bot's response
      const sections = fullText.split(/\d\.\s/).filter(Boolean);
      setReport({
        today: sections[0]?.replace('TODAY:', '').trim() || "No entries today.",
        week: sections[1]?.replace('WEEKLY:', '').trim() || "Keep writing to see weekly trends.",
        month: sections[2]?.replace('MONTHLY:', '').trim() || "Monthly data is being gathered.",
        overallMood: sections[3]?.replace('OVERALL MOOD:', '').trim() || "Neutral"
      });

    } catch (error) {
      console.error("Analysis Error:", error);
      Alert.alert("Analysis Error", "I couldn't process your report right now. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

    const newEntryObj = {
      user_id: user?.id,
      title: newTitle,
      content: newText,
      mood: currentMood,
      date_string: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      category: 'Personal'
    };

    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert([newEntryObj])
        .select();

      if (error) throw error;

      if (data && data[0]) {
        const entry = data[0];
        const formattedEntry: JournalEntry = {
          id: entry.id,
          title: entry.title,
          text: entry.content,
          date: entry.date_string,
          mood: entry.mood,
          category: entry.category,
          timestamp: new Date(entry.created_at).getTime(),
        };
        setEntries([formattedEntry, ...entries]);
      }
      
      setIsNewEntryVisible(false);
      setNewTitle('');
      setNewText('');
    } catch (e: any) {
      Alert.alert("Save Failed", e.message);
    }
  };

  const handleMoodSelect = (mood: string) => {
    setCurrentMood(mood);
  };

  const openEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setIsViewEntryVisible(true);
  };

  const deleteEntry = async (id: string) => {
    Alert.alert("Delete Entry", "Are you sure you want to delete this memory?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        try {
          const { error } = await supabase
            .from('journal_entries')
            .delete()
            .eq('id', id);

          if (error) throw error;

          const updated = entries.filter(e => e.id !== id);
          setEntries(updated);
          setIsViewEntryVisible(false);
        } catch (e: any) {
          Alert.alert("Delete Failed", e.message);
        }
      }}
    ]);
  };

  const renderMoodSelector = (isModal: boolean = false) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={isModal ? styles.modalMoodScroll : styles.moodScrollContainer}>
      {MOOD_LIST.map((mood) => (
        <TouchableOpacity 
          key={mood.label}
          style={[
            isModal ? styles.modalMoodButton : styles.moodButton,
            currentMood === mood.label && { backgroundColor: mood.color + '15', borderColor: mood.color }
          ]}
          onPress={() => handleMoodSelect(mood.label)}
        >
          <mood.icon size={isModal ? 20 : 24} color={currentMood === mood.label ? mood.color : Colors.textMuted} />
          <Text style={[
            isModal ? styles.modalMoodLabel : styles.moodLabel,
            currentMood === mood.label && { color: mood.color, fontWeight: '700' }
          ]}>{mood.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Leaf size={24} color={Colors.primary} />
          <Text style={styles.headerTitle}>Serene Journal</Text>
        </View>
        <Image 
          source={require('@/assets/images/user_avatar.png')} 
          style={styles.avatar} 
        />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Emotional Progress Section - BMC: Advanced Mood Analytics */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <TrendingUp size={20} color={Colors.primary} />
              <Text style={styles.cardTitle}>Emotional Progress</Text>
            </View>
            <TouchableOpacity 
              style={styles.refreshButton} 
              onPress={generateProgressReport}
              disabled={analyzing}
            >
              {analyzing ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <RefreshCw size={18} color={Colors.primary} />
              )}
            </TouchableOpacity>
          </View>

          {!report ? (
            <View style={styles.analyticsPlaceholder}>
              <Sparkles size={40} color={Colors.primary} opacity={0.2} style={{ marginBottom: 12 }} />
              <Text style={styles.analyticsInsight}>
                Tap the refresh icon to generate your AI-powered Emotional Progress Report based on your entries.
              </Text>
              <TouchableOpacity style={styles.generateBtn} onPress={generateProgressReport}>
                <Text style={styles.generateBtnText}>Generate Report</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.reportContainer}>
              <View style={styles.reportHeader}>
                <View style={styles.overallMoodBadge}>
                  <Text style={styles.overallMoodLabel}>CURRENT STATE</Text>
                  <Text style={styles.overallMoodValue}>{report.overallMood}</Text>
                </View>
              </View>

              <View style={styles.reportSection}>
                <View style={styles.reportSectionHeader}>
                  <Calendar size={14} color={Colors.primary} />
                  <Text style={styles.reportSectionTitle}>TODAY</Text>
                </View>
                <Text style={styles.reportText}>{report.today}</Text>
              </View>

              <View style={styles.reportSection}>
                <View style={styles.reportSectionHeader}>
                  <TrendingUp size={14} color={Colors.primary} />
                  <Text style={styles.reportSectionTitle}>THIS WEEK</Text>
                </View>
                <Text style={styles.reportText}>{report.week}</Text>
              </View>

              <View style={styles.reportSection}>
                <View style={styles.reportSectionHeader}>
                  <FileText size={14} color={Colors.primary} />
                  <Text style={styles.reportSectionTitle}>LONG TERM (MONTH)</Text>
                </View>
                <Text style={styles.reportText}>{report.month}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Action Button */}
        <TouchableOpacity 
          style={styles.newEntryCard}
          onPress={() => setIsNewEntryVisible(true)}
        >
          <View style={styles.newEntryIcon}>
            <Plus size={24} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.newEntryTitle}>Write a new entry</Text>
          </View>
        </TouchableOpacity>

        {/* Recent Entries */}
        <View style={styles.entriesSection}>
          <View style={styles.entriesHeader}>
            <Text style={styles.entriesTitle}>Recent Entries</Text>
          </View>

          {entries.length === 0 ? (
            <View style={styles.emptyEntries}>
              <BookOpen size={40} color={Colors.border} />
              <Text style={styles.emptyEntriesText}>Your journal is empty. Start writing!</Text>
            </View>
          ) : (
            entries.map((entry) => (
              <TouchableOpacity key={entry.id} style={styles.entryRow} onPress={() => openEntry(entry)}>
                <View style={styles.entryLeft}>
                  <View style={styles.dateBadge}>
                    <Calendar size={14} color={Colors.primary} />
                    <Text style={styles.dateText}>{entry.date}</Text>
                  </View>
                  <Text style={styles.entryTitle}>{entry.title}</Text>
                  <View style={styles.categoryTag}>
                    <Text style={styles.categoryText}>{entry.mood}</Text>
                  </View>
                </View>
                <ChevronRight size={20} color={Colors.border} />
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* New Entry Modal */}
      <Modal visible={isNewEntryVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsNewEntryVisible(false)}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Journal Entry</Text>
            <TouchableOpacity onPress={handleSaveEntry}>
              <Save size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <TextInput 
              style={styles.modalInputTitle}
              placeholder="Title of your entry..."
              placeholderTextColor={Colors.textMuted}
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <View style={styles.modalDivider} />
            
            <Text style={styles.modalLabel}>How are you feeling?</Text>
            {renderMoodSelector(true)}
            <View style={styles.modalDivider} />

            <TextInput 
              style={styles.modalInputText}
              placeholder="Start typing your thoughts here..."
              placeholderTextColor={Colors.textMuted}
              multiline
              value={newText}
              onChangeText={setNewText}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* View Entry Modal */}
      <Modal visible={isViewEntryVisible} animationType="fade" transparent>
        <View style={styles.overlay}>
          <SafeAreaView style={styles.viewModalContainer}>
            <View style={styles.viewModalHeader}>
              <View style={styles.viewModalDateRow}>
                <Calendar size={16} color={Colors.primary} />
                <Text style={styles.viewModalDate}>{selectedEntry?.date}</Text>
              </View>
              <TouchableOpacity onPress={() => setIsViewEntryVisible(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.viewModalContent}>
              <Text style={styles.viewModalTitle}>{selectedEntry?.title}</Text>
              <View style={[styles.categoryTag, { marginBottom: 20 }]}>
                <Text style={styles.categoryText}>Feeling {selectedEntry?.mood}</Text>
              </View>
              <Text style={styles.viewModalText}>{selectedEntry?.text}</Text>
            </ScrollView>

            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => selectedEntry && deleteEntry(selectedEntry.id)}
            >
              <Text style={styles.deleteButtonText}>Delete Entry</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      </Modal>

      <TouchableOpacity style={styles.fab} onPress={() => setIsNewEntryVisible(true)}>
        <Plus size={28} color="#FFF" />
      </TouchableOpacity>
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
  },
  card: {
    backgroundColor: '#FFF',
    marginBottom: 20,
    padding: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  cardTitle: {
    ...Typography.subtitle,
    color: Colors.text,
    marginBottom: 15,
  },
  moodScrollContainer: {
    flexDirection: 'row',
  },
  moodButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    width: 80,
    marginRight: 10,
  },
  moodLabel: {
    fontSize: 12,
    marginTop: 6,
    color: Colors.textMuted,
    fontFamily: 'PublicSans-Medium',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: Colors.primaryContainer,
  },
  analyticsPlaceholder: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  analyticsInsight: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 15,
  },
  generateBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  generateBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  reportContainer: {
    gap: 20,
  },
  reportHeader: {
    alignItems: 'center',
    marginBottom: 5,
  },
  overallMoodBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  overallMoodLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '800',
  },
  overallMoodValue: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '800',
  },
  reportSection: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  reportSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  reportSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 1,
  },
  reportText: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  newEntryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    padding: 20,
    borderRadius: 24,
    gap: 16,
    marginBottom: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  newEntryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newEntryTitle: {
    ...Typography.subtitle,
    color: '#ffffff',
  },
  entriesSection: {
    marginTop: 10,
  },
  entriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  entriesTitle: {
    ...Typography.subtitle,
    color: Colors.text,
  },
  emptyEntries: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  emptyEntriesText: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  entryLeft: {
    gap: 6,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 10,
  },
  entryTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
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
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    ...Typography.h2,
    color: Colors.text,
  },
  modalContent: {
    padding: 20,
  },
  modalInputTitle: {
    ...Typography.h2,
    fontSize: 24,
    color: Colors.text,
    marginBottom: 10,
  },
  modalDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 20,
  },
  modalInputText: {
    ...Typography.body,
    fontSize: 18,
    color: Colors.text,
    minHeight: 300,
    textAlignVertical: 'top',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  viewModalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: '90%',
    padding: 20,
  },
  viewModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  viewModalDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewModalDate: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 14,
  },
  viewModalContent: {
    flex: 1,
  },
  viewModalTitle: {
    ...Typography.h2,
    fontSize: 28,
    color: Colors.text,
    marginBottom: 12,
  },
  viewModalText: {
    ...Typography.body,
    fontSize: 18,
    color: Colors.text,
    lineHeight: 28,
  },
  deleteButton: {
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#E53E3E',
    fontWeight: '700',
    fontFamily: 'Manrope-Bold',
  },
  modalLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modalMoodScroll: {
    marginBottom: 20,
    flexDirection: 'row',
  },
  modalMoodButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 10,
    flexDirection: 'row',
    gap: 8,
  },
  modalMoodLabel: {
    fontSize: 14,
    color: Colors.textMuted,
    fontFamily: 'PublicSans-Medium',
  },
});
