import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import KidsBackground from '../components/KidsBackground';
import { BASE_URL } from '../api/client';

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
  route: any;
};

const StudentProfileScreen: React.FC<Props> = ({ navigation, route }) => {
  const { student } = route.params;

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KidsBackground />
      {/* Header */}
      <View className="flex-row items-center justify-between p-5 bg-white shadow-sm z-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-slate-50 rounded-full">
          <Icon name="arrow-back" size={24} color="#334155" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-slate-800">Student Profile</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Top Profile Card */}
        <View className="bg-white items-center pt-8 pb-6 px-5 border-b border-slate-100">
          <View className="w-28 h-28 bg-teal-100 rounded-full items-center justify-center mb-4 border-4 border-white shadow-sm overflow-hidden">
            {student.profile_image_url ? (
              <Image source={{ uri: `${BASE_URL}${student.profile_image_url}` }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <Icon name="person" size={50} color="#0D9488" />
            )}
          </View>
          <Text className="text-2xl font-black text-slate-800">{student.first_name} {student.last_name}</Text>
          <View className="flex-row items-center mt-2 bg-slate-50 px-3 py-1 rounded-full">
            <Icon name="id-card" size={14} color="#64748B" />
            <Text className="text-slate-600 font-bold text-xs ml-1 uppercase tracking-wider">ADM: {student.admission_number}</Text>
          </View>
          
          {!student.is_active && (
            <View className="bg-red-100 px-3 py-1 rounded-full mt-3 flex-row items-center">
              <Icon name="warning" size={14} color="#DC2626" />
              <Text className="text-red-700 text-xs font-bold ml-1 uppercase">Inactive Profile</Text>
            </View>
          )}
        </View>

        {/* Action Buttons Row */}
        <View className="flex-row px-5 py-6 space-x-4">
          <TouchableOpacity className="flex-1 bg-teal-600 rounded-2xl py-3.5 items-center shadow-sm flex-row justify-center">
            <Icon name="document-text" size={18} color="#fff" />
            <Text className="text-white font-bold ml-2">Attendance</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-slate-800 rounded-2xl py-3.5 items-center shadow-sm flex-row justify-center">
            <Icon name="cash" size={18} color="#fff" />
            <Text className="text-white font-bold ml-2">Fee History</Text>
          </TouchableOpacity>
        </View>

        {/* Parent Details Card */}
        <View className="px-5 mb-6">
          <Text className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Parent Information</Text>
          <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 bg-indigo-50 rounded-full items-center justify-center mr-3">
                <Icon name="people" size={20} color="#4F46E5" />
              </View>
              <View>
                <Text className="text-xs text-slate-400 font-bold uppercase">Parent Name</Text>
                <Text className="text-base font-bold text-slate-800">{student.parent_name || 'N/A'}</Text>
              </View>
            </View>
            
            <View className="h-[1px] w-full bg-slate-50 mb-4" />
            
            <View className="flex-row justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-8 h-8 bg-slate-50 rounded-full items-center justify-center mr-2">
                  <Icon name="call" size={16} color="#64748B" />
                </View>
                <View>
                  <Text className="text-[10px] text-slate-400 font-bold uppercase">Contact</Text>
                  <Text className="text-sm font-bold text-slate-700">{student.contact_number || 'N/A'}</Text>
                </View>
              </View>
              
              <View className="flex-row items-center flex-1 pl-2">
                <View className="w-8 h-8 bg-slate-50 rounded-full items-center justify-center mr-2">
                  <Icon name="mail" size={16} color="#64748B" />
                </View>
                <View className="flex-1">
                  <Text className="text-[10px] text-slate-400 font-bold uppercase">Email</Text>
                  <Text className="text-sm font-bold text-slate-700" numberOfLines={1}>{student.parent_email || 'N/A'}</Text>
                </View>
              </View>
            </View>

            <View className="flex-row justify-between mt-4">
              <View className="flex-row items-center flex-1">
                <View className="w-8 h-8 bg-slate-50 rounded-full items-center justify-center mr-2">
                  <Icon name="call" size={16} color="#64748B" />
                </View>
                <View>
                  <Text className="text-[10px] text-slate-400 font-bold uppercase">Alternative Contact</Text>
                  <Text className="text-sm font-bold text-slate-700">{student.alternative_mobile || 'N/A'}</Text>
                </View>
              </View>
            </View>
            
            {student.address && (
              <View className="mt-4 pt-4 border-t border-slate-50">
                <View className="flex-row items-start">
                  <View className="w-8 h-8 bg-slate-50 rounded-full items-center justify-center mr-2 mt-1">
                    <Icon name="location" size={16} color="#64748B" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[10px] text-slate-400 font-bold uppercase">Address</Text>
                    <Text className="text-sm font-bold text-slate-700 mt-1">{student.address}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Personal Details Card */}
        <View className="px-5 mb-6">
          <Text className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Personal Details</Text>
          <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
            <View className="flex-row justify-between mb-4">
              <View className="flex-1">
                <Text className="text-xs text-slate-400 font-bold uppercase">Date of Birth</Text>
                <Text className="text-sm font-bold text-slate-800 mt-1">{student.date_of_birth || 'Not specified'}</Text>
              </View>
              <View className="flex-1 pl-4">
                <Text className="text-xs text-slate-400 font-bold uppercase">Gender</Text>
                <Text className="text-sm font-bold text-slate-800 mt-1">{student.gender || 'Not specified'}</Text>
              </View>
            </View>
            <View className="flex-row justify-between">
              <View className="flex-1">
                <Text className="text-xs text-slate-400 font-bold uppercase">Blood Group</Text>
                <Text className="text-sm font-bold text-slate-800 mt-1">{student.blood_group || 'Not specified'}</Text>
              </View>
              <View className="flex-1 pl-4">
                <Text className="text-xs text-slate-400 font-bold uppercase">Joined Date</Text>
                <Text className="text-sm font-bold text-slate-800 mt-1">
                  {student.created_at ? new Date(student.created_at).toLocaleDateString() : 'Unknown'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Emergency Contact Card */}
        <View className="px-5 mb-8">
          <Text className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Emergency Contact</Text>
          <View className="bg-orange-50 rounded-3xl p-5 border border-orange-100 shadow-sm">
            <View className="flex-row justify-between">
              <View className="flex-1">
                <Text className="text-xs text-orange-700 font-black uppercase">Contact Person</Text>
                <Text className="text-sm font-bold text-slate-800 mt-1">{student.emergency_contact_name || 'Not specified'}</Text>
              </View>
              <View className="flex-1 pl-4">
                <Text className="text-xs text-orange-700 font-black uppercase">Phone Number</Text>
                <Text className="text-sm font-bold text-slate-800 mt-1">{student.emergency_contact_phone || 'Not specified'}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default StudentProfileScreen;
