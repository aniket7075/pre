import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import apiClient from '../api/client';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any, any>; };

const GalleryScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlbums = async () => {
    try {
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

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: Math.max(insets.top, 10) }}>
      <View className="flex-row items-center px-6 py-4 mb-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="bg-gray-50 p-3 rounded-full mr-4">
          <Icon name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-textPrimary text-2xl font-black">School Gallery</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4F46E5" className="mt-10" />
      ) : (
        <FlatList
          data={albums}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity className="bg-white rounded-3xl shadow-sm mb-6 border border-gray-100 overflow-hidden">
              <View className="h-40 bg-gray-200">
                {item.cover_image_url ? (
                  <Image source={{ uri: item.cover_image_url }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <View className="w-full h-full items-center justify-center bg-indigo-50">
                    <Icon name="image-outline" size={40} color="#6366F1" />
                  </View>
                )}
              </View>
              <View className="p-4">
                <Text className="font-bold text-lg text-textPrimary">{item.title}</Text>
                <Text className="text-gray-500 text-sm mt-1">{item.description}</Text>
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
    </View>
  );
};

export default GalleryScreen;
