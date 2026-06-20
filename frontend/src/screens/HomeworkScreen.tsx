import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, TouchableOpacity,
  Linking, RefreshControl, Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import apiClient from '../api/client';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import KidsBackground from '../components/KidsBackground';

type Props = { navigation: NativeStackNavigationProp<any, any> };

const SUBJECT_COLORS: Record<string, { color: string; bg: string; icon: string }> = {
  math:       { color: '#2563EB', bg: '#EFF6FF', icon: 'calculator' },
  mathematics:{ color: '#2563EB', bg: '#EFF6FF', icon: 'calculator' },
  science:    { color: '#059669', bg: '#ECFDF5', icon: 'flask' },
  english:    { color: '#7C3AED', bg: '#F5F3FF', icon: 'book' },
  hindi:      { color: '#EA580C', bg: '#FFF7ED', icon: 'language' },
  social:     { color: '#0891B2', bg: '#ECFEFF', icon: 'globe' },
  drawing:    { color: '#EC4899', bg: '#FDF2F8', icon: 'color-palette' },
  default:    { color: '#6366F1', bg: '#EEF2FF', icon: 'document-text' },
};

function getSubjectStyle(subject?: string) {
  if (!subject) return SUBJECT_COLORS.default;
  const key = subject.toLowerCase();
  return SUBJECT_COLORS[key] || SUBJECT_COLORS.default;
}

function formatDueDate(dateStr: string): string {
  if (!dateStr) return 'No deadline';
  try {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) return 'Due Today!';
    if (date.getTime() === tomorrow.getTime()) return 'Due Tomorrow';

    const diff = Math.ceil((date.getTime() - today.getTime()) / 86400000);
    if (diff < 0) return `Overdue (${Math.abs(diff)}d)`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  } catch {
    return dateStr;
  }
}

function getDueDateStyle(dateStr: string): { color: string; bg: string } {
  if (!dateStr) return { color: '#94A3B8', bg: '#F8FAFC' };
  try {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((date.getTime() - today.getTime()) / 86400000);
    if (diff < 0) return { color: '#DC2626', bg: '#FEE2E2' };
    if (diff === 0) return { color: '#EA580C', bg: '#FFF7ED' };
    if (diff === 1) return { color: '#D97706', bg: '#FFFBEB' };
    return { color: '#059669', bg: '#ECFDF5' };
  } catch {
    return { color: '#94A3B8', bg: '#F8FAFC' };
  }
}

const HomeworkScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { activeChild } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [homework, setHomework] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchHomework = useCallback(async () => {
    try {
      // Use child's grade, else fetch all
      const grade = activeChild?.grade || 'all';
      const response = await apiClient.get(`/homework/${grade}`);
      const data = response.data.data || [];

      // Sort: upcoming first, then sort by due date
      const sorted = data.sort((a: any, b: any) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      });
      setHomework(sorted);
    } catch (error) {
      console.error('Homework fetch error:', error);
      Alert.alert('Error', 'Failed to load homework');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeChild?.grade]);

  useEffect(() => { fetchHomework(); }, [fetchHomework]);

  const onRefresh = () => { setRefreshing(true); fetchHomework(); };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC', paddingTop: Math.max(insets.top, 0) }}>
      <KidsBackground />

      {/* Header */}
      <Animated.View entering={FadeInDown.duration(600)} style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 14, zIndex: 10,
      }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ padding: 10, backgroundColor: '#fff', borderRadius: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 }}
        >
          <Icon name="arrow-back" size={22} color="#334155" />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>
            {activeChild?.first_name || 'Student'}
          </Text>
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#1E293B' }}>Homework</Text>
        </View>
        <View style={{ width: 44 }} />
      </Animated.View>

      {/* Grade badge */}
      {activeChild?.grade && (
        <View style={{ alignItems: 'center', marginBottom: 4, zIndex: 10 }}>
          <View style={{ backgroundColor: '#EDE9FE', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 }}>
            <Text style={{ color: '#6D28D9', fontWeight: '800', fontSize: 12 }}>Grade: {activeChild.grade}</Text>
          </View>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#7C3AED" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={homework}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, paddingTop: 8, zIndex: 10 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7C3AED" />}
          renderItem={({ item, index }) => {
            const subjectStyle = getSubjectStyle(item.subject || item.class_name);
            const dueDateStyle = getDueDateStyle(item.due_date);
            const isExpanded = expandedId === item.id;
            let attachments: string[] = [];
            try { attachments = item.attachments ? JSON.parse(item.attachments) : []; } catch { }

            return (
              <Animated.View entering={FadeInUp.delay(index * 40).duration(500)}>
                <TouchableOpacity
                  onPress={() => setExpandedId(isExpanded ? null : item.id)}
                  activeOpacity={0.9}
                  style={{
                    backgroundColor: '#fff', borderRadius: 20, marginBottom: 12,
                    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
                    overflow: 'hidden', borderLeftWidth: 5, borderLeftColor: subjectStyle.color,
                  }}
                >
                  <View style={{ padding: 16 }}>
                    {/* Subject chip & Due date */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: subjectStyle.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
                        <Icon name={subjectStyle.icon as any} size={13} color={subjectStyle.color} />
                        <Text style={{ color: subjectStyle.color, fontWeight: '800', fontSize: 11, marginLeft: 5, textTransform: 'uppercase' }}>
                          {item.subject || item.class_name || 'General'}
                        </Text>
                      </View>
                      <View style={{ backgroundColor: dueDateStyle.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
                        <Text style={{ color: dueDateStyle.color, fontWeight: '800', fontSize: 11 }}>
                          {formatDueDate(item.due_date)}
                        </Text>
                      </View>
                    </View>

                    {/* Title */}
                    <Text style={{ fontSize: 16, fontWeight: '900', color: '#1E293B', marginBottom: 6 }}>{item.title}</Text>

                    {/* Teacher */}
                    {item.teacher_name && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Icon name="person-circle-outline" size={13} color="#94A3B8" />
                        <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '600', marginLeft: 4 }}>
                          by {item.teacher_name}
                        </Text>
                      </View>
                    )}

                    {/* Description (collapsed preview) */}
                    <Text
                      style={{ fontSize: 13, color: '#64748B', lineHeight: 19, marginTop: 6 }}
                      numberOfLines={isExpanded ? undefined : 2}
                    >
                      {item.description}
                    </Text>

                    {/* Expand indicator */}
                    <View style={{ alignItems: 'center', marginTop: 8 }}>
                      <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color="#CBD5E1" />
                    </View>
                  </View>

                  {/* Expanded: Links & Attachments */}
                  {isExpanded && (
                    <View style={{ backgroundColor: '#F8FAFC', padding: 16, paddingTop: 0 }}>
                      {item.reference_link ? (
                        <TouchableOpacity
                          style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', padding: 12, borderRadius: 12, marginBottom: 8 }}
                          onPress={() => Linking.openURL(item.reference_link)}
                        >
                          <Icon name="link" size={16} color="#2563EB" />
                          <Text style={{ color: '#2563EB', fontWeight: '700', fontSize: 13, marginLeft: 8 }}>
                            Open Reference Link
                          </Text>
                        </TouchableOpacity>
                      ) : null}

                      {attachments.length > 0 && attachments.map((file: string, idx: number) => {
                        const baseUrl = (apiClient.defaults.baseURL || '').replace('/api', '');
                        return (
                          <TouchableOpacity
                            key={idx}
                            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', padding: 12, borderRadius: 12, marginBottom: 6 }}
                            onPress={() => Linking.openURL(`${baseUrl}${file}`)}
                          >
                            <Icon name="document-attach" size={16} color="#6366F1" />
                            <Text style={{ color: '#6366F1', fontWeight: '700', fontSize: 13, marginLeft: 8 }}>
                              Attachment {idx + 1}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Icon name="book-outline" size={60} color="#E2E8F0" />
              <Text style={{ color: '#94A3B8', fontWeight: '700', fontSize: 16, marginTop: 12 }}>No homework assigned</Text>
              <Text style={{ color: '#CBD5E1', fontSize: 13, marginTop: 4 }}>All caught up! Great work 🎉</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default HomeworkScreen;
