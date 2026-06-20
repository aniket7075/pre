import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { logout, setActiveChild } from '../store/slices/authSlice';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, { FadeInDown, FadeInUp, SlideInRight } from 'react-native-reanimated';
import KidsBackground from '../components/KidsBackground';
import apiClient, { BASE_URL } from '../api/client';

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

const AVATAR_COLORS = ['#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899'];

const ParentProfileScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { user, activeChild } = useSelector((state: RootState) => state.auth);

  const [children, setChildren] = useState<any[]>([]);
  const [childDetails, setChildDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    first_name: user?.firstName || '',
    last_name: user?.lastName || '',
    phone_number: '',
  });

  const fetchData = useCallback(async () => {
    try {
      const [childrenRes] = await Promise.all([
        apiClient.get('/users/children'),
      ]);
      setChildren(childrenRes.data);
      if (childrenRes.data.length > 0 && !activeChild) {
        dispatch(setActiveChild(childrenRes.data[0]));
      }
      // Fetch detailed child info if there's an active child
      if (activeChild?.id) {
        try {
          const detailRes = await apiClient.get(`/users/child/${activeChild.id}`);
          setChildDetails(detailRes.data);
        } catch {
          setChildDetails(null);
        }
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeChild]);

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => dispatch(logout() as any),
        },
      ]
    );
  };

  const handleSaveProfile = async () => {
    if (!editForm.first_name.trim() || !editForm.last_name.trim()) {
      Alert.alert('Error', 'Name fields cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      await apiClient.put('/users/me', editForm);
      Alert.alert('Success', 'Profile updated successfully!');
      setEditModalVisible(false);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  const selectChild = (child: any) => {
    dispatch(setActiveChild(child));
  };

  const getAvatarColor = (name: string) => {
    const index = name ? name.charCodeAt(0) % AVATAR_COLORS.length : 0;
    return AVATAR_COLORS[index];
  };

  const initials = (name: string) =>
    name ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : 'P';

  const parentName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Parent';
  const avatarColor = getAvatarColor(parentName);

  // Info row helper
  const InfoRow = ({ icon, label, value, color = '#7C3AED' }: any) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: color + '18', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
        <Icon name={icon} size={18} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 10, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>
        <Text style={{ fontSize: 14, color: '#1E293B', fontWeight: '700', marginTop: 2 }}>{value || 'N/A'}</Text>
      </View>
    </View>
  );

  // Stat card helper
  const StatCard = ({ icon, label, value, color }: any) => (
    <View style={{
      flex: 1,
      backgroundColor: '#fff',
      borderRadius: 18,
      padding: 14,
      alignItems: 'center',
      marginHorizontal: 4,
      shadowColor: color,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    }}>
      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: color + '20', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
        <Icon name={icon} size={20} color={color} />
      </View>
      <Text style={{ fontSize: 18, fontWeight: '900', color: '#1E293B' }}>{value}</Text>
      <Text style={{ fontSize: 10, color: '#94A3B8', fontWeight: '700', marginTop: 2, textAlign: 'center' }}>{label}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC', paddingTop: Math.max(insets.top, 0) }}>
      <KidsBackground />

      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(600)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 14,
          zIndex: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ padding: 10, backgroundColor: '#fff', borderRadius: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 }}
        >
          <Icon name="arrow-back" size={22} color="#334155" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '900', color: '#1E293B' }}>My Profile</Text>
        <TouchableOpacity
          onPress={handleLogout}
          style={{ padding: 10, backgroundColor: '#FEF2F2', borderRadius: 14 }}
        >
          <Icon name="power" size={22} color="#EF4444" />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={{ flex: 1, zIndex: 10 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7C3AED" />}
      >
        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 }}>
            <ActivityIndicator size="large" color="#7C3AED" />
          </View>
        ) : (
          <>
            {/* Profile Hero Card */}
            <Animated.View entering={FadeInDown.delay(100).duration(700)} style={{ marginHorizontal: 20, marginBottom: 24 }}>
              <View style={{
                borderRadius: 28,
                overflow: 'hidden',
                shadowColor: '#7C3AED',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.25,
                shadowRadius: 20,
                elevation: 12,
              }}>
                {/* Gradient-like top */}
                <View style={{ backgroundColor: '#7C3AED', paddingTop: 28, paddingBottom: 50, alignItems: 'center' }}>
                  <View style={{
                    width: 90,
                    height: 90,
                    borderRadius: 45,
                    backgroundColor: '#fff',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 14,
                    borderWidth: 4,
                    borderColor: 'rgba(255,255,255,0.3)',
                    overflow: 'hidden',
                  }}>
                    {user?.profilePictureUrl ? (
                      <Image source={{ uri: `${BASE_URL}${user.profilePictureUrl}` }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : (
                      <Text style={{ fontSize: 32, fontWeight: '900', color: avatarColor }}>
                        {initials(parentName)}
                      </Text>
                    )}
                  </View>
                  <Text style={{ fontSize: 22, fontWeight: '900', color: '#fff' }}>{parentName}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 }}>
                    <Icon name="shield-checkmark" size={12} color="#fff" />
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700', marginLeft: 5, textTransform: 'uppercase' }}>Parent</Text>
                  </View>
                </View>

                {/* Stats strip */}
                <View style={{ backgroundColor: '#fff', flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 16, marginTop: -24 }}>
                  <StatCard icon="people" label="Children" value={children.length} color="#7C3AED" />
                  <StatCard icon="school" label="Enrolled" value={children.filter((c) => c.is_active !== false).length} color="#10B981" />
                  <StatCard icon="star" label="Role" value="Parent" color="#F59E0B" />
                </View>
              </View>
            </Animated.View>

            {/* Edit Profile Button */}
            <Animated.View entering={FadeInDown.delay(200).duration(600)} style={{ marginHorizontal: 20, marginBottom: 20 }}>
              <TouchableOpacity
                onPress={() => {
                  setEditForm({
                    first_name: user?.firstName || '',
                    last_name: user?.lastName || '',
                    phone_number: '',
                  });
                  setEditModalVisible(true);
                }}
                style={{
                  backgroundColor: '#7C3AED',
                  borderRadius: 18,
                  paddingVertical: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#7C3AED',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <Icon name="create-outline" size={18} color="#fff" />
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15, marginLeft: 8 }}>Edit Profile</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Account Information */}
            <Animated.View entering={FadeInDown.delay(250).duration(600)} style={{ marginHorizontal: 20, marginBottom: 20 }}>
              <Text style={{ fontSize: 12, color: '#94A3B8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginLeft: 4 }}>
                Account Information
              </Text>
              <View style={{ backgroundColor: '#fff', borderRadius: 22, padding: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 }}>
                <InfoRow icon="mail-outline" label="Email" value={user?.email} color="#7C3AED" />
                <InfoRow icon="person-outline" label="First Name" value={user?.firstName} color="#10B981" />
                <InfoRow icon="person-outline" label="Last Name" value={user?.lastName} color="#10B981" />
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#F59E0B18', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <Icon name="key-outline" size={18} color="#F59E0B" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 10, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>Role</Text>
                    <Text style={{ fontSize: 14, color: '#1E293B', fontWeight: '700', marginTop: 2, textTransform: 'capitalize' }}>{user?.role?.replace('_', ' ')}</Text>
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* My Children Section */}
            <Animated.View entering={FadeInDown.delay(300).duration(600)} style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 12, color: '#94A3B8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginLeft: 24 }}>
                My Wards ({children.length})
              </Text>
              {children.length === 0 ? (
                <View style={{ marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 22, padding: 24, alignItems: 'center' }}>
                  <Icon name="people-outline" size={40} color="#CBD5E1" />
                  <Text style={{ color: '#94A3B8', fontWeight: '600', marginTop: 10 }}>No children enrolled yet</Text>
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
                  {children.map((child, index) => {
                    const isActive = activeChild?.id === child.id;
                    const childColor = getAvatarColor(child.first_name);
                    return (
                      <Animated.View
                        key={child.id}
                        entering={SlideInRight.delay(index * 80).duration(500)}
                      >
                        <TouchableOpacity
                          onPress={() => selectChild(child)}
                          style={{
                            width: 170,
                            backgroundColor: '#fff',
                            borderRadius: 22,
                            padding: 16,
                            marginRight: 14,
                            borderWidth: 2,
                            borderColor: isActive ? '#7C3AED' : 'transparent',
                            shadowColor: isActive ? '#7C3AED' : '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: isActive ? 0.2 : 0.05,
                            shadowRadius: 10,
                            elevation: isActive ? 6 : 2,
                          }}
                        >
                          {/* Child Avatar */}
                          <View style={{ alignItems: 'center', marginBottom: 12 }}>
                            <View style={{
                              width: 64,
                              height: 64,
                              borderRadius: 32,
                              backgroundColor: childColor + '20',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderWidth: 3,
                              borderColor: isActive ? '#7C3AED' : childColor + '40',
                              overflow: 'hidden',
                            }}>
                              {child.profile_image_url ? (
                                <Image source={{ uri: `${BASE_URL}${child.profile_image_url}` }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                              ) : (
                                <Text style={{ fontSize: 22, fontWeight: '900', color: childColor }}>
                                  {initials(child.first_name)}
                                </Text>
                              )}
                            </View>
                            {isActive && (
                              <View style={{ position: 'absolute', bottom: -2, right: 42, backgroundColor: '#7C3AED', borderRadius: 8, padding: 2, borderWidth: 2, borderColor: '#fff' }}>
                                <Icon name="checkmark" size={8} color="#fff" />
                              </View>
                            )}
                          </View>

                          <Text style={{ fontSize: 15, fontWeight: '900', color: '#1E293B', textAlign: 'center' }}>
                            {child.first_name} {child.last_name}
                          </Text>
                          <Text style={{ fontSize: 11, color: '#7C3AED', fontWeight: '700', textAlign: 'center', marginTop: 2 }}>
                            Grade {child.grade}
                          </Text>
                          <Text style={{ fontSize: 10, color: '#94A3B8', fontWeight: '600', textAlign: 'center', marginTop: 2 }}>
                            ADM: {child.admission_number}
                          </Text>

                          {/* Action Row */}
                          <TouchableOpacity
                            onPress={() => navigation.navigate('StudentProfile', { student: child })}
                            style={{
                              marginTop: 12,
                              backgroundColor: isActive ? '#7C3AED' : '#F1F5F9',
                              borderRadius: 12,
                              paddingVertical: 8,
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Icon name="eye-outline" size={14} color={isActive ? '#fff' : '#64748B'} />
                            <Text style={{ fontSize: 12, fontWeight: '700', color: isActive ? '#fff' : '#64748B', marginLeft: 5 }}>
                              View Profile
                            </Text>
                          </TouchableOpacity>
                        </TouchableOpacity>
                      </Animated.View>
                    );
                  })}
                </ScrollView>
              )}
            </Animated.View>

            {/* Active Child Quick Stats */}
            {activeChild && (
              <Animated.View entering={FadeInUp.delay(400).duration(600)} style={{ marginHorizontal: 20, marginBottom: 20 }}>
                <Text style={{ fontSize: 12, color: '#94A3B8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginLeft: 4 }}>
                  Active Ward Details
                </Text>
                <View style={{
                  backgroundColor: '#fff',
                  borderRadius: 22,
                  padding: 20,
                  shadowColor: '#7C3AED',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.08,
                  shadowRadius: 12,
                  elevation: 3,
                }}>
                  {/* Child Header */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
                    <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#7C3AED20', alignItems: 'center', justifyContent: 'center', marginRight: 12, overflow: 'hidden' }}>
                      {activeChild.profile_image_url ? (
                        <Image source={{ uri: `${BASE_URL}${activeChild.profile_image_url}` }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                      ) : (
                        <Text style={{ fontSize: 18, fontWeight: '900', color: '#7C3AED' }}>{initials(activeChild.first_name)}</Text>
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 17, fontWeight: '900', color: '#1E293B' }}>
                        {activeChild.first_name} {activeChild.last_name}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#7C3AED', fontWeight: '700' }}>
                        Grade {activeChild.grade} • ADM #{activeChild.admission_number}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('StudentProfile', { student: activeChild })}
                      style={{ backgroundColor: '#EEF2FF', padding: 10, borderRadius: 12 }}
                    >
                      <Icon name="open-outline" size={18} color="#7C3AED" />
                    </TouchableOpacity>
                  </View>

                  {/* Quick links */}
                  {[
                    { icon: 'calendar', label: 'Attendance', screen: 'Attendance', color: '#8B5CF6' },
                    { icon: 'book', label: 'Homework', screen: 'Homework', color: '#14B8A6' },
                    { icon: 'cash', label: 'Fee Status', screen: 'Fees', color: '#10B981' },
                    { icon: 'stats-chart', label: 'Results', screen: 'Result', color: '#F59E0B' },
                  ].map((link, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => navigation.navigate(link.screen)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 12,
                        borderBottomWidth: idx < 3 ? 1 : 0,
                        borderBottomColor: '#F8FAFC',
                      }}
                    >
                      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: link.color + '15', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                        <Icon name={link.icon} size={18} color={link.color} />
                      </View>
                      <Text style={{ flex: 1, fontSize: 14, fontWeight: '700', color: '#334155' }}>{link.label}</Text>
                      <Icon name="chevron-forward" size={16} color="#CBD5E1" />
                    </TouchableOpacity>
                  ))}
                </View>
              </Animated.View>
            )}

            {/* Logout Button */}
            <Animated.View entering={FadeInUp.delay(500).duration(600)} style={{ marginHorizontal: 20, marginBottom: 30 }}>
              <TouchableOpacity
                onPress={handleLogout}
                style={{
                  backgroundColor: '#FEF2F2',
                  borderRadius: 18,
                  paddingVertical: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: '#FECACA',
                }}
              >
                <Icon name="power" size={18} color="#EF4444" />
                <Text style={{ color: '#EF4444', fontWeight: '800', fontSize: 15, marginLeft: 8 }}>Logout</Text>
              </TouchableOpacity>
            </Animated.View>
          </>
        )}
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent onRequestClose={() => setEditModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} activeOpacity={1} onPress={() => setEditModalVisible(false)} />
          <View style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            padding: 28,
            paddingBottom: Math.max(insets.bottom + 20, 30),
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          }}>
            <View style={{ width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 }} />
            <Text style={{ fontSize: 20, fontWeight: '900', color: '#1E293B', marginBottom: 6 }}>Edit Profile</Text>
            <Text style={{ fontSize: 13, color: '#94A3B8', fontWeight: '500', marginBottom: 24 }}>Update your account information</Text>

            {[
              { key: 'first_name', label: 'First Name', icon: 'person-outline', placeholder: 'Enter first name' },
              { key: 'last_name', label: 'Last Name', icon: 'person-outline', placeholder: 'Enter last name' },
              { key: 'phone_number', label: 'Phone Number', icon: 'call-outline', placeholder: 'Enter phone number' },
            ].map((field) => (
              <View key={field.key} style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{field.label}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 14 }}>
                  <Icon name={field.icon} size={18} color="#94A3B8" />
                  <TextInput
                    value={(editForm as any)[field.key]}
                    onChangeText={(v) => setEditForm((prev) => ({ ...prev, [field.key]: v }))}
                    placeholder={field.placeholder}
                    placeholderTextColor="#CBD5E1"
                    style={{ flex: 1, paddingVertical: 13, paddingLeft: 10, fontSize: 15, color: '#1E293B', fontWeight: '600' }}
                  />
                </View>
              </View>
            ))}

            <TouchableOpacity
              onPress={handleSaveProfile}
              disabled={saving}
              style={{
                backgroundColor: '#7C3AED',
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: 'center',
                marginTop: 8,
                shadowColor: '#7C3AED',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.35,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default ParentProfileScreen;
