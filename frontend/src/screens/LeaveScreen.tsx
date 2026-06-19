import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import apiClient from '../api/client';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

type Props = { navigation: NativeStackNavigationProp<any, any>; };

const LeaveScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useSelector((state: RootState) => state.auth);
  const isParent = user?.role === 'parent';
  
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
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
      await apiClient.post('/leaves', {
        student_id: 'dummy-student-id',
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
    <View className="flex-1 bg-slate-50" style={{ paddingTop: Math.max(insets.top, 10) }}>
      
      {/* Premium Header */}
      <Animated.View entering={FadeInDown.duration(600)} className="px-6 py-4 flex-row justify-between items-center mb-2 z-10">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            className="bg-white w-12 h-12 rounded-full items-center justify-center mr-4"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}
          >
            <Icon name="arrow-back" size={24} color="#334155" />
          </TouchableOpacity>
          <View>
            <Text className="text-gray-500 text-xs font-bold tracking-widest uppercase">Management</Text>
            <Text className="text-slate-800 text-2xl font-black mt-1">Leaves</Text>
          </View>
        </View>
        {isParent && (
          <TouchableOpacity 
            onPress={() => setShowForm(!showForm)} 
            className="bg-purple-600 w-12 h-12 rounded-full items-center justify-center"
            style={{ shadowColor: '#9333EA', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 5 }}
          >
            <Icon name={showForm ? "close" : "add"} size={28} color="#fff" />
          </TouchableOpacity>
        )}
      </Animated.View>

      {showForm && isParent && (
        <Animated.View entering={FadeInUp.duration(500)} className="bg-white p-6 m-5 rounded-[28px] z-10" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 5 }}>
          <Text className="text-slate-700 font-bold mb-2 ml-2">Start Date (YYYY-MM-DD)</Text>
          <TextInput className="bg-slate-50 p-4 rounded-2xl mb-4 border border-slate-100 font-semibold" value={startDate} onChangeText={setStartDate} placeholder="e.g. 2023-10-01" placeholderTextColor="#94A3B8" />
          
          <Text className="text-slate-700 font-bold mb-2 ml-2">End Date (YYYY-MM-DD)</Text>
          <TextInput className="bg-slate-50 p-4 rounded-2xl mb-4 border border-slate-100 font-semibold" value={endDate} onChangeText={setEndDate} placeholder="e.g. 2023-10-02" placeholderTextColor="#94A3B8" />
          
          <Text className="text-slate-700 font-bold mb-2 ml-2">Reason</Text>
          <TextInput className="bg-slate-50 p-4 rounded-2xl mb-6 border border-slate-100 font-semibold h-24" value={reason} onChangeText={setReason} placeholder="Reason for leave..." placeholderTextColor="#94A3B8" multiline textAlignVertical="top" />
          
          <TouchableOpacity className="bg-purple-600 p-4 rounded-full items-center flex-row justify-center" onPress={handleApplyLeave} style={{ shadowColor: '#9333EA', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }}>
            <Icon name="paper-plane" size={20} color="#fff" className="mr-2" />
            <Text className="text-white font-black text-lg">Submit Application</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      ) : (
        <FlatList
          data={leaves}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInUp.delay(100 * index).duration(500)} className="bg-white p-5 rounded-[24px] mb-4" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: '#F8FAFC' }}>
              <View className="flex-row justify-between items-center mb-3">
                <Text className="font-black text-xl text-slate-800">{item.student_name}</Text>
                <View className={`px-3 py-1.5 rounded-full ${item.status === 'approved' ? 'bg-emerald-100' : item.status === 'rejected' ? 'bg-rose-100' : 'bg-amber-100'}`}>
                  <Text className={`text-xs font-black uppercase tracking-wider ${item.status === 'approved' ? 'text-emerald-700' : item.status === 'rejected' ? 'text-rose-700' : 'text-amber-700'}`}>
                    {item.status}
                  </Text>
                </View>
              </View>
              
              <View className="bg-slate-50 rounded-2xl p-4 mb-4">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-slate-500 font-semibold text-xs uppercase">From</Text>
                  <Text className="text-slate-500 font-semibold text-xs uppercase">To</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-slate-800 font-bold">{item.start_date.substring(0, 10)}</Text>
                  <Icon name="arrow-forward" size={16} color="#94A3B8" />
                  <Text className="text-slate-800 font-bold">{item.end_date.substring(0, 10)}</Text>
                </View>
              </View>

              <Text className="text-slate-600 font-medium leading-relaxed mb-1 px-1">"{item.reason}"</Text>
              
              {!isParent && item.status === 'pending' && (
                <View className="flex-row justify-end space-x-3 mt-4 border-t border-slate-100 pt-4">
                  <TouchableOpacity onPress={() => handleUpdateStatus(item.id, 'rejected')} className="px-5 py-2.5 bg-rose-50 rounded-xl">
                    <Text className="text-rose-600 font-bold">Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleUpdateStatus(item.id, 'approved')} className="px-5 py-2.5 bg-emerald-50 rounded-xl">
                    <Text className="text-emerald-600 font-bold">Approve</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          )}
          ListEmptyComponent={
            <Animated.View entering={FadeInUp} className="items-center justify-center mt-20">
              <View className="bg-slate-100 w-24 h-24 rounded-full items-center justify-center mb-4">
                <Icon name="document-text-outline" size={40} color="#94A3B8" />
              </View>
              <Text className="text-slate-400 font-bold text-lg">No leave applications</Text>
            </Animated.View>
          }
        />
      )}
    </View>
  );
};

export default LeaveScreen;
