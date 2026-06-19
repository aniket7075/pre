import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Dimensions, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import apiClient from '../api/client';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

const AddParentStudentScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  
  const [parentName, setParentName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Dynamic state for multiple children
  const [children, setChildren] = useState([
    { id: 1, name: '', grade: '', age: '' }
  ]);

  const addChild = () => {
    if (children.length >= 3) {
      Alert.alert("Limit Reached", "You can add up to 3 children at once.");
      return;
    }
    setChildren([...children, { id: Date.now(), name: '', grade: '', age: '' }]);
  };

  const removeChild = (id: number) => {
    setChildren(children.filter(child => child.id !== id));
  };

  const updateChild = (id: number, field: string, value: string) => {
    setChildren(children.map(child => child.id === id ? { ...child, [field]: value } : child));
  };

  const handleSubmit = async () => {
    if (!parentName || !contactNumber || children.some(c => !c.name || !c.grade)) {
      Alert.alert("Validation Error", "Please fill in all required fields.");
      return;
    }
    
    setLoading(true);
    try {
      const response = await apiClient.post('/admin/add-family', {
        parentName,
        contactNumber,
        email,
        children
      });
      
      Alert.alert("Success", "Parent & Student details saved successfully!");
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
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Sleek Header */}
        <View className="flex-row items-center px-6 py-4 mb-2">
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            className="bg-gray-50 p-3 rounded-full mr-4"
          >
            <Icon name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <View>
            <Text className="text-textSecondary text-xs font-semibold tracking-widest uppercase">New Admission</Text>
            <Text className="text-textPrimary text-2xl font-black">Add Family</Text>
          </View>
        </View>
      
        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
          
          {/* Parent Details Section */}
          <View 
            className="bg-white p-5 rounded-3xl mb-6 mt-2"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)' }}
          >
            <View className="flex-row items-center mb-5">
              <View className="bg-indigo-50 p-2 rounded-xl mr-3">
                <Icon name="person" size={22} color="#6366F1" />
              </View>
              <Text className="text-lg font-bold text-textPrimary">Parent Details</Text>
            </View>
            
            <Text className="text-xs text-textSecondary mb-1.5 font-bold uppercase tracking-wider ml-1">Full Name *</Text>
            <TextInput 
              className="bg-gray-50 rounded-2xl p-4 mb-4 text-textPrimary font-medium border border-gray-100"
              placeholder="e.g. Rahul Sharma"
              value={parentName}
              onChangeText={setParentName}
              placeholderTextColor="#94A3B8"
            />

            <Text className="text-xs text-textSecondary mb-1.5 font-bold uppercase tracking-wider ml-1">Contact Number *</Text>
            <TextInput 
              className="bg-gray-50 rounded-2xl p-4 mb-4 text-textPrimary font-medium border border-gray-100"
              placeholder="e.g. 9876543210"
              keyboardType="phone-pad"
              value={contactNumber}
              onChangeText={setContactNumber}
              placeholderTextColor="#94A3B8"
            />
            
            <Text className="text-xs text-textSecondary mb-1.5 font-bold uppercase tracking-wider ml-1">Email Address</Text>
            <TextInput 
              className="bg-gray-50 rounded-2xl p-4 mb-2 text-textPrimary font-medium border border-gray-100"
              placeholder="e.g. rahul@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Children Details Section */}
          <View className="flex-row items-center mb-4 mt-2 px-1">
            <View className="bg-teal-50 p-2 rounded-xl mr-3">
              <Icon name="people" size={22} color="#14B8A6" />
            </View>
            <Text className="text-lg font-bold text-textPrimary">Children Details</Text>
          </View>

          {children.map((child, index) => (
            <View 
              key={child.id} 
              className="bg-white p-5 rounded-3xl mb-5"
              style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)' }}
            >
              <View className="flex-row justify-between items-center mb-5">
                <View className="bg-teal-500 px-3 py-1 rounded-full">
                  <Text className="text-xs font-bold text-white uppercase tracking-wider">Child {index + 1}</Text>
                </View>
                {children.length > 1 && (
                  <TouchableOpacity 
                    onPress={() => removeChild(child.id)}
                    className="bg-red-50 p-2 rounded-full"
                  >
                    <Icon name="trash" size={18} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
              
              <Text className="text-xs text-textSecondary mb-1.5 font-bold uppercase tracking-wider ml-1">Student Name *</Text>
              <TextInput 
                className="bg-gray-50 rounded-2xl p-4 mb-4 text-textPrimary font-medium border border-gray-100"
                placeholder="e.g. Aarav Sharma"
                value={child.name}
                onChangeText={(val) => updateChild(child.id, 'name', val)}
                placeholderTextColor="#94A3B8"
              />

              <View className="flex-row justify-between">
                <View className="flex-1 mr-2">
                  <Text className="text-xs text-textSecondary mb-1.5 font-bold uppercase tracking-wider ml-1">Grade/Class *</Text>
                  <TextInput 
                    className="bg-gray-50 rounded-2xl p-4 mb-2 text-textPrimary font-medium border border-gray-100"
                    placeholder="e.g. 1st Grade"
                    value={child.grade}
                    onChangeText={(val) => updateChild(child.id, 'grade', val)}
                    placeholderTextColor="#94A3B8"
                  />
                </View>
                <View className="flex-1 ml-2">
                  <Text className="text-xs text-textSecondary mb-1.5 font-bold uppercase tracking-wider ml-1">Age</Text>
                  <TextInput 
                    className="bg-gray-50 rounded-2xl p-4 mb-2 text-textPrimary font-medium border border-gray-100"
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
              className="flex-row items-center justify-center p-4 bg-gray-50 rounded-2xl mb-8 border border-dashed border-gray-300"
              onPress={addChild}
            >
              <Icon name="add-circle" size={24} color="#6366F1" className="mr-2" />
              <Text className="font-bold text-primary ml-2 text-base">Add Another Child</Text>
            </TouchableOpacity>
          )}

          {/* Submit Button */}
          <TouchableOpacity 
            className={`p-5 rounded-2xl items-center mb-10 ${loading ? 'bg-gray-400' : 'bg-primary'}`}
            style={{ shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text className="text-white font-bold text-lg">
              {loading ? 'Saving...' : 'Save Record'}
            </Text>
          </TouchableOpacity>
          
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default AddParentStudentScreen;
