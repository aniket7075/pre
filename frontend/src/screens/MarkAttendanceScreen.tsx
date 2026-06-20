import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, TouchableOpacity,
  Alert, ScrollView, RefreshControl
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import apiClient from '../api/client';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import KidsBackground from '../components/KidsBackground';

type Props = { navigation: NativeStackNavigationProp<any, any> };

type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave';
type Student = { id: string; full_name: string; grade: string; profile_image_url?: string };
type AttendanceRecord = { student_id: string; status: AttendanceStatus };

const STATUS_OPTIONS: { status: AttendanceStatus; color: string; bg: string; icon: string; label: string }[] = [
  { status: 'present', color: '#059669', bg: '#D1FAE5', icon: 'checkmark-circle', label: 'P' },
  { status: 'absent',  color: '#DC2626', bg: '#FEE2E2', icon: 'close-circle',    label: 'A' },
  { status: 'late',    color: '#D97706', bg: '#FEF3C7', icon: 'time',            label: 'L' },
  { status: 'leave',   color: '#7C3AED', bg: '#EDE9FE', icon: 'airplane',        label: 'V' },
];

const MarkAttendanceScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<string[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const todayDisplay = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const fetchStudents = useCallback(async () => {
    try {
      // Use the new /attendance/students/all endpoint for teachers
      const response = await apiClient.get('/attendance/students/all');
      const studentsList: Student[] = Array.isArray(response.data) ? response.data : [];

      setAllStudents(studentsList);

      const uniqueGrades = Array.from(new Set(studentsList.map(s => s.grade))).filter(Boolean).sort();
      setGrades(uniqueGrades);
      if (uniqueGrades.length > 0 && !selectedGrade) setSelectedGrade(uniqueGrades[0]);

      // Default all to 'present'
      const defaultAtt: Record<string, AttendanceRecord> = {};
      studentsList.forEach(s => { defaultAtt[s.id] = { student_id: s.id, status: 'present' }; });
      setAttendance(defaultAtt);
    } catch (error) {
      console.error('Fetch students error:', error);
      Alert.alert('Error', 'Failed to load students. Make sure you have teacher/admin access.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const onRefresh = () => { setRefreshing(true); fetchStudents(); };

  const cycleStatus = (studentId: string) => {
    setAttendance(prev => {
      const current = prev[studentId]?.status || 'present';
      const idx = STATUS_OPTIONS.findIndex(o => o.status === current);
      const next = STATUS_OPTIONS[(idx + 1) % STATUS_OPTIONS.length].status;
      return { ...prev, [studentId]: { student_id: studentId, status: next } };
    });
  };

  const setAllStatus = (status: AttendanceStatus) => {
    const filtered = allStudents.filter(s => s.grade === selectedGrade);
    setAttendance(prev => {
      const next = { ...prev };
      filtered.forEach(s => { next[s.id] = { student_id: s.id, status }; });
      return next;
    });
  };

  const handleSave = async () => {
    const currentGradeStudents = allStudents.filter(s => s.grade === selectedGrade);
    if (currentGradeStudents.length === 0) {
      Alert.alert('No Students', 'No students in this grade to mark attendance for.');
      return;
    }

    Alert.alert(
      'Submit Attendance',
      `Submit attendance for ${selectedGrade} on ${today}?\n${currentGradeStudents.length} students`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            try {
              setSaving(true);
              const records = currentGradeStudents.map(s => attendance[s.id] || { student_id: s.id, status: 'present' });
              await apiClient.post('/attendance/mark', { date: today, records });
              Alert.alert('Success! ✅', `Attendance marked for ${currentGradeStudents.length} students in ${selectedGrade}`);
            } catch (error) {
              console.error('Save attendance error:', error);
              Alert.alert('Error', 'Failed to submit attendance. Please try again.');
            } finally {
              setSaving(false);
            }
          }
        }
      ]
    );
  };

  const filteredStudents = allStudents.filter(s => s.grade === selectedGrade);

  // Summary for current grade
  const gradeSummary = filteredStudents.reduce((acc, s) => {
    const status = attendance[s.id]?.status || 'present';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
          <Text style={{ fontSize: 10, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>{today}</Text>
          <Text style={{ fontSize: 17, fontWeight: '900', color: '#1E293B' }}>Mark Attendance</Text>
        </View>
        <TouchableOpacity
          onPress={onRefresh}
          style={{ padding: 10, backgroundColor: '#fff', borderRadius: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 }}
        >
          <Icon name="refresh" size={20} color="#7C3AED" />
        </TouchableOpacity>
      </Animated.View>

      {/* Grade Tabs */}
      {!loading && grades.length > 0 && (
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={{ zIndex: 10, marginBottom: 4 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}>
            {grades.map(grade => (
              <TouchableOpacity
                key={grade}
                onPress={() => setSelectedGrade(grade)}
                style={{
                  marginRight: 8, paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20,
                  backgroundColor: selectedGrade === grade ? '#7C3AED' : '#fff',
                  borderWidth: 1.5, borderColor: selectedGrade === grade ? '#7C3AED' : '#E2E8F0',
                  shadowColor: '#7C3AED', shadowOpacity: selectedGrade === grade ? 0.2 : 0, shadowRadius: 6, elevation: selectedGrade === grade ? 3 : 1,
                }}
              >
                <Text style={{ fontWeight: '800', fontSize: 13, color: selectedGrade === grade ? '#fff' : '#64748B' }}>{grade}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      )}

      {/* Quick Mark All + Summary */}
      {!loading && selectedGrade && filteredStudents.length > 0 && (
        <Animated.View entering={FadeInDown.delay(150).duration(500)} style={{ marginHorizontal: 16, marginBottom: 8, zIndex: 10 }}>
          <View style={{
            backgroundColor: '#fff', borderRadius: 18, padding: 12,
            shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '700' }}>
                {selectedGrade} · {filteredStudents.length} Students
              </Text>
              <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '600' }}>Tap to cycle: P→A→L→V</Text>
            </View>
            {/* Quick Set All buttons */}
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {STATUS_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.status}
                  onPress={() => setAllStatus(opt.status)}
                  style={{
                    flex: 1, paddingVertical: 8, borderRadius: 12, backgroundColor: opt.bg,
                    alignItems: 'center', borderWidth: 1.5, borderColor: opt.color + '40',
                  }}
                >
                  <Text style={{ color: opt.color, fontWeight: '800', fontSize: 13 }}>All {opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {/* Mini summary */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 }}>
              {STATUS_OPTIONS.map(opt => (
                <View key={opt.status} style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 18, fontWeight: '900', color: opt.color }}>{gradeSummary[opt.status] || 0}</Text>
                  <Text style={{ fontSize: 9, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>{opt.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>
      )}

      {/* Students List */}
      <View style={{ flex: 1, zIndex: 10 }}>
        {loading ? (
          <ActivityIndicator size="large" color="#7C3AED" style={{ marginTop: 60 }} />
        ) : allStudents.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 60, paddingHorizontal: 40 }}>
            <Icon name="people-outline" size={56} color="#E2E8F0" />
            <Text style={{ color: '#94A3B8', fontWeight: '700', fontSize: 16, marginTop: 12, textAlign: 'center' }}>
              No students found
            </Text>
            <Text style={{ color: '#CBD5E1', fontSize: 13, marginTop: 6, textAlign: 'center' }}>
              Add students from the Admin panel first.
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredStudents}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7C3AED" />}
            renderItem={({ item, index }) => {
              const status = attendance[item.id]?.status || 'present';
              const opt = STATUS_OPTIONS.find(o => o.status === status) || STATUS_OPTIONS[0];

              return (
                <Animated.View entering={FadeInUp.delay(index * 25).duration(400)}>
                  <TouchableOpacity
                    onPress={() => cycleStatus(item.id)}
                    activeOpacity={0.85}
                    style={{
                      backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 8,
                      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                      shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
                      borderLeftWidth: 4.5, borderLeftColor: opt.color,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: opt.bg, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                        <Text style={{ fontSize: 15, fontWeight: '900', color: opt.color }}>{(item.full_name || '?').charAt(0).toUpperCase()}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#1E293B' }} numberOfLines={1}>{item.full_name}</Text>
                        {item.grade && <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '600' }}>{item.grade}</Text>}
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: opt.bg, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12 }}>
                      <Icon name={opt.icon as any} size={15} color={opt.color} />
                      <Text style={{ color: opt.color, fontWeight: '800', fontSize: 12, marginLeft: 5, textTransform: 'uppercase' }}>{opt.status}</Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            }}
          />
        )}
      </View>

      {/* Submit Button */}
      {!loading && filteredStudents.length > 0 && (
        <View style={{ position: 'absolute', bottom: 20, left: 16, right: 16, zIndex: 20 }}>
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={{
              backgroundColor: saving ? '#C4B5FD' : '#7C3AED', borderRadius: 20, padding: 18,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              shadowColor: '#7C3AED', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 8,
            }}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" style={{ marginRight: 10 }} />
            ) : (
              <Icon name="save" size={22} color="#fff" />
            )}
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16, marginLeft: 10 }}>
              {saving ? 'Submitting...' : `Submit Attendance (${filteredStudents.length} students)`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default MarkAttendanceScreen;
