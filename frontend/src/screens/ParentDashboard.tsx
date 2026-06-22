import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, ScrollView, ActivityIndicator, Image, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { logout, setActiveChild } from '../store/slices/authSlice';
import { RootState } from '../store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import KidsBackground from '../components/KidsBackground';
import apiClient, { BASE_URL } from '../api/client';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

const ParentDashboard: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { user, activeChild } = useSelector((state: RootState) => state.auth);
  
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    dispatch(logout() as any);
  };

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const response = await apiClient.get('/users/children');
        setChildren(response.data);
        if (response.data.length > 0 && !activeChild) {
          dispatch(setActiveChild(response.data[0]));
        }
      } catch (error) {
        console.error('Failed to fetch children', error);
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, []);

  const selectChild = (child: any) => {
    dispatch(setActiveChild(child));
  };

  const features = [
    { title: 'Attendance', icon: 'calendar', screen: 'Attendance', color: '#8B5CF6', bg: 'bg-purple-50' },
    { title: 'Homework', icon: 'book', screen: 'Homework', color: '#14B8A6', bg: 'bg-teal-50' },
    { title: 'Fees', icon: 'cash', screen: 'Fees', color: '#10B981', bg: 'bg-emerald-50' },
    { title: 'Transport', icon: 'bus', screen: 'Transport', color: '#F43F5E', bg: 'bg-rose-50' },
    { title: 'Chat', icon: 'chatbubbles', screen: 'ChatList', color: '#F43F5E', bg: 'bg-rose-50' },
    { title: 'Leaves', icon: 'document-text', screen: 'Leaves', color: '#8B5CF6', bg: 'bg-purple-50' },
    { title: 'Timetable', icon: 'calendar-outline', screen: 'Timetable', color: '#EC4899', bg: 'bg-pink-50' },
    { title: 'Gallery', icon: 'images', screen: 'Gallery', color: '#F59E0B', bg: 'bg-amber-50' },
    { title: 'Library', icon: 'library', screen: 'Library', color: '#10B981', bg: 'bg-emerald-50' },
    { title: 'Certificates', icon: 'ribbon', screen: 'Certificates', color: '#8B5CF6', bg: 'bg-purple-50' },
    { title: 'Results', icon: 'stats-chart', screen: 'Result', color: '#3B82F6', bg: 'bg-blue-50' },
    { title: 'My Profile', icon: 'person-circle', screen: 'ParentProfile', color: '#7C3AED', bg: 'bg-violet-50' },
  ];

  return (
    <View className="flex-1 bg-slate-50" style={{ paddingTop: Math.max(insets.top, 10) }}>
      <KidsBackground />
      
      {/* Decorative Background Blob */}
      <View pointerEvents="none" className="absolute w-[400px] h-[400px] bg-pink-100 rounded-full opacity-60 -top-20 -left-20" />

      {/* Modern Profile Header */}
      <Animated.View entering={FadeInDown.duration(800)} className="px-6 py-4 flex-row justify-between items-center mb-2 z-10">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity 
            onPress={() => navigation.navigate('ParentProfile')}
            className="w-14 h-14 bg-white rounded-full items-center justify-center shadow-sm mr-4" 
            style={{ elevation: 5, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2 }}
          >
            <Text className="text-2xl font-black text-purple-600">{user?.firstName?.[0]?.toUpperCase() || 'P'}</Text>
          </TouchableOpacity>
          <View>
            <Text className="text-gray-500 text-xs font-bold tracking-widest uppercase">Parent Portal</Text>
            <Text className="text-slate-800 text-2xl font-black mt-1">My Dashboard</Text>
          </View>
        </View>
        <TouchableOpacity 
          onPress={() => navigation.navigate('ParentProfile')} 
          className="bg-white p-3 rounded-full"
          style={{ shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }}
        >
          <Icon name="person-circle-outline" size={24} color="#7C3AED" />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView className="flex-1 z-10" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* Child Switcher Section */}
        <Animated.View entering={FadeInDown.delay(100).duration(800)} className="mb-6 mt-2">
          <Text className="text-slate-800 text-lg font-black px-6 mb-3 tracking-wide">My Wards</Text>
          {loading ? (
            <ActivityIndicator size="small" color="#7C3AED" />
          ) : children.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }} className="py-2">
              {children.map((child, index) => {
                const isActive = activeChild?.id === child.id;
                return (
                  <TouchableOpacity 
                    key={child.id}
                    onPress={() => selectChild(child)}
                    className={`mr-4 items-center p-3 rounded-3xl ${isActive ? 'bg-purple-100 border border-purple-300' : 'bg-white'}`}
                    style={isActive ? undefined : { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 }}
                  >
                    <View className={`w-16 h-16 rounded-full items-center justify-center overflow-hidden mb-2 ${isActive ? 'border-4 border-purple-500' : 'bg-slate-100'}`}>
                      {child.profile_image_url ? (
                        <Image source={{ uri: `${BASE_URL}${child.profile_image_url}` }} className="w-full h-full" resizeMode="cover" />
                      ) : (
                        <Icon name="person" size={32} color={isActive ? '#7C3AED' : '#94A3B8'} />
                      )}
                    </View>
                    <Text className={`font-bold text-sm ${isActive ? 'text-purple-700' : 'text-slate-600'}`}>{child.first_name}</Text>
                    <Text className="text-[10px] text-slate-400 font-bold uppercase">{child.grade}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            <Text className="text-slate-500 px-6 italic">No children registered yet.</Text>
          )}
        </Animated.View>

        {/* Active Child Summary Card */}
        <View className="px-6">
          <Animated.View entering={FadeInUp.delay(200).duration(800)}>
            <View 
              className="bg-primary w-full p-6 rounded-[30px] flex-row items-center justify-between mb-8"
              style={{ shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 10 }}
            >
              <View className="flex-1">
                <View className="bg-white/20 self-start px-3 py-1 rounded-full mb-2 flex-row items-center">
                  <Icon name="person-circle" size={14} color="#fff" />
                  <Text className="text-white text-xs font-bold uppercase tracking-wider ml-1">Viewing</Text>
                </View>
                {activeChild ? (
                  <>
                    <Text className="text-white text-2xl font-black">{activeChild.first_name} {activeChild.last_name}</Text>
                    <Text className="text-purple-100 text-sm font-semibold mt-1">Grade {activeChild.grade} | ADM: {activeChild.admission_number}</Text>
                  </>
                ) : (
                  <>
                    <Text className="text-white text-xl font-black">No Active Child</Text>
                    <Text className="text-purple-100 text-sm mt-1">Select a child from the list</Text>
                  </>
                )}
              </View>
              <TouchableOpacity 
                className="bg-white p-4 rounded-full ml-4" 
                style={{ shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 5 }} 
                onPress={() => navigation.navigate('Result')}
              >
                <Icon name="stats-chart" size={28} color="#7C3AED" />
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.Text entering={FadeInUp.delay(300).duration(800)} className="text-slate-800 text-xl font-black mb-4 ml-2 tracking-wide">
            Academics & More
          </Animated.Text>

          {/* Modern Grid */}
          <View className="flex-row flex-wrap justify-between">
            {features.map((item, index) => (
              <Animated.View key={index} entering={FadeInUp.delay(400 + (index * 50)).duration(600)} className="w-[48%] mb-4">
                <TouchableOpacity 
                  className="bg-white p-3 rounded-2xl items-center"
                  style={{ 
                    shadowColor: item.color, 
                    shadowOffset: { width: 0, height: 4 }, 
                    shadowOpacity: 0.08, 
                    shadowRadius: 8, 
                    elevation: 3,
                  }}
                  onPress={() => {
                    if (item.screen === 'ParentProfile') {
                      navigation.navigate(item.screen);
                      return;
                    }
                    if (!activeChild) {
                       Alert.alert("Error", "Please select a child first.");
                       return;
                    }
                    navigation.navigate(item.screen)
                  }}
                  activeOpacity={0.8}
                >
                  <View className={`${item.bg} w-11 h-11 rounded-xl items-center justify-center mb-2`}>
                    <Icon name={item.icon} size={20} color={item.color} />
                  </View>
                  <Text className="text-xs font-bold text-slate-700 text-center">
                    {item.title}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ParentDashboard;
