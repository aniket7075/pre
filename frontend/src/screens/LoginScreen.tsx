import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store';
import { ActivityIndicator, Alert } from 'react-native';

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

const { width } = Dimensions.get('window');

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeRole, setActiveRole] = useState<'parent' | 'staff' | 'admin'>('parent');

  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    const resultAction = await dispatch(login({ email, password }));
    if (login.rejected.match(resultAction)) {
      Alert.alert('Login Failed', resultAction.payload as string);
      dispatch(clearError());
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Decorative background elements */}
      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />
      
      <Animated.View entering={FadeInDown.delay(200).duration(800)} style={styles.headerContainer}>
        <Text style={styles.welcomeText}>
          {activeRole === 'parent' ? 'Welcome Back!' : activeRole === 'staff' ? 'Staff Portal' : 'Admin Portal'}
        </Text>
        <Text style={styles.subText}>
          {activeRole === 'parent' ? 'Ready to learn and play?' : 'Manage school activities'}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(400).duration(800)} style={styles.card}>
        {/* Role Selector */}
        <View style={styles.roleContainer}>
          <TouchableOpacity 
            style={[styles.roleTab, activeRole === 'admin' && styles.activeRoleTab]}
            onPress={() => setActiveRole('admin')}
          >
            <Text style={[styles.roleText, activeRole === 'admin' && styles.activeRoleText]}>Admin</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.roleTab, activeRole === 'staff' && styles.activeRoleTab]}
            onPress={() => setActiveRole('staff')}
          >
            <Text style={[styles.roleText, activeRole === 'staff' && styles.activeRoleText]}>Staff</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.roleTab, activeRole === 'parent' && styles.activeRoleTab]}
            onPress={() => setActiveRole('parent')}
          >
            <Text style={[styles.roleText, activeRole === 'parent' && styles.activeRoleText]}>Parent</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address ✉️</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Secret Password 🔑</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.8} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Let's Go! 🚀</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff', // Soft blue background
    justifyContent: 'center',
    padding: 20,
  },
  blob: {
    position: 'absolute',
    borderRadius: 200,
    opacity: 0.5,
  },
  blob1: {
    width: 300,
    height: 300,
    backgroundColor: '#ffcc00', // Yellow
    top: -100,
    left: -100,
  },
  blob2: {
    width: 250,
    height: 250,
    backgroundColor: '#ff6699', // Pink
    bottom: -50,
    right: -100,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
    zIndex: 10,
  },
  welcomeText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#4da6ff', // Playful blue
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff6699',
    marginTop: 5,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 30,
    padding: 25,
    shadowColor: '#4da6ff',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 10,
  },
  roleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginBottom: 25,
    padding: 5,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 15,
  },
  activeRoleTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  roleText: {
    fontWeight: 'bold',
    color: '#888',
  },
  activeRoleText: {
    color: '#4da6ff',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#33cc33', // Success Green
    marginBottom: 8,
    marginLeft: 5,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 25,
  },
  forgotText: {
    color: '#ff9933', // Warning Orange
    fontWeight: 'bold',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#4da6ff', // Playful blue
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#4da6ff',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  }
});

export default LoginScreen;
