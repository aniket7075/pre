import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import apiClient from '../api/client';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any, any>; };

const NoticeScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState<any[]>([]);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await apiClient.get('/notices');
        if (response.data.data && response.data.data.length > 0) {
          setNotices(response.data.data);
        } else {
          // Fallback dummy data
          setNotices([
            { id: '1', title: 'Annual Sports Day', content: 'The annual sports day will be held on 15th Nov. All students must participate.', date: '2023-11-01' },
            { id: '2', title: 'Diwali Holidays', content: 'School will remain closed from 10th to 14th Nov for Diwali.', date: '2023-11-05' },
          ]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center p-5 bg-primary justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">Notice Board</Text>
        </View>
        <Icon name="megaphone" size={24} color="#fff" />
      </View>
      
      <View className="flex-1 p-5">
        {loading ? (
          <ActivityIndicator size="large" color="#4F46E5" />
        ) : (
          <FlatList
            data={notices}
            keyExtractor={(item: any) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View className="bg-card p-5 rounded-xl mb-4 shadow-sm border border-border">
                <View className="flex-row items-center mb-2">
                  <Icon name="notifications-outline" size={20} color="#F59E0B" className="mr-2" />
                  <Text className="text-lg font-bold text-primary flex-1">{item.title}</Text>
                </View>
                <Text className="text-textSecondary leading-6 mb-2">{item.content}</Text>
                <Text className="text-xs text-textSecondary text-right">{item.date}</Text>
              </View>
            )}
            ListEmptyComponent={
              <View className="items-center justify-center py-20">
                <Icon name="megaphone-outline" size={60} color="#E2E8F0" />
                <Text className="text-lg text-textSecondary mt-4">No new notices.</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default NoticeScreen;
