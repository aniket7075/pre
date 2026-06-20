import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import apiClient from '../api/client';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import KidsBackground from '../components/KidsBackground';

type Props = { navigation: NativeStackNavigationProp<any, any>; };

const MarkEntryScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [term, setTerm] = useState('Term 1');
  const [examName, setExamName] = useState('Periodic Test 1');
  const [grade, setGrade] = useState('1st Grade');
  const [subject, setSubject] = useState('');
  const [marks, setMarks] = useState('');
  const [maxMarks, setMaxMarks] = useState('40');

  const handleSubmit = async () => {
    if (!subject || !marks || !maxMarks) {
      Alert.alert('Error', 'Please fill all marks fields');
      return;
    }

    setLoading(true);
    try {
      // 1. Ensure Exam Exists
      let examRes = await apiClient.get(`/exams/${encodeURIComponent(grade)}`);
      let exams = examRes.data.data;
      let targetExam = exams.find((e: any) => e.term === term && e.name === examName && e.year === '2023-24');
      
      if (!targetExam) {
        // Create it
        const createRes = await apiClient.post('/exams', { term, name: examName, grade, year: '2023-24' });
        targetExam = createRes.data.data;
      }

      // 2. Submit Marks (Mock student_id for demo)
      await apiClient.post('/exams/marks', {
        exam_id: targetExam.id,
        student_id: 'dummy-student-id',
        subject,
        marks_obtained: marks,
        max_marks: maxMarks
      });

      Alert.alert('Success', 'Marks updated successfully!');
      setSubject('');
      setMarks('');
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to submit marks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: Math.max(insets.top, 10) }}>
      <KidsBackground />
      <View className="flex-row items-center px-6 py-4 mb-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="bg-gray-50 p-3 rounded-full mr-4">
          <Icon name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-textPrimary text-2xl font-black">Enter Marks</Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="bg-indigo-50 p-4 rounded-2xl mb-6">
          <Text className="text-indigo-800 font-semibold">
            Select the Exam and enter marks for the subject. This will instantly reflect on the parent's report card.
          </Text>
        </View>

        <View className="flex-row justify-between mb-4">
          <View className="w-[48%]">
            <Text className="font-bold text-gray-500 mb-2">Term</Text>
            <TextInput className="bg-gray-50 p-4 rounded-xl border border-gray-100 font-bold" value={term} onChangeText={setTerm} />
          </View>
          <View className="w-[48%]">
            <Text className="font-bold text-gray-500 mb-2">Exam Name</Text>
            <TextInput className="bg-gray-50 p-4 rounded-xl border border-gray-100 font-bold" value={examName} onChangeText={setExamName} />
          </View>
        </View>

        <Text className="font-bold text-gray-500 mb-2">Grade / Class</Text>
        <TextInput className="bg-gray-50 p-4 rounded-xl border border-gray-100 font-bold mb-6" value={grade} onChangeText={setGrade} />

        <Text className="text-xl font-black text-textPrimary mb-4">Subject Marks</Text>

        <Text className="font-bold text-gray-500 mb-2">Subject Name</Text>
        <TextInput className="bg-gray-50 p-4 rounded-xl border border-gray-100 font-bold mb-4" value={subject} onChangeText={setSubject} placeholder="e.g. Mathematics" />

        <View className="flex-row justify-between mb-8">
          <View className="w-[48%]">
            <Text className="font-bold text-gray-500 mb-2">Marks Obtained</Text>
            <TextInput className="bg-gray-50 p-4 rounded-xl border border-gray-100 font-bold" value={marks} onChangeText={setMarks} keyboardType="numeric" placeholder="0" />
          </View>
          <View className="w-[48%]">
            <Text className="font-bold text-gray-500 mb-2">Max Marks</Text>
            <TextInput className="bg-gray-50 p-4 rounded-xl border border-gray-100 font-bold" value={maxMarks} onChangeText={setMaxMarks} keyboardType="numeric" />
          </View>
        </View>

        <TouchableOpacity 
          className={`p-5 rounded-2xl items-center flex-row justify-center mb-10 ${loading ? 'bg-gray-400' : 'bg-primary'}`}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Icon name="checkmark-circle" size={24} color="#fff" className="mr-2" />
          <Text className="text-white font-bold text-lg">{loading ? 'Submitting...' : 'Submit Marks'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default MarkEntryScreen;
