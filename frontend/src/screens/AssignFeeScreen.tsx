import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import apiClient from '../api/client';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any, any>; };

const AssignFeeScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [feeType, setFeeType] = useState('');
  const [amount, setAmount] = useState('');
  const [grade, setGrade] = useState('1st Grade'); // Hardcoded for prototype, usually a dropdown
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // 30 days from now

  const handleAssign = async () => {
    if (!feeType || !amount || !grade || !dueDate) {
      Alert.alert('Validation Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/fees/assign', {
        fee_type: feeType,
        amount: parseFloat(amount),
        grade,
        due_date: dueDate
      });
      Alert.alert('Success', `Fee assigned to all students in ${grade}!`);
      navigation.goBack();
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to assign fee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: Math.max(insets.top, 10) }}>
      <View className="flex-row items-center px-6 py-4 mb-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="bg-gray-50 p-3 rounded-full mr-4">
          <Icon name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View>
          <Text className="text-textSecondary text-xs font-semibold tracking-widest uppercase">Admin</Text>
          <Text className="text-textPrimary text-2xl font-black">Assign Fees</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="bg-indigo-50 p-4 rounded-2xl mb-6">
          <Text className="text-primary font-semibold">
            Use this form to quickly assign a specific fee to all students in a grade. This will generate pending payment records for parents.
          </Text>
        </View>

        <Text className="text-sm font-bold text-textSecondary uppercase tracking-wider mb-2 ml-1">Fee Description</Text>
        <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl mb-5 border border-gray-100">
          <Icon name="pricetag-outline" size={20} color="#64748B" className="mr-3" />
          <TextInput
            className="flex-1 text-base text-textPrimary font-semibold"
            placeholder="e.g. Q1 Tuition Fee"
            placeholderTextColor="#94A3B8"
            value={feeType}
            onChangeText={setFeeType}
          />
        </View>

        <Text className="text-sm font-bold text-textSecondary uppercase tracking-wider mb-2 ml-1">Amount (₹)</Text>
        <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl mb-5 border border-gray-100">
          <Icon name="cash-outline" size={20} color="#64748B" className="mr-3" />
          <TextInput
            className="flex-1 text-base text-textPrimary font-semibold"
            placeholder="15000"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        <Text className="text-sm font-bold text-textSecondary uppercase tracking-wider mb-2 ml-1">Target Class / Grade</Text>
        <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl mb-5 border border-gray-100">
          <Icon name="school-outline" size={20} color="#64748B" className="mr-3" />
          <TextInput
            className="flex-1 text-base text-textPrimary font-semibold"
            placeholder="1st Grade"
            value={grade}
            onChangeText={setGrade}
          />
        </View>

        <Text className="text-sm font-bold text-textSecondary uppercase tracking-wider mb-2 ml-1">Due Date (YYYY-MM-DD)</Text>
        <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl mb-8 border border-gray-100">
          <Icon name="calendar-outline" size={20} color="#64748B" className="mr-3" />
          <TextInput
            className="flex-1 text-base text-textPrimary font-semibold"
            placeholder="2023-12-01"
            value={dueDate}
            onChangeText={setDueDate}
          />
        </View>

        <TouchableOpacity 
          className={`p-5 rounded-2xl items-center flex-row justify-center mb-10 ${loading ? 'bg-gray-400' : 'bg-primary'}`}
          style={{ shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }}
          onPress={handleAssign}
          disabled={loading}
        >
          <Icon name="checkmark-done" size={24} color="#fff" className="mr-2" />
          <Text className="text-white font-bold text-lg">{loading ? 'Assigning...' : 'Assign Fee to Class'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default AssignFeeScreen;
