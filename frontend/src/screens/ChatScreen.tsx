import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
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
  const [loading, setLoading] = useState(true);
  const roomId = route.params?.roomId;
  const chatName = route.params?.chatName || 'Chat';

  const fetchMessages = async () => {
    if (!roomId) return;
    try {
      const response = await apiClient.get(`/chat/messages/${roomId}`);
      setMessages(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Simple polling for new messages (prototype)
    const interval = setInterval(() => fetchMessages(), 3000);
    return () => clearInterval(interval);
  }, [roomId]);

  const sendMessage = async () => {
    if (!inputText.trim() || !roomId) return;
    
    // Optimistic UI update
    const optimisticMessage = { 
      id: Date.now().toString(), 
      sender_id: user?.id, 
      message: inputText,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    const textToSend = inputText;
    setInputText('');

    try {
      await apiClient.post('/chat/messages', {
        room_id: roomId,
        message: textToSend
      });
      // fetchMessages will sync it soon via polling
    } catch (error) {
      console.error('Send message failed:', error);
      // Remove optimistic update on failure
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
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
              <Text className="text-white font-bold">{chatName[0]}</Text>
            </View>
            <Text className="text-xl font-bold text-white">{chatName}</Text>
          </View>
        </View>
      </View>
      
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#4F46E5" />
          </View>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            inverted={false} // Adjust based on sorting
          />
        )}
        
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
