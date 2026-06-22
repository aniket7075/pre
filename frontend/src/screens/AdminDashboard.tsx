import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { RootState } from '../store';
import KidsBackground from '../components/KidsBackground';
import apiClient from '../api/client';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

interface Stats {
  totalStudents: number;
  totalTeachers: number;
  todayAttendance: string;
  pendingFees: number;
  recentActivities: Array<{ action: string; entityType: string; createdAt: string }>;
}

const AdminDashboard: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { user } = useSelector((state: RootState) => state.auth);

  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogout = () => {
    dispatch(logout() as any);
  };

  const handleNavigate = (screen: string) => {
    try {
      navigation.navigate(screen as any);
    } catch (err) {
      console.error('Navigation error:', err);
      Alert.alert('Navigation Error', `Unable to open ${screen}`);
    }
  };

  const handleDeleteAll = async () => {
    try {
      setErrorMessage(null);
      const response = await apiClient.delete('/admin/delete-all');
      if (response.status === 200) {
        Alert.alert('Success', 'All items deleted successfully');
      } else {
        setErrorMessage('Failed to delete items');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setErrorMessage('Delete request failed');
    }
  };

  const fetchStats = async () => {
    try {
      setErrorMessage(null);
      const response = await apiClient.get('/admin/dashboard-stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
      setErrorMessage('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchStats();
    }, [])
  );

  const academicFeatures = [
    { title: 'Manage Classes', icon: 'business', screen: 'Classes', color: '#10B981', bg: 'bg-emerald-50' },
    { title: 'Timetable', icon: 'calendar-outline', screen: 'Timetable', color: '#EC4899', bg: 'bg-pink-50' },
    { title: 'Certificates', icon: 'ribbon', screen: 'Certificates', color: '#8B5CF6', bg: 'bg-purple-50' },
    { title: 'Student Notes', icon: 'document-text', screen: 'Notes', color: '#F59E0B', bg: 'bg-amber-50' },
  ];

  const operationalFeatures = [
    { title: 'Staff Directory', icon: 'people', screen: 'Staff', color: '#8B5CF6', bg: 'bg-purple-50' },
    { title: 'Student Directory', icon: 'school', screen: 'Students', color: '#14B8A6', bg: 'bg-teal-50' },
    { title: 'Transport Routes', icon: 'bus', screen: 'Transport', color: '#F43F5E', bg: 'bg-rose-50' },
    { title: 'Assign Fees', icon: 'cash', screen: 'AssignFee', color: '#10B981', bg: 'bg-emerald-50' },
  ];

  const communicationFeatures = [
    { title: 'Notices', icon: 'megaphone', screen: 'Notice', color: '#F59E0B', bg: 'bg-amber-50' },
    { title: 'Chat Portal', icon: 'chatbubbles', screen: 'ChatList', color: '#F43F5E', bg: 'bg-rose-50' },
    { title: 'Library Books', icon: 'library', screen: 'Library', color: '#10B981', bg: 'bg-emerald-50' },
    { title: 'School Gallery', icon: 'images', screen: 'Gallery', color: '#F59E0B', bg: 'bg-amber-50' },
    { title: 'Leave Approvals', icon: 'document-text', screen: 'Leaves', color: '#8B5CF6', bg: 'bg-purple-50' },
  ];

  const renderGridSection = (title: string, list: typeof academicFeatures) => (
    <View className="mb-6">
      <Text className="text-slate-800 text-lg font-black mb-3 ml-2 tracking-wide">{title}</Text>
      <View className="flex-row flex-wrap justify-between">
        {list.map((item, index) => (
          <TouchableOpacity
            key={index}
            className="w-[48%] bg-white p-3 rounded-2xl items-center mb-3"
            style={{
              shadowColor: item.color,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 2,
            }}
            onPress={() => handleNavigate(item.screen)}
            activeOpacity={0.8}
          >
            <View className={`${item.bg} w-11 h-11 rounded-xl items-center justify-center mb-2`}>
              <Icon name={item.icon} size={20} color={item.color} />
            </View>
            <Text className="text-xs font-bold text-slate-700 text-center">{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-slate-50" style={{ paddingTop: Math.max(insets.top, 10) }}>
      <KidsBackground />

      {/* Decorative Background Blob */}
      <View pointerEvents="none" className="absolute w-[500px] h-[500px] bg-amber-100 rounded-full opacity-50 -top-20 -right-20" />

      {/* Header */}
      <Animated.View entering={FadeInDown.duration(800)} className="px-6 py-4 flex-row justify-between items-center mb-2 z-10">
        <View className="flex-row items-center flex-1">
          <View className="w-14 h-14 bg-white rounded-full items-center justify-center shadow-sm mr-4" style={{ elevation: 5, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2 }}>
            <Text className="text-2xl font-black text-purple-600">A</Text>
          </View>
          <View>
            <Text className="text-gray-500 text-xs font-bold tracking-widest uppercase">Admin Portal</Text>
            <Text className="text-slate-800 text-2xl font-black mt-1">Dashboard</Text>
          </View>
        </View>
        {/* Logout */}
        <TouchableOpacity onPress={handleLogout} className="bg-white p-3 rounded-full" style={{ shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }}>
          <Icon name="power" size={24} color="#EF4444" />
        </TouchableOpacity>

      </Animated.View>

      <ScrollView className="flex-1 px-6 z-10" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>
        {/* Statistics Cards Grid */}
        <Animated.View entering={FadeInUp.delay(100).duration(800)} className="mb-6">
          <Text className="text-slate-800 text-lg font-black mb-3 ml-2 tracking-wide">School Overview</Text>
          {loading ? (
            <ActivityIndicator size="small" color="#8B6CF6" />
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {/* Card 1: Students */}
              <View className="w-[48%] bg-white p-4 rounded-2xl mb-3 flex-row items-center" style={{ elevation: 2, shadowColor: '#10B981', shadowOpacity: 0.05, shadowRadius: 5 }}>
                <View className="w-10 h-10 rounded-xl bg-emerald-50 items-center justify-center mr-3">
                  <Icon name="people" size={20} color="#10B981" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-medium text-slate-400">Students</Text>
                  <Text className="text-lg font-black text-slate-800">{stats?.totalStudents || 0}</Text>
                </View>
              </View>

              {/* Card 2: Teachers */}
              <View className="w-[48%] bg-white p-4 rounded-2xl mb-3 flex-row items-center" style={{ elevation: 2, shadowColor: '#8B5CF6', shadowOpacity: 0.05, shadowRadius: 5 }}>
                <View className="w-10 h-10 rounded-xl bg-purple-50 items-center justify-center mr-3">
                  <Icon name="school" size={20} color="#8B5CF6" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-medium text-slate-400">Teachers</Text>
                  <Text className="text-lg font-black text-slate-800">{stats?.totalTeachers || 0}</Text>
                </View>
              </View>

              {/* Card 3: Attendance */}
              <View className="w-[48%] bg-white p-4 rounded-2xl mb-3 flex-row items-center" style={{ elevation: 2, shadowColor: '#14B8A6', shadowOpacity: 0.05, shadowRadius: 5 }}>
                <View className="w-10 h-10 rounded-xl bg-teal-50 items-center justify-center mr-3">
                  <Icon name="calendar" size={20} color="#14B8A6" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-medium text-slate-400">Attendance</Text>
                  <Text className="text-sm font-black text-slate-800">{stats?.todayAttendance || '0/0'}</Text>
                </View>
              </View>

              {/* Card 4: Dues */}
              <View className="w-[48%] bg-white p-4 rounded-2xl mb-3 flex-row items-center" style={{ elevation: 2, shadowColor: '#F59E0B', shadowOpacity: 0.05, shadowRadius: 5 }}>
                <View className="w-10 h-10 rounded-xl bg-amber-50 items-center justify-center mr-3">
                  <Icon name="cash" size={20} color="#F59E0B" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-medium text-slate-400">Fee Dues</Text>
                  <Text className="text-sm font-black text-slate-800">₹{stats?.pendingFees?.toLocaleString() || 0}</Text>
                </View>
              </View>
            </View>
          )}
        </Animated.View>

        {/* Quick Actions Row */}
        <Animated.View entering={FadeInUp.delay(200).duration(800)} className="mb-6">
          <Text className="text-slate-800 text-lg font-black mb-3 ml-2 tracking-wide">Quick ERP Actions</Text>
          <View className="flex-row justify-between bg-white p-4 rounded-3xl" style={{ elevation: 3, shadowColor: '#8B5CF6', shadowOpacity: 0.08, shadowRadius: 10 }}>
            {/* Action 1: Add Student */}
            <TouchableOpacity onPress={() => navigation.navigate('AddParentStudent')} className="items-center flex-1">
              <View className="w-12 h-12 rounded-2xl bg-teal-50 items-center justify-center mb-2">
                <Icon name="person-add" size={22} color="#14B8A6" />
              </View>
              <Text className="text-[11px] font-black text-slate-700 text-center">Add Student</Text>
            </TouchableOpacity>
            <View className="w-[1px] h-10 bg-slate-100 self-center" />
            {/* Action 2: Add Teacher */}
            <TouchableOpacity onPress={() => navigation.navigate('Staff', { openAddModal: true })} className="items-center flex-1">
              <View className="w-12 h-12 rounded-2xl bg-purple-50 items-center justify-center mb-2">
                <Icon name="people-circle" size={24} color="#8B5CF6" />
              </View>
              <Text className="text-[11px] font-black text-slate-700 text-center">Add Teacher</Text>
            </TouchableOpacity>
            <View className="w-[1px] h-10 bg-slate-100 self-center" />
            {/* Action 3: Collect Fees */}
            <TouchableOpacity onPress={() => navigation.navigate('AssignFee')} className="items-center flex-1">
              <View className="w-12 h-12 rounded-2xl bg-rose-50 items-center justify-center mb-2">
                <Icon name="card" size={22} color="#F43F5E" />
              </View>
              <Text className="text-[11px] font-black text-slate-700 text-center">Collect Fees</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Feature Sections */}
        <Animated.View entering={FadeInUp.delay(300).duration(800)}>
          {renderGridSection('Academics & Classes', academicFeatures)}
          {renderGridSection('Operations & Management', operationalFeatures)}
          {renderGridSection('Communication & Albums', communicationFeatures)}
        </Animated.View>

        {/* Recent Activities Section */}
        <Animated.View entering={FadeInUp.delay(400).duration(800)} className="mb-4">
          <Text className="text-slate-800 text-lg font-black mb-3 ml-2 tracking-wide">Recent Activities</Text>
          <View className="bg-white p-5 rounded-3xl" style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 }}>
            {loading ? (
              <ActivityIndicator size="small" color="#8B5CF6" />
            ) : stats?.recentActivities && stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((act, i) => (
                <View key={i} className="flex-row items-center py-2.5 border-b border-slate-50 last:border-b-0">
                  <View className="w-8 h-8 rounded-lg bg-slate-50 items-center justify-center mr-3">
                    <Icon
                      name={
                        act.entityType === 'Settings'
                          ? 'settings-outline'
                          : act.entityType === 'Class'
                          ? 'business-outline'
                          : act.entityType === 'Fees'
                          ? 'cash-outline'
                          : 'notifications-outline'
                      }
                      size={16}
                      color="#64748B"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-bold text-slate-700">{act.action}</Text>
                    <Text className="text-[10px] text-slate-400 font-medium mt-0.5">
                      {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | {act.entityType}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text className="text-slate-400 italic text-center py-4">No recent activity logs.</Text>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

export default AdminDashboard;
