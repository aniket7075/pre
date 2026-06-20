import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import apiClient from '../api/client';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import KidsBackground from '../components/KidsBackground';

type Props = { navigation: NativeStackNavigationProp<any, any>; };

interface FeeData {
  id: string;
  fee_type: string;
  amount_due: string;
  total_paid: string;
  last_payment_date: string | null;
  due_date: string;
  status: string;
}

const FeeScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [fees, setFees] = useState<FeeData[]>([]);
  const { activeChild } = useSelector((state: RootState) => state.auth);
  
  // Payment Modal state
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedFee, setSelectedFee] = useState<FeeData | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  const fetchFees = async () => {
    try {
      const childId = activeChild?.id || 'dummy_student_id';
      const response = await apiClient.get(`/fees/${childId}`);
      if (response.data.data.length > 0) {
        setFees(response.data.data);
      } else {
        setFees([]);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch fee details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, [activeChild]);

  const openPaymentModal = (fee: FeeData) => {
    setSelectedFee(fee);
    const balance = parseFloat(fee.amount_due) - parseFloat(fee.total_paid);
    setPaymentAmount(balance.toString()); // default to full balance
    setPaymentModalVisible(true);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedFee) return;
    
    const amount = parseFloat(paymentAmount);
    const balance = parseFloat(selectedFee.amount_due) - parseFloat(selectedFee.total_paid);

    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid payment amount.');
      return;
    }
    if (amount > balance) {
      Alert.alert('Invalid Amount', `You cannot pay more than the remaining balance of ₹${balance}.`);
      return;
    }

    try {
      setPayingId(selectedFee.id);
      setPaymentModalVisible(false);
      
      await apiClient.post('/fees/verify-payment', {
        fee_id: selectedFee.id,
        amount_paid: amount
      });
      
      Alert.alert('Success', 'Payment processed successfully! Receipt generated.');
      fetchFees(); // Refresh the list
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Payment failed.');
    } finally {
      setPayingId(null);
    }
  };

  const renderPaymentModal = () => (
    <Modal visible={paymentModalVisible} transparent animationType="slide">
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl p-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-slate-800">Make Payment</Text>
            <TouchableOpacity onPress={() => setPaymentModalVisible(false)} className="p-2 bg-slate-100 rounded-full">
              <Icon name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {selectedFee && (
            <>
              <View className="bg-indigo-50 p-4 rounded-xl mb-4">
                <Text className="text-indigo-800 font-bold mb-1">{selectedFee.fee_type}</Text>
                <Text className="text-indigo-600">
                  Remaining Balance: ₹{parseFloat(selectedFee.amount_due) - parseFloat(selectedFee.total_paid)}
                </Text>
              </View>

              <Text className="text-slate-600 font-bold mb-2 ml-1">Enter Amount to Pay (₹)</Text>
              <TextInput
                className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-lg font-bold text-slate-800 mb-6"
                keyboardType="numeric"
                value={paymentAmount}
                onChangeText={setPaymentAmount}
                autoFocus
              />

              <TouchableOpacity 
                onPress={handlePaymentSubmit}
                className="bg-primary p-4 rounded-xl items-center flex-row justify-center"
              >
                <Icon name="card" size={20} color="#fff" className="mr-2" />
                <Text className="text-white font-bold text-lg">Pay Now</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KidsBackground />
      <View className="flex-row items-center p-5 bg-primary justify-between rounded-b-3xl mb-2" style={{ shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 }}>
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 bg-white/20 p-2 rounded-full">
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text className="text-indigo-100 text-xs font-bold uppercase tracking-wider">Fees & Payments</Text>
            <Text className="text-2xl font-black text-white">{activeChild ? `${activeChild.first_name}'s Fees` : 'Fee Details'}</Text>
          </View>
        </View>
        <Icon name="cash" size={28} color="#fff" />
      </View>
      
      <View className="flex-1 px-5 pt-2">
        {loading ? (
          <ActivityIndicator size="large" color="#4F46E5" className="mt-10" />
        ) : (
          <FlatList
            data={fees}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
            renderItem={({ item }) => {
              const amountDue = parseFloat(item.amount_due);
              const totalPaid = parseFloat(item.total_paid);
              const balance = amountDue - totalPaid;
              const isPaid = balance <= 0 || item.status === 'paid';

              return (
                <View className="bg-white p-5 rounded-2xl mb-4 shadow-sm border border-slate-100" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 }}>
                  <View className="flex-row justify-between items-center mb-4 border-b border-slate-100 pb-3">
                    <View className="flex-1 mr-2">
                      <Text className="text-lg font-black text-slate-800">{item.fee_type}</Text>
                      <Text className="text-xs text-slate-500 font-semibold mt-1">Due Date: {new Date(item.due_date).toLocaleDateString()}</Text>
                    </View>
                    <View className={`px-3 py-1.5 rounded-lg ${isPaid ? 'bg-emerald-100' : (totalPaid > 0 ? 'bg-amber-100' : 'bg-rose-100')}`}>
                      <Text className={`text-xs font-bold ${isPaid ? 'text-emerald-700' : (totalPaid > 0 ? 'text-amber-700' : 'text-rose-700')}`}>
                        {isPaid ? 'FULLY PAID' : (totalPaid > 0 ? 'PARTIAL' : 'PENDING')}
                      </Text>
                    </View>
                  </View>
                  
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-sm font-semibold text-slate-500">Total Fee</Text>
                    <Text className="text-sm font-bold text-slate-700">₹{amountDue}</Text>
                  </View>

                  <View className="flex-row justify-between mb-3">
                    <Text className="text-sm font-semibold text-emerald-600">Paid Amount</Text>
                    <Text className="text-sm font-bold text-emerald-600">₹{totalPaid}</Text>
                  </View>

                  {/* Payment Date if exists */}
                  {item.last_payment_date && totalPaid > 0 && (
                    <View className="bg-emerald-50 rounded-lg p-2 mb-3 flex-row items-center justify-center">
                      <Icon name="checkmark-circle" size={14} color="#10B981" className="mr-1" />
                      <Text className="text-xs font-bold text-emerald-700">
                        Last Paid on: {new Date(item.last_payment_date).toLocaleDateString()}
                      </Text>
                    </View>
                  )}

                  {!isPaid && (
                    <>
                      <View className="flex-row justify-between items-center bg-rose-50 p-3 rounded-xl mb-4 border border-rose-100">
                        <Text className="text-sm font-bold text-rose-800">Remaining Balance</Text>
                        <Text className="text-lg font-black text-rose-600">₹{balance}</Text>
                      </View>

                      <TouchableOpacity 
                        className={`py-3 rounded-xl flex-row justify-center items-center ${payingId === item.id ? 'bg-slate-400' : 'bg-primary'}`}
                        onPress={() => openPaymentModal(item)}
                        disabled={payingId === item.id}
                        style={{ shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 4 }}
                      >
                        {payingId === item.id ? (
                          <ActivityIndicator size="small" color="#fff" className="mr-2" />
                        ) : (
                          <Icon name="card" size={20} color="#fff" className="mr-2" />
                        )}
                        <Text className="text-white font-bold text-center">
                          {payingId === item.id ? 'Processing...' : 'Pay Balance'}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              );
            }}
            ListEmptyComponent={
              <View className="items-center justify-center py-20">
                <View className="w-24 h-24 bg-slate-50 rounded-full items-center justify-center mb-4">
                  <Icon name="shield-checkmark" size={40} color="#cbd5e1" />
                </View>
                <Text className="text-xl font-bold text-slate-800">All Clear!</Text>
                <Text className="text-sm text-slate-500 mt-2 text-center px-10">
                  There are no pending fees for {activeChild?.first_name || 'your child'}. Great job!
                </Text>
              </View>
            }
          />
        )}
      </View>
      {renderPaymentModal()}
    </SafeAreaView>
  );
};

export default FeeScreen;
