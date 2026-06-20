import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import apiClient from '../api/client';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import KidsBackground from '../components/KidsBackground';

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

const ChatListScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [creating, setCreating] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await apiClient.get('/chat/rooms');
      setRooms(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChat = async () => {
    if (!newRoomName.trim()) {
      Alert.alert('Error', 'Please enter a chat name');
      return;
    }
    setCreating(true);
    try {
      const response = await apiClient.post('/chat/rooms', { name: newRoomName });
      setModalVisible(false);
      setNewRoomName('');
      fetchRooms();
      if (response.data.data?.id) {
        navigation.navigate('ChatRoom', { roomId: response.data.data.id, roomName: response.data.data.name });
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to create chat');
    } finally {
      setCreating(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-50" style={{ paddingTop: Math.max(insets.top, 10) }}>
      <KidsBackground />
      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInUp.delay(100 * index).duration(500)}>
            <TouchableOpacity
              className="bg-white p-4 rounded-[24px] mb-4 flex-row items-center"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.04,
                shadowRadius: 10,
                elevation: 3,
                borderWidth: 1,
                borderColor: '#F8FAFC',
              }}
              onPress={() => navigation.navigate('ChatRoom', { roomId: item.id, roomName: item.name })}
              activeOpacity={0.7}
            >
              <View className="bg-blue-50 w-14 h-14 rounded-full items-center justify-center mr-4">
                <Icon name="chatbubbles" size={26} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-lg text-slate-800 mb-0.5">{item.name}</Text>
                <Text className="text-slate-500 font-medium text-sm">Tap to view messages</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#CBD5E1" />
            </TouchableOpacity>
          </Animated.View>
        )}
        ListEmptyComponent={
          <Animated.View entering={FadeInUp} className="items-center justify-center mt-20">
            <View className="bg-slate-100 w-24 h-24 rounded-full items-center justify-center mb-4">
              <Icon name="chatbubble-ellipses-outline" size={40} color="#94A3B8" />
            </View>
            <Text className="text-slate-400 font-bold text-lg">No chats available</Text>
            <Text className="text-slate-500 text-sm mt-2">Tap the + button to start a new chat</Text>
          </Animated.View>
        }
      />

      {(user?.role === 'teacher' || user?.role === 'school_admin' || user?.role === 'super_admin') && (
        <Animated.View entering={FadeInUp.delay(300).duration(500)} className="absolute bottom-24 right-6">
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="bg-blue-600 w-16 h-16 rounded-full items-center justify-center"
            style={{ shadowColor: '#2563EB', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 }}
          >
            <Icon name="add" size={32} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-black text-slate-800">Start New Chat</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2 bg-slate-100 rounded-full">
                <Icon name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View className="mb-8">
              <Text className="text-slate-600 font-bold mb-2 ml-1">Chat Name / Topic *</Text>
              <TextInput
                className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 font-medium"
                placeholder="e.g. 1st Grade Parents, Annual Day Planning"
                value={newRoomName}
                onChangeText={setNewRoomName}
              />
            </View>

            <TouchableOpacity
              onPress={handleCreateChat}
              disabled={creating}
              className="bg-blue-600 py-4 rounded-2xl items-center shadow-sm flex-row justify-center"
            >
              {creating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Icon name="chatbubble" size={20} color="#fff" className="mr-2" />
                  <Text className="text-white font-bold text-lg ml-2">Create Chat Room</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default ChatListScreen;
