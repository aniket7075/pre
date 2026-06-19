import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import apiClient from '../api/client';
import { useFocusEffect } from '@react-navigation/native';

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  is_active: boolean;
  parent_email: string;
  parent_name: string;
  contact_number: string;
}

const StudentsScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [saving, setSaving] = useState(false);

  // Fetch when screen comes into focus
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
    setSelectedStudent(student);
    setFirstName(student.first_name);
    setLastName(student.last_name);
    setAdmissionNumber(student.admission_number || '');
    setModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!firstName || !lastName || !admissionNumber) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setSaving(true);
    try {
      await apiClient.put(`/admin/students/${selectedStudent?.id}`, {
        firstName,
        lastName,
        admissionNumber,
        isActive: selectedStudent?.is_active
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
      `Are you sure you want to deactivate ${student.first_name}? They will no longer show as active in the system.`,
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
            } catch (error) {
              Alert.alert('Error', 'Failed to deactivate student');
            }
          }
        }
      ]
    );
  };

  const renderStudent = ({ item, index }: { item: Student, index: number }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.navigate('StudentProfile', { student: item })}
    >
      <Animated.View 
        entering={FadeInDown.delay(index * 100).duration(500)}
        layout={Layout.springify()}
        className="bg-white p-5 rounded-3xl mb-4 flex-row items-center justify-between"
        style={{ shadowColor: '#14B8A6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}
      >
        <View className="flex-row flex-1">
          <View className={`w-14 h-14 rounded-full items-center justify-center mr-4 mt-1 ${item.is_active ? 'bg-teal-100' : 'bg-slate-100'}`}>
            <Icon name="person" size={24} color={item.is_active ? '#0D9488' : '#94A3B8'} />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-slate-800" numberOfLines={1}>
              {item.first_name} {item.last_name}
            </Text>
            <Text className="text-xs text-slate-500 font-bold mb-2">ADM: {item.admission_number}</Text>
            
            <View className="bg-slate-50 p-2 rounded-xl border border-slate-100">
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
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-slate-50" style={{ paddingTop: Math.max(insets.top, 10) }}>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(600)} className="px-6 py-4 flex-row justify-between items-center z-10">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            className="bg-white w-12 h-12 rounded-full items-center justify-center mr-4 shadow-sm"
          >
            <Icon name="arrow-back" size={24} color="#334155" />
          </TouchableOpacity>
          <View>
            <Text className="text-slate-800 text-2xl font-black">Manage Students</Text>
            <Text className="text-slate-500 text-sm font-medium">{students.length} total students</Text>
          </View>
        </View>
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
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center mt-20">
              <Icon name="school-outline" size={60} color="#CBD5E1" />
              <Text className="text-slate-400 mt-4 font-medium text-lg">No students found.</Text>
            </View>
          }
        />
      )}

      {/* Floating Add Button */}
      <Animated.View entering={FadeInUp.delay(300).duration(500)} className="absolute bottom-6 right-6">
        <TouchableOpacity 
          onPress={() => navigation.navigate('AddParentStudent')}
          className="bg-teal-600 w-16 h-16 rounded-full items-center justify-center"
          style={{ shadowColor: '#0D9488', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 }}
        >
          <Icon name="add" size={32} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      {/* Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
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
    </View>
  );
};

export default StudentsScreen;
