import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import apiClient from '../api/client';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

type Props = { route: any; navigation: NativeStackNavigationProp<any, any>; };

const ChatScreen: React.FC<Props> = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useSelector((state: RootState) => state.auth);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  
  const roomId = route.params?.roomId;
  const chatName = route.params?.roomName || 'Global Chat';

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
    const interval = setInterval(() => fetchMessages(), 3000);
    return () => clearInterval(interval);
  }, [roomId]);

  const sendMessage = async () => {
    if (!inputText.trim() || !roomId) return;
    
    const textToSend = inputText;
    setInputText('');
    
    // Optimistic UI
    const optimisticMessage = { 
      id: Date.now().toString(), 
      sender_id: user?.id, 
      message: textToSend,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      await apiClient.post('/chat/messages', {
        room_id: roomId,
        message: textToSend
      });
    } catch (error) {
      console.error('Send message failed:', error);
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
    }
  };

  const renderMessage = ({ item }: any) => {
    const isMe = item.sender_id === user?.id;
    return (
      <View className={`mb-4 max-w-[80%] rounded-2xl px-5 py-3.5 shadow-sm ${isMe ? 'bg-blue-600 self-end rounded-br-sm' : 'bg-white self-start rounded-bl-sm border border-slate-100'}`}>
        <Text className={`text-base font-medium ${isMe ? 'text-white' : 'text-slate-800'}`}>{item.message}</Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-slate-50" style={{ paddingTop: Math.max(insets.top, 10) }}>
      
      {/* Premium Header */}
      <Animated.View entering={FadeInDown.duration(600)} className="px-6 py-4 flex-row justify-between items-center mb-2 z-10 bg-slate-50">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            className="bg-white w-12 h-12 rounded-full items-center justify-center mr-4"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}
          >
            <Icon name="arrow-back" size={24} color="#334155" />
          </TouchableOpacity>
          <View className="flex-row items-center flex-1">
            <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-3">
              <Text className="text-blue-600 font-black text-lg">{chatName[0]}</Text>
            </View>
            <View>
              <Text className="text-slate-800 text-xl font-black">{chatName}</Text>
              <Text className="text-emerald-500 text-xs font-bold">Online</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            contentContainerStyle={{ padding: 20, paddingTop: 10 }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}
        
        {/* Chat Input Field at the Bottom */}
        <Animated.View entering={FadeInUp.duration(500)} className="bg-white px-5 py-4 flex-row items-center border-t border-slate-100" style={{ paddingBottom: Math.max(insets.bottom, 15) }}>
          <View className="flex-1 bg-slate-100 rounded-full flex-row items-center px-5 py-2 mr-3 border border-slate-200">
            <TextInput 
              className="flex-1 text-slate-800 text-base font-medium max-h-24 min-h-[40px]"
              placeholder="Type a message..." 
              placeholderTextColor="#94A3B8"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
          </View>
          <TouchableOpacity 
            className={`${inputText.trim() ? 'bg-blue-600' : 'bg-slate-300'} w-12 h-12 rounded-full items-center justify-center`}
            style={inputText.trim() ? { shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 5 } : {}}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Icon name="send" size={20} color="#fff" style={{ marginLeft: 3 }} />
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChatScreen;
