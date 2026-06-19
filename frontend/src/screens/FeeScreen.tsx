import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import apiClient from '../api/client';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any, any>; };

const FeeScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [fees, setFees] = useState<any[]>([]);

  const fetchFees = async () => {
    try {
      const response = await apiClient.get('/fees/dummy_student_id');
      if (response.data.data.length > 0) {
        setFees(response.data.data);
      } else {
        // Fallback dummy data
        setFees([
          { id: '1', fee_type: 'Tuition Fee (Q1)', amount_due: '15000', due_date: '2023-11-01', status: 'pending' },
          { id: '2', fee_type: 'Transport Fee', amount_due: '2000', due_date: '2023-10-05', status: 'paid' },
        ]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const handlePayment = async (feeId: string, amount: string) => {
    try {
      setPayingId(feeId);
      await apiClient.post('/fees/verify-payment', {
        fee_id: feeId,
        amount_paid: amount
      });
      Alert.alert('Success', 'Payment simulated successfully! Receipt generated.');
      fetchFees(); // Refresh the list to show as PAID
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Payment failed.');
    } finally {
      setPayingId(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center p-5 bg-primary justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">Fee Details</Text>
        </View>
        <Icon name="cash" size={24} color="#fff" />
      </View>
      
      <View className="flex-1 p-5">
        {loading ? (
          <ActivityIndicator size="large" color="#4F46E5" />
        ) : (
          <FlatList
            data={fees}
            keyExtractor={(item: any) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View className="bg-card p-5 rounded-xl mb-4 shadow-sm border border-border">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-lg font-bold text-textPrimary">{item.fee_type}</Text>
                  <Text className="text-lg font-extrabold text-primary">₹{item.amount_due}</Text>
                </View>
                
                <View className="flex-row justify-between items-center mb-4">
                  <View className="flex-row items-center">
                    <Icon name="time-outline" size={16} color="#64748B" className="mr-1" />
                    <Text className="text-sm text-textSecondary">Due: {item.due_date}</Text>
                  </View>
                  <View className={`px-3 py-1 rounded-full ${item.status === 'paid' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                    <Text className={`text-xs font-bold ${item.status === 'paid' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {item.status !== 'paid' && (
                  <TouchableOpacity 
                    className={`py-3 rounded-lg flex-row justify-center items-center ${payingId === item.id ? 'bg-gray-400' : 'bg-primary'}`}
                    onPress={() => handlePayment(item.id, item.amount_due)}
                    disabled={payingId === item.id}
                  >
                    <Icon name={payingId === item.id ? "hourglass" : "card"} size={20} color="#fff" className="mr-2" />
                    <Text className="text-white font-bold text-center">
                      {payingId === item.id ? 'Processing...' : 'Pay Now'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            ListEmptyComponent={
              <View className="items-center justify-center py-20">
                <Icon name="cash-outline" size={60} color="#E2E8F0" />
                <Text className="text-lg text-textSecondary mt-4">No fee records found.</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default FeeScreen;
