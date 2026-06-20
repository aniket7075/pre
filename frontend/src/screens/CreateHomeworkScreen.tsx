import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import DocumentPicker, { DocumentPickerResponse } from 'react-native-document-picker';
import apiClient from '../api/client';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import KidsBackground from '../components/KidsBackground';

type Props = { navigation: NativeStackNavigationProp<any, any>; };

const CreateHomeworkScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [loading, setLoading] = useState(false);
  const [grade, setGrade] = useState('');
  const [subject, setSubject] = useState(user?.department || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('Tomorrow');
  const [referenceLink, setReferenceLink] = useState('');
  const [files, setFiles] = useState<DocumentPickerResponse[]>([]);

  useEffect(() => {
    const fetchMyClass = async () => {
      try {
        const response = await apiClient.get('/classes');
        const myClass = response.data.find((c: any) => c.class_teacher_id === user?.id);
        if (myClass) {
          setGrade(myClass.name);
        }
      } catch (error) {
        console.error('Failed to fetch class', error);
      }
    };
    fetchMyClass();
  }, [user]);

  const pickFiles = async () => {
    try {
      const results = await DocumentPicker.pick({
        allowMultiSelection: true,
        type: [DocumentPicker.types.images, DocumentPicker.types.pdf, DocumentPicker.types.video],
      });
      setFiles([...files, ...results]);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // user canceled
      } else {
        Alert.alert('Error', 'Failed to pick files');
      }
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const handleAssign = async () => {
    if (!grade || !subject || !title || !description || !dueDate) {
      Alert.alert('Validation Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      if (files.length > 0) {
        // Use FormData for file upload
        const formData = new FormData();
        formData.append('grade', grade);
        formData.append('subject', subject);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('due_date', dueDate);
        if (referenceLink) formData.append('reference_link', referenceLink);
        
        files.forEach((file, index) => {
          formData.append('files', {
            uri: file.uri,
            type: file.type || 'application/octet-stream',
            name: file.name || `file${index}`,
          } as any);
        });

        await apiClient.post('/homework', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Standard JSON request
        await apiClient.post('/homework', {
          grade,
          subject,
          title,
          description,
          due_date: dueDate,
          reference_link: referenceLink || undefined
        });
      }
      
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
      <KidsBackground />
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
            placeholder="e.g. 1st Grade"
            value={grade}
            onChangeText={setGrade}
          />
        </View>

        <Text className="text-sm font-bold text-textSecondary uppercase tracking-wider mb-2 ml-1">Subject</Text>
        <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl mb-5 border border-gray-100">
          <Icon name="library-outline" size={20} color="#64748B" className="mr-3" />
          <TextInput
            className="flex-1 text-base text-textPrimary font-semibold"
            placeholder="e.g. Mathematics, English"
            placeholderTextColor="#94A3B8"
            value={subject}
            onChangeText={setSubject}
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
        <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl mb-5 border border-gray-100">
          <Icon name="calendar-outline" size={20} color="#64748B" className="mr-3" />
          <TextInput
            className="flex-1 text-base text-textPrimary font-semibold"
            placeholder="e.g. Tomorrow or 2023-11-05"
            value={dueDate}
            onChangeText={setDueDate}
          />
        </View>

        <Text className="text-sm font-bold text-textSecondary uppercase tracking-wider mb-2 ml-1">Reference Link (Optional)</Text>
        <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl mb-5 border border-gray-100">
          <Icon name="link-outline" size={20} color="#64748B" className="mr-3" />
          <TextInput
            className="flex-1 text-base text-textPrimary font-semibold"
            placeholder="e.g. https://youtube.com/watch?v=..."
            placeholderTextColor="#94A3B8"
            value={referenceLink}
            onChangeText={setReferenceLink}
            autoCapitalize="none"
          />
        </View>

        <Text className="text-sm font-bold text-textSecondary uppercase tracking-wider mb-2 ml-1">Attachments</Text>
        <TouchableOpacity 
          onPress={pickFiles}
          className="flex-row items-center justify-center bg-indigo-50 p-4 rounded-2xl mb-4 border border-indigo-100 border-dashed"
        >
          <Icon name="cloud-upload-outline" size={24} color="#4F46E5" className="mr-2" />
          <Text className="text-primary font-bold text-base">Select Images, PDFs, or Videos</Text>
        </TouchableOpacity>

        {files.length > 0 && (
          <View className="mb-6">
            {files.map((file, index) => (
              <View key={index} className="flex-row items-center justify-between bg-gray-50 p-3 rounded-xl mb-2 border border-gray-200">
                <View className="flex-row items-center flex-1 pr-2">
                  <Icon name="document-attach" size={20} color="#64748B" className="mr-2" />
                  <Text className="text-sm text-textPrimary font-medium flex-1" numberOfLines={1}>{file.name}</Text>
                </View>
                <TouchableOpacity onPress={() => removeFile(index)} className="p-1">
                  <Icon name="close-circle" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View className="h-4" />

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
