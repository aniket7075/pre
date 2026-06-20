import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import apiClient from '../api/client';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import KidsBackground from '../components/KidsBackground';

type Props = { navigation: NativeStackNavigationProp<any, any>; };

const LibraryScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useSelector((state: RootState) => state.auth);
  const isParent = user?.role === 'parent';

  const [activeTab, setActiveTab] = useState<'catalog' | 'issued'>('catalog');
  const [books, setBooks] = useState<any[]>([]);
  const [issuedBooks, setIssuedBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Admin Add Book States
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [copies, setCopies] = useState('1');

  const fetchBooks = async () => {
    try {
      const response = await apiClient.get('/library/books');
      setBooks(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchIssuedBooks = async () => {
    try {
      // Mock student ID for demo
      const response = await apiClient.get('/library/issued/dummy-student-id');
      setIssuedBooks(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchBooks(), fetchIssuedBooks()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddBook = async () => {
    if (!title || !author) {
      Alert.alert('Error', 'Please fill title and author');
      return;
    }
    try {
      await apiClient.post('/library/books', {
        title, author, total_copies: parseInt(copies, 10)
      });
      setShowAddForm(false);
      setTitle(''); setAuthor(''); setCopies('1');
      fetchBooks();
    } catch (error) {
      Alert.alert('Error', 'Failed to add book');
    }
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: Math.max(insets.top, 10) }}>
      <View className="flex-row items-center justify-between px-6 py-4 mb-2">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="bg-gray-50 p-3 rounded-full mr-4">
            <Icon name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <View>
            <Text className="text-textSecondary text-xs font-semibold tracking-widest uppercase">E-Library</Text>
            <Text className="text-textPrimary text-2xl font-black">Library</Text>
          </View>
        </View>
        {!isParent && (
          <TouchableOpacity onPress={() => setShowAddForm(!showAddForm)} className="bg-primary p-2 rounded-full">
            <Icon name={showAddForm ? "close" : "add"} size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <View className="flex-row px-5 mb-4 space-x-4">
        <TouchableOpacity 
          className={`flex-1 py-3 items-center rounded-xl ${activeTab === 'catalog' ? 'bg-primary' : 'bg-gray-100'}`}
          onPress={() => setActiveTab('catalog')}
        >
          <Text className={`font-bold ${activeTab === 'catalog' ? 'text-white' : 'text-gray-500'}`}>Catalog</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`flex-1 py-3 items-center rounded-xl ${activeTab === 'issued' ? 'bg-primary' : 'bg-gray-100'}`}
          onPress={() => setActiveTab('issued')}
        >
          <Text className={`font-bold ${activeTab === 'issued' ? 'text-white' : 'text-gray-500'}`}>Issued Books</Text>
        </TouchableOpacity>
      </View>

      {showAddForm && !isParent && activeTab === 'catalog' && (
        <View className="p-5 bg-indigo-50 m-5 rounded-2xl border border-indigo-100">
          <Text className="font-bold mb-2">Book Title</Text>
          <TextInput className="bg-white p-3 rounded-xl mb-3 border border-gray-100" value={title} onChangeText={setTitle} />
          <Text className="font-bold mb-2">Author</Text>
          <TextInput className="bg-white p-3 rounded-xl mb-3 border border-gray-100" value={author} onChangeText={setAuthor} />
          <Text className="font-bold mb-2">Total Copies</Text>
          <TextInput className="bg-white p-3 rounded-xl mb-4 border border-gray-100" value={copies} onChangeText={setCopies} keyboardType="numeric" />
          
          <TouchableOpacity className="bg-primary p-4 rounded-xl items-center" onPress={handleAddBook}>
            <Text className="text-white font-bold">Add Book</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#4F46E5" className="mt-10" />
      ) : activeTab === 'catalog' ? (
        <FlatList
          data={books}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <View className="bg-white p-4 rounded-2xl shadow-sm mb-4 border border-gray-100 flex-row items-center">
              <View className="bg-blue-100 w-12 h-16 rounded-lg items-center justify-center mr-4">
                <Icon name="book" size={24} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-lg text-textPrimary">{item.title}</Text>
                <Text className="text-gray-500 text-sm mb-1">{item.author}</Text>
                <View className="flex-row items-center">
                  <View className={`w-2 h-2 rounded-full mr-2 ${item.available_copies > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                  <Text className="text-xs font-semibold text-gray-500">{item.available_copies} of {item.total_copies} available</Text>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text className="text-center text-gray-500 mt-10">No books found in catalog.</Text>}
        />
      ) : (
        <FlatList
          data={issuedBooks}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => {
            const isOverdue = new Date(item.due_date) < new Date() && item.status !== 'returned';
            return (
              <View className="bg-white p-4 rounded-2xl shadow-sm mb-4 border border-gray-100">
      <KidsBackground />
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="font-bold text-lg flex-1 mr-2">{item.title}</Text>
                  <View className={`px-2 py-1 rounded-md ${item.status === 'returned' ? 'bg-green-100' : isOverdue ? 'bg-red-100' : 'bg-blue-100'}`}>
                    <Text className={`text-xs font-bold ${item.status === 'returned' ? 'text-green-700' : isOverdue ? 'text-red-700' : 'text-blue-700'}`}>
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text className="text-gray-500 text-sm mb-3">By {item.author}</Text>
                <View className="bg-gray-50 p-3 rounded-xl flex-row justify-between">
                  <View>
                    <Text className="text-xs text-gray-500">Issued</Text>
                    <Text className="font-bold text-gray-800">{item.issue_date.substring(0,10)}</Text>
                  </View>
                  <View>
                    <Text className="text-xs text-gray-500">Due</Text>
                    <Text className={`font-bold ${isOverdue ? 'text-red-600' : 'text-gray-800'}`}>{item.due_date.substring(0,10)}</Text>
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View className="items-center justify-center mt-20">
              <Icon name="library-outline" size={60} color="#E2E8F0" />
              <Text className="text-gray-400 mt-4 font-semibold text-center">No books issued to you.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default LibraryScreen;
