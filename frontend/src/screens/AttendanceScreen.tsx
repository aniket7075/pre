import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import apiClient from '../api/client';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any, any>; };

const AttendanceScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<any[]>([]);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        // In a real app, this would be the selected child's ID.
        // For now, we will fetch data if we know the student ID, otherwise show dummy data.
        const response = await apiClient.get('/attendance/dummy_id_here');
        setAttendance(response.data.data);
      } catch (error) {
        console.error(error);
        // Fallback dummy data for visual testing
        setAttendance([
          { id: '1', date: '2023-10-01', status: 'Present' },
          { id: '2', date: '2023-10-02', status: 'Absent' },
          { id: '3', date: '2023-10-03', status: 'Present' },
          { id: '4', date: '2023-10-04', status: 'Leave' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const getStatusColor = (status: string) => {
    if (status === 'Present') return 'text-emerald-500 bg-emerald-50 border-emerald-200';
    if (status === 'Absent') return 'text-rose-500 bg-rose-50 border-rose-200';
    return 'text-amber-500 bg-amber-50 border-amber-200';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'Present') return 'checkmark-circle';
    if (status === 'Absent') return 'close-circle';
    return 'airplane';
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: Math.max(insets.top, 10) }}>
      <View className="flex-row items-center px-6 py-4 mb-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="bg-gray-50 p-3 rounded-full mr-4">
          <Icon name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View>
          <Text className="text-textSecondary text-xs font-semibold tracking-widest uppercase">My Child</Text>
          <Text className="text-textPrimary text-2xl font-black">Attendance</Text>
        </View>
      </View>
      
      <View className="flex-1 px-5">
        {loading ? (
          <ActivityIndicator size="large" color="#4F46E5" className="mt-10" />
        ) : (
          <FlatList
            data={attendance}
            keyExtractor={(item: any) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
            renderItem={({ item }) => {
              const colors = getStatusColor(item.status);
              return (
                <View 
                  className={`p-4 rounded-2xl mb-3 flex-row justify-between items-center border ${colors}`}
                  style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 }}
                >
                  <View className="flex-row items-center">
                    <View className="bg-white/50 p-3 rounded-full mr-4">
                      <Icon name={getStatusIcon(item.status)} size={24} color="inherit" />
                    </View>
                    <View>
                      <Text className="text-lg font-bold text-textPrimary">{item.date}</Text>
                      <Text className="text-sm font-medium opacity-80">{item.status}</Text>
                    </View>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View className="items-center justify-center py-20">
                <Icon name="calendar-outline" size={60} color="#E2E8F0" />
                <Text className="text-lg text-textSecondary mt-4">No attendance records found.</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
};

export default AttendanceScreen;
