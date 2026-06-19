import React from 'react';
import { View, Text, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

const TeacherDashboard: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    dispatch(logout() as any);
  };

  const features = [
    { title: 'My Classes', icon: 'business', screen: 'Classes', color: '#6366F1', bg: 'bg-indigo-50' },
    { title: 'Attendance', icon: 'checkmark-circle', screen: 'MarkAttendance', color: '#14B8A6', bg: 'bg-teal-50' },
    { title: 'Homework', icon: 'create', screen: 'CreateHomework', color: '#10B981', bg: 'bg-emerald-50' },
    { title: 'Lesson Plan', icon: 'book', screen: 'LessonPlan', color: '#10B981', bg: 'bg-emerald-50' },
    { title: 'Enter Marks', icon: 'create', screen: 'EnterMarks', color: '#F59E0B', bg: 'bg-amber-50' },
    { title: 'Parent Chats', icon: 'chatbubbles', screen: 'ChatList', color: '#3B82F6', bg: 'bg-blue-50' },
    { title: 'Notices', icon: 'megaphone', screen: 'Notice', color: '#F43F5E', bg: 'bg-rose-50' },
    { title: 'Leaves', icon: 'document-text', screen: 'Leaves', color: '#8B5CF6', bg: 'bg-purple-50' },
    { title: 'Timetable', icon: 'calendar-outline', screen: 'Timetable', color: '#EC4899', bg: 'bg-pink-50' },
    { title: 'Gallery', icon: 'images', screen: 'Gallery', color: '#F59E0B', bg: 'bg-amber-50' },
  ];

  return (
    <View className="flex-1 bg-slate-50" style={{ paddingTop: Math.max(insets.top, 10) }}>
      
      {/* Decorative Background Blob */}
      <View className="absolute w-[450px] h-[450px] bg-emerald-100 rounded-full opacity-60 -top-24 -right-10" />

      {/* Modern Profile Header */}
      <Animated.View entering={FadeInDown.duration(800)} className="px-6 py-4 flex-row justify-between items-center mb-4 z-10">
        <View className="flex-row items-center flex-1">
          <View className="w-14 h-14 bg-white rounded-full items-center justify-center shadow-sm mr-4" style={{ elevation: 5, shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2 }}>
            <Text className="text-2xl font-black text-emerald-600">T</Text>
          </View>
          <View>
            <Text className="text-gray-500 text-xs font-bold tracking-widest uppercase">Staff Portal</Text>
            <Text className="text-slate-800 text-2xl font-black mt-1">Dashboard</Text>
          </View>
        </View>
        <TouchableOpacity 
          onPress={handleLogout} 
          className="bg-white p-3 rounded-full"
          style={{ shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }}
        >
          <Icon name="power" size={24} color="#EF4444" />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView className="flex-1 px-6 z-10" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Upcoming Class Card */}
        <Animated.View entering={FadeInUp.delay(200).duration(800)}>
          <View 
            className="bg-emerald-600 w-full p-6 rounded-[30px] flex-row items-center justify-between mb-8"
            style={{ shadowColor: '#059669', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 10 }}
          >
            <View className="flex-1">
              <View className="bg-white/20 self-start px-3 py-1 rounded-full mb-2">
                <Text className="text-white text-xs font-bold uppercase tracking-wider">Next Class</Text>
              </View>
              <Text className="text-white text-2xl font-black">Grade 5A - Math</Text>
              <Text className="text-emerald-100 text-sm font-semibold mt-1">Starts in 15 mins</Text>
            </View>
            <TouchableOpacity className="bg-white p-4 rounded-full ml-4" style={{ shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 5 }} onPress={() => navigation.navigate('Timetable')}>
              <Icon name="time" size={28} color="#059669" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.Text entering={FadeInUp.delay(300).duration(800)} className="text-slate-800 text-xl font-black mb-4 ml-2 tracking-wide">
          Teacher Tools
        </Animated.Text>

        {/* Modern Grid */}
        <View className="flex-row flex-wrap justify-between">
          {features.map((item, index) => (
            <Animated.View key={index} entering={FadeInUp.delay(400 + (index * 50)).duration(600)} className="w-[48%] mb-4">
              <TouchableOpacity 
                className="bg-white p-5 rounded-[28px] items-center"
                style={{ 
                  shadowColor: item.color, 
                  shadowOffset: { width: 0, height: 8 }, 
                  shadowOpacity: 0.1, 
                  shadowRadius: 12, 
                  elevation: 5,
                }}
                onPress={() => navigation.navigate(item.screen)}
                activeOpacity={0.8}
              >
                <View className={`${item.bg} w-16 h-16 rounded-full items-center justify-center mb-3`}>
                  <Icon name={item.icon} size={28} color={item.color} />
                </View>
                <Text className="text-sm font-bold text-slate-700 text-center">
                  {item.title}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default TeacherDashboard;
