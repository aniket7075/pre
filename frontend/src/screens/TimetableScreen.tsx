import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import apiClient from '../api/client';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any, any>; };

const TimetableScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [timetable, setTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('Monday');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const fetchTimetable = async () => {
    try {
      // Mocking grade '1st Grade' for demo
      const response = await apiClient.get('/timetable/1st%20Grade');
      setTimetable(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  const filteredTimetable = timetable.filter(t => t.day_of_week === selectedDay);

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: Math.max(insets.top, 10) }}>
      <View className="flex-row items-center px-6 py-4 mb-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="bg-gray-50 p-3 rounded-full mr-4">
          <Icon name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-textPrimary text-2xl font-black">Timetable</Text>
      </View>

      <View className="px-5 mb-4">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={days}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => setSelectedDay(item)}
              className={`mr-3 px-5 py-2 rounded-full border ${selectedDay === item ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
            >
              <Text className={`font-bold ${selectedDay === item ? 'text-white' : 'text-gray-600'}`}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4F46E5" className="mt-10" />
      ) : (
        <FlatList
          data={filteredTimetable}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <View className="bg-gray-50 p-4 rounded-2xl mb-3 flex-row items-center border border-gray-100">
              <View className="bg-indigo-100 w-12 h-12 rounded-xl items-center justify-center mr-4">
                <Text className="text-primary font-black text-lg">{item.period_number}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-textPrimary">{item.subject}</Text>
                <Text className="text-gray-500 text-sm">
                  <Icon name="time-outline" size={12} /> {item.start_time} - {item.end_time}
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View className="items-center justify-center mt-20">
              <Icon name="calendar-outline" size={60} color="#E2E8F0" />
              <Text className="text-gray-400 mt-4 font-semibold">No classes scheduled for {selectedDay}</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default TimetableScreen;
