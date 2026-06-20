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

const MarkEntryScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [term, setTerm] = useState('Term 1');
  const [examName, setExamName] = useState('Periodic Test 1');
  const [grade, setGrade] = useState('1st Grade');
  const [subject, setSubject] = useState('');
  const [marks, setMarks] = useState('');
  const [maxMarks, setMaxMarks] = useState('40');

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

  const handleSubmit = async () => {
    if (!selectedStudent) {
      Alert.alert('Validation Error', 'Please select a student first');
      return;
    }
    if (!subject || !marks || !maxMarks) {
      Alert.alert('Error', 'Please fill all marks fields');
      return;
    }

    setLoading(true);
    try {
      // 1. Ensure Exam Exists
      let examRes = await apiClient.get(`/exams/${encodeURIComponent(grade)}`);
      let exams = examRes.data.data;
      let targetExam = exams.find((e: any) => e.term === term && e.name === examName && e.grade === grade);
      
      if (!targetExam) {
        // Create it
        const createRes = await apiClient.post('/exams', { term, name: examName, grade, year: '2023-24' });
        targetExam = createRes.data.data;
      }

      // 2. Submit Marks
      await apiClient.post('/exams/marks', {
        exam_id: targetExam.id,
        student_id: selectedStudent.id,
        subject,
        marks_obtained: parseFloat(marks),
        max_marks: parseFloat(maxMarks)
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
        <TextInput className="bg-gray-50 p-4 rounded-xl border border-gray-100 font-bold mb-4" value={grade} onChangeText={setGrade} />

        <Text className="font-bold text-gray-500 mb-2">Select Student</Text>
        <TouchableOpacity 
          onPress={() => setModalVisible(true)}
          className="flex-row items-center justify-between bg-gray-50 p-4 rounded-2xl mb-6 border border-gray-100"
        >
          <View className="flex-row items-center">
            <Icon name="person-circle-outline" size={20} color="#64748B" className="mr-3" />
            <Text className={`text-base font-semibold ${selectedStudent ? 'text-textPrimary' : 'text-indigo-600'}`}>
              {selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : 'Select a Student'}
            </Text>
          </View>
          <Icon name="chevron-down" size={20} color="#94A3B8" />
        </TouchableOpacity>

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

      {renderStudentPicker()}
    </View>
  );
};

export default MarkEntryScreen;
