import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import apiClient from '../api/client';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const AttendanceScreen = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    // Basic fetch (needs student_id in real implementation)
    const fetchAttendance = async () => {
      try {
        // Assume student ID is fetched or passed for Parents/Teachers
        const response = await apiClient.get('/attendance/dummy_id_here');
        setAttendance(response.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAttendance();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Attendance Records</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#4da6ff" />
      ) : (
        <FlatList
          data={attendance}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text>Date: {item.date}</Text>
              <Text>Status: {item.status}</Text>
            </View>
          )}
          ListEmptyComponent={<Text>No attendance records found.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f0f8ff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#33cc33' },
  card: { padding: 15, backgroundColor: '#fff', borderRadius: 10, marginBottom: 10, elevation: 2 },
});

export default AttendanceScreen;
