import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import apiClient from '../api/client';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const ChatScreen = ({ route }: any) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const roomId = route.params?.roomId || 'dummy_room_id';

  useEffect(() => {
    // In a real implementation, we would subscribe to Supabase Realtime here
    // For now, we simulate fetching historical messages
    const fetchMessages = async () => {
      // Dummy data for visual representation
      setMessages([
        { id: '1', sender_id: user?.id, message: 'Hello! How is the child doing?' },
        { id: '2', sender_id: 'other_id', message: 'Doing great today! Played a lot.' }
      ]);
    };
    fetchMessages();
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    try {
      // Local optimistic update
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
      <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.otherMessage]}>
        <Text style={[styles.messageText, isMe && styles.myMessageText]}>{item.message}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>School Chat</Text>
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{ padding: 20 }}
      />
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input} 
          placeholder="Type a message..." 
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f8ff' },
  header: { padding: 20, paddingTop: 50, backgroundColor: '#4da6ff', color: '#fff', fontSize: 20, fontWeight: 'bold' },
  messageBubble: { padding: 15, borderRadius: 20, marginBottom: 10, maxWidth: '80%' },
  myMessage: { backgroundColor: '#4da6ff', alignSelf: 'flex-end', borderBottomRightRadius: 0 },
  otherMessage: { backgroundColor: '#fff', alignSelf: 'flex-start', borderBottomLeftRadius: 0, elevation: 1 },
  messageText: { color: '#333' },
  myMessageText: { color: '#fff' },
  inputContainer: { flexDirection: 'row', padding: 15, backgroundColor: '#fff', elevation: 10 },
  input: { flex: 1, backgroundColor: '#f0f8ff', borderRadius: 25, paddingHorizontal: 20, marginRight: 10 },
  sendButton: { backgroundColor: '#ff6699', paddingHorizontal: 20, justifyContent: 'center', borderRadius: 25 },
  sendText: { color: '#fff', fontWeight: 'bold' }
});

export default ChatScreen;
