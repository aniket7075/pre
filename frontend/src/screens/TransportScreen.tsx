import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView, FlatList, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import apiClient from '../api/client';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import KidsBackground from '../components/KidsBackground';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

type Props = { navigation: NativeStackNavigationProp<any, any>; };

interface RouteData {
  id: string;
  route_name: string;
  driver_name: string;
  driver_phone: string;
  vehicle_number: string;
  vehicle_type: 'bus' | 'van' | 'private';
  capacity: number;
}

const TransportScreen: React.FC<Props> = ({ navigation }) => {
  const { user, activeChild } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'super_admin' || user?.role === 'school_admin';

  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [studentTransport, setStudentTransport] = useState<any>(null);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  // Form states
  const [routeName, setRouteName] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState<'bus' | 'van' | 'private'>('bus');
  const [capacity, setCapacity] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeChild?.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const response = await apiClient.get('/transport/routes');
        setRoutes(response.data.data);
      } else {
        if (!activeChild?.id) {
          setLoading(false);
          return;
        }
        const response = await apiClient.get(`/transport/student/${activeChild.id}`);
        setStudentTransport(response.data.data);
      }
    } catch (error) {
      console.error(error);
      if (!isAdmin) {
        // Fallback for visual parent demo
        setStudentTransport({
          route_name: 'Route A - City Center',
          driver_name: 'John Doe',
          driver_phone: '+1 234 567 8900',
          vehicle_number: 'MH 12 AB 1234',
          pickup_point: 'Main Square',
          pickup_time: '07:30 AM',
          drop_time: '03:45 PM'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setSelectedRouteId(null);
    setRouteName('');
    setDriverName('');
    setDriverPhone('');
    setVehicleNumber('');
    setVehicleType('bus');
    setCapacity('');
    setModalVisible(true);
  };

  const openEditModal = (route: RouteData) => {
    setIsEditing(true);
    setSelectedRouteId(route.id);
    setRouteName(route.route_name);
    setDriverName(route.driver_name);
    setDriverPhone(route.driver_phone);
    setVehicleNumber(route.vehicle_number);
    setVehicleType(route.vehicle_type);
    setCapacity(route.capacity.toString());
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!routeName || !driverName || !driverPhone || !vehicleNumber || !capacity) {
      Alert.alert('Validation Error', 'Please fill in all fields');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        route_name: routeName,
        driver_name: driverName,
        driver_phone: driverPhone,
        vehicle_number: vehicleNumber,
        vehicle_type: vehicleType,
        capacity: parseInt(capacity)
      };

      if (isEditing && selectedRouteId) {
        await apiClient.put(`/transport/routes/${selectedRouteId}`, payload);
        Alert.alert('Success', 'Route updated successfully');
      } else {
        await apiClient.post('/transport/routes', payload);
        Alert.alert('Success', 'Route created successfully');
      }
      setModalVisible(false);
      fetchData();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to save route');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (route: RouteData) => {
    Alert.alert(
      'Delete Route',
      `Are you sure you want to delete ${route.route_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/transport/routes/${route.id}`);
              Alert.alert('Success', 'Route deleted successfully');
              fetchData();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.error || 'Failed to delete route');
            }
          }
        }
      ]
    );
  };

  const renderRouteItem = ({ item }: { item: RouteData }) => (
    <View className="bg-white p-5 rounded-3xl mb-4 border border-slate-100" style={{ elevation: 2, shadowColor: '#F43F5E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 5 }}>
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 rounded-xl bg-rose-50 items-center justify-center mr-3">
            <Icon name="bus" size={20} color="#F43F5E" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-slate-800" numberOfLines={1}>{item.route_name}</Text>
            <Text className="text-xs text-slate-500 font-bold">{item.vehicle_number} | Cap: {item.capacity}</Text>
          </View>
        </View>
        <View className="flex-row">
          <TouchableOpacity onPress={() => openEditModal(item)} className="p-2 bg-slate-50 rounded-full mr-2">
            <Icon name="pencil" size={18} color="#8B5CF6" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item)} className="p-2 bg-slate-50 rounded-full">
            <Icon name="trash" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
      <View className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex-row justify-between">
        <View className="flex-row items-center flex-1 mr-2">
          <Icon name="person" size={16} color="#64748B" className="mr-2" />
          <Text className="text-xs font-semibold text-slate-600" numberOfLines={1}>{item.driver_name}</Text>
        </View>
        <View className="flex-row items-center flex-1 justify-end">
          <Icon name="call" size={16} color="#64748B" className="mr-2" />
          <Text className="text-xs font-semibold text-slate-600">{item.driver_phone}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KidsBackground />
      
      {/* Header */}
      <View className="flex-row items-center justify-between p-5 bg-white shadow-sm z-10">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-slate-50 rounded-full mr-4">
            <Icon name="arrow-back" size={24} color="#334155" />
          </TouchableOpacity>
          <View>
            <Text className="text-slate-800 text-2xl font-black">{isAdmin ? 'Transport Hub' : 'Transport Details'}</Text>
            {isAdmin && <Text className="text-slate-500 text-sm font-medium">{routes.length} total routes</Text>}
          </View>
        </View>
        <Icon name="bus" size={24} color="#F43F5E" />
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#F43F5E" />
        </View>
      ) : isAdmin ? (
        /* Admin View */
        <View className="flex-1 px-5 pt-4">
          <FlatList
            data={routes}
            keyExtractor={(item) => item.id}
            renderItem={renderRouteItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={
              <View className="items-center justify-center mt-20">
                <Icon name="bus-outline" size={60} color="#CBD5E1" />
                <Text className="text-slate-400 mt-4 font-semibold text-lg">No routes found.</Text>
              </View>
            }
          />
          {/* Floating Add Route Button */}
          <TouchableOpacity 
            onPress={openAddModal}
            className="absolute bottom-24 right-6 bg-rose-500 w-16 h-16 rounded-full items-center justify-center shadow-lg"
            style={{ shadowColor: '#F43F5E', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 8 }}
          >
            <Icon name="add" size={32} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        /* Parent View */
        <ScrollView className="flex-1 p-5">
          {studentTransport ? (
            <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <View className="items-center mb-6">
                <View className="bg-rose-50 p-4 rounded-2xl mb-3">
                  <Icon name="bus" size={40} color="#F43F5E" />
                </View>
                <Text className="text-xl font-black text-slate-800 text-center">{studentTransport.route_name}</Text>
                <Text className="text-sm font-bold text-slate-400 mt-1">{studentTransport.vehicle_number}</Text>
              </View>

              <View className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100">
                <View className="flex-row items-center mb-3">
                  <Icon name="person" size={20} color="#14B8A6" className="mr-3" />
                  <View>
                    <Text className="text-[10px] text-slate-400 font-bold uppercase">Driver Name</Text>
                    <Text className="font-bold text-slate-800 mt-0.5">{studentTransport.driver_name}</Text>
                  </View>
                </View>
                <View className="flex-row items-center">
                  <Icon name="call" size={20} color="#14B8A6" className="mr-3" />
                  <View>
                    <Text className="text-[10px] text-slate-400 font-bold uppercase">Phone Number</Text>
                    <Text className="font-bold text-slate-800 mt-0.5">{studentTransport.driver_phone}</Text>
                  </View>
                </View>
              </View>

              <View className="flex-row justify-between">
                <View className="bg-slate-50 rounded-2xl p-4 flex-1 mr-2 border border-slate-100 items-center">
                  <Icon name="location" size={24} color="#8B5CF6" className="mb-2" />
                  <Text className="text-[10px] text-slate-400 font-bold uppercase">Pickup</Text>
                  <Text className="font-black text-slate-800 text-center mt-1">{studentTransport.pickup_time}</Text>
                  <Text className="text-[10px] text-center text-slate-500 mt-1 font-medium">{studentTransport.pickup_point}</Text>
                </View>
                
                <View className="bg-slate-50 rounded-2xl p-4 flex-1 ml-2 border border-slate-100 items-center">
                  <Icon name="home" size={24} color="#F59E0B" className="mb-2" />
                  <Text className="text-[10px] text-slate-400 font-bold uppercase">Drop-off</Text>
                  <Text className="font-black text-slate-800 text-center mt-1">{studentTransport.drop_time}</Text>
                  <Text className="text-[10px] text-center text-slate-500 mt-1 font-medium">{studentTransport.pickup_point}</Text>
                </View>
              </View>
            </View>
          ) : (
            <View className="items-center justify-center py-20">
              <Icon name="bus-outline" size={60} color="#CBD5E1" />
              <Text className="text-lg text-slate-500 mt-4 font-semibold">No transport assigned.</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-black text-slate-800">{isEditing ? 'Edit Route' : 'Create Route'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2 bg-slate-100 rounded-full">
                <Icon name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="mb-4">
                <Text className="text-slate-600 font-bold mb-2 ml-1">Route Name *</Text>
                <TextInput 
                  className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 font-medium"
                  placeholder="e.g. Route A - Town Center"
                  value={routeName}
                  onChangeText={setRouteName}
                />
              </View>

              <View className="flex-row space-x-4 mb-4">
                <View className="flex-1 pr-2">
                  <Text className="text-slate-600 font-bold mb-2 ml-1">Driver Name *</Text>
                  <TextInput 
                    className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 font-medium"
                    placeholder="e.g. John Doe"
                    value={driverName}
                    onChangeText={setDriverName}
                  />
                </View>
                <View className="flex-1 pl-2">
                  <Text className="text-slate-600 font-bold mb-2 ml-1">Driver Phone *</Text>
                  <TextInput 
                    className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 font-medium"
                    placeholder="e.g. 9876543210"
                    value={driverPhone}
                    onChangeText={setDriverPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View className="flex-row space-x-4 mb-6">
                <View className="flex-1 pr-2">
                  <Text className="text-slate-600 font-bold mb-2 ml-1">Vehicle Number *</Text>
                  <TextInput 
                    className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 font-medium"
                    placeholder="e.g. MH 12 AB 1234"
                    value={vehicleNumber}
                    onChangeText={setVehicleNumber}
                    autoCapitalize="characters"
                  />
                </View>
                <View className="flex-1 pl-2">
                  <Text className="text-slate-600 font-bold mb-2 ml-1">Capacity *</Text>
                  <TextInput 
                    className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 font-medium"
                    placeholder="e.g. 15"
                    value={capacity}
                    onChangeText={setCapacity}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <TouchableOpacity 
                onPress={handleSave}
                disabled={saving}
                className="bg-rose-500 py-4 rounded-2xl items-center shadow-sm flex-row justify-center mb-6"
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Icon name="checkmark-circle" size={20} color="#fff" className="mr-2" />
                    <Text className="text-white font-bold text-lg ml-2">{isEditing ? 'Save Changes' : 'Create Route'}</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

export default TransportScreen;
