import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  withRepeat,
  withSequence
} from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = {
  navigation?: NativeStackNavigationProp<any, any>;
};

const { width } = Dimensions.get('window');
const logoImg = require('../../qidoo.png');

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const logoScale = useSharedValue(0);
  const logoRotation = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(50);

  useEffect(() => {
    // Sequence of animations for a playful feel
    logoScale.value = withSpring(1, { damping: 5, stiffness: 80 });
    
    // Wiggle effect
    logoRotation.value = withSequence(
      withTiming(-10, { duration: 100 }),
      withRepeat(withTiming(10, { duration: 200 }), 4, true),
      withTiming(0, { duration: 100 })
    );

    textOpacity.value = withTiming(1, { duration: 1000 });
    textTranslateY.value = withSpring(0, { damping: 6, stiffness: 90 });

    const timer = setTimeout(() => {
      if (navigation) {
        navigation.replace('Login');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const logoStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: logoScale.value },
        { rotate: `${logoRotation.value}deg` }
      ]
    };
  });

  const textStyle = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value,
      transform: [{ translateY: textTranslateY.value }]
    };
  });

  return (
    <View style={styles.container}>
      {/* Decorative background circles */}
      <View style={[styles.circle, styles.circle1]} />
      <View style={[styles.circle, styles.circle2]} />
      <View style={[styles.circle, styles.circle3]} />

      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <Image source={logoImg} style={styles.logoImage} resizeMode="contain" />
      </Animated.View>

      <Animated.View style={textStyle}>
        <Text style={styles.title}>Qidoo</Text>
        <Text style={styles.subtitle}>Learn, Play, Grow!</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF', // Background primary matching login
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.6,
  },
  circle1: {
    width: width * 0.8,
    height: width * 0.8,
    backgroundColor: '#FEF08A', // Soft Yellow
    top: -width * 0.2,
    right: -width * 0.2,
  },
  circle2: {
    width: width * 0.6,
    height: width * 0.6,
    backgroundColor: '#FBCFE8', // Soft Pink
    bottom: -width * 0.1,
    left: -width * 0.2,
  },
  circle3: {
    width: width * 0.4,
    height: width * 0.4,
    backgroundColor: '#A7F3D0', // Soft Green
    top: width * 0.4,
    left: width * 0.8,
  },
  logoContainer: {
    width: 130,
    height: 130,
    backgroundColor: '#ffffff',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    marginBottom: 25,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 44,
    fontWeight: '950',
    color: '#1E3A8A', // Vibrant dark blue
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#6366F1', // Playful blue/indigo
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 0.5,
  }
});

export default SplashScreen;
