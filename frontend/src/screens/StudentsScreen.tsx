import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

const StudentsScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center p-5 bg-primary justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white">Manage Students</Text>
        </View>
      </View>
      
      <ScrollView className="flex-1 p-5">
        <View className="items-center justify-center py-20">
          <Icon name="people-circle" size={80} color="#E2E8F0" />
          <Text className="text-xl text-textSecondary mt-4">No students added yet.</Text>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        className="absolute bottom-8 right-8 bg-secondary w-16 h-16 rounded-full items-center justify-center shadow-lg"
        onPress={() => navigation.navigate('AddParentStudent')}
      >
        <Icon name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default StudentsScreen;
