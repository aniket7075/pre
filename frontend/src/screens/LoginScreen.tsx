import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Dimensions, Image } from 'react-native';
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
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
const logoImg = require('../../qidoo.png');

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  // Floating animation for the top icon
  const translateY = useSharedValue(0);
  React.useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1500 }),
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
          <Image source={logoImg} style={styles.logoImage} resizeMode="contain" />
        </Animated.View>
        <Text style={styles.welcomeText}>Qidoo</Text>
        <Text style={styles.subText}>Learn, Play & Grow!</Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(400).duration(800)} style={styles.card}>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address</Text>
          <View style={[styles.inputWrapper, emailFocused && styles.inputWrapperFocused]}>
            <Icon name="mail-outline" size={20} color={emailFocused ? '#6366F1' : '#a0aec0'} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#a0aec0"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={[styles.inputWrapper, passwordFocused && styles.inputWrapperFocused]}>
            <Icon name="lock-closed-outline" size={20} color={passwordFocused ? '#6366F1' : '#a0aec0'} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              placeholderTextColor="#a0aec0"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
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
    backgroundColor: '#F0F9FF',
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
    backgroundColor: '#FEF08A',
    top: -height * 0.1,
    left: -width * 0.2,
  },
  blob2: {
    width: width * 0.6,
    height: width * 0.6,
    backgroundColor: '#FBCFE8',
    bottom: height * 0.1,
    right: -width * 0.2,
  },
  blob3: {
    width: width * 0.5,
    height: width * 0.5,
    backgroundColor: '#A7F3D0',
    top: height * 0.3,
    left: -width * 0.3,
    opacity: 0.4,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 35,
    zIndex: 10,
  },
  logoContainer: {
    width: 110,
    height: 110,
    backgroundColor: '#ffffff',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  logoImage: {
    width: 90,
    height: 90,
  },
  welcomeText: {
    fontSize: 40,
    fontWeight: '950',
    color: '#1E3A8A',
    letterSpacing: 0.5,
  },
  subText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#6366F1',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 32,
    padding: 26,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 12,
    zIndex: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
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
    borderRadius: 18,
    paddingHorizontal: 15,
  },
  inputWrapperFocused: {
    borderColor: '#6366F1',
    backgroundColor: '#ffffff',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '600',
  },
  forgotPassword: {
    alignSelf: 'center',
    marginBottom: 22,
  },
  forgotText: {
    color: '#F59E0B',
    fontWeight: '800',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#6366F1',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.5,
  }
});

export default LoginScreen;
