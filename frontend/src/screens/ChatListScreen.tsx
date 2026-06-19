import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import apiClient from '../api/client';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any, any>; };

const ChatListScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);

  const fetchRooms = async () => {
    try {
      const response = await apiClient.get('/chat/rooms');
      setRooms(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRooms();
  };

  const handleCreateDemoRoom = async () => {
    // For demo purposes, if no rooms exist, we let them create one with a dummy user
    try {
      setLoading(true);
      const teacherId = user?.role === 'teacher' ? user.id : 'b6356c9a-58c0-43aa-8d07-27b9c97b83d1'; // Fallback UUID
      const parentId = user?.role === 'parent' ? user.id : 'b6356c9a-58c0-43aa-8d07-27b9c97b83d1'; // Fallback UUID
      
      await apiClient.post('/chat/rooms', {
        teacher_id: teacherId,
        parent_id: parentId
      });
      fetchRooms();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center p-5 bg-primary justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">Messages</Text>
        </View>
        <TouchableOpacity onPress={handleCreateDemoRoom}>
          <Icon name="add-circle-outline" size={26} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <View className="flex-1">
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#4F46E5" />
          </View>
        ) : (
          <FlatList
            data={rooms}
            keyExtractor={(item: any) => item.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            renderItem={({ item }) => (
              <TouchableOpacity 
                className="bg-white p-5 border-b border-border flex-row items-center"
                onPress={() => navigation.navigate('Chat', { roomId: item.id, chatName: item.first_name ? `${item.first_name} ${item.last_name}` : 'Demo Chat' })}
              >
                <View className="w-12 h-12 rounded-full bg-indigo-100 items-center justify-center mr-4">
                  <Text className="text-primary font-bold text-lg">
                    {item.first_name ? item.first_name[0] : 'U'}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-textPrimary">
                    {item.first_name ? `${item.first_name} ${item.last_name}` : 'Demo Chat'}
                  </Text>
                  <Text className="text-sm text-textSecondary" numberOfLines={1}>
                    Tap to view messages...
                  </Text>
                </View>
                <Icon name="chevron-forward" size={20} color="#CBD5E1" />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View className="items-center justify-center py-20 px-5">
                <Icon name="chatbubbles-outline" size={60} color="#E2E8F0" />
                <Text className="text-lg text-textSecondary mt-4 text-center mb-4">No conversations yet.</Text>
                <TouchableOpacity onPress={handleCreateDemoRoom} className="bg-primary px-6 py-3 rounded-full">
                  <Text className="text-white font-bold">Start a Demo Chat</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default ChatListScreen;
