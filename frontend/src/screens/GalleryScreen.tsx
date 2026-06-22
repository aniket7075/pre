import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image, Modal, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import apiClient, { BASE_URL } from '../api/client';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import KidsBackground from '../components/KidsBackground';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import DocumentPicker, { DocumentPickerResponse } from 'react-native-document-picker';

type Props = { navigation: NativeStackNavigationProp<any, any>; };

const GalleryScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<DocumentPickerResponse | null>(null);

  const isStaff = user?.role === 'super_admin' || user?.role === 'school_admin' || user?.role === 'teacher';

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/gallery');
      setAlbums(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  const pickCoverImage = async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.images],
      });
      setSelectedFile(res);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert('Error', 'Failed to pick image');
      }
    }
  };

  const handleCreateAlbum = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Album title is required');
      return;
    }

    setCreateLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      
      if (selectedFile) {
        formData.append('cover_image', {
          uri: selectedFile.uri,
          type: selectedFile.type || 'image/jpeg',
          name: selectedFile.name || 'cover_image.jpg',
        } as any);
      }

      await apiClient.post('/gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Success', 'Album created successfully');
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      fetchAlbums();
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to create album');
    } finally {
      setCreateLoading(false);
    }
  };

  const renderImage = (coverUrl: string) => {
    if (!coverUrl) {
      return (
        <View className="w-full h-full items-center justify-center bg-indigo-50">
          <Icon name="image-outline" size={40} color="#6366F1" />
        </View>
      );
    }
    const uri = coverUrl.startsWith('/uploads') ? `${BASE_URL}${coverUrl}` : coverUrl;
    return <Image source={{ uri }} className="w-full h-full" resizeMode="cover" />;
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: Math.max(insets.top, 10), paddingBottom: insets.bottom }}>
      <KidsBackground />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 mb-2 z-10">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="bg-gray-50 p-3 rounded-full mr-4">
            <Icon name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text className="text-textPrimary text-2xl font-black">School Gallery</Text>
        </View>
      </View>

      {/* Album List */}
      {loading ? (
        <ActivityIndicator size="large" color="#4F46E5" className="mt-10" />
      ) : (
        <FlatList
          data={albums}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => navigation.navigate('AlbumPhotos', { albumId: item.id, albumTitle: item.title })}
              className="bg-white rounded-3xl shadow-sm mb-6 border border-gray-100 overflow-hidden"
              style={{ shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}
            >
              <View className="h-44 bg-gray-100">
                {renderImage(item.cover_image_url)}
              </View>
              <View className="p-4 flex-row justify-between items-center bg-white">
                <View className="flex-1 pr-4">
                  <Text className="font-bold text-lg text-textPrimary">{item.title}</Text>
                  {item.description ? (
                    <Text className="text-gray-500 text-sm mt-1" numberOfLines={2}>{item.description}</Text>
                  ) : null}
                </View>
                <Icon name="chevron-forward" size={20} color="#6366F1" />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center justify-center mt-20">
              <Icon name="images-outline" size={60} color="#E2E8F0" />
              <Text className="text-gray-400 mt-4 font-semibold">No albums available</Text>
            </View>
          }
        />
      )}

      {/* Floating Action Button for Admin/Teachers */}
      {isStaff && (
        <TouchableOpacity
          onPress={() => setShowCreateModal(true)}
          className="w-14 h-14 bg-indigo-600 rounded-full items-center justify-center absolute bottom-6 right-6 shadow-lg z-20"
          style={{ shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }}
        >
          <Icon name="add" size={30} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Create Album Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
            className="bg-white rounded-t-[40px] px-6 pt-6 pb-10"
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-textPrimary text-xl font-black">Create Gallery Album</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)} className="bg-gray-100 p-2 rounded-full">
                <Icon name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="max-h-[400px]">
              <Text className="text-sm font-bold text-textSecondary uppercase tracking-wider mb-2 ml-1">Album Title</Text>
              <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl mb-4 border border-gray-100">
                <Icon name="folder-open-outline" size={20} color="#64748B" className="mr-3" />
                <TextInput
                  className="flex-1 text-base text-textPrimary font-semibold"
                  placeholder="e.g. Sports Day 2026"
                  placeholderTextColor="#94A3B8"
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              <Text className="text-sm font-bold text-textSecondary uppercase tracking-wider mb-2 ml-1">Description</Text>
              <View className="flex-row bg-gray-50 p-4 rounded-2xl mb-4 border border-gray-100 min-h-[80px]">
                <Icon name="document-text-outline" size={20} color="#64748B" className="mr-3 mt-1" />
                <TextInput
                  className="flex-1 text-base text-textPrimary font-semibold"
                  placeholder="Describe the album context..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  textAlignVertical="top"
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              <Text className="text-sm font-bold text-textSecondary uppercase tracking-wider mb-2 ml-1">Cover Image</Text>
              {selectedFile ? (
                <View className="flex-row items-center justify-between bg-gray-50 p-3 rounded-2xl mb-6 border border-gray-200">
                  <View className="flex-row items-center flex-1 pr-2">
                    <Icon name="image-outline" size={20} color="#64748B" className="mr-2" />
                    <Text className="text-sm text-textPrimary font-semibold flex-1" numberOfLines={1}>
                      {selectedFile.name}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedFile(null)} className="p-1">
                    <Icon name="close-circle" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  onPress={pickCoverImage}
                  className="flex-row items-center justify-center bg-indigo-50/50 p-4 rounded-2xl mb-6 border border-indigo-100 border-dashed"
                >
                  <Icon name="cloud-upload-outline" size={22} color="#4F46E5" className="mr-2" />
                  <Text className="text-primary font-bold text-base">Choose Cover Image</Text>
                </TouchableOpacity>
              )}
            </ScrollView>

            <TouchableOpacity 
              className={`p-5 rounded-2xl items-center flex-row justify-center ${createLoading ? 'bg-gray-400' : 'bg-primary'}`}
              style={{ shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }}
              onPress={handleCreateAlbum}
              disabled={createLoading}
            >
              {createLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Icon name="checkmark-circle-outline" size={24} color="#fff" className="mr-2" />
                  <Text className="text-white font-bold text-lg">Create Album</Text>
                </>
              )}
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

export default GalleryScreen;
