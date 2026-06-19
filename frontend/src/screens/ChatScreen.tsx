import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import apiClient from '../api/client';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { route: any; navigation: NativeStackNavigationProp<any, any>; };

const ChatScreen: React.FC<Props> = ({ route, navigation }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const roomId = route.params?.roomId || 'dummy_room_id';

  useEffect(() => {
    const fetchMessages = async () => {
      setMessages([
        { id: '1', sender_id: user?.id, message: 'Hello! How is the child doing?' },
        { id: '2', sender_id: 'other_id', message: 'Doing great today! Played a lot and finished lunch.' }
      ]);
    };
    fetchMessages();
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    try {
      const newMessage = { id: Date.now().toString(), sender_id: user?.id, message: inputText };
      setMessages(prev => [...prev, newMessage]);
      setInputText('');

      await apiClient.post('/chat/messages', {
        room_id: roomId,
        message: inputText
      });
    } catch (error) {
      console.error(error);
    }
  };

  const renderMessage = ({ item }: any) => {
    const isMe = item.sender_id === user?.id;
    return (
      <View className={`mb-3 max-w-[80%] rounded-2xl px-4 py-3 ${isMe ? 'bg-primary self-end rounded-br-none' : 'bg-card self-start rounded-bl-none border border-border shadow-sm'}`}>
        <Text className={`text-base ${isMe ? 'text-white' : 'text-textPrimary'}`}>{item.message}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center p-5 bg-primary justify-between shadow-sm z-10">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mr-3">
              <Icon name="person" size={20} color="#fff" />
            </View>
            <Text className="text-xl font-bold text-white">Class Teacher</Text>
          </View>
        </View>
      </View>
      
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
        
        <View className="flex-row p-4 bg-card border-t border-border items-center">
          <TextInput 
            className="flex-1 bg-background border border-border rounded-full px-5 py-3 text-textPrimary mr-3 max-h-24"
            placeholder="Type a message..." 
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity 
            className="bg-primary w-12 h-12 rounded-full items-center justify-center shadow-sm"
            onPress={sendMessage}
          >
            <Icon name="send" size={20} color="#fff" className="ml-1" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
