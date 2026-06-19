import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import apiClient from '../api/client';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any, any>; };

const HomeworkScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [homework, setHomework] = useState<any[]>([]);

  useEffect(() => {
    const fetchHomework = async () => {
      try {
        const response = await apiClient.get('/homework/dummy_section_id');
        if (response.data.data && response.data.data.length > 0) {
          setHomework(response.data.data);
        } else {
          // Fallback dummy data
          setHomework([
            { id: '1', title: 'Math Chapter 5', description: 'Solve exercises 1 to 10 on page 45.', due_date: 'Tomorrow' },
            { id: '2', title: 'Science Project', description: 'Bring materials for the solar system model.', due_date: 'Next Monday' },
          ]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomework();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center p-5 bg-primary justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">Homework</Text>
        </View>
        <Icon name="book" size={24} color="#fff" />
      </View>
      
      <View className="flex-1 p-5">
        {loading ? (
          <ActivityIndicator size="large" color="#4F46E5" />
        ) : (
          <FlatList
            data={homework}
            keyExtractor={(item: any) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View className="bg-card p-5 rounded-xl mb-4 shadow-sm border border-border">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-lg font-bold text-primary">{item.title}</Text>
                  <View className="bg-amber-100 px-3 py-1 rounded-full">
                    <Text className="text-xs font-bold text-amber-600">{item.due_date}</Text>
                  </View>
                </View>
                <Text className="text-textSecondary leading-6">{item.description}</Text>
              </View>
            )}
            ListEmptyComponent={
              <View className="items-center justify-center py-20">
                <Icon name="document-outline" size={60} color="#E2E8F0" />
                <Text className="text-lg text-textSecondary mt-4">No homework assigned.</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default HomeworkScreen;
