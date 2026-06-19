import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store';
import { ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

const { width, height } = Dimensions.get('window');

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  // Floating animation for the top icon
  const translateY = useSharedValue(0);
  React.useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1500 }),
        withTiming(0, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }]
  }));

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Oops!', 'Please fill in both email and password.');
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
      {/* Decorative background blobs */}
      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />
      <View style={[styles.blob, styles.blob3]} />
      
      <Animated.View entering={FadeInDown.delay(200).duration(800)} style={styles.headerContainer}>
        <Animated.View style={[styles.logoContainer, floatingStyle]}>
          <Icon name="school" size={60} color="#fff" />
        </Animated.View>
        <Text style={styles.welcomeText}>Creyons</Text>
        <Text style={styles.subText}>Learn, Play & Grow!</Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(400).duration(800)} style={styles.card}>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputWrapper}>
            <Icon name="mail-outline" size={20} color="#a0aec0" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#a0aec0"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Icon name="lock-closed-outline" size={20} color="#a0aec0" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              placeholderTextColor="#a0aec0"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.8} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.btnContent}>
              <Text style={styles.loginButtonText}>Login to Start</Text>
              <Icon name="arrow-forward-circle" size={24} color="#fff" style={{ marginLeft: 8 }} />
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF', // Very light playful blue
    justifyContent: 'center',
    padding: 20,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    borderRadius: 200,
    opacity: 0.6,
  },
  blob1: {
    width: width * 0.8,
    height: width * 0.8,
    backgroundColor: '#FEF08A', // Soft Yellow
    top: -height * 0.1,
    left: -width * 0.2,
  },
  blob2: {
    width: width * 0.6,
    height: width * 0.6,
    backgroundColor: '#FBCFE8', // Soft Pink
    bottom: height * 0.1,
    right: -width * 0.2,
  },
  blob3: {
    width: width * 0.5,
    height: width * 0.5,
    backgroundColor: '#A7F3D0', // Soft Green
    top: height * 0.3,
    left: -width * 0.3,
    opacity: 0.4,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
    zIndex: 10,
  },
  logoContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#3B82F6', // Blue circle
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  welcomeText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#1E3A8A', // Darker blue for contrast
    letterSpacing: 1,
  },
  subText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#8B5CF6', // Playful purple
    marginTop: 5,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 35,
    padding: 30,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 15,
    zIndex: 10,
  },
  inputContainer: {
    marginBottom: 22,
  },
  label: {
    fontSize: 15,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 8,
    marginLeft: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '600',
  },
  forgotPassword: {
    alignSelf: 'center',
    marginBottom: 25,
  },
  forgotText: {
    color: '#F59E0B', // Amber
    fontWeight: '800',
    fontSize: 15,
  },
  loginButton: {
    backgroundColor: '#8B5CF6', // Purple base
    borderRadius: 25,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  }
});

export default LoginScreen;
