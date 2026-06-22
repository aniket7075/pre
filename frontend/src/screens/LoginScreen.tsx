import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Dimensions, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import Animated, { 
  FadeInDown,
  FadeInUp,
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming, 
  withSpring 
} from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store';
import Icon from 'react-native-vector-icons/Ionicons';

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

const { width, height } = Dimensions.get('window');
const logoImg = require('../../qodo.png');

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.auth);

  // Floating animation for the top logo
  const translateY = useSharedValue(0);
  React.useEffect(() => {
    // Floating logo animation
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

  // Shake animation for login failures
  const shakeX = useSharedValue(0);
  const shakeCard = () => {
    shakeX.value = withSequence(
      withTiming(-10, { duration: 80 }),
      withTiming(10, { duration: 80 }),
      withTiming(-10, { duration: 80 }),
      withTiming(10, { duration: 80 }),
      withTiming(0, { duration: 80 })
    );
  };

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }]
  }));

  // Button Tap scaling animation
  const buttonScale = useSharedValue(1);
  const btnPressIn = () => { buttonScale.value = withSpring(0.95); };
  const btnPressOut = () => { buttonScale.value = withSpring(1); };
  
  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }]
  }));

  const handleLogin = async () => {
    if (!email || !password) {
      shakeCard();
      Alert.alert('Oops!', 'Please fill in both email and password.');
      return;
    }
    const resultAction = await dispatch(login({ email, password }));
    if (login.rejected.match(resultAction)) {
      shakeCard();
      Alert.alert('Login Failed', resultAction.payload as string);
      dispatch(clearError());
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      enabled={Platform.OS === 'ios'}
    >
      {/* Decorative background blobs with pointerEvents="none" to prevent intercepting touches */}
      <View pointerEvents="none" style={[styles.blob, styles.blob1]} />
      <View pointerEvents="none" style={[styles.blob, styles.blob2]} />
      <View pointerEvents="none" style={[styles.blob, styles.blob3]} />
      
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand Header */}
        <Animated.View entering={FadeInDown.delay(200).duration(800)} style={styles.headerContainer}>
          <Animated.View style={[styles.logoContainer, floatingStyle]}>
            <Image source={logoImg} style={styles.logoImage as any} resizeMode="contain" />
          </Animated.View>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.subText}>Learn, Play & Grow!</Text>
        </Animated.View>

        {/* Main Login Card */}
        <Animated.View style={[styles.card, cardStyle]} entering={FadeInUp.delay(400).duration(800)}>
          
          {/* Email Field */}
          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, emailFocused && styles.inputWrapperFocused]}>
              <View style={styles.iconCircle}>
                <Icon name="person-outline" size={20} color="#fff" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#A5B4FC"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>
          </View>

          {/* Password Field */}
          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, passwordFocused && styles.inputWrapperFocused]}>
              <View style={styles.iconCircle}>
                <Icon name="lock-closed-outline" size={20} color="#fff" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#A5B4FC"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <TouchableOpacity 
                style={styles.eyeIcon} 
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <Icon 
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'} 
                  size={20} 
                  color="#6366F1" 
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Animated Login Button */}
          <Animated.View style={buttonStyle}>
            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={handleLogin} 
              activeOpacity={0.9} 
              disabled={isLoading}
              onPressIn={btnPressIn}
              onPressOut={btnPressOut}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF', // Clean, soft sky blue matching splash screen
    overflow: 'hidden',
  },
  scroll: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  blob: {
    position: 'absolute',
    borderRadius: 200,
    opacity: 0.5,
  },
  blob1: {
    width: width * 0.9,
    height: width * 0.9,
    backgroundColor: '#FEF08A', // Soft warm yellow matching splash screen
    top: -height * 0.15,
    left: -width * 0.25,
  },
  blob2: {
    width: width * 0.75,
    height: width * 0.75,
    backgroundColor: '#FBCFE8', // Soft blush pink matching splash screen
    bottom: height * 0.05,
    right: -width * 0.25,
  },
  blob3: {
    width: width * 0.6,
    height: width * 0.6,
    backgroundColor: '#A7F3D0', // Soft mint green matching splash screen
    top: height * 0.25,
    left: -width * 0.3,
    opacity: 0.35,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 25,
    zIndex: 10,
  },
  logoContainer: {
    width: 250,
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoImage: {
    width: 200,
    height: 120,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E3A8A', // Vibrant dark blue matching splash screen
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6366F1', // Playful blue/indigo matching splash screen
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFDF9', // Warm off-white/cream
    borderRadius: 36,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#E2E8F0', // Soft slate border
    shadowColor: '#6366F1', // Shadow matching brand colors
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 10,
    zIndex: 10,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9', // Soft light slate
    borderRadius: 30,
    paddingHorizontal: 8,
    height: 60,
    borderWidth: 1.5,
    borderColor: '#F1F5F9', // Base color
  },
  inputWrapperFocused: {
    borderColor: '#6366F1', // Indigo highlight color on focus
    backgroundColor: '#FFFFFF', // Turn white on focus
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366F1', // Indigo badge color
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#1E3A8A', // Dark blue
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 0, // Centering text input vertically on Android/iOS
  },
  eyeIcon: {
    padding: 10,
    marginRight: 6,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginRight: 6,
  },
  forgotText: {
    color: '#6366F1',
    fontWeight: '700',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#6366F1',
    borderRadius: 30,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  }
});

export default LoginScreen;

