import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import apiClient from '../api/client';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import KidsBackground from '../components/KidsBackground';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

type Props = { navigation: NativeStackNavigationProp<any, any>; };

interface TimetableEntry {
  id: string;
  grade: string;
  day_of_week: string;
  period_number: number;
  subject: string;
  start_time: string;
  end_time: string;
}

const TimetableScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'super_admin' || user?.role === 'school_admin' || user?.role === 'teacher';

  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  const grades = ['Playgroup', 'Nursery', 'Jr KG', 'Sr KG'];
  const [selectedGrade, setSelectedGrade] = useState('Nursery');
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const [selectedDay, setSelectedDay] = useState('Monday');

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  // Form states
  const [subject, setSubject] = useState('');
  const [periodNumber, setPeriodNumber] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/timetable/${encodeURIComponent(selectedGrade)}`);
      setTimetable(response.data.data);
    } catch (error) {
      console.error(error);
      setTimetable([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, [selectedGrade]);

  const openAddModal = () => {
    setIsEditing(false);
    setSelectedEntryId(null);
    setSubject('');
    setPeriodNumber('');
    setStartTime('');
    setEndTime('');
    setModalVisible(true);
  };

  const openEditModal = (entry: TimetableEntry) => {
    setIsEditing(true);
    setSelectedEntryId(entry.id);
    setSubject(entry.subject);
    setPeriodNumber(entry.period_number.toString());
    setStartTime(entry.start_time);
    setEndTime(entry.end_time);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!subject || !periodNumber || !startTime || !endTime) {
      Alert.alert('Validation Error', 'Please fill in all fields');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        grade: selectedGrade,
        day_of_week: selectedDay,
        period_number: parseInt(periodNumber),
        subject,
        start_time: startTime,
        end_time: endTime
      };

      if (isEditing && selectedEntryId) {
        await apiClient.put(`/timetable/${selectedEntryId}`, payload);
        Alert.alert('Success', 'Timetable entry updated successfully');
      } else {
        await apiClient.post('/timetable', payload);
        Alert.alert('Success', 'Timetable entry created successfully');
      }
      setModalVisible(false);
      fetchTimetable();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to save timetable entry');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (entry: TimetableEntry) => {
    Alert.alert(
      'Delete Entry',
      `Are you sure you want to delete Period ${entry.period_number} (${entry.subject})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/timetable/${entry.id}`);
              Alert.alert('Success', 'Timetable entry deleted');
              fetchTimetable();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.error || 'Failed to delete entry');
            }
          }
        }
      ]
    );
  };

  const filteredTimetable = timetable
    .filter(t => t.day_of_week === selectedDay)
    .sort((a, b) => a.period_number - b.period_number);

  const renderPeriod = ({ item }: { item: TimetableEntry }) => (
    <View className="bg-white p-4 rounded-3xl mb-3 flex-row items-center border border-slate-100" style={{ elevation: 2, shadowColor: '#EC4899', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 5 }}>
      <View className="bg-pink-50 w-12 h-12 rounded-2xl items-center justify-center mr-4">
        <Text className="text-pink-600 font-black text-lg">{item.period_number}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-lg font-bold text-slate-800">{item.subject}</Text>
        <Text className="text-slate-500 text-xs font-semibold mt-0.5">
          <Icon name="time-outline" size={12} /> {item.start_time} - {item.end_time}
        </Text>
      </View>
      {isAdmin && (
        <View className="flex-row">
          <TouchableOpacity onPress={() => openEditModal(item)} className="p-2 bg-slate-50 rounded-full mr-2">
            <Icon name="pencil" size={18} color="#8B5CF6" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item)} className="p-2 bg-slate-50 rounded-full">
            <Icon name="trash" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-slate-50" style={{ paddingTop: Math.max(insets.top, 10) }}>
      <KidsBackground />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 mb-2 bg-white/80">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="bg-white w-12 h-12 rounded-full items-center justify-center mr-4 shadow-sm">
            <Icon name="arrow-back" size={24} color="#334155" />
          </TouchableOpacity>
          <View>
            <Text className="text-slate-800 text-2xl font-black">Timetable</Text>
            <Text className="text-slate-500 text-sm font-medium">Class Schedules</Text>
          </View>
        </View>
        <Icon name="calendar" size={24} color="#EC4899" />
      </View>

      {/* Grade Selector */}
      <View className="px-5 mb-3">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={grades}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => setSelectedGrade(item)}
              className={`mr-3 px-5 py-2.5 rounded-2xl border ${selectedGrade === item ? 'bg-pink-500 border-pink-500' : 'bg-white border-slate-200'}`}
              style={selectedGrade === item ? { elevation: 3, shadowColor: '#EC4899', shadowOpacity: 0.2, shadowRadius: 5 } : undefined}
            >
              <Text className={`font-bold ${selectedGrade === item ? 'text-white' : 'text-slate-600'}`}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Day Selector */}
      <View className="px-5 mb-4">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={days}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => setSelectedDay(item)}
              className={`mr-2.5 px-4 py-2 rounded-xl border ${selectedDay === item ? 'bg-purple-100 border-purple-300' : 'bg-white border-slate-100'}`}
            >
              <Text className={`font-bold text-xs ${selectedDay === item ? 'text-purple-700' : 'text-slate-500'}`}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#EC4899" className="mt-10" />
      ) : (
        <View className="flex-1 px-5">
          <FlatList
            data={filteredTimetable}
            keyExtractor={item => item.id}
            renderItem={renderPeriod}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={
              <View className="items-center justify-center mt-20">
                <Icon name="calendar-outline" size={60} color="#CBD5E1" />
                <Text className="text-slate-400 mt-4 font-semibold text-center">No periods scheduled for {selectedDay} in {selectedGrade}.</Text>
              </View>
            }
          />
        </View>
      )}

      {/* Floating Add Period Button */}
      {isAdmin && (
        <TouchableOpacity 
          onPress={openAddModal}
          className="absolute bottom-6 right-6 bg-pink-500 w-16 h-16 rounded-full items-center justify-center shadow-lg"
          style={{ shadowColor: '#EC4899', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 8 }}
        >
          <Icon name="add" size={32} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-black text-slate-800">{isEditing ? 'Edit Period' : 'Add Period'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2 bg-slate-100 rounded-full">
                <Icon name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="mb-4">
                <Text className="text-slate-600 font-bold mb-2 ml-1">Class / Grade</Text>
                <TextInput 
                  className="bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-400 font-bold"
                  value={selectedGrade}
                  editable={false}
                />
              </View>

              <View className="mb-4">
                <Text className="text-slate-600 font-bold mb-2 ml-1">Day of Week</Text>
                <TextInput 
                  className="bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-400 font-bold"
                  value={selectedDay}
                  editable={false}
                />
              </View>

              <View className="flex-row space-x-4 mb-4">
                <View className="flex-1 pr-2">
                  <Text className="text-slate-600 font-bold mb-2 ml-1">Subject / Activity *</Text>
                  <TextInput 
                    className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 font-medium"
                    placeholder="e.g. Drawing, Rhymes, Math"
                    value={subject}
                    onChangeText={setSubject}
                  />
                </View>
                <View className="flex-1 pl-2">
                  <Text className="text-slate-600 font-bold mb-2 ml-1">Period Number *</Text>
                  <TextInput 
                    className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 font-medium"
                    placeholder="e.g. 1, 2, 3"
                    value={periodNumber}
                    onChangeText={setPeriodNumber}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View className="flex-row space-x-4 mb-6">
                <View className="flex-1 pr-2">
                  <Text className="text-slate-600 font-bold mb-2 ml-1">Start Time *</Text>
                  <TextInput 
                    className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 font-medium"
                    placeholder="e.g. 08:30 AM"
                    value={startTime}
                    onChangeText={setStartTime}
                  />
                </View>
                <View className="flex-1 pl-2">
                  <Text className="text-slate-600 font-bold mb-2 ml-1">End Time *</Text>
                  <TextInput 
                    className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 font-medium"
                    placeholder="e.g. 09:15 AM"
                    value={endTime}
                    onChangeText={setEndTime}
                  />
                </View>
              </View>

              <TouchableOpacity 
                onPress={handleSave}
                disabled={saving}
                className="bg-pink-500 py-4 rounded-2xl items-center shadow-sm flex-row justify-center mb-6"
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Icon name="checkmark-circle" size={20} color="#fff" className="mr-2" />
                    <Text className="text-white font-bold text-lg ml-2">{isEditing ? 'Save Changes' : 'Create Entry'}</Text>
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

export default TimetableScreen;
