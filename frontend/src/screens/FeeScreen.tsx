import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import apiClient from '../api/client';

const FeeScreen = () => {
  const [loading, setLoading] = useState(true);
  const [fees, setFees] = useState([]);

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const response = await apiClient.get('/fees/dummy_student_id');
        setFees(response.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, []);

  const handlePayment = async (feeId: string, amount: number) => {
    Alert.alert('Razorpay Integration', 'Razorpay checkout will open here for amount: ₹' + amount);
    // In real app, call /api/fees/create-order, then use react-native-razorpay
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Fee Details</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#4da6ff" />
      ) : (
        <FlatList
          data={fees}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.title}>{item.fee_type}</Text>
                <Text style={styles.amount}>₹{item.amount_due}</Text>
              </View>
              <Text style={styles.date}>Due: {item.due_date}</Text>
              <Text style={styles.status}>Status: {item.status}</Text>
              {item.status !== 'paid' && (
                <TouchableOpacity 
                  style={styles.payButton} 
                  onPress={() => handlePayment(item.id, item.amount_due)}
                >
                  <Text style={styles.payText}>Pay Now</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          ListEmptyComponent={<Text>No fee records found.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f0f8ff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#ff9933' },
  card: { padding: 15, backgroundColor: '#fff', borderRadius: 10, marginBottom: 15, elevation: 3 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: 'bold' },
  amount: { fontSize: 18, fontWeight: 'bold', color: '#ff6699' },
  date: { color: '#666', marginTop: 5 },
  status: { fontWeight: 'bold', marginTop: 5, color: '#33cc33' },
  payButton: { backgroundColor: '#4da6ff', padding: 10, borderRadius: 8, marginTop: 15, alignItems: 'center' },
  payText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default FeeScreen;
