import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import apiClient from '../api/client';
import Animated, { FadeInUp } from 'react-native-reanimated';

const ProgressDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const studentId = user?.id; // Mock
      const res = await apiClient.get(`/progress/${studentId}`);
      setProgress(res.data);
    } catch (error) {
      console.log('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#ff6699" /></View>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Student Progress 🌟</Text>

      {/* Attendance Summary */}
      <Animated.View entering={FadeInUp.delay(100)} style={styles.section}>
        <Text style={styles.sectionTitle}>Attendance Overview</Text>
        <View style={styles.statsContainer}>
          {progress?.attendance?.length > 0 ? progress.attendance.map((a: any, i: number) => (
            <View key={i} style={styles.statBox}>
              <Text style={styles.statValue}>{a.count}</Text>
              <Text style={styles.statLabel}>{a.status}</Text>
            </View>
          )) : <Text style={styles.emptyText}>No attendance records</Text>}
        </View>
      </Animated.View>

      {/* Recent Exams */}
      <Animated.View entering={FadeInUp.delay(300)} style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Exams</Text>
        {progress?.recentExams?.length > 0 ? progress.recentExams.map((e: any, i: number) => (
          <View key={i} style={styles.rowItem}>
            <Text style={styles.rowTitle}>{e.name}</Text>
            <Text style={styles.rowValue}>{e.marks_obtained}/{e.total_marks}</Text>
          </View>
        )) : <Text style={styles.emptyText}>No recent exams</Text>}
      </Animated.View>

      {/* Teacher Notes */}
      <Animated.View entering={FadeInUp.delay(500)} style={styles.section}>
        <Text style={styles.sectionTitle}>Teacher's Remarks 📝</Text>
        {progress?.notes?.length > 0 ? progress.notes.map((n: any, i: number) => (
          <View key={i} style={styles.noteBox}>
            <Text style={styles.noteType}>{n.note_type.toUpperCase()}</Text>
            <Text style={styles.noteContent}>{n.content}</Text>
          </View>
        )) : <Text style={styles.emptyText}>No remarks yet.</Text>}
      </Animated.View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff5f8', padding: 20, paddingTop: 50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 28, fontWeight: 'bold', color: '#ff6699', marginBottom: 30, textAlign: 'center' },
  section: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#ff6699', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap' },
  statBox: { alignItems: 'center', padding: 10 },
  statValue: { fontSize: 24, fontWeight: '900', color: '#4da6ff' },
  statLabel: { fontSize: 12, color: '#888', textTransform: 'capitalize' },
  emptyText: { color: '#aaa', fontStyle: 'italic', textAlign: 'center' },
  rowItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  rowTitle: { fontSize: 16, color: '#444' },
  rowValue: { fontSize: 16, fontWeight: 'bold', color: '#33cc33' },
  noteBox: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 10, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#ffcc00' },
  noteType: { fontSize: 12, fontWeight: 'bold', color: '#ff9933', marginBottom: 5 },
  noteContent: { fontSize: 14, color: '#555', lineHeight: 20 }
});

export default ProgressDashboard;
