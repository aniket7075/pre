import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import apiClient from '../api/client';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import KidsBackground from '../components/KidsBackground';

type Props = { navigation: NativeStackNavigationProp<any, any>; };

const LessonPlanScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [grade, setGrade] = useState('1st Grade');
  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');
  const [status, setStatus] = useState('Planned'); // Planned, In Progress, Completed

  const fetchPlans = async () => {
    try {
      const response = await apiClient.get(`/lesson-plans/${encodeURIComponent(grade)}`);
      setPlans(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [grade]);

  const handleAddPlan = async () => {
    if (!subject || !chapter) {
      Alert.alert('Error', 'Please fill subject and chapter');
      return;
    }
    try {
      await apiClient.post('/lesson-plans', {
        grade,
        subject,
        chapter_name: chapter,
        status
      });
      setShowForm(false);
      setSubject('');
      setChapter('');
      fetchPlans();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to add lesson plan');
    }
  };

  const getStatusColor = (s: string) => {
    if (s === 'Completed') return 'text-green-600 bg-green-100';
    if (s === 'In Progress') return 'text-amber-600 bg-amber-100';
    return 'text-blue-600 bg-blue-100';
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: Math.max(insets.top, 10) }}>
      <KidsBackground />
      <View className="flex-row items-center justify-between px-6 py-4 mb-2">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="bg-gray-50 p-3 rounded-full mr-4">
            <Icon name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <View>
            <Text className="text-textSecondary text-xs font-semibold tracking-widest uppercase">NCERT Tracker</Text>
            <Text className="text-textPrimary text-2xl font-black">Lesson Plan</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setShowForm(!showForm)} className="bg-primary p-2 rounded-full">
          <Icon name={showForm ? "close" : "add"} size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {showForm && (
        <View className="p-5 bg-indigo-50 m-5 rounded-2xl border border-indigo-100">
          <Text className="font-bold mb-2">Subject</Text>
          <TextInput className="bg-white p-3 rounded-xl mb-3 border border-gray-100" value={subject} onChangeText={setSubject} placeholder="e.g. Science" />
          <Text className="font-bold mb-2">Chapter Name</Text>
          <TextInput className="bg-white p-3 rounded-xl mb-3 border border-gray-100" value={chapter} onChangeText={setChapter} placeholder="e.g. Plants and Animals" />
          
          <Text className="font-bold mb-2">Status</Text>
          <View className="flex-row mb-4 justify-between">
            {['Planned', 'In Progress', 'Completed'].map(st => (
              <TouchableOpacity 
                key={st}
                onPress={() => setStatus(st)}
                className={`py-2 px-3 rounded-lg border ${status === st ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
              >
                <Text className={`font-bold text-xs ${status === st ? 'text-white' : 'text-gray-600'}`}>{st}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity className="bg-primary p-4 rounded-xl items-center" onPress={handleAddPlan}>
            <Text className="text-white font-bold">Save Plan</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#4F46E5" className="mt-10" />
      ) : (
        <FlatList
          data={plans}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <View className="bg-white p-4 rounded-2xl shadow-sm mb-4 border border-gray-100 flex-row justify-between items-center">
              <View className="flex-1 mr-4">
                <Text className="text-sm font-bold text-gray-500 uppercase">{item.subject}</Text>
                <Text className="text-lg font-black text-textPrimary">{item.chapter_name}</Text>
              </View>
              <View className={`px-3 py-1 rounded-md ${getStatusColor(item.status).split(' ')[1]}`}>
                <Text className={`text-xs font-bold ${getStatusColor(item.status).split(' ')[0]}`}>{item.status}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View className="items-center justify-center mt-20">
              <Icon name="book-outline" size={60} color="#E2E8F0" />
              <Text className="text-gray-400 mt-4 font-semibold text-center">No lesson plans mapped for this grade yet.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default LessonPlanScreen;
