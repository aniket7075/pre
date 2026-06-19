import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import apiClient from '../api/client';

const TransportScreen = () => {
  const [loading, setLoading] = useState(true);
  const [transport, setTransport] = useState<any>(null);

  useEffect(() => {
    const fetchTransport = async () => {
      try {
        const response = await apiClient.get('/transport/student/dummy_student_id');
        setTransport(response.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransport();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Transport Details</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#4da6ff" />
      ) : transport ? (
        <View style={styles.card}>
          <Text style={styles.label}>Route: <Text style={styles.value}>{transport.route_name}</Text></Text>
          <Text style={styles.label}>Driver: <Text style={styles.value}>{transport.driver_name}</Text></Text>
          <Text style={styles.label}>Phone: <Text style={styles.value}>{transport.driver_phone}</Text></Text>
          <Text style={styles.label}>Vehicle: <Text style={styles.value}>{transport.vehicle_number}</Text></Text>
          <View style={styles.divider} />
          <Text style={styles.label}>Pickup: <Text style={styles.value}>{transport.pickup_point} at {transport.pickup_time}</Text></Text>
          <Text style={styles.label}>Drop: <Text style={styles.value}>{transport.drop_time}</Text></Text>
        </View>
      ) : (
        <Text>No transport assigned.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f0f8ff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#33cc33' },
  card: { padding: 20, backgroundColor: '#fff', borderRadius: 15, elevation: 4 },
  label: { fontSize: 16, color: '#666', marginBottom: 10 },
  value: { fontWeight: 'bold', color: '#333' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 }
});

export default TransportScreen;
