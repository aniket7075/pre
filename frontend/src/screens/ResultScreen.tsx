import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import apiClient from '../api/client';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import KidsBackground from '../components/KidsBackground';

type Props = { navigation: NativeStackNavigationProp<any, any>; };

const ResultScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [marks, setMarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResults = async () => {
    try {
      // Mock student ID for demo
      const response = await apiClient.get('/exams/marks/dummy-student-id');
      setMarks(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  // Group marks by term
  const term1Marks = marks.filter(m => m.term === 'Term 1');
  const term2Marks = marks.filter(m => m.term === 'Term 2');

  const renderTermCard = (title: string, termMarks: any[]) => {
    if (termMarks.length === 0) return null;
    
    let totalObtained = 0;
    let totalMax = 0;
    termMarks.forEach(m => {
      totalObtained += parseFloat(m.marks_obtained);
      totalMax += parseFloat(m.max_marks);
    });
    const percentage = ((totalObtained / totalMax) * 100).toFixed(1);

    return (
      <View className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
        <View className="flex-row justify-between items-center mb-4 border-b border-gray-100 pb-3">
          <Text className="text-xl font-black text-textPrimary">{title}</Text>
          <View className="bg-green-50 px-3 py-1 rounded-full">
            <Text className="text-green-600 font-bold">{percentage}%</Text>
          </View>
        </View>

        <View className="flex-row justify-between mb-2 px-1">
          <Text className="font-bold text-gray-500 w-1/2">Subject</Text>
          <Text className="font-bold text-gray-500 text-right w-1/4">Marks</Text>
          <Text className="font-bold text-gray-500 text-right w-1/4">Grade</Text>
        </View>

        {termMarks.map((m, idx) => {
          const perc = (parseFloat(m.marks_obtained) / parseFloat(m.max_marks)) * 100;
          let grade = 'E';
          if (perc >= 91) grade = 'A1';
          else if (perc >= 81) grade = 'A2';
          else if (perc >= 71) grade = 'B1';
          else if (perc >= 61) grade = 'B2';
          else if (perc >= 51) grade = 'C1';
          else if (perc >= 41) grade = 'C2';
          else if (perc >= 33) grade = 'D';

          return (
            <View key={idx} className="flex-row justify-between mb-3 bg-gray-50 p-3 rounded-xl">
              <Text className="font-bold text-textPrimary w-1/2">{m.subject}</Text>
              <Text className="font-bold text-textPrimary text-right w-1/4">{m.marks_obtained}/{m.max_marks}</Text>
              <Text className="font-black text-primary text-right w-1/4">{grade}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: Math.max(insets.top, 10) }}>
      <KidsBackground />
      <View className="flex-row items-center px-6 py-4 mb-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="bg-white p-3 rounded-full mr-4 shadow-sm">
          <Icon name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View>
          <Text className="text-textSecondary text-xs font-semibold tracking-widest uppercase">Report Card</Text>
          <Text className="text-textPrimary text-2xl font-black">Academic Results</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4F46E5" className="mt-10" />
      ) : marks.length === 0 ? (
        <View className="items-center justify-center mt-20 px-5">
          <Icon name="document-text-outline" size={60} color="#CBD5E1" />
          <Text className="text-gray-500 mt-4 text-center font-semibold">No results published yet for this student.</Text>
        </View>
      ) : (
        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
          {renderTermCard('Term 1', term1Marks)}
          {renderTermCard('Term 2', term2Marks)}
        </ScrollView>
      )}
    </View>
  );
};

export default ResultScreen;
