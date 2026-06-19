import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import apiClient from '../api/client';
import Animated, { FadeInUp } from 'react-native-reanimated';

const ResultScreen = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      // If parent, fetch child's result
      if (user?.role === 'parent') {
        // Mocking studentId, usually derived from user profile
        const studentId = user.id; 
        const res = await apiClient.get(`/results/student/${studentId}`);
        setResults(res.data);
      } else {
        // Teacher/Admin fetching class results logic would go here
        // Using an empty array for now
        setResults([]);
      }
    } catch (error) {
      console.log('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4da6ff" /></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Exam Results 📊</Text>
      {results.length === 0 ? (
        <Text style={styles.noData}>No results published yet.</Text>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInUp.delay(index * 100).duration(500)} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.examName}>{item.exam_name}</Text>
                <Text style={styles.grade}>{item.grade || '-'}</Text>
              </View>
              <Text style={styles.marks}>Marks: {item.marks_obtained} / {item.total_marks}</Text>
              {item.remarks && <Text style={styles.remarks}>Remarks: {item.remarks}</Text>}
            </Animated.View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f8ff', padding: 20, paddingTop: 50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 28, fontWeight: 'bold', color: '#4da6ff', marginBottom: 20 },
  noData: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 50 },
  card: {
    backgroundColor: '#fff', padding: 20, borderRadius: 20, marginBottom: 15,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  examName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  grade: { fontSize: 24, fontWeight: '900', color: '#33cc33' },
  marks: { fontSize: 16, color: '#555', marginBottom: 5 },
  remarks: { fontSize: 14, color: '#888', fontStyle: 'italic' }
});

export default ResultScreen;
