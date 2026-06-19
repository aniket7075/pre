import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { RootState } from '../store';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

const AdminDashboard: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout() as any);
  };

  const features = [
    { title: 'Manage Staff', icon: 'people', screen: 'Staff', color: '#6366F1', bg: 'bg-indigo-50' },
    { title: 'Students', icon: 'school', screen: 'Students', color: '#14B8A6', bg: 'bg-teal-50' },
    { title: 'Assign Fees', icon: 'cash', screen: 'AssignFee', color: '#10B981', bg: 'bg-emerald-50' },
    { title: 'Notice', icon: 'megaphone', screen: 'CreateNotice', color: '#F59E0B', bg: 'bg-amber-50' },
    { title: 'Transport', icon: 'bus', screen: 'Transport', color: '#F43F5E', bg: 'bg-rose-50' },
    { title: 'Chat', icon: 'chatbubbles', screen: 'ChatList', color: '#3B82F6', bg: 'bg-blue-50' },
    { title: 'Leaves', icon: 'document-text', screen: 'Leaves', color: '#8B5CF6', bg: 'bg-purple-50' },
    { title: 'Timetable', icon: 'calendar-outline', screen: 'Timetable', color: '#EC4899', bg: 'bg-pink-50' },
    { title: 'Gallery', icon: 'images', screen: 'Gallery', color: '#F59E0B', bg: 'bg-amber-50' },
    { title: 'Library', icon: 'library', screen: 'Library', color: '#10B981', bg: 'bg-emerald-50' },
    { title: 'Certificates', icon: 'ribbon', screen: 'Certificates', color: '#6366F1', bg: 'bg-indigo-50' },
  ];

  return (
    <View className="flex-1 bg-slate-50" style={{ paddingTop: Math.max(insets.top, 10) }}>
      
      {/* Decorative Background Blob */}
      <View className="absolute w-[500px] h-[500px] bg-blue-100 rounded-full opacity-50 -top-20 -right-20" />

      {/* Modern Profile Header */}
      <Animated.View entering={FadeInDown.duration(800)} className="px-6 py-4 flex-row justify-between items-center mb-4 z-10">
        <View className="flex-row items-center flex-1">
          <View className="w-14 h-14 bg-white rounded-full items-center justify-center shadow-sm mr-4" style={{ elevation: 5, shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2 }}>
            <Text className="text-2xl font-black text-blue-600">A</Text>
          </View>
          <View>
            <Text className="text-gray-500 text-xs font-bold tracking-widest uppercase">Admin Portal</Text>
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
        
        {/* Prominent Quick Action Card */}
        <Animated.View entering={FadeInUp.delay(200).duration(800)}>
          <TouchableOpacity 
            className="bg-blue-600 w-full p-6 rounded-[30px] flex-row items-center justify-between mb-8"
            style={{ shadowColor: '#2563EB', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 10 }}
            onPress={() => navigation.navigate('AddParentStudent')}
            activeOpacity={0.9}
          >
            <View className="flex-1">
              <View className="bg-white/20 self-start px-3 py-1 rounded-full mb-2">
                <Text className="text-white text-xs font-bold uppercase tracking-wider">Admission</Text>
              </View>
              <Text className="text-white text-2xl font-black">Add New Student</Text>
              <Text className="text-blue-100 text-sm font-semibold mt-1">Register parent & child</Text>
            </View>
            <View className="bg-white p-4 rounded-full ml-4" style={{ shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 5 }}>
              <Icon name="person-add" size={28} color="#2563EB" />
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.Text entering={FadeInUp.delay(300).duration(800)} className="text-slate-800 text-xl font-black mb-4 ml-2 tracking-wide">
          Management Tools
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

export default AdminDashboard;
