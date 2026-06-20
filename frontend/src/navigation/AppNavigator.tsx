import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { checkAuthStatus } from '../store/slices/authSlice';
import Icon from 'react-native-vector-icons/Ionicons';
import { View, Platform } from 'react-native';

// Screens
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import ParentDashboard from '../screens/ParentDashboard';
import AttendanceScreen from '../screens/AttendanceScreen';
import HomeworkScreen from '../screens/HomeworkScreen';
import NoticeScreen from '../screens/NoticeScreen';
import FeeScreen from '../screens/FeeScreen';
import TransportScreen from '../screens/TransportScreen';
import AdminDashboard from '../screens/AdminDashboard';
import TeacherDashboard from '../screens/TeacherDashboard';
import ChatScreen from '../screens/ChatScreen';
import ChatListScreen from '../screens/ChatListScreen';
import LeaveScreen from '../screens/LeaveScreen';
import TimetableScreen from '../screens/TimetableScreen';
import GalleryScreen from '../screens/GalleryScreen';
import LessonPlanScreen from '../screens/LessonPlanScreen';
import MarkEntryScreen from '../screens/MarkEntryScreen';
import LibraryScreen from '../screens/LibraryScreen';
import CertificateScreen from '../screens/CertificateScreen';
import ResultScreen from '../screens/ResultScreen';
import ProgressDashboard from '../screens/ProgressDashboard';
import StaffScreen from '../screens/StaffScreen';
import StudentsScreen from '../screens/StudentsScreen';
import AddParentStudentScreen from '../screens/AddParentStudentScreen';
import ClassesScreen from '../screens/ClassesScreen';
import NotesScreen from '../screens/NotesScreen';
import MarkAttendanceScreen from '../screens/MarkAttendanceScreen';
import AssignFeeScreen from '../screens/AssignFeeScreen';
import CreateHomeworkScreen from '../screens/CreateHomeworkScreen';
import CreateNoticeScreen from '../screens/CreateNoticeScreen';
import StudentProfileScreen from '../screens/StudentProfileScreen';
import ParentProfileScreen from '../screens/ParentProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          elevation: 25,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.12,
          shadowRadius: 15,
          height: Platform.OS === 'ios' ? 90 : 75,
          paddingBottom: Platform.OS === 'ios' ? 24 : 12,
          paddingTop: 10,
          position: 'absolute',
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
        },
        tabBarIcon: ({ focused }) => {
          let iconName = 'home';
          let activeBg = '#EEF2FF';
          let activeColor = '#4F46E5';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
            activeBg = '#FEF3C7';
            activeColor = '#D97706';
          } else if (route.name === 'Notices') {
            iconName = focused ? 'megaphone' : 'megaphone-outline';
            activeBg = '#FCE7F3';
            activeColor = '#DB2777';
          } else if (route.name === 'Chats') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            activeBg = '#E0F2FE';
            activeColor = '#0284C7';
          } else if (route.name === 'Leaves') {
            iconName = focused ? 'document-text' : 'document-text-outline';
            activeBg = '#D1FAE5';
            activeColor = '#059669';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
            activeBg = '#F3E8FF';
            activeColor = '#9333EA';
          }

          return (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <View style={{
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: focused ? activeBg : 'transparent',
                padding: 10,
                borderRadius: 22,
                width: 52,
                height: 52,
                transform: [{ scale: focused ? 1.08 : 1.0 }],
                shadowColor: focused ? activeColor : 'transparent',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 6,
                elevation: focused ? 4 : 0,
              }}>
                <Icon name={iconName} size={focused ? 26 : 24} color={focused ? activeColor : '#94A3B8'} />
              </View>
              {focused && (
                <View style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: activeColor,
                  marginTop: 4,
                  position: 'absolute',
                  bottom: -10,
                }} />
              )}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" 
        component={
          user?.role === 'super_admin' || user?.role === 'school_admin' 
            ? AdminDashboard 
            : user?.role === 'teacher' 
            ? TeacherDashboard 
            : ParentDashboard
        } 
      />
      <Tab.Screen name="Notices" component={NoticeScreen} />
      <Tab.Screen name="Chats" component={ChatListScreen} />
      <Tab.Screen name="Leaves" component={LeaveScreen} />
      {(user?.role === 'parent') && (
        <Tab.Screen name="Profile" component={ParentProfileScreen} />
      )}
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // Authenticated Stack
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            
            {/* Inner Screens that don't need Bottom Tabs */}
            <Stack.Screen name="Attendance" component={AttendanceScreen} />
            <Stack.Screen name="Homework" component={HomeworkScreen} />
            <Stack.Screen name="Notice" component={NoticeScreen} />
            <Stack.Screen name="Fees" component={FeeScreen} />
            <Stack.Screen name="ChatRoom" component={ChatScreen} />
            <Stack.Screen name="Results" component={ResultScreen} />
            <Stack.Screen name="Result" component={ResultScreen} />
            <Stack.Screen name="Progress" component={ProgressDashboard} />
            <Stack.Screen name="Staff" component={StaffScreen} />
            <Stack.Screen name="Students" component={StudentsScreen} />
            <Stack.Screen name="StudentProfile" component={StudentProfileScreen} />
            <Stack.Screen name="ParentProfile" component={ParentProfileScreen} />
            <Stack.Screen name="AddParentStudent" component={AddParentStudentScreen} />
            <Stack.Screen name="Classes" component={ClassesScreen} />
            <Stack.Screen name="Notes" component={NotesScreen} />
            <Stack.Screen name="MarkAttendance" component={MarkAttendanceScreen} />
            <Stack.Screen name="AssignFee" component={AssignFeeScreen} />
            <Stack.Screen name="CreateHomework" component={CreateHomeworkScreen} />
            <Stack.Screen name="CreateNotice" component={CreateNoticeScreen} />
            <Stack.Screen name="Timetable" component={TimetableScreen} />
            <Stack.Screen name="Gallery" component={GalleryScreen} />
            <Stack.Screen name="LessonPlan" component={LessonPlanScreen} />
            <Stack.Screen name="EnterMarks" component={MarkEntryScreen} />
            <Stack.Screen name="Library" component={LibraryScreen} />
            <Stack.Screen name="Certificates" component={CertificateScreen} />
          </>
        ) : (
          // Auth Stack
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
