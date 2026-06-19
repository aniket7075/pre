import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import apiClient from '../api/client';
import { useFocusEffect } from '@react-navigation/native';

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

interface ClassData {
  id: string;
  name: string;
  description: string;
}

const ClassesScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [classTeacherId, setClassTeacherId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      fetchClasses();
      fetchTeachers();
    }, [])
  );

  const fetchClasses = async () => {
    try {
      const response = await apiClient.get('/classes');
      setClasses(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await apiClient.get('/admin/staff');
      const teacherList = response.data.filter((s: any) => s.role === 'teacher' && s.is_active);
      setTeachers(teacherList);
    } catch (error) {
      console.error(error);
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setSelectedClassId(null);
    setName('');
    setDescription('');
    setClassTeacherId(null);
    setModalVisible(true);
  };

  const openEditModal = (cls: any) => {
    setIsEditing(true);
    setSelectedClassId(cls.id);
    setName(cls.name);
    setDescription(cls.description || '');
    setClassTeacherId(cls.class_teacher_id || null);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name) {
      Alert.alert('Error', 'Class name is required');
      return;
    }
    setSaving(true);
    try {
      if (isEditing && selectedClassId) {
        await apiClient.put(`/classes/${selectedClassId}`, { name, description, class_teacher_id: classTeacherId });
        Alert.alert('Success', 'Class updated successfully');
      } else {
        await apiClient.post('/classes', { name, description, class_teacher_id: classTeacherId });
        Alert.alert('Success', 'Class added successfully');
      }
      setModalVisible(false);
      fetchClasses();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to save class');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (cls: ClassData) => {
    Alert.alert(
      'Delete Class',
      `Are you sure you want to delete ${cls.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/classes/${cls.id}`);
              Alert.alert('Success', 'Class deleted');
              fetchClasses();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.error || 'Failed to delete class');
            }
          }
        }
      ]
    );
  };

  const renderClass = ({ item, index }: { item: ClassData, index: number }) => (
    <Animated.View 
      entering={FadeInDown.delay(index * 100).duration(500)}
      layout={Layout.springify()}
      className="bg-white p-5 rounded-3xl mb-4 flex-row items-center justify-between"
      style={{ shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}
    >
      <View className="flex-row flex-1 items-center">
        <View className="w-14 h-14 rounded-full bg-blue-100 items-center justify-center mr-4">
          <Icon name="school" size={24} color="#2563EB" />
        </View>
        <View className="flex-1">
          <Text className="text-xl font-bold text-slate-800">{item.name}</Text>
          {item.description ? (
            <Text className="text-sm text-slate-500 font-medium mt-1">{item.description}</Text>
          ) : null}
          {(item as any).teacher_first_name && (
            <View className="flex-row items-center mt-2 bg-blue-50 self-start px-2 py-1 rounded">
              <Icon name="person" size={12} color="#2563EB" />
              <Text className="text-xs text-blue-700 font-bold ml-1">Class Teacher: {(item as any).teacher_first_name} {(item as any).teacher_last_name}</Text>
            </View>
          )}
        </View>
      </View>
      
      <View className="flex-row">
        <TouchableOpacity onPress={() => openEditModal(item)} className="p-2 bg-slate-50 rounded-full mr-2">
          <Icon name="pencil" size={20} color="#2563EB" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item)} className="p-2 bg-slate-50 rounded-full">
          <Icon name="trash" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </Animated.View>
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
            <Text className="text-slate-800 text-2xl font-black">Manage Classes</Text>
            <Text className="text-slate-500 text-sm font-medium">{classes.length} total classes</Text>
          </View>
        </View>
      </Animated.View>

      {/* List */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={classes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderClass}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center mt-20">
              <Icon name="business-outline" size={60} color="#CBD5E1" />
              <Text className="text-slate-400 mt-4 font-medium text-lg">No classes found.</Text>
            </View>
          }
        />
      )}

      {/* Floating Add Button */}
      <Animated.View entering={FadeInUp.delay(300).duration(500)} className="absolute bottom-6 right-6">
        <TouchableOpacity 
          onPress={openAddModal}
          className="bg-blue-600 w-16 h-16 rounded-full items-center justify-center"
          style={{ shadowColor: '#2563EB', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 }}
        >
          <Icon name="add" size={32} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-black text-slate-800">
                {isEditing ? 'Edit Class' : 'Add New Class'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2 bg-slate-100 rounded-full">
                <Icon name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-slate-600 font-bold mb-2 ml-1">Class Name *</Text>
              <TextInput 
                className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 font-medium"
                placeholder="e.g. Nursery, Junior KG, 1st Grade"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View className="mb-6">
              <Text className="text-slate-600 font-bold mb-2 ml-1">Description (Optional)</Text>
              <TextInput 
                className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 font-medium min-h-[80px]"
                placeholder="Brief description about this class..."
                value={description}
                onChangeText={setDescription}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View className="mb-8">
              <Text className="text-slate-600 font-bold mb-2 ml-1">Assign Class Teacher</Text>
              {teachers.length === 0 ? (
                <Text className="text-slate-400 text-sm ml-1">No active teachers found.</Text>
              ) : (
                <FlatList
                  data={teachers}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(t) => t.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      onPress={() => setClassTeacherId(item.id)}
                      className={`mr-3 px-4 py-2.5 rounded-xl border ${classTeacherId === item.id ? 'bg-blue-100 border-blue-500' : 'bg-slate-50 border-slate-200'}`}
                    >
                      <Text className={`font-bold ${classTeacherId === item.id ? 'text-blue-700' : 'text-slate-600'}`}>
                        {item.first_name} {item.last_name}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>

            <TouchableOpacity 
              onPress={handleSave}
              disabled={saving}
              className="bg-blue-600 py-4 rounded-2xl items-center shadow-sm flex-row justify-center"
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Icon name="checkmark-circle" size={20} color="#fff" className="mr-2" />
                  <Text className="text-white font-bold text-lg ml-2">
                    {isEditing ? 'Save Changes' : 'Create Class'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default ClassesScreen;
