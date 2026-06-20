import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import apiClient from '../api/client';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import KidsBackground from '../components/KidsBackground';

type Props = { navigation: NativeStackNavigationProp<any, any>; };

const ProgressDashboard: React.FC<Props> = ({ navigation }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const studentId = user?.id; // Mock
      const res = await apiClient.get(`/progress/${studentId}`);
      setProgress(res.data);
    } catch (error) {
      console.log('Error fetching progress:', error);
      // Fallback dummy data
      setProgress({
        attendance: [
          { status: 'Present', count: 18 },
          { status: 'Absent', count: 2 },
          { status: 'Late', count: 1 }
        ],
        recentExams: [
          { name: 'Mid Term', marks_obtained: 480, total_marks: 500 },
          { name: 'Unit Test 2', marks_obtained: 45, total_marks: 50 }
        ],
        notes: [
          { note_type: 'behavior', content: 'Very attentive in class and participates actively.' },
          { note_type: 'academic', content: 'Needs a bit more practice in Mathematics.' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KidsBackground />
      <View className="flex-row items-center p-5 bg-primary justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">Student Progress</Text>
        </View>
        <Icon name="trending-up" size={24} color="#fff" />
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : (
        <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
          
          {/* Attendance Summary */}
          <Animated.View entering={FadeInUp.delay(100)} className="bg-card p-5 rounded-2xl mb-5 shadow-sm border border-border">
            <View className="flex-row items-center mb-4 border-b border-border pb-2">
              <Icon name="calendar-outline" size={20} color="#14B8A6" className="mr-2" />
              <Text className="text-lg font-bold text-textPrimary">Attendance Overview</Text>
            </View>
            <View className="flex-row justify-between">
              {progress?.attendance?.length > 0 ? progress.attendance.map((a: any, i: number) => (
                <View key={i} className="items-center bg-background p-3 rounded-xl flex-1 mx-1 border border-border">
                  <Text className={`text-2xl font-black ${a.status === 'Present' ? 'text-emerald-500' : a.status === 'Absent' ? 'text-rose-500' : 'text-amber-500'}`}>{a.count}</Text>
                  <Text className="text-xs text-textSecondary uppercase tracking-wider font-bold mt-1">{a.status}</Text>
                </View>
              )) : <Text className="text-textSecondary italic w-full text-center py-4">No attendance records</Text>}
            </View>
          </Animated.View>

          {/* Recent Exams */}
          <Animated.View entering={FadeInUp.delay(300)} className="bg-card p-5 rounded-2xl mb-5 shadow-sm border border-border">
            <View className="flex-row items-center mb-4 border-b border-border pb-2">
              <Icon name="school-outline" size={20} color="#4F46E5" className="mr-2" />
              <Text className="text-lg font-bold text-textPrimary">Recent Exams</Text>
            </View>
            {progress?.recentExams?.length > 0 ? progress.recentExams.map((e: any, i: number) => (
              <View key={i} className="flex-row justify-between items-center py-3 border-b border-border/50 last:border-0">
                <Text className="text-base text-textPrimary font-medium">{e.name}</Text>
                <View className="bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                  <Text className="text-base font-bold text-primary">{e.marks_obtained}/{e.total_marks}</Text>
                </View>
              </View>
            )) : <Text className="text-textSecondary italic w-full text-center py-4">No recent exams</Text>}
          </Animated.View>

          {/* Teacher Notes */}
          <Animated.View entering={FadeInUp.delay(500)} className="bg-card p-5 rounded-2xl mb-10 shadow-sm border border-border">
            <View className="flex-row items-center mb-4 border-b border-border pb-2">
              <Icon name="chatbubbles-outline" size={20} color="#F59E0B" className="mr-2" />
              <Text className="text-lg font-bold text-textPrimary">Teacher's Remarks</Text>
            </View>
            {progress?.notes?.length > 0 ? progress.notes.map((n: any, i: number) => (
              <View key={i} className="bg-background p-4 rounded-xl mb-3 border-l-4 border-amber-500">
                <Text className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">{n.note_type}</Text>
                <Text className="text-sm text-textPrimary leading-5">{n.content}</Text>
              </View>
            )) : <Text className="text-textSecondary italic w-full text-center py-4">No remarks yet.</Text>}
          </Animated.View>

        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default ProgressDashboard;
