import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import apiClient from '../api/client';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any, any>; };

const LeaveScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useSelector((state: RootState) => state.auth);
  const isParent = user?.role === 'parent';
  
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states (for parents)
  const [showForm, setShowForm] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const fetchLeaves = async () => {
    try {
      const response = await apiClient.get('/leaves');
      setLeaves(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleApplyLeave = async () => {
    if (!startDate || !endDate || !reason) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    try {
      // In a real app, parent selects student. Here we mock student_id.
      await apiClient.post('/leaves', {
        student_id: 'dummy-student-id', // Needs valid UUID if enforcing FKs, but we'll bypass or use a real one.
        start_date: startDate,
        end_date: endDate,
        reason
      });
      Alert.alert('Success', 'Leave application submitted');
      setShowForm(false);
      fetchLeaves();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to apply');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await apiClient.put(`/leaves/${id}/status`, { status });
      fetchLeaves();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update');
    }
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: Math.max(insets.top, 10) }}>
      <View className="flex-row items-center justify-between px-6 py-4 mb-2">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="bg-gray-50 p-3 rounded-full mr-4">
            <Icon name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text className="text-textPrimary text-2xl font-black">Leaves</Text>
        </View>
        {isParent && (
          <TouchableOpacity onPress={() => setShowForm(!showForm)} className="bg-primary p-2 rounded-full">
            <Icon name={showForm ? "close" : "add"} size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {showForm && isParent && (
        <View className="p-5 bg-gray-50 m-5 rounded-2xl border border-gray-200">
          <Text className="font-bold mb-2">Start Date (YYYY-MM-DD)</Text>
          <TextInput className="bg-white p-3 rounded-xl mb-3 border border-gray-100" value={startDate} onChangeText={setStartDate} placeholder="2023-10-01" />
          <Text className="font-bold mb-2">End Date (YYYY-MM-DD)</Text>
          <TextInput className="bg-white p-3 rounded-xl mb-3 border border-gray-100" value={endDate} onChangeText={setEndDate} placeholder="2023-10-02" />
          <Text className="font-bold mb-2">Reason</Text>
          <TextInput className="bg-white p-3 rounded-xl mb-4 border border-gray-100" value={reason} onChangeText={setReason} placeholder="Fever..." multiline />
          <TouchableOpacity className="bg-primary p-4 rounded-xl items-center" onPress={handleApplyLeave}>
            <Text className="text-white font-bold">Submit Application</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#4F46E5" className="mt-10" />
      ) : (
        <FlatList
          data={leaves}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <View className="bg-white p-4 rounded-2xl shadow-sm mb-4 border border-gray-100">
              <View className="flex-row justify-between mb-2">
                <Text className="font-bold text-lg">{item.student_name}</Text>
                <View className={`px-2 py-1 rounded-md ${item.status === 'approved' ? 'bg-green-100' : item.status === 'rejected' ? 'bg-red-100' : 'bg-orange-100'}`}>
                  <Text className={`text-xs font-bold ${item.status === 'approved' ? 'text-green-700' : item.status === 'rejected' ? 'text-red-700' : 'text-orange-700'}`}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text className="text-gray-600 mb-1"><Text className="font-semibold">From:</Text> {item.start_date.substring(0, 10)} <Text className="font-semibold">To:</Text> {item.end_date.substring(0, 10)}</Text>
              <Text className="text-gray-800 mb-3">{item.reason}</Text>
              
              {!isParent && item.status === 'pending' && (
                <View className="flex-row justify-end space-x-3 mt-2 border-t border-gray-100 pt-3">
                  <TouchableOpacity onPress={() => handleUpdateStatus(item.id, 'rejected')} className="px-4 py-2 bg-red-50 rounded-lg mr-2">
                    <Text className="text-red-600 font-bold">Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleUpdateStatus(item.id, 'approved')} className="px-4 py-2 bg-green-50 rounded-lg">
                    <Text className="text-green-600 font-bold">Approve</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={<Text className="text-center text-gray-500 mt-10">No leave applications found.</Text>}
        />
      )}
    </View>
  );
};

export default LeaveScreen;
