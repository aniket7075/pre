import React from 'react';
import { View, Text, TouchableOpacity, Dimensions, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

const AdminDashboard: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    dispatch(logout() as any);
  };

  const features = [
    { title: 'Manage Staff', icon: 'people', screen: 'Staff', color: '#6366F1', bg: 'bg-indigo-50' },
    { title: 'Manage Students', icon: 'school', screen: 'Students', color: '#14B8A6', bg: 'bg-teal-50' },
    { title: 'Assign Fees', icon: 'cash', screen: 'AssignFee', color: '#10B981', bg: 'bg-emerald-50' },
    { title: 'Publish Notice', icon: 'megaphone', screen: 'CreateNotice', color: '#F59E0B', bg: 'bg-amber-50' },
    { title: 'Transport', icon: 'bus', screen: 'Transport', color: '#F43F5E', bg: 'bg-rose-50' },
    { title: 'Global Chat', icon: 'chatbubbles', screen: 'Chat', color: '#3B82F6', bg: 'bg-blue-50' },
    { title: 'Progress', icon: 'trending-up', screen: 'Progress', color: '#A855F7', bg: 'bg-purple-50' },
  ];

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: Math.max(insets.top, 20) }}>
      {/* Sleek Modern Header */}
      <View className="px-6 py-4 flex-row justify-between items-center mb-2">
        <View>
          <Text className="text-textSecondary text-sm font-semibold tracking-widest uppercase">Admin Panel</Text>
          <Text className="text-textPrimary text-3xl font-black mt-1">Dashboard</Text>
        </View>
        <TouchableOpacity 
          onPress={handleLogout} 
          className="bg-gray-100 p-3 rounded-full shadow-sm"
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 }}
        >
          <Icon name="log-out-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Prominent Quick Action */}
        <TouchableOpacity 
          className="bg-primary w-full p-5 rounded-3xl flex-row items-center justify-between mb-8"
          style={{ shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 }}
          onPress={() => navigation.navigate('AddParentStudent')}
          activeOpacity={0.8}
        >
          <View className="flex-1">
            <Text className="text-white/80 text-sm font-bold uppercase tracking-wider mb-1">New Admission</Text>
            <Text className="text-white text-xl font-bold">Add Parent & Students</Text>
          </View>
          <View className="bg-white/20 p-3 rounded-2xl ml-4">
            <Icon name="person-add" size={28} color="#fff" />
          </View>
        </TouchableOpacity>

        <Text className="text-textPrimary text-xl font-bold mb-4 ml-1">Quick Actions</Text>

        {/* Modern Grid */}
        <View className="flex-row flex-wrap justify-between pb-10">
          {features.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              className="bg-white w-[48%] p-5 rounded-3xl items-center mb-4"
              style={{ 
                shadowColor: '#000', 
                shadowOffset: { width: 0, height: 4 }, 
                shadowOpacity: 0.06, 
                shadowRadius: 12, 
                elevation: 3,
                borderWidth: 1,
                borderColor: 'rgba(0,0,0,0.02)'
              }}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.7}
            >
              <View className={`${item.bg} p-4 rounded-2xl mb-3`}>
                <Icon name={item.icon} size={30} color={item.color} />
              </View>
              <Text className="text-sm font-bold text-textPrimary text-center">
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default AdminDashboard;

