import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import apiClient from '../api/client';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import KidsBackground from '../components/KidsBackground';

type Props = { navigation: NativeStackNavigationProp<any, any>; };

const CertificateScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, activeChild } = useSelector((state: RootState) => state.auth);
  const isParent = user?.role === 'parent';
  
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states (for parents)
  const [showForm, setShowForm] = useState(false);
  const [certType, setCertType] = useState('Bonafide Certificate');
  const [reason, setReason] = useState('');

  const fetchCerts = async () => {
    try {
      const response = await apiClient.get('/certificates');
      setCerts(response.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCerts();
  }, [activeChild?.id]);

  const handleApply = async () => {
    if (!reason) {
      Alert.alert('Error', 'Please provide a reason');
      return;
    }
    if (isParent && !activeChild?.id) {
      Alert.alert('Error', 'Please select a child first');
      return;
    }
    try {
      await apiClient.post('/certificates', {
        student_id: isParent ? activeChild?.id : null,
        type: certType,
        reason
      });
      Alert.alert('Success', 'Application submitted');
      setShowForm(false);
      setReason('');
      fetchCerts();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to apply');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await apiClient.put(`/certificates/${id}/status`, { status });
      fetchCerts();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update');
    }
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: Math.max(insets.top, 10) }}>
      <KidsBackground />
      <View className="flex-row items-center justify-between px-6 py-4 mb-2">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="bg-gray-50 p-3 rounded-full mr-4">
            <Icon name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text className="text-textPrimary text-2xl font-black">Certificates</Text>
        </View>
        {isParent && (
          <TouchableOpacity onPress={() => setShowForm(!showForm)} className="bg-primary p-2 rounded-full">
            <Icon name={showForm ? "close" : "add"} size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {showForm && isParent && (
        <View className="p-5 bg-gray-50 m-5 rounded-2xl border border-gray-200">
          <Text className="font-bold mb-2">Certificate Type</Text>
          <View className="flex-row mb-4 space-x-2">
            {['Bonafide', 'Leaving'].map(t => (
              <TouchableOpacity 
                key={t}
                onPress={() => setCertType(`${t} Certificate`)}
                className={`px-4 py-2 rounded-lg border ${certType.includes(t) ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
              >
                <Text className={`font-bold ${certType.includes(t) ? 'text-white' : 'text-gray-600'}`}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text className="font-bold mb-2">Reason</Text>
          <TextInput className="bg-white p-3 rounded-xl mb-4 border border-gray-100" value={reason} onChangeText={setReason} placeholder="Required for passport..." multiline />
          <TouchableOpacity className="bg-primary p-4 rounded-xl items-center" onPress={handleApply}>
            <Text className="text-white font-bold">Submit Request</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#4F46E5" className="mt-10" />
      ) : (
        <FlatList
          data={certs}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <View className="bg-white p-4 rounded-2xl shadow-sm mb-4 border border-gray-100">
              <View className="flex-row justify-between mb-2">
                <View className="flex-1 mr-2">
                  <Text className="font-bold text-lg">{item.type}</Text>
                  {!isParent && <Text className="text-gray-500 font-semibold text-sm">{item.student_name}</Text>}
                </View>
                <View className={`px-2 py-1 rounded-md self-start ${item.status === 'ready' ? 'bg-green-100' : item.status === 'rejected' ? 'bg-red-100' : 'bg-orange-100'}`}>
                  <Text className={`text-xs font-bold ${item.status === 'ready' ? 'text-green-700' : item.status === 'rejected' ? 'text-red-700' : 'text-orange-700'}`}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text className="text-gray-800 mb-1">{item.reason}</Text>
              <Text className="text-xs text-gray-400 mb-3">Applied on: {item.created_at ? item.created_at.substring(0, 10) : ''}</Text>
              
              {!isParent && item.status === 'pending' && (
                <View className="flex-row justify-end space-x-3 mt-2 border-t border-gray-100 pt-3">
                  <TouchableOpacity onPress={() => handleUpdateStatus(item.id, 'rejected')} className="px-4 py-2 bg-red-50 rounded-lg mr-2">
                    <Text className="text-red-600 font-bold">Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleUpdateStatus(item.id, 'ready')} className="px-4 py-2 bg-green-50 rounded-lg">
                    <Text className="text-green-600 font-bold">Mark Ready</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={<Text className="text-center text-gray-500 mt-10">No certificate requests found.</Text>}
        />
      )}
    </View>
  );
};

export default CertificateScreen;
