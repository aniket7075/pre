import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { checkAuthStatus } from '../store/slices/authSlice';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import ParentDashboard from '../screens/ParentDashboard';
import AttendanceScreen from '../screens/AttendanceScreen';
import HomeworkScreen from '../screens/HomeworkScreen';
import NoticeScreen from '../screens/NoticeScreen';
import FeeScreen from '../screens/FeeScreen';
import TransportScreen from '../screens/TransportScreen';
import AdminDashboard from '../screens/AdminDashboard';
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

const Stack = createNativeStackNavigator();

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
            {user.role === 'super_admin' || user.role === 'school_admin' ? (
              <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
            ) : user.role === 'teacher' ? (
              <Stack.Screen name="TeacherDashboard" component={TeacherDashboard} />
            ) : (
              <Stack.Screen name="ParentDashboard" component={ParentDashboard} />
            )}
            <Stack.Screen name="Attendance" component={AttendanceScreen} />
            <Stack.Screen name="Homework" component={HomeworkScreen} />
            <Stack.Screen name="Notice" component={NoticeScreen} />
            <Stack.Screen name="Fees" component={FeeScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="ChatList" component={ChatListScreen} />
            <Stack.Screen name="Results" component={ResultScreen} />
            <Stack.Screen name="Progress" component={ProgressDashboard} />
            <Stack.Screen name="Staff" component={StaffScreen} />
            <Stack.Screen name="Students" component={StudentsScreen} />
            <Stack.Screen name="AddParentStudent" component={AddParentStudentScreen} />
            <Stack.Screen name="Classes" component={ClassesScreen} />
            <Stack.Screen name="Notes" component={NotesScreen} />
            <Stack.Screen name="MarkAttendance" component={MarkAttendanceScreen} />
            <Stack.Screen name="AssignFee" component={AssignFeeScreen} />
            <Stack.Screen name="CreateHomework" component={CreateHomeworkScreen} />
            <Stack.Screen name="CreateNotice" component={CreateNoticeScreen} />
            <Stack.Screen name="Leaves" component={LeaveScreen} />
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
