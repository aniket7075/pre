import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import apiClient from '../api/client';

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
  route: any;
};

interface Staff {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  department?: string;
  designation?: string;
  phone_number?: string;
}

const StaffScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  
  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('teacher');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchStaff();
    }, [])
  );

  useEffect(() => {
    if (route.params?.openAddModal) {
      openAddModal();
      navigation.setParams({ openAddModal: undefined });
    }
  }, [route.params]);

  const fetchStaff = async () => {
    try {
      const response = await apiClient.get('/admin/staff');
      setStaffList(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setSelectedStaff(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setRole('teacher');
    setPassword('');
    setDepartment('');
    setDesignation('');
    setPhoneNumber('');
    setModalVisible(true);
  };

  const openEditModal = (staff: Staff) => {
    setIsEditing(true);
    setSelectedStaff(staff);
    setFirstName(staff.first_name);
    setLastName(staff.last_name);
    setEmail(staff.email);
    setRole(staff.role);
    setDepartment(staff.department || '');
    setDesignation(staff.designation || '');
    setPhoneNumber(staff.phone_number || '');
    setPassword('');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!firstName || !lastName || !email) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }
    setSaving(true);
    try {
      if (isEditing && selectedStaff) {
        await apiClient.put(`/admin/staff/${selectedStaff.id}`, {
          firstName, lastName, email, role, department, designation, phoneNumber,
          isActive: selectedStaff.is_active
        });
        Alert.alert('Success', 'Staff updated successfully');
      } else {
        if (!password) {
          Alert.alert('Error', 'Password is required for new staff');
          setSaving(false);
          return;
        }
        await apiClient.post('/admin/staff', {
          firstName, lastName, email, role, password, department, designation, phoneNumber
        });
        Alert.alert('Success', 'Staff added successfully');
      }
      setModalVisible(false);
      fetchStaff();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to save staff');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (staff: Staff) => {
    Alert.alert(
      'Deactivate Staff',
      `Are you sure you want to deactivate ${staff.first_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Deactivate', 
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/admin/staff/${staff.id}`);
              Alert.alert('Success', 'Staff deactivated');
              fetchStaff();
            } catch (error) {
              Alert.alert('Error', 'Failed to deactivate staff');
            }
          }
        }
      ]
    );
  };

  const renderStaff = ({ item, index }: { item: Staff, index: number }) => (
    <Animated.View 
      entering={FadeInDown.delay(index * 100).duration(500)}
      layout={Layout.springify()}
      className="bg-white p-5 rounded-3xl mb-4 flex-row items-center justify-between"
      style={{ shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}
    >
      <View className="flex-row flex-1">
        <View className={`w-14 h-14 rounded-full items-center justify-center mr-4 mt-1 ${item.is_active ? 'bg-indigo-100' : 'bg-slate-100'}`}>
          <Icon name={item.role === 'teacher' ? 'school' : 'briefcase'} size={24} color={item.is_active ? '#4F46E5' : '#94A3B8'} />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-slate-800" numberOfLines={1}>
            {item.first_name} {item.last_name}
          </Text>
            {!item.is_active && (
              <View className="ml-2 bg-red-100 px-2 py-1 rounded-md">
                <Text className="text-red-700 text-xs font-bold">Inactive</Text>
              </View>
            )}
          </View>
        </View>
      
      <View className="flex-row ml-2">
        <TouchableOpacity onPress={() => openEditModal(item)} className="p-2 bg-slate-50 rounded-full mr-2">
          <Icon name="pencil" size={20} color="#3B82F6" />
        </TouchableOpacity>
        {item.is_active && (
          <TouchableOpacity onPress={() => handleDelete(item)} className="p-2 bg-slate-50 rounded-full">
            <Icon name="trash" size={20} color="#EF4444" />
          </TouchableOpacity>
        )}
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
            <Text className="text-slate-800 text-2xl font-black">Manage Staff</Text>
            <Text className="text-slate-500 text-sm font-medium">{staffList.length} total members</Text>
          </View>
        </View>
      </Animated.View>

      {/* List */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : (
        <FlatList
          data={staffList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderStaff}
          contentContainerStyle={{ padding: 20, paddingBottom: 110 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center mt-20">
              <Icon name="people-outline" size={60} color="#CBD5E1" />
              <Text className="text-slate-400 mt-4 font-medium text-lg">No staff members found.</Text>
            </View>
          }
        />
      )}

      {/* Floating Add Button */}
      <Animated.View entering={FadeInUp.delay(300).duration(500)} className="absolute bottom-24 right-6">
        <TouchableOpacity 
          onPress={openAddModal}
          className="bg-indigo-600 w-16 h-16 rounded-full items-center justify-center"
          style={{ shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 }}
        >
          <Icon name="add" size={32} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-black text-slate-800">{isEditing ? 'Edit Staff' : 'Add New Staff'}</Text>
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
                    placeholder="John"
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </View>
                <View className="flex-1 pl-2">
                  <Text className="text-slate-600 font-bold mb-2 ml-1">Last Name</Text>
                  <TextInput 
                    className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 font-medium"
                    placeholder="Doe"
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>
              </View>

                <View className="mb-4">
                  <Text className="text-slate-600 font-bold mb-2 ml-1">Email Address *</Text>
                  <TextInput 
                    className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 font-medium"
                    placeholder="e.g. rahul@school.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {!isEditing && (
                  <View className="mb-4">
                    <Text className="text-slate-600 font-bold mb-2 ml-1">Password *</Text>
                    <TextInput 
                      className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 font-medium"
                      placeholder="Enter a secure password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                    />
                  </View>
                )}

                <View className="flex-row space-x-4 mb-4">
                  <View className="flex-1 pr-2">
                    <Text className="text-slate-600 font-bold mb-2 ml-1">Department</Text>
                    <TextInput 
                      className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 font-medium"
                      placeholder="e.g. Science"
                      value={department}
                      onChangeText={setDepartment}
                    />
                  </View>
                  <View className="flex-1 pl-2">
                    <Text className="text-slate-600 font-bold mb-2 ml-1">Designation</Text>
                    <TextInput 
                      className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 font-medium"
                      placeholder="e.g. HOD"
                      value={designation}
                      onChangeText={setDesignation}
                    />
                  </View>
                </View>

                <View className="mb-6">
                  <Text className="text-slate-600 font-bold mb-2 ml-1">Phone Number</Text>
                  <TextInput 
                    className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 font-medium"
                    placeholder="e.g. 9876543210"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                  />
                </View>

              <View className="mb-6">
                <Text className="text-slate-600 font-bold mb-2 ml-1">Role</Text>
                <View className="flex-row">
                  <TouchableOpacity 
                    onPress={() => setRole('teacher')}
                    className={`flex-1 py-3 items-center rounded-l-2xl border ${role === 'teacher' ? 'bg-indigo-50 border-indigo-500' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <Text className={`font-bold ${role === 'teacher' ? 'text-indigo-600' : 'text-slate-500'}`}>Teacher</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setRole('non_teaching_staff')}
                    className={`flex-1 py-3 items-center rounded-r-2xl border-t border-b border-r ${role === 'non_teaching_staff' ? 'bg-indigo-50 border-indigo-500' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <Text className={`font-bold ${role === 'non_teaching_staff' ? 'text-indigo-600' : 'text-slate-500'}`}>Other Staff</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity 
                onPress={handleSave}
                disabled={saving}
                className="bg-indigo-600 py-4 rounded-2xl items-center shadow-sm flex-row justify-center"
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Icon name="checkmark-circle" size={20} color="#fff" className="mr-2" />
                    <Text className="text-white font-bold text-lg ml-2">Save Staff Member</Text>
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

export default StaffScreen;
