import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
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
        {/* Placeholder for an actual playful logo/icon */}
        <Text style={styles.logoText}>🎨</Text> 
      </Animated.View>

      <Animated.View style={textStyle}>
        <Text style={styles.title}>Kiddy Connect</Text>
        <Text style={styles.subtitle}>Learn, Play, Grow!</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff', // Background primary
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
    backgroundColor: '#ffcc00', // Secondary
    top: -width * 0.2,
    right: -width * 0.2,
  },
  circle2: {
    width: width * 0.6,
    height: width * 0.6,
    backgroundColor: '#ff6699', // Accent
    bottom: -width * 0.1,
    left: -width * 0.2,
  },
  circle3: {
    width: width * 0.4,
    height: width * 0.4,
    backgroundColor: '#33cc33', // Success
    top: width * 0.4,
    left: width * 0.8,
  },
  logoContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#4da6ff', // Primary
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#4da6ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    marginBottom: 30,
  },
  logoText: {
    fontSize: 60,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#ff6699', // Vibrant pink
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4da6ff', // Playful blue
    textAlign: 'center',
    marginTop: 10,
    letterSpacing: 0.5,
  }
});

export default SplashScreen;
