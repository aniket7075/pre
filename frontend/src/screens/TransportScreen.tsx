import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import apiClient from '../api/client';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any, any>; };

const TransportScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [transport, setTransport] = useState<any>(null);

  useEffect(() => {
    const fetchTransport = async () => {
      try {
        const response = await apiClient.get('/transport/student/dummy_student_id');
        setTransport(response.data.data);
      } catch (error) {
        console.error(error);
        // Fallback dummy data
        setTransport({
          route_name: 'Route A - City Center',
          driver_name: 'John Doe',
          driver_phone: '+1 234 567 8900',
          vehicle_number: 'MH 12 AB 1234',
          pickup_point: 'Main Square',
          pickup_time: '07:30 AM',
          drop_time: '03:45 PM'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchTransport();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center p-5 bg-primary justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">Transport Details</Text>
        </View>
        <Icon name="bus" size={24} color="#fff" />
      </View>
      
      <ScrollView className="flex-1 p-5">
        {loading ? (
          <ActivityIndicator size="large" color="#4F46E5" />
        ) : transport ? (
          <View className="bg-card p-6 rounded-2xl shadow-sm border border-border">
            <View className="items-center mb-6">
              <View className="bg-rose-100 p-4 rounded-full mb-3">
                <Icon name="bus" size={40} color="#F43F5E" />
              </View>
              <Text className="text-xl font-bold text-textPrimary text-center">{transport.route_name}</Text>
              <Text className="text-sm text-textSecondary">{transport.vehicle_number}</Text>
            </View>

            <View className="bg-background rounded-xl p-4 mb-4 border border-border">
              <View className="flex-row items-center mb-3">
                <Icon name="person" size={20} color="#14B8A6" className="mr-3" />
                <View>
                  <Text className="text-xs text-textSecondary uppercase tracking-wider">Driver</Text>
                  <Text className="font-bold text-textPrimary">{transport.driver_name}</Text>
                </View>
              </View>
              <View className="flex-row items-center">
                <Icon name="call" size={20} color="#14B8A6" className="mr-3" />
                <View>
                  <Text className="text-xs text-textSecondary uppercase tracking-wider">Phone</Text>
                  <Text className="font-bold text-textPrimary">{transport.driver_phone}</Text>
                </View>
              </View>
            </View>

            <View className="flex-row justify-between">
              <View className="bg-background rounded-xl p-4 flex-1 mr-2 border border-border items-center">
                <Icon name="location" size={24} color="#4F46E5" className="mb-2" />
                <Text className="text-xs text-textSecondary uppercase tracking-wider mb-1">Pickup</Text>
                <Text className="font-bold text-textPrimary text-center">{transport.pickup_time}</Text>
                <Text className="text-xs text-center text-textSecondary mt-1">{transport.pickup_point}</Text>
              </View>
              
              <View className="bg-background rounded-xl p-4 flex-1 ml-2 border border-border items-center">
                <Icon name="home" size={24} color="#F59E0B" className="mb-2" />
                <Text className="text-xs text-textSecondary uppercase tracking-wider mb-1">Drop-off</Text>
                <Text className="font-bold text-textPrimary text-center">{transport.drop_time}</Text>
                <Text className="text-xs text-center text-textSecondary mt-1">{transport.pickup_point}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View className="items-center justify-center py-20">
            <Icon name="bus-outline" size={60} color="#E2E8F0" />
            <Text className="text-lg text-textSecondary mt-4">No transport assigned.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TransportScreen;
