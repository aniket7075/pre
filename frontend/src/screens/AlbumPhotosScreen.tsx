import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image, Modal, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform, Dimensions, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import apiClient, { BASE_URL } from '../api/client';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import KidsBackground from '../components/KidsBackground';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import DocumentPicker, { DocumentPickerResponse } from 'react-native-document-picker';

type RouteParams = {
  AlbumPhotos: {
    albumId: string;
    albumTitle: string;
  };
};

type Props = {
  navigation?: NativeStackNavigationProp<any, any>;
  route?: RouteProp<RouteParams, 'AlbumPhotos'>;
};

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2; // 2 columns with padding

const AlbumPhotosScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const albumId = route?.params?.albumId || '';
  const albumTitle = route?.params?.albumTitle || '';
  const { user } = useSelector((state: RootState) => state.auth);

  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Form State
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<DocumentPickerResponse | null>(null);

  // Lightbox State (for images)
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);

  const isStaff = user?.role === 'super_admin' || user?.role === 'school_admin' || user?.role === 'teacher';

  const isVideoFile = (url: string) => {
    if (!url) return false;
    const cleanUrl = url.split('?')[0].toLowerCase();
    return (
      cleanUrl.endsWith('.mp4') ||
      cleanUrl.endsWith('.mov') ||
      cleanUrl.endsWith('.mkv') ||
      cleanUrl.endsWith('.quicktime') ||
      cleanUrl.endsWith('.3gp') ||
      cleanUrl.endsWith('.avi')
    );
  };

  const fetchPhotos = async () => {
    if (!albumId) return;
    try {
      setLoading(true);
      const response = await apiClient.get(`/gallery/${albumId}/photos`);
      setPhotos(response.data.data);
    } catch (error) {
      console.error('Failed to fetch photos', error);
      Alert.alert('Error', 'Failed to load photos/videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [albumId]);

  const pickMedia = async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.images, DocumentPicker.types.video],
      });
      setSelectedFile(res);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert('Error', 'Failed to select media');
      }
    }
  };

  const handleUploadPhoto = async () => {
    if (!selectedFile) {
      Alert.alert('Validation Error', 'Please select a photo or video first');
      return;
    }

    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('description', description.trim());
      formData.append('photo', {
        uri: selectedFile.uri,
        type: selectedFile.type || 'application/octet-stream',
        name: selectedFile.name || 'media_file',
      } as any);

      await apiClient.post(`/gallery/${albumId}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Success', 'Media uploaded successfully');
      setShowUploadModal(false);
      setDescription('');
      setSelectedFile(null);
      fetchPhotos();
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to upload media');
    } finally {
      setUploadLoading(false);
    }
  };

  const formatImageUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('/uploads') ? `${BASE_URL}${url}` : url;
  };

  const handleMediaPress = (item: any) => {
    const mediaUrl = formatImageUrl(item.image_url);
    if (isVideoFile(item.image_url)) {
      Linking.openURL(mediaUrl).catch(() => {
        Alert.alert('Error', 'Unable to play video on this device');
      });
    } else {
      setSelectedPhoto(item);
    }
  };

  const isSelectedFileVideo = selectedFile && isVideoFile(selectedFile.name || '');

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: Math.max(insets.top, 10), paddingBottom: insets.bottom }}>
      <KidsBackground />

      {/* Header */}
      <View className="flex-row items-center px-6 py-4 mb-2 z-10">
        <TouchableOpacity onPress={() => navigation?.goBack()} className="bg-gray-50 p-3 rounded-full mr-4">
          <Icon name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest">Album</Text>
          <Text className="text-textPrimary text-2xl font-black" numberOfLines={1}>{albumTitle}</Text>
        </View>
      </View>

      {/* Photos / Videos Grid */}
      {loading ? (
        <ActivityIndicator size="large" color="#4F46E5" className="mt-10" />
      ) : (
        <FlatList
          data={photos}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
          contentContainerStyle={{ paddingVertical: 10, paddingBottom: 100 }}
          renderItem={({ item }) => {
            const isVideo = isVideoFile(item.image_url);
            return (
              <TouchableOpacity 
                onPress={() => handleMediaPress(item)}
                activeOpacity={0.9}
                className="bg-white rounded-2xl mb-4 overflow-hidden border border-gray-100"
                style={{
                  width: COLUMN_WIDTH,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 6,
                  elevation: 2,
                }}
              >
                {isVideo ? (
                  <View className="w-full h-36 bg-slate-900 items-center justify-center relative">
                    <Icon name="play-circle-outline" size={48} color="#FFFFFF" />
                    <View className="bg-black/40 px-2 py-0.5 rounded absolute bottom-2">
                      <Text className="text-white text-[10px] uppercase font-black tracking-widest">Video</Text>
                    </View>
                  </View>
                ) : (
                  <Image 
                    source={{ uri: formatImageUrl(item.image_url) }} 
                    className="w-full h-36" 
                    resizeMode="cover" 
                  />
                )}
                {item.description ? (
                  <View className="p-3 bg-white">
                    <Text className="text-slate-700 text-xs font-semibold" numberOfLines={2}>
                      {item.description}
                    </Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View className="items-center justify-center mt-20">
              <Icon name="images-outline" size={60} color="#E2E8F0" />
              <Text className="text-gray-400 mt-4 font-semibold">No photos or videos in this album</Text>
            </View>
          }
        />
      )}

      {/* Upload Media Button for Staff */}
      {isStaff && (
        <TouchableOpacity
          onPress={() => setShowUploadModal(true)}
          className="w-14 h-14 bg-indigo-600 rounded-full items-center justify-center absolute bottom-6 right-6 shadow-lg z-20"
          style={{ shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }}
        >
          <Icon name="camera-outline" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Lightbox / View Photo Modal */}
      <Modal visible={!!selectedPhoto} animationType="fade" transparent>
        <View className="flex-1 bg-black justify-center items-center">
          {selectedPhoto && (
            <View className="w-full h-full flex-1 justify-between" style={{ paddingTop: Math.max(insets.top, 20), paddingBottom: Math.max(insets.bottom, 20) }}>
              {/* Top Close Bar */}
              <View className="flex-row justify-end px-6 z-30">
                <TouchableOpacity onPress={() => setSelectedPhoto(null)} className="bg-white/20 p-3 rounded-full">
                  <Icon name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Main Image */}
              <View className="flex-1 justify-center items-center px-4">
                <Image 
                  source={{ uri: formatImageUrl(selectedPhoto.image_url) }} 
                  style={{ width: '100%', height: '80%' }}
                  resizeMode="contain" 
                />
              </View>

              {/* Bottom Caption Overlay */}
              {selectedPhoto.description ? (
                <View className="bg-black/60 p-6 mx-4 rounded-3xl border border-white/10 mb-4">
                  <Text className="text-white text-base font-medium leading-6">
                    {selectedPhoto.description}
                  </Text>
                </View>
              ) : (
                <View className="h-10" />
              )}
            </View>
          )}
        </View>
      </Modal>

      {/* Add Media Modal */}
      <Modal visible={showUploadModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
            className="bg-white rounded-t-[40px] px-6 pt-6 pb-10"
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-textPrimary text-xl font-black">Add Photo / Video to Gallery</Text>
              <TouchableOpacity onPress={() => setShowUploadModal(false)} className="bg-gray-100 p-2 rounded-full">
                <Icon name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="max-h-[400px]">
              <Text className="text-sm font-bold text-textSecondary uppercase tracking-wider mb-2 ml-1">Select Photo / Video</Text>
              {selectedFile ? (
                <View className="bg-gray-50 rounded-2xl mb-4 overflow-hidden border border-gray-200">
                  {isSelectedFileVideo ? (
                    <View className="h-44 bg-slate-900 items-center justify-center relative">
                      <Icon name="film-outline" size={48} color="#FFFFFF" />
                      <Text className="text-white/60 text-xs font-bold absolute bottom-4">Video Selected</Text>
                      <TouchableOpacity 
                        onPress={() => setSelectedFile(null)} 
                        className="absolute top-2 right-2 bg-red-500 p-2 rounded-full shadow"
                      >
                        <Icon name="trash-outline" size={18} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View className="h-44 bg-gray-100 relative">
                      <Image source={{ uri: selectedFile.uri }} className="w-full h-full" resizeMode="contain" />
                      <TouchableOpacity 
                        onPress={() => setSelectedFile(null)} 
                        className="absolute top-2 right-2 bg-red-500 p-2 rounded-full shadow"
                      >
                        <Icon name="trash-outline" size={18} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  )}
                  <View className="p-3">
                    <Text className="text-xs text-slate-500 text-center font-bold" numberOfLines={1}>
                      {selectedFile.name}
                    </Text>
                  </View>
                </View>
              ) : (
                <TouchableOpacity 
                  onPress={pickMedia}
                  className="flex-row items-center justify-center bg-indigo-50/50 p-6 rounded-2xl mb-4 border border-indigo-100 border-dashed"
                >
                  <Icon name="image-outline" size={24} color="#4F46E5" className="mr-2" />
                  <Text className="text-primary font-bold text-base">Pick Photo or Video</Text>
                </TouchableOpacity>
              )}

              <Text className="text-sm font-bold text-textSecondary uppercase tracking-wider mb-2 ml-1">Media Description / Caption</Text>
              <View className="flex-row bg-gray-50 p-4 rounded-2xl mb-6 border border-gray-100 min-h-[80px]">
                <Icon name="document-text-outline" size={20} color="#64748B" className="mr-3 mt-1" />
                <TextInput
                  className="flex-1 text-base text-textPrimary font-semibold"
                  placeholder="e.g. Children performing at the annual day dance activity..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  textAlignVertical="top"
                  value={description}
                  onChangeText={setDescription}
                />
              </View>
            </ScrollView>

            <TouchableOpacity 
              className={`p-5 rounded-2xl items-center flex-row justify-center ${uploadLoading ? 'bg-gray-400' : 'bg-primary'}`}
              style={{ shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }}
              onPress={handleUploadPhoto}
              disabled={uploadLoading}
            >
              {uploadLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Icon name="cloud-upload-outline" size={24} color="#fff" className="mr-2" />
                  <Text className="text-white font-bold text-lg">Upload Media</Text>
                </>
              )}
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

export default AlbumPhotosScreen;
