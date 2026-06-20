import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import apiClient, { BASE_URL } from '../api/client';
import { useFocusEffect } from '@react-navigation/native';
import KidsBackground from '../components/KidsBackground';

type Props = {
  navigation: any;
};

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  grade: string;
  is_active: boolean;
  parent_name?: string;
  contact_number?: string;
  profile_image_url?: string;
}

const StudentsScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit Student Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [saving, setSaving] = useState(false);

  // Promote Modal State
  const [modalPromoteVisible, setModalPromoteVisible] = useState(false);
  const grades = ['Playgroup', 'Nursery', 'Jr KG', 'Sr KG'];
  const [fromGrade, setFromGrade] = useState('Nursery');
  const [toGrade, setToGrade] = useState('Jr KG');
  const [promoting, setPromoting] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchStudents();
    }, [])
  );

  const fetchStudents = async () => {
    try {
      const response = await apiClient.get('/admin/students');
      setStudents(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (student: Student) => {
    setSelectedStudentId(student.id);
    setFirstName(student.first_name);
    setLastName(student.last_name);
    setAdmissionNumber(student.admission_number || '');
    setModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!firstName || !lastName) {
      Alert.alert('Error', 'First and Last name are required');
      return;
    }
    setSaving(true);
    try {
      await apiClient.put(`/admin/students/${selectedStudentId}`, {
        firstName,
        lastName,
        admissionNumber,
        isActive: true
      });
      Alert.alert('Success', 'Student updated successfully');
      setModalVisible(false);
      fetchStudents();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update student');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (student: Student) => {
    Alert.alert(
      'Deactivate Student',
      `Are you sure you want to deactivate ${student.first_name} ${student.last_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Deactivate', 
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/admin/students/${student.id}`);
              Alert.alert('Success', 'Student deactivated');
              fetchStudents();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.error || 'Failed to deactivate student');
            }
          }
        }
      ]
    );
  };

  const handlePromote = async () => {
    if (fromGrade === toGrade) {
      Alert.alert('Validation Error', 'From and To class cannot be the same');
      return;
    }
    setPromoting(true);
    try {
      const response = await apiClient.post('/admin/promote', { fromGrade, toGrade });
      Alert.alert('Success', response.data.message || 'Promotion process completed!');
      setModalPromoteVisible(false);
      fetchStudents();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to promote class');
    } finally {
      setPromoting(false);
    }
  };

  const renderStudent = ({ item, index }: { item: Student, index: number }) => (
    <Animated.View 
      entering={FadeInDown.delay(index * 50).duration(500)}
      layout={Layout.springify()}
      className={`bg-white p-4 rounded-3xl mb-4 flex-row items-center justify-between border-l-4 ${item.is_active ? 'border-teal-500' : 'border-slate-300 opacity-70'}`}
      style={{ shadowColor: '#0D9488', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}
    >
      <View className="flex-row flex-1 items-center">
        <View className="w-16 h-16 rounded-full bg-teal-50 border-2 border-teal-100 items-center justify-center mr-4 overflow-hidden">
          {item.profile_image_url ? (
            <Image 
              source={{ uri: item.profile_image_url.startsWith('http') ? item.profile_image_url : `${BASE_URL}${item.profile_image_url}` }} 
              className="w-full h-full"
            />
          ) : (
            <Text className="text-xl font-black text-teal-600">{item.first_name.charAt(0)}{item.last_name.charAt(0)}</Text>
          )}
        </View>
        
        <View className="flex-1">
          <Text className="text-xl font-bold text-slate-800">{item.first_name} {item.last_name}</Text>
          <Text className="text-xs text-slate-500 font-bold mb-2">ADM: {item.admission_number} | Grade: {item.grade || 'N/A'}</Text>
          
          <View className="bg-slate-50 p-2 rounded-xl border border-slate-100 mt-1">
            <View className="flex-row items-center mb-1">
              <Icon name="people" size={14} color="#64748B" />
              <Text className="text-xs text-slate-600 ml-1 font-medium">{item.parent_name || 'Parent Name N/A'}</Text>
            </View>
            <View className="flex-row items-center">
              <Icon name="call" size={14} color="#64748B" />
              <Text className="text-xs text-slate-600 ml-1 font-medium">{item.contact_number || 'No Contact'}</Text>
            </View>
          </View>
        </View>
      </View>
      
      <View className="flex-col justify-between items-end ml-2 h-full py-1">
        {!item.is_active && (
          <View className="bg-red-100 px-2 py-1 rounded-md mb-2">
            <Text className="text-red-700 text-xs font-bold">Inactive</Text>
          </View>
        )}
        <View className="flex-row mt-auto">
          <TouchableOpacity onPress={() => openEditModal(item)} className="p-2 bg-slate-50 rounded-full mr-2">
            <Icon name="pencil" size={20} color="#0D9488" />
          </TouchableOpacity>
          {item.is_active && (
            <TouchableOpacity onPress={() => handleDelete(item)} className="p-2 bg-slate-50 rounded-full">
              <Icon name="trash" size={20} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View className="flex-1 bg-slate-50" style={{ paddingTop: Math.max(insets.top, 10) }}>
      <KidsBackground />
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(600)} className="px-6 py-4 flex-row justify-between items-center z-10 bg-white/80">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            className="bg-white w-12 h-12 rounded-full items-center justify-center mr-4 shadow-sm"
          >
            <Icon name="arrow-back" size={24} color="#334155" />
          </TouchableOpacity>
          <View>
            <Text className="text-slate-800 text-2xl font-black">Students</Text>
            <Text className="text-slate-500 text-sm font-medium">{students.length} total students</Text>
          </View>
        </View>
        
        {/* Promotion Trigger */}
        <TouchableOpacity 
          onPress={() => setModalPromoteVisible(true)}
          className="bg-teal-50 px-3.5 py-2.5 rounded-2xl flex-row items-center border border-teal-100"
        >
          <Icon name="trending-up" size={16} color="#0D9488" />
          <Text className="text-teal-700 text-xs font-extrabold ml-1.5">Promote</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* List */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0D9488" />
        </View>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderStudent}
          contentContainerStyle={{ padding: 20, paddingBottom: 110 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center mt-20">
              <Icon name="school-outline" size={60} color="#CBD5E1" />
              <Text className="text-slate-400 mt-4 font-medium text-lg">No students found.</Text>
            </View>
          }
        />
      )}

      {/* Floating Add Button - shifted up to avoid tab overlap */}
      <Animated.View entering={FadeInUp.delay(300).duration(500)} className="absolute bottom-24 right-6">
        <TouchableOpacity 
          onPress={() => navigation.navigate('AddParentStudent')}
          className="bg-teal-600 w-16 h-16 rounded-full items-center justify-center"
          style={{ shadowColor: '#0D9488', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 }}
        >
          <Icon name="add" size={32} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      {/* Edit Student Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-black text-slate-800">Edit Student</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2 bg-slate-100 rounded-full">
                <Icon name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="flex-row space-x-4 mb-4">
                <View className="flex-1 pr-2">
                  <Text className="text-slate-600 font-bold mb-2 ml-1">First Name</Text>
                  <TextInput 
                    className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 font-medium"
                    placeholder="First Name"
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </View>
                <View className="flex-1 pl-2">
                  <Text className="text-slate-600 font-bold mb-2 ml-1">Last Name</Text>
                  <TextInput 
                    className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 font-medium"
                    placeholder="Last Name"
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>
              </View>

              <View className="mb-6">
                <Text className="text-slate-600 font-bold mb-2 ml-1">Admission Number</Text>
                <TextInput 
                  className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 font-medium"
                  placeholder="ADM-12345"
                  value={admissionNumber}
                  onChangeText={setAdmissionNumber}
                  autoCapitalize="characters"
                />
              </View>

              <TouchableOpacity 
                onPress={handleUpdate}
                disabled={saving}
                className="bg-teal-600 py-4 rounded-2xl items-center shadow-sm flex-row justify-center"
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Icon name="checkmark-circle" size={20} color="#fff" className="mr-2" />
                    <Text className="text-white font-bold text-lg ml-2">Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Class Promotion Modal */}
      <Modal visible={modalPromoteVisible} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-black text-slate-800">Class Promotion</Text>
              <TouchableOpacity onPress={() => setModalPromoteVisible(false)} className="p-2 bg-slate-100 rounded-full">
                <Icon name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View className="bg-teal-50 p-4 rounded-2xl mb-6">
              <Text className="text-teal-800 font-semibold text-xs leading-5">
                Bulk promote students from their current class to the next academic level (e.g., Nursery to Junior KG). Only active student profiles are affected.
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-slate-600 font-bold mb-2 ml-1">Promote From Class</Text>
              <FlatList
                data={grades}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    onPress={() => setFromGrade(item)}
                    className={`mr-3 px-4 py-2.5 rounded-xl border ${fromGrade === item ? 'bg-teal-100 border-teal-500' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <Text className={`font-bold ${fromGrade === item ? 'text-teal-700' : 'text-slate-600'}`}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>

            <View className="mb-8">
              <Text className="text-slate-600 font-bold mb-2 ml-1">Promote To Class</Text>
              <FlatList
                data={grades}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    onPress={() => setToGrade(item)}
                    className={`mr-3 px-4 py-2.5 rounded-xl border ${toGrade === item ? 'bg-indigo-100 border-indigo-500' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <Text className={`font-bold ${toGrade === item ? 'text-indigo-700' : 'text-slate-600'}`}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>

            <TouchableOpacity 
              onPress={handlePromote}
              disabled={promoting}
              className="bg-teal-600 py-4 rounded-2xl items-center shadow-sm flex-row justify-center mb-4"
            >
              {promoting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Icon name="swap-horizontal" size={20} color="#fff" className="mr-2" />
                  <Text className="text-white font-bold text-lg ml-2">Execute Bulk Promotion</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default StudentsScreen;
