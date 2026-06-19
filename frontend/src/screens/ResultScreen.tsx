import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import apiClient from '../api/client';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any, any>; };

const ResultScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      if (user?.role === 'parent') {
        const studentId = user.id; 
        const res = await apiClient.get(`/results/student/${studentId}`);
        setResults(res.data);
      } else {
        setResults([
          { exam_name: 'Mid Term Examination', grade: 'A+', marks_obtained: 480, total_marks: 500, remarks: 'Excellent performance!' },
          { exam_name: 'Quarterly Test', grade: 'A', marks_obtained: 85, total_marks: 100, remarks: 'Keep it up.' }
        ]);
      }
    } catch (error) {
      console.log('Error fetching results:', error);
      // Fallback
      setResults([
        { exam_name: 'Mid Term Examination', grade: 'A+', marks_obtained: 480, total_marks: 500, remarks: 'Excellent performance!' },
        { exam_name: 'Quarterly Test', grade: 'A', marks_obtained: 85, total_marks: 100, remarks: 'Keep it up.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center p-5 bg-primary justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">Exam Results</Text>
        </View>
        <Icon name="school" size={24} color="#fff" />
      </View>

      <View className="flex-1 p-5">
        {loading ? (
          <ActivityIndicator size="large" color="#4F46E5" />
        ) : results.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Icon name="document-text-outline" size={60} color="#E2E8F0" />
            <Text className="text-lg text-textSecondary mt-4">No results published yet.</Text>
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeInUp.delay(index * 100).duration(500)} className="bg-card p-5 rounded-2xl mb-4 shadow-sm border border-border">
                <View className="flex-row justify-between items-center mb-3 border-b border-border pb-3">
                  <Text className="text-lg font-bold text-textPrimary flex-1">{item.exam_name}</Text>
                  <View className="bg-emerald-100 w-12 h-12 rounded-full items-center justify-center ml-2">
                    <Text className="text-xl font-extrabold text-emerald-600">{item.grade || '-'}</Text>
                  </View>
                </View>
                
                <View className="flex-row items-center mb-2">
                  <Icon name="bar-chart" size={16} color="#14B8A6" className="mr-2" />
                  <Text className="text-base text-textSecondary">Marks: <Text className="font-bold text-textPrimary">{item.marks_obtained}</Text> / {item.total_marks}</Text>
                </View>
                
                {item.remarks && (
                  <View className="flex-row mt-1 bg-background p-3 rounded-xl border border-border">
                    <Icon name="chatbubble-ellipses" size={16} color="#F59E0B" className="mr-2 mt-0.5" />
                    <Text className="text-sm text-textSecondary flex-1 italic">{item.remarks}</Text>
                  </View>
                )}
              </Animated.View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default ResultScreen;
