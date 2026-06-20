import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import apiClient from '../api/client';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import KidsBackground from '../components/KidsBackground';

type Props = { navigation: NativeStackNavigationProp<any, any>; };

const CreateNoticeScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audience, setAudience] = useState('all');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handlePublish = async () => {
    if (!title || !content || !date) {
      Alert.alert('Validation Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/notices', {
        title,
        content,
        audience,
        date
      });
      Alert.alert('Success', `Notice published successfully!`);
      navigation.goBack();
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to publish notice');
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
        <View>
          <Text className="text-textSecondary text-xs font-semibold tracking-widest uppercase">Admin</Text>
          <Text className="text-textPrimary text-2xl font-black">Publish Notice</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="bg-amber-50 p-4 rounded-2xl mb-6">
          <Text className="text-amber-700 font-semibold">
            Publish school-wide announcements, holidays, or event details. This will be visible to parents and teachers.
          </Text>
        </View>

        <Text className="text-sm font-bold text-textSecondary uppercase tracking-wider mb-2 ml-1">Notice Title</Text>
        <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl mb-5 border border-gray-100">
          <Icon name="megaphone-outline" size={20} color="#64748B" className="mr-3" />
          <TextInput
            className="flex-1 text-base text-textPrimary font-semibold"
            placeholder="e.g. Diwali Holidays"
            placeholderTextColor="#94A3B8"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <Text className="text-sm font-bold text-textSecondary uppercase tracking-wider mb-2 ml-1">Target Audience</Text>
        <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl mb-5 border border-gray-100">
          <Icon name="people-outline" size={20} color="#64748B" className="mr-3" />
          <TextInput
            className="flex-1 text-base text-textPrimary font-semibold"
            placeholder="all / parents / teachers"
            placeholderTextColor="#94A3B8"
            value={audience}
            onChangeText={setAudience}
          />
        </View>

        <Text className="text-sm font-bold text-textSecondary uppercase tracking-wider mb-2 ml-1">Notice Content</Text>
        <View className="flex-row bg-gray-50 p-4 rounded-2xl mb-5 border border-gray-100 min-h-[120px]">
          <Icon name="document-text-outline" size={20} color="#64748B" className="mr-3 mt-1" />
          <TextInput
            className="flex-1 text-base text-textPrimary font-semibold"
            placeholder="School will remain closed from..."
            placeholderTextColor="#94A3B8"
            multiline
            textAlignVertical="top"
            value={content}
            onChangeText={setContent}
          />
        </View>

        <Text className="text-sm font-bold text-textSecondary uppercase tracking-wider mb-2 ml-1">Date</Text>
        <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl mb-8 border border-gray-100">
          <Icon name="calendar-outline" size={20} color="#64748B" className="mr-3" />
          <TextInput
            className="flex-1 text-base text-textPrimary font-semibold"
            value={date}
            onChangeText={setDate}
          />
        </View>

        <TouchableOpacity 
          className={`p-5 rounded-2xl items-center flex-row justify-center mb-10 ${loading ? 'bg-gray-400' : 'bg-primary'}`}
          style={{ shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }}
          onPress={handlePublish}
          disabled={loading}
        >
          <Icon name="send" size={24} color="#fff" className="mr-2" />
          <Text className="text-white font-bold text-lg">{loading ? 'Publishing...' : 'Publish Notice'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default CreateNoticeScreen;
