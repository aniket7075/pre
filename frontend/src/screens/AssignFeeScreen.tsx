import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Modal, FlatList, ActivityIndicator, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import apiClient, { BASE_URL } from '../api/client';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import KidsBackground from '../components/KidsBackground';

type Props = { navigation: NativeStackNavigationProp<any, any>; };

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  admission_number?: string;
  profile_image_url?: string;
}

const AssignFeeScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [feeType, setFeeType] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await apiClient.get('/admin/students');
      setStudents(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch students list');
    } finally {
      setFetching(false);
    }
  };

  const handleAssign = async () => {
    if (!feeType || !amount || !dueDate) {
      Alert.alert('Validation Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        fee_type: feeType,
        amount: parseFloat(amount),
        due_date: dueDate
      };

      if (selectedStudent) {
        payload.student_id = selectedStudent.id;
      } else {
        // Fallback or "All Students" logic. We set grade = 'All' to let backend know to assign to all active.
        payload.grade = 'All';
      }

      const response = await apiClient.post('/fees/assign', payload);
      Alert.alert('Success', response.data.message || 'Fee assigned successfully!');
      navigation.goBack();
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to assign fee');
    } finally {
      setLoading(false);
    }
  };

  const renderStudentPicker = () => (
    <Modal visible={modalVisible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl p-6 h-3/4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-slate-800">Select Student</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2 bg-slate-100 rounded-full">
              <Icon name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            onPress={() => { setSelectedStudent(null); setModalVisible(false); }}
            className={`p-4 rounded-2xl mb-3 border ${!selectedStudent ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}
          >
            <Text className={`font-bold text-lg ${!selectedStudent ? 'text-indigo-600' : 'text-slate-700'}`}>Assign to ALL Students</Text>
          </TouchableOpacity>

          {fetching ? (
            <ActivityIndicator size="large" color="#4F46E5" className="mt-10" />
          ) : (
            <FlatList
              data={students}
              keyExtractor={(s) => s.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  onPress={() => { setSelectedStudent(item); setModalVisible(false); }}
                  className="flex-row items-center p-3 border-b border-slate-100"
                >
                  <View className="w-10 h-10 rounded-full bg-slate-200 mr-3 overflow-hidden">
                    {item.profile_image_url ? (
                      <Image source={{ uri: item.profile_image_url.startsWith('http') ? item.profile_image_url : `${BASE_URL}${item.profile_image_url}` }} className="w-full h-full" />
                    ) : (
                      <View className="w-full h-full items-center justify-center bg-indigo-100">
                        <Text className="font-bold text-indigo-500">{item.first_name[0]}</Text>
                      </View>
                    )}
                  </View>
                  <View>
                    <Text className="font-bold text-slate-800">{item.first_name} {item.last_name}</Text>
                    {item.admission_number && <Text className="text-xs text-slate-500">{item.admission_number}</Text>}
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: Math.max(insets.top, 10) }}>
      <KidsBackground />
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
            Use this form to assign a specific fee to a student or the entire school. Parents will receive the due payment record.
          </Text>
        </View>

        <Text className="text-sm font-bold text-textSecondary uppercase tracking-wider mb-2 ml-1">Fee Description</Text>
        <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl mb-5 border border-gray-100">
          <Icon name="pricetag-outline" size={20} color="#64748B" className="mr-3" />
          <TextInput
            className="flex-1 text-base text-textPrimary font-semibold"
            placeholder="e.g. Q1 Tuition Fee, Late Fine"
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

        <Text className="text-sm font-bold text-textSecondary uppercase tracking-wider mb-2 ml-1">Target Student</Text>
        <TouchableOpacity 
          onPress={() => setModalVisible(true)}
          className="flex-row items-center justify-between bg-gray-50 p-4 rounded-2xl mb-5 border border-gray-100"
        >
          <View className="flex-row items-center">
            <Icon name="person-circle-outline" size={20} color="#64748B" className="mr-3" />
            <Text className={`text-base font-semibold ${selectedStudent ? 'text-textPrimary' : 'text-indigo-600'}`}>
              {selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : 'All Students'}
            </Text>
          </View>
          <Icon name="chevron-down" size={20} color="#94A3B8" />
        </TouchableOpacity>

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
          <Text className="text-white font-bold text-lg">{loading ? 'Assigning...' : 'Assign Fee'}</Text>
        </TouchableOpacity>
      </ScrollView>

      {renderStudentPicker()}
    </View>
  );
};

export default AssignFeeScreen;
