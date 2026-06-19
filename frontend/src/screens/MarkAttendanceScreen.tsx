import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import apiClient from '../api/client';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any, any>; };

type Student = { id: string; full_name: string; grade: string };
type AttendanceRecord = { student_id: string; status: 'Present' | 'Absent' | 'Leave' };

const MarkAttendanceScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
  const [saving, setSaving] = useState(false);

  // For this prototype, we assume the teacher is assigned to "1st Grade"
  const selectedGrade = '1st Grade';
  
  // Date format: YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchClassStudents();
  }, []);

  const fetchClassStudents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/attendance/class/${selectedGrade}`);
      const studentsList: Student[] = response.data.data;
      setStudents(studentsList);

      // Default everyone to 'Present'
      const defaultAttendance: Record<string, AttendanceRecord> = {};
      studentsList.forEach(s => {
        defaultAttendance[s.id] = { student_id: s.id, status: 'Present' };
      });
      setAttendance(defaultAttendance);

    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch students for your class.');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = (studentId: string, currentStatus: string) => {
    const nextStatus = 
      currentStatus === 'Present' ? 'Absent' : 
      currentStatus === 'Absent' ? 'Leave' : 'Present';
      
    setAttendance(prev => ({
      ...prev,
      [studentId]: { student_id: studentId, status: nextStatus as any }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const records = Object.values(attendance);
      await apiClient.post('/attendance/mark', {
        date: today,
        records
      });
      Alert.alert('Success', 'Attendance marked successfully!');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to mark attendance.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'Present') return 'text-emerald-500 bg-emerald-50 border-emerald-200';
    if (status === 'Absent') return 'text-rose-500 bg-rose-50 border-rose-200';
    return 'text-amber-500 bg-amber-50 border-amber-200'; // Leave
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
          <Text className="text-textSecondary text-xs font-semibold tracking-widest uppercase">{today}</Text>
          <Text className="text-textPrimary text-2xl font-black">Mark Attendance</Text>
        </View>
      </View>
      
      <View className="flex-1 px-5">
        <View className="bg-indigo-50 p-4 rounded-2xl mb-4 flex-row items-center">
          <Icon name="business" size={24} color="#4F46E5" className="mr-3" />
          <Text className="text-primary font-bold text-lg">{selectedGrade} Students</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#4F46E5" className="mt-10" />
        ) : students.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Icon name="people-outline" size={60} color="#E2E8F0" />
            <Text className="text-lg text-textSecondary mt-4 text-center">No students found for this class.</Text>
            <Text className="text-sm text-textSecondary text-center px-4 mt-2">Add students to {selectedGrade} first using the Admin panel.</Text>
          </View>
        ) : (
          <FlatList
            data={students}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={({ item }) => {
              const status = attendance[item.id]?.status || 'Present';
              const colors = getStatusColor(status);
              
              return (
                <TouchableOpacity 
                  onPress={() => toggleStatus(item.id, status)}
                  activeOpacity={0.7}
                  className={`p-4 rounded-2xl mb-3 flex-row justify-between items-center border ${colors}`}
                  style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 }}
                >
                  <View className="flex-row items-center flex-1">
                    <View className="bg-white/50 p-2 rounded-xl mr-3">
                      <Icon name="person" size={20} color="#64748B" />
                    </View>
                    <Text className="text-lg font-bold text-textPrimary">{item.full_name}</Text>
                  </View>
                  
                  <View className="flex-row items-center bg-white/50 px-3 py-1.5 rounded-full">
                    <Icon name={getStatusIcon(status)} size={16} color="inherit" className="mr-1" />
                    <Text className="font-bold text-sm uppercase tracking-wider">{status}</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>

      {!loading && students.length > 0 && (
        <View className="absolute bottom-5 left-5 right-5">
          <TouchableOpacity 
            className={`p-4 rounded-2xl items-center flex-row justify-center ${saving ? 'bg-gray-400' : 'bg-primary'}`}
            style={{ shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }}
            onPress={handleSave}
            disabled={saving}
          >
            <Icon name={saving ? 'hourglass' : 'save'} size={24} color="#fff" className="mr-2" />
            <Text className="text-white font-bold text-lg">{saving ? 'Saving...' : 'Submit Attendance'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default MarkAttendanceScreen;
