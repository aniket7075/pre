import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, Modal, Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import apiClient from '../api/client';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import KidsBackground from '../components/KidsBackground';

type Props = { navigation: NativeStackNavigationProp<any, any> };

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  pending:  { color: '#D97706', bg: '#FFFBEB', label: 'Pending' },
  approved: { color: '#059669', bg: '#ECFDF5', label: 'Approved' },
  rejected: { color: '#DC2626', bg: '#FEF2F2', label: 'Rejected' },
};

const LeaveScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, activeChild } = useSelector((state: RootState) => state.auth);
  const isParent = user?.role === 'parent';

  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const fetchLeaves = async () => {
    try {
      const response = await apiClient.get('/leaves');
      setLeaves(response.data.data || []);
    } catch (error) {
      console.error('Fetch leaves error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const handleApplyLeave = async () => {
    if (!startDate || !endDate || !reason) {
      Alert.alert('Missing Fields', 'Please fill start date, end date, and reason');
      return;
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      Alert.alert('Invalid Date', 'Please use YYYY-MM-DD format (e.g., 2024-06-15)');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      Alert.alert('Invalid Dates', 'End date cannot be before start date');
      return;
    }

    if (!activeChild?.id) {
      Alert.alert('No Child Selected', 'Please select a child from the dashboard first');
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.post('/leaves', {
        student_id: activeChild.id,
        start_date: startDate,
        end_date: endDate,
        reason,
      });
      Alert.alert('Success! 🎉', 'Leave application submitted. You can track its status here.');
      setShowForm(false);
      setStartDate('');
      setEndDate('');
      setReason('');
      fetchLeaves();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to submit leave application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    Alert.alert(
      `${status.charAt(0).toUpperCase() + status.slice(1)} Leave?`,
      `Are you sure you want to ${status} this leave application?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: status === 'rejected' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await apiClient.put(`/leaves/${id}/status`, { status });
              fetchLeaves();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.error || 'Failed to update');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC', paddingTop: Math.max(insets.top, 0) }}>
      <KidsBackground />

      {/* Header */}
      <Animated.View entering={FadeInDown.duration(600)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, zIndex: 10 }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ padding: 10, backgroundColor: '#fff', borderRadius: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 }}
        >
          <Icon name="arrow-back" size={22} color="#334155" />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>Management</Text>
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#1E293B' }}>Leave Applications</Text>
        </View>
        {isParent ? (
          <TouchableOpacity
            onPress={() => setShowForm(!showForm)}
            style={{ padding: 10, backgroundColor: showForm ? '#F1F5F9' : '#7C3AED', borderRadius: 14, elevation: 3 }}
          >
            <Icon name={showForm ? 'close' : 'add'} size={22} color={showForm ? '#475569' : '#fff'} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </Animated.View>

      {/* Apply Leave Form */}
      {showForm && isParent && (
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={{
            backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 24, padding: 20, zIndex: 10,
            shadowColor: '#7C3AED', shadowOpacity: 0.1, shadowRadius: 16, elevation: 6, marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '800', color: '#1E293B', marginBottom: 14 }}>
            Apply Leave {activeChild ? `for ${activeChild.first_name}` : ''}
          </Text>

          {!activeChild && (
            <View style={{ backgroundColor: '#FEF3C7', borderRadius: 12, padding: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="warning" size={16} color="#D97706" />
              <Text style={{ color: '#92400E', fontSize: 12, fontWeight: '600', marginLeft: 8, flex: 1 }}>
                No child selected. Go to dashboard and select a child.
              </Text>
            </View>
          )}

          <Text style={{ color: '#64748B', fontWeight: '700', fontSize: 12, marginBottom: 6 }}>START DATE</Text>
          <TextInput
            style={{ backgroundColor: '#F8FAFC', padding: 14, borderRadius: 14, marginBottom: 12, fontWeight: '600', color: '#1E293B', borderWidth: 1, borderColor: '#E2E8F0' }}
            value={startDate}
            onChangeText={setStartDate}
            placeholder="YYYY-MM-DD (e.g. 2024-06-15)"
            placeholderTextColor="#CBD5E1"
          />
          <Text style={{ color: '#64748B', fontWeight: '700', fontSize: 12, marginBottom: 6 }}>END DATE</Text>
          <TextInput
            style={{ backgroundColor: '#F8FAFC', padding: 14, borderRadius: 14, marginBottom: 12, fontWeight: '600', color: '#1E293B', borderWidth: 1, borderColor: '#E2E8F0' }}
            value={endDate}
            onChangeText={setEndDate}
            placeholder="YYYY-MM-DD (e.g. 2024-06-16)"
            placeholderTextColor="#CBD5E1"
          />
          <Text style={{ color: '#64748B', fontWeight: '700', fontSize: 12, marginBottom: 6 }}>REASON</Text>
          <TextInput
            style={{ backgroundColor: '#F8FAFC', padding: 14, borderRadius: 14, marginBottom: 16, fontWeight: '600', color: '#1E293B', height: 90, textAlignVertical: 'top', borderWidth: 1, borderColor: '#E2E8F0' }}
            value={reason}
            onChangeText={setReason}
            placeholder="Reason for leave application..."
            placeholderTextColor="#CBD5E1"
            multiline
          />
          <TouchableOpacity
            onPress={handleApplyLeave}
            disabled={submitting}
            style={{ backgroundColor: submitting ? '#C4B5FD' : '#7C3AED', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
          >
            {submitting ? <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} /> : <Icon name="paper-plane" size={18} color="#fff" />}
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15, marginLeft: 8 }}>
              {submitting ? 'Submitting...' : 'Submit Application'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      ) : (
        <FlatList
          data={leaves}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, zIndex: 10 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => {
            const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
            const startStr = item.start_date?.substring(0, 10);
            const endStr = item.end_date?.substring(0, 10);
            const days = startStr && endStr
              ? Math.ceil((new Date(endStr).getTime() - new Date(startStr).getTime()) / 86400000) + 1
              : 0;

            return (
              <Animated.View entering={FadeInUp.delay(60 * index).duration(500)}>
                <View style={{
                  backgroundColor: '#fff', borderRadius: 22, padding: 18, marginBottom: 12,
                  shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, elevation: 2,
                  borderLeftWidth: 5, borderLeftColor: cfg.color,
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={{ fontSize: 16, fontWeight: '900', color: '#1E293B' }}>
                        {item.student_name || 'Student'}
                      </Text>
                      {item.grade && (
                        <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '600', marginTop: 2 }}>Grade: {item.grade}</Text>
                      )}
                      {item.parent_name && (
                        <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '600' }}>Parent: {item.parent_name}</Text>
                      )}
                    </View>
                    <View style={{ backgroundColor: cfg.bg, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 }}>
                      <Text style={{ color: cfg.color, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' }}>{cfg.label}</Text>
                    </View>
                  </View>

                  <View style={{ backgroundColor: '#F8FAFC', borderRadius: 14, padding: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ fontSize: 10, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>From</Text>
                      <Text style={{ fontSize: 13, fontWeight: '800', color: '#334155', marginTop: 2 }}>{startStr}</Text>
                    </View>
                    <View style={{ alignItems: 'center', flex: 1 }}>
                      <View style={{ width: 60, height: 2, backgroundColor: '#E2E8F0', borderRadius: 1 }} />
                      <Text style={{ fontSize: 10, color: '#94A3B8', fontWeight: '600', marginTop: 4 }}>{days} day{days !== 1 ? 's' : ''}</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ fontSize: 10, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>To</Text>
                      <Text style={{ fontSize: 13, fontWeight: '800', color: '#334155', marginTop: 2 }}>{endStr}</Text>
                    </View>
                  </View>

                  <Text style={{ fontSize: 13, color: '#475569', fontStyle: 'italic', marginBottom: 8, lineHeight: 18 }}>
                    "{item.reason}"
                  </Text>

                  {/* Approve/Reject buttons for teacher/admin */}
                  {!isParent && item.status === 'pending' && (
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10 }}>
                      <TouchableOpacity
                        onPress={() => handleUpdateStatus(item.id, 'rejected')}
                        style={{ backgroundColor: '#FEE2E2', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 }}
                      >
                        <Text style={{ color: '#DC2626', fontWeight: '700', fontSize: 13 }}>Reject</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleUpdateStatus(item.id, 'approved')}
                        style={{ backgroundColor: '#D1FAE5', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 }}
                      >
                        <Text style={{ color: '#059669', fontWeight: '700', fontSize: 13 }}>Approve</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </Animated.View>
            );
          }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Icon name="document-text-outline" size={36} color="#CBD5E1" />
              </View>
              <Text style={{ color: '#94A3B8', fontWeight: '700', fontSize: 16 }}>No leave applications yet</Text>
              {isParent && <Text style={{ color: '#CBD5E1', fontSize: 13, marginTop: 6 }}>Tap + to apply for leave</Text>}
            </View>
          }
        />
      )}
    </View>
  );
};

export default LeaveScreen;
