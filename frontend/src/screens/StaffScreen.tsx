import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

const StaffScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center p-5 bg-primary">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-white">Manage Staff</Text>
      </View>
      <View className="flex-1 items-center justify-center">
        <Icon name="people" size={80} color="#E2E8F0" />
        <Text className="text-xl text-textSecondary mt-4">Staff management coming soon</Text>
      </View>
    </SafeAreaView>
  );
};

export default StaffScreen;
