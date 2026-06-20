import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Dimensions, Alert, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import apiClient from '../api/client';
import KidsBackground from '../components/KidsBackground';
import DocumentPicker, { types } from 'react-native-document-picker';

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

const AddParentStudentScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  
  const [parentName, setParentName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alternativeMobile, setAlternativeMobile] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Dynamic state for multiple children
  const [children, setChildren] = useState<any[]>([
    { id: 1, name: '', admissionNumber: '', grade: '', age: '', profileImage: null }
  ]);

  const addChild = () => {
    if (children.length >= 3) {
      Alert.alert("Limit Reached", "You can add up to 3 children at once.");
      return;
    }
    setChildren([...children, { id: Date.now(), name: '', admissionNumber: '', grade: '', age: '', profileImage: null }]);
  };

  const removeChild = (id: number) => {
    setChildren(children.filter(child => child.id !== id));
  };

  const updateChild = (id: number, field: string, value: any) => {
    setChildren(children.map(child => child.id === id ? { ...child, [field]: value } : child));
  };

  const pickImage = async (id: number) => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [types.images],
      });
      updateChild(id, 'profileImage', res);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert("Error", "Failed to pick image");
      }
    }
  };

  const handleSubmit = async () => {
    if (!parentName || !contactNumber || children.some(c => !c.name || !c.grade)) {
      Alert.alert("Validation Error", "Please fill in all required fields.");
      return;
    }
    
    setLoading(true);
    try {
      const processedChildren = await Promise.all(children.map(async (child) => {
        let profileImageUrl = null;
        if (child.profileImage) {
          const formData = new FormData();
          formData.append('profile_image', {
            uri: child.profileImage.uri,
            type: child.profileImage.type || 'image/jpeg',
            name: child.profileImage.name || 'profile.jpg',
          } as any);
          
          const uploadRes = await apiClient.post('/admin/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          profileImageUrl = uploadRes.data.url;
        }
        
        return {
          ...child,
          profileImageUrl
        };
      }));

      const response = await apiClient.post('/admin/add-family', {
        parentName,
        contactNumber,
        alternativeMobile,
        address,
        email,
        password,
        children: processedChildren
      });
      
      Alert.alert("Success", "Family details saved successfully!");
      navigation.goBack();
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", error.response?.data?.error || "Failed to save details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: Math.max(insets.top, 10) }}>
      <KidsBackground />
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center z-10 bg-white/80">
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          className="bg-white w-12 h-12 rounded-full items-center justify-center mr-4 shadow-sm"
        >
          <Icon name="arrow-back" size={24} color="#334155" />
        </TouchableOpacity>
        <View>
          <Text className="text-slate-800 text-2xl font-black">Add Family</Text>
          <Text className="text-slate-500 text-sm font-medium">Register Parent & Students</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          
          {/* Parent Section */}
          <View className="bg-white p-5 rounded-3xl shadow-sm mb-6 mt-4 border border-slate-100">
            <View className="flex-row items-center mb-4">
              <Icon name="people" size={24} color="#4F46E5" />
              <Text className="text-lg font-bold text-slate-800 ml-2">Parent Details</Text>
            </View>

            <View className="mb-4">
              <Text className="text-xs text-slate-500 mb-1 font-bold uppercase tracking-wider ml-1">Parent Name *</Text>
              <TextInput 
                className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-800 font-medium"
                placeholder="e.g. Rahul Sharma"
                value={parentName}
                onChangeText={setParentName}
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View className="mb-4">
              <Text className="text-xs text-slate-500 mb-1 font-bold uppercase tracking-wider ml-1">Contact Number *</Text>
              <TextInput 
                className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-800 font-medium"
                placeholder="e.g. 9876543210"
                value={contactNumber}
                onChangeText={setContactNumber}
                keyboardType="phone-pad"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View className="mb-4">
              <Text className="text-xs text-slate-500 mb-1 font-bold uppercase tracking-wider ml-1">Alternative Contact</Text>
              <TextInput 
                className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-800 font-medium"
                placeholder="e.g. 9876543211"
                value={alternativeMobile}
                onChangeText={setAlternativeMobile}
                keyboardType="phone-pad"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View className="mb-4">
              <Text className="text-xs text-slate-500 mb-1 font-bold uppercase tracking-wider ml-1">Address</Text>
              <TextInput 
                className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-800 font-medium"
                placeholder="e.g. 123 Main St, City"
                value={address}
                onChangeText={setAddress}
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View className="mb-4">
              <Text className="text-xs text-slate-500 mb-1 font-bold uppercase tracking-wider ml-1">Email Address (For Login)</Text>
              <TextInput 
                className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-800 font-medium"
                placeholder="e.g. rahul@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View className="mb-4">
              <Text className="text-xs text-slate-500 mb-1 font-bold uppercase tracking-wider ml-1">Login Password *</Text>
              <TextInput 
                className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-800 font-medium"
                placeholder="Set a secure password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          {/* Children Section */}
          <Text className="text-lg font-black text-slate-800 mb-4 ml-2">Students</Text>
          
          {children.map((child, index) => (
            <View key={child.id} className="bg-white p-5 rounded-3xl shadow-sm mb-6 border border-slate-100 relative">
              {index > 0 && (
                <TouchableOpacity 
                  onPress={() => removeChild(child.id)}
                  className="absolute top-4 right-4 bg-red-50 p-2 rounded-full z-10"
                >
                  <Icon name="trash" size={20} color="#EF4444" />
                </TouchableOpacity>
              )}
              
              <View className="items-center mb-6 mt-2">
                <TouchableOpacity onPress={() => pickImage(child.id)} className="relative">
                  <View className="w-24 h-24 bg-teal-50 rounded-full items-center justify-center border-2 border-teal-100 overflow-hidden">
                    {child.profileImage ? (
                      <Image source={{ uri: child.profileImage.uri }} className="w-full h-full" />
                    ) : (
                      <Icon name="person" size={40} color="#0D9488" />
                    )}
                  </View>
                  <View className="absolute bottom-0 right-0 bg-teal-600 w-8 h-8 rounded-full items-center justify-center border-2 border-white">
                    <Icon name="camera" size={14} color="#fff" />
                  </View>
                </TouchableOpacity>
                <Text className="text-xs text-slate-400 mt-2 font-bold">Upload Photo</Text>
              </View>

              <View className="mb-4">
                <Text className="text-xs text-slate-500 mb-1 font-bold uppercase tracking-wider ml-1">Student Full Name *</Text>
                <TextInput 
                  className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-800 font-medium"
                  placeholder="e.g. Aryan Sharma"
                  value={child.name}
                  onChangeText={(val) => updateChild(child.id, 'name', val)}
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View className="mb-4">
                <Text className="text-xs text-slate-500 mb-1 font-bold uppercase tracking-wider ml-1">Admission Number</Text>
                <TextInput 
                  className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-800 font-medium"
                  placeholder="e.g. ADM-1234"
                  value={child.admissionNumber}
                  onChangeText={(val) => updateChild(child.id, 'admissionNumber', val)}
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View className="flex-row justify-between mb-2">
                <View className="flex-1 mr-2">
                  <Text className="text-xs text-slate-500 mb-1 font-bold uppercase tracking-wider ml-1">Grade/Class *</Text>
                  <TextInput 
                    className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-800 font-medium"
                    placeholder="e.g. 1st Grade"
                    value={child.grade}
                    onChangeText={(val) => updateChild(child.id, 'grade', val)}
                    placeholderTextColor="#94A3B8"
                  />
                </View>
                <View className="flex-1 ml-2">
                  <Text className="text-xs text-slate-500 mb-1 font-bold uppercase tracking-wider ml-1">Age</Text>
                  <TextInput 
                    className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-800 font-medium"
                    placeholder="e.g. 6"
                    keyboardType="numeric"
                    value={child.age}
                    onChangeText={(val) => updateChild(child.id, 'age', val)}
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>
            </View>
          ))}

          {children.length < 3 && (
            <TouchableOpacity 
              className="flex-row items-center justify-center p-4 bg-slate-50 rounded-2xl mb-8 border border-dashed border-slate-300"
              onPress={addChild}
            >
              <Icon name="add-circle" size={24} color="#0D9488" className="mr-2" />
              <Text className="font-bold text-teal-700 ml-2 text-base">Add Another Child</Text>
            </TouchableOpacity>
          )}

          {/* Submit Button */}
          <TouchableOpacity 
            className={`p-5 rounded-2xl items-center mb-10 ${loading ? 'bg-slate-400' : 'bg-teal-600'}`}
            style={{ shadowColor: '#0D9488', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text className="text-white font-black text-lg">
              {loading ? 'Saving...' : 'Save Complete Record'}
            </Text>
          </TouchableOpacity>
          
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default AddParentStudentScreen;
