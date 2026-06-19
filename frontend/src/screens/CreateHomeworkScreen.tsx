import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import apiClient from '../api/client';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any, any>; };

const CreateHomeworkScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [grade, setGrade] = useState('1st Grade'); // Hardcoded for prototype
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('Tomorrow');

  const handleAssign = async () => {
    if (!grade || !title || !description || !dueDate) {
      Alert.alert('Validation Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/homework', {
        grade,
        title,
        description,
        due_date: dueDate
      });
      Alert.alert('Success', `Homework assigned to ${grade}!`);
      navigation.goBack();
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to assign homework');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: Math.max(insets.top, 10) }}>
      <View className="flex-row items-center px-6 py-4 mb-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="bg-gray-50 p-3 rounded-full mr-4">
          <Icon name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View>
          <Text className="text-textSecondary text-xs font-semibold tracking-widest uppercase">Teacher</Text>
          <Text className="text-textPrimary text-2xl font-black">Assign Homework</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="bg-indigo-50 p-4 rounded-2xl mb-6">
          <Text className="text-primary font-semibold">
            Assign daily homework or projects to your class. Parents will receive a notification.
          </Text>
        </View>

        <Text className="text-sm font-bold text-textSecondary uppercase tracking-wider mb-2 ml-1">Target Class / Grade</Text>
        <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl mb-5 border border-gray-100">
          <Icon name="school-outline" size={20} color="#64748B" className="mr-3" />
          <TextInput
            className="flex-1 text-base text-textPrimary font-semibold"
            placeholder="1st Grade"
            value={grade}
            onChangeText={setGrade}
          />
        </View>

        <Text className="text-sm font-bold text-textSecondary uppercase tracking-wider mb-2 ml-1">Homework Title</Text>
        <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl mb-5 border border-gray-100">
          <Icon name="book-outline" size={20} color="#64748B" className="mr-3" />
          <TextInput
            className="flex-1 text-base text-textPrimary font-semibold"
            placeholder="e.g. Math Chapter 5"
            placeholderTextColor="#94A3B8"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <Text className="text-sm font-bold text-textSecondary uppercase tracking-wider mb-2 ml-1">Description / Tasks</Text>
        <View className="flex-row bg-gray-50 p-4 rounded-2xl mb-5 border border-gray-100 min-h-[100px]">
          <Icon name="document-text-outline" size={20} color="#64748B" className="mr-3 mt-1" />
          <TextInput
            className="flex-1 text-base text-textPrimary font-semibold"
            placeholder="Solve exercises 1 to 10 on page 45..."
            placeholderTextColor="#94A3B8"
            multiline
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <Text className="text-sm font-bold text-textSecondary uppercase tracking-wider mb-2 ml-1">Due Date</Text>
        <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl mb-8 border border-gray-100">
          <Icon name="calendar-outline" size={20} color="#64748B" className="mr-3" />
          <TextInput
            className="flex-1 text-base text-textPrimary font-semibold"
            placeholder="e.g. Tomorrow or 2023-11-05"
            value={dueDate}
            onChangeText={setDueDate}
          />
        </View>

        <TouchableOpacity 
          className={`p-5 rounded-2xl items-center flex-row justify-center mb-10 ${loading ? 'bg-gray-400' : 'bg-primary'}`}
          style={{ shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }}
          onPress={handleAssign}
          disabled={loading}
        >
          <Icon name="checkmark-done" size={24} color="#fff" className="mr-2" />
          <Text className="text-white font-bold text-lg">{loading ? 'Assigning...' : 'Assign Homework'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default CreateHomeworkScreen;
