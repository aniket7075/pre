import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import apiClient from '../api/client';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any, any>; };

const AttendanceScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<any[]>([]);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await apiClient.get('/attendance/dummy_id_here');
        setAttendance(response.data.data);
      } catch (error) {
        console.error(error);
        // Fallback dummy data for visual testing
        setAttendance([
          { id: '1', date: '2023-10-01', status: 'Present' },
          { id: '2', date: '2023-10-02', status: 'Absent' },
          { id: '3', date: '2023-10-03', status: 'Present' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center p-5 bg-primary justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">Attendance Records</Text>
        </View>
        <Icon name="calendar" size={24} color="#fff" />
      </View>
      
      <View className="flex-1 p-5">
        {loading ? (
          <ActivityIndicator size="large" color="#4F46E5" />
        ) : (
          <FlatList
            data={attendance}
            keyExtractor={(item: any) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View className="bg-card p-4 rounded-xl mb-4 flex-row justify-between items-center shadow-sm border border-border">
                <View className="flex-row items-center">
                  <View className={`p-3 rounded-full mr-4 ${item.status === 'Present' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                    <Icon name={item.status === 'Present' ? 'checkmark-circle' : 'close-circle'} size={24} color={item.status === 'Present' ? '#10B981' : '#EF4444'} />
                  </View>
                  <View>
                    <Text className="text-lg font-bold text-textPrimary">{item.date}</Text>
                    <Text className="text-sm text-textSecondary">Status: {item.status}</Text>
                  </View>
                </View>
                <Text className={`font-bold ${item.status === 'Present' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {item.status}
                </Text>
              </View>
            )}
            ListEmptyComponent={
              <View className="items-center justify-center py-20">
                <Icon name="calendar-outline" size={60} color="#E2E8F0" />
                <Text className="text-lg text-textSecondary mt-4">No attendance records found.</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default AttendanceScreen;
