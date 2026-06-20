import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Dimensions, Image } from 'react-native';
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
  const { isLoading } = useSelector((state: RootState) => state.auth);

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

  // Floating label animation values
  const emailFocusVal = useSharedValue(email ? 1 : 0);
  const passwordFocusVal = useSharedValue(password ? 1 : 0);

  React.useEffect(() => {
    emailFocusVal.value = withTiming(email || emailFocused ? 1 : 0, { duration: 180 });
  }, [email, emailFocused]);

  React.useEffect(() => {
    passwordFocusVal.value = withTiming(password || passwordFocused ? 1 : 0, { duration: 180 });
  }, [password, passwordFocused]);

  const emailLabelStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: emailFocusVal.value === 1 ? -12 : 18 },
      { translateX: emailFocusVal.value === 1 ? 5 : 44 }
    ],
    fontSize: emailFocusVal.value === 1 ? 12 : 15,
    color: emailFocusVal.value === 1 ? '#6366F1' : '#94A3B8',
    backgroundColor: emailFocusVal.value === 1 ? '#ffffff' : 'transparent',
    paddingHorizontal: emailFocusVal.value === 1 ? 6 : 0,
  }));

  const passwordLabelStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: passwordFocusVal.value === 1 ? -12 : 18 },
      { translateX: passwordFocusVal.value === 1 ? 5 : 44 }
    ],
    fontSize: passwordFocusVal.value === 1 ? 12 : 15,
    color: passwordFocusVal.value === 1 ? '#6366F1' : '#94A3B8',
    backgroundColor: passwordFocusVal.value === 1 ? '#ffffff' : 'transparent',
    paddingHorizontal: passwordFocusVal.value === 1 ? 6 : 0,
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
        <Text style={styles.welcomeText}>Qodo</Text>
        <Text style={styles.subText}>Learn, Play & Grow!</Text>
      </Animated.View>

      <Animated.View style={[styles.card, cardStyle]} entering={FadeInUp.delay(400).duration(800)}>
        
        {/* Email Field */}
        <Animated.View entering={FadeInUp.delay(500).duration(600)} style={styles.inputContainer}>
          <View style={[styles.inputWrapper, emailFocused && styles.inputWrapperFocused]}>
            <Animated.Text style={[styles.animatedLabel, emailLabelStyle]}>
              Email Address
            </Animated.Text>
            <Icon name="mail-outline" size={20} color={emailFocused ? '#6366F1' : '#a0aec0'} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder=""
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
          </View>
        </Animated.View>

        {/* Password Field */}
        <Animated.View entering={FadeInUp.delay(650).duration(600)} style={styles.inputContainer}>
          <View style={[styles.inputWrapper, passwordFocused && styles.inputWrapperFocused]}>
            <Animated.Text style={[styles.animatedLabel, passwordLabelStyle]}>
              Password
            </Animated.Text>
            <Icon name="lock-closed-outline" size={20} color={passwordFocused ? '#6366F1' : '#a0aec0'} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder=""
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
          </View>
        </Animated.View>

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        {/* Animated Login Button */}
        <Animated.View entering={FadeInUp.delay(800).duration(600)} style={buttonStyle}>
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
              <View style={styles.btnContent}>
                <Text style={styles.loginButtonText}>Login to Start</Text>
                <Icon name="arrow-forward-circle" size={24} color="#fff" style={{ marginLeft: 8 }} />
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
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
    position: 'relative',
  },
  animatedLabel: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 10,
    fontWeight: '800',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    paddingHorizontal: 15,
    height: 58,
    position: 'relative',
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
    marginTop: 18, // Pushed down to align with placeholder height
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '600',
    paddingVertical: 0,
    marginTop: 18, // Pushed down to avoid overlapping floating labels
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
