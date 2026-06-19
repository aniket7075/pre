import React, { useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import apiClient from '../api/client';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useFocusEffect } from '@react-navigation/native';

type Props = { navigation: NativeStackNavigationProp<any, any>; };

const NoticeScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState<any[]>([]);
  const { user } = useSelector((state: RootState) => state.auth);

  useFocusEffect(
    React.useCallback(() => {
      fetchNotices();
    }, [])
  );

  const fetchNotices = async () => {
    try {
      const response = await apiClient.get('/notices');
      if (response.data.data && response.data.data.length > 0) {
        setNotices(response.data.data);
      } else {
        setNotices([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderNotice = ({ item, index }: { item: any, index: number }) => (
    <Animated.View 
      entering={FadeInDown.delay(index * 100).duration(500)}
      layout={Layout.springify()}
      className="bg-white p-5 rounded-3xl mb-4"
      style={{ shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}
    >
      <View className="flex-row items-center mb-3">
        <View className="w-12 h-12 bg-amber-100 rounded-full items-center justify-center mr-3">
          <Icon name="megaphone" size={24} color="#D97706" />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-slate-800">{item.title}</Text>
          <View className="flex-row items-center mt-1">
            <Icon name="calendar" size={14} color="#94A3B8" />
            <Text className="text-xs text-slate-500 font-bold ml-1">{item.date}</Text>
            {item.audience && item.audience !== 'all' && (
              <View className="bg-slate-100 px-2 py-0.5 rounded ml-2">
                <Text className="text-[10px] text-slate-500 font-bold uppercase">{item.audience}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      
      <View className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <Text className="text-slate-600 leading-6 font-medium">{item.content}</Text>
      </View>
    </Animated.View>
  );

  const canCreateNotice = user?.role === 'super_admin' || user?.role === 'school_admin' || user?.role === 'teacher';

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
            <Text className="text-slate-800 text-2xl font-black">Notice Board</Text>
            <Text className="text-slate-500 text-sm font-medium">{notices.length} latest notices</Text>
          </View>
        </View>
      </Animated.View>
      
      <View className="flex-1">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#D97706" />
          </View>
        ) : (
          <FlatList
            data={notices}
            keyExtractor={(item: any) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
            renderItem={renderNotice}
            ListEmptyComponent={
              <View className="items-center justify-center py-20 mt-10">
                <View className="w-24 h-24 bg-slate-100 rounded-full items-center justify-center mb-4">
                  <Icon name="notifications-off" size={40} color="#CBD5E1" />
                </View>
                <Text className="text-lg font-bold text-slate-400">No active notices.</Text>
              </View>
            }
          />
        )}
      </View>

      {/* Floating Add Button */}
      {canCreateNotice && (
        <Animated.View entering={FadeInUp.delay(300).duration(500)} className="absolute bottom-6 right-6">
          <TouchableOpacity 
            onPress={() => navigation.navigate('CreateNotice')}
            className="bg-amber-500 w-16 h-16 rounded-full items-center justify-center"
            style={{ shadowColor: '#D97706', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 }}
          >
            <Icon name="add" size={32} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

export default NoticeScreen;
