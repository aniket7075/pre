import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
  RefreshControl, Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import apiClient from '../api/client';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import KidsBackground from '../components/KidsBackground';

type Props = { navigation: NativeStackNavigationProp<any, any> };

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: string; label: string }> = {
  present:  { color: '#10B981', bg: '#ECFDF5', icon: 'checkmark-circle', label: 'Present' },
  absent:   { color: '#EF4444', bg: '#FEF2F2', icon: 'close-circle',    label: 'Absent'  },
  late:     { color: '#F59E0B', bg: '#FFFBEB', icon: 'time',            label: 'Late'    },
  leave:    { color: '#8B5CF6', bg: '#F5F3FF', icon: 'airplane',        label: 'Leave'   },
  half_day: { color: '#3B82F6', bg: '#EFF6FF', icon: 'contrast',        label: 'Half Day'},
};

const AttendanceScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { activeChild } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [summary, setSummary] = useState({ present: 0, absent: 0, late: 0, leave: 0, half_day: 0 });

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const fetchAttendance = useCallback(async () => {
    if (!activeChild?.id) {
      setLoading(false);
      return;
    }
    try {
      const response = await apiClient.get(
        `/attendance/${activeChild.id}?month=${selectedMonth}&year=${selectedYear}`
      );
      setAttendance(response.data.data || []);
      setSummary(response.data.summary || { present: 0, absent: 0, late: 0, leave: 0, half_day: 0 });
    } catch (error) {
      console.error('Attendance fetch error:', error);
      Alert.alert('Error', 'Could not load attendance data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeChild?.id, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const onRefresh = () => { setRefreshing(true); fetchAttendance(); };

  const prevMonth = () => {
    if (selectedMonth === 1) { setSelectedMonth(12); setSelectedYear(y => y - 1); }
    else setSelectedMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (selectedMonth === 12) { setSelectedMonth(1); setSelectedYear(y => y + 1); }
    else setSelectedMonth(m => m + 1);
  };

  const totalMarked = attendance.length;
  const attendanceRate = totalMarked > 0 ? Math.round((summary.present + summary.late) / totalMarked * 100) : 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC', paddingTop: Math.max(insets.top, 0) }}>
      <KidsBackground />

      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(600)}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, zIndex: 10 }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ padding: 10, backgroundColor: '#fff', borderRadius: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 }}
        >
          <Icon name="arrow-back" size={22} color="#334155" />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>
            {activeChild?.first_name || 'Child'}
          </Text>
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#1E293B' }}>Attendance</Text>
        </View>
        <View style={{ width: 44 }} />
      </Animated.View>

      <ScrollView
        style={{ flex: 1, zIndex: 10 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7C3AED" />}
      >
        {/* Month Selector */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={{ marginHorizontal: 20, marginBottom: 16 }}>
          <View style={{
            backgroundColor: '#fff', borderRadius: 20, padding: 16,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, elevation: 2,
          }}>
            <TouchableOpacity onPress={prevMonth} style={{ padding: 8, backgroundColor: '#F1F5F9', borderRadius: 12 }}>
              <Icon name="chevron-back" size={20} color="#475569" />
            </TouchableOpacity>
            <Text style={{ fontSize: 17, fontWeight: '900', color: '#1E293B' }}>
              {MONTHS[selectedMonth - 1]} {selectedYear}
            </Text>
            <TouchableOpacity onPress={nextMonth} style={{ padding: 8, backgroundColor: '#F1F5F9', borderRadius: 12 }}>
              <Icon name="chevron-forward" size={20} color="#475569" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Summary Cards */}
        <Animated.View entering={FadeInDown.delay(150).duration(600)} style={{ marginHorizontal: 20, marginBottom: 20 }}>
          {/* Attendance Rate */}
          <View style={{
            backgroundColor: '#7C3AED', borderRadius: 22, padding: 20,
            marginBottom: 12, shadowColor: '#7C3AED', shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Attendance Rate
                </Text>
                <Text style={{ color: '#fff', fontSize: 42, fontWeight: '900', marginTop: 4 }}>{attendanceRate}%</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600', marginTop: 2 }}>
                  {summary.present + summary.late} present out of {totalMarked} days
                </Text>
              </View>
              <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="calendar-outline" size={36} color="#fff" />
              </View>
            </View>
            {/* Progress Bar */}
            <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, height: 8, marginTop: 14 }}>
              <View style={{ backgroundColor: '#fff', borderRadius: 8, height: 8, width: `${attendanceRate}%` as any }} />
            </View>
          </View>

          {/* Stat Grid */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <View key={key} style={{
                width: '48%', backgroundColor: cfg.bg, borderRadius: 16, padding: 14,
                marginBottom: 10, flexDirection: 'row', alignItems: 'center',
              }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                  <Icon name={cfg.icon} size={18} color={cfg.color} />
                </View>
                <View>
                  <Text style={{ fontSize: 20, fontWeight: '900', color: cfg.color }}>{summary[key as keyof typeof summary]}</Text>
                  <Text style={{ fontSize: 10, color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>{cfg.label}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Records List */}
        <Animated.View entering={FadeInUp.delay(250).duration(600)} style={{ marginHorizontal: 20 }}>
          <Text style={{ fontSize: 12, color: '#94A3B8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginLeft: 4 }}>
            Daily Records ({attendance.length})
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color="#7C3AED" style={{ marginTop: 40 }} />
          ) : attendance.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 50 }}>
              <Icon name="calendar-outline" size={56} color="#E2E8F0" />
              <Text style={{ color: '#94A3B8', fontWeight: '600', marginTop: 12, fontSize: 15 }}>
                No records for {MONTHS[selectedMonth - 1]} {selectedYear}
              </Text>
              {!activeChild && (
                <Text style={{ color: '#CBD5E1', fontSize: 13, marginTop: 6 }}>Please select a child first</Text>
              )}
            </View>
          ) : (
            attendance.map((item, idx) => {
              const cfg = STATUS_CONFIG[item.status?.toLowerCase()] || STATUS_CONFIG.absent;
              const dateStr = new Date(item.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
              return (
                <Animated.View key={item.id} entering={FadeInUp.delay(idx * 30).duration(400)}>
                  <View style={{
                    backgroundColor: '#fff', borderRadius: 16, padding: 14,
                    flexDirection: 'row', alignItems: 'center', marginBottom: 10,
                    borderLeftWidth: 4, borderLeftColor: cfg.color,
                    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
                  }}>
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: cfg.bg, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                      <Icon name={cfg.icon} size={20} color={cfg.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: '#1E293B' }}>{dateStr}</Text>
                      {item.remarks ? (
                        <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{item.remarks}</Text>
                      ) : null}
                    </View>
                    <View style={{ backgroundColor: cfg.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: cfg.color, textTransform: 'uppercase' }}>{cfg.label}</Text>
                    </View>
                  </View>
                </Animated.View>
              );
            })
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

export default AttendanceScreen;
