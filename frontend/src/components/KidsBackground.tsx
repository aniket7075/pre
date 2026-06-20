import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence, 
  Easing 
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

type FloatingIconProps = {
  name: string;
  size: number;
  color: string;
  startX: number;
  startY: number;
  delay?: number;
  isMaterial?: boolean;
};

const FloatingIcon: React.FC<FloatingIconProps> = ({ 
  name, size, color, startX, startY, delay = 0, isMaterial = false 
}) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-20, { duration: 3000 + delay, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 3000 + delay, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    translateX.value = withRepeat(
      withSequence(
        withTiming(15, { duration: 3500 + delay, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 3500 + delay, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    rotate.value = withRepeat(
      withSequence(
        withTiming(10, { duration: 4000 + delay, easing: Easing.inOut(Easing.ease) }),
        withTiming(-10, { duration: 4000 + delay, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value }, 
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` }
    ]
  }));

  return (
    <Animated.View style={[styles.floatingIcon, { top: startY, left: startX }, animatedStyle]}>
      {isMaterial ? (
        <MaterialCommunityIcons name={name} size={size} color={color} />
      ) : (
        <Icon name={name} size={size} color={color} />
      )}
    </Animated.View>
  );
};

const KidsBackground: React.FC = () => {
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: '#F0F9FF', zIndex: -1 }]} pointerEvents="none">
      {/* Decorative background blobs from LoginScreen */}
      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />
      <View style={[styles.blob, styles.blob3]} />
      
      {/* Creative floating elements for kids */}
      <FloatingIcon name="pencil" size={45} color="#FF6B6B" startX={width * 0.1} startY={height * 0.15} delay={0} />
      <FloatingIcon name="bee" size={50} color="#FCA311" startX={width * 0.8} startY={height * 0.1} delay={500} isMaterial={true} />
      <FloatingIcon name="color-palette" size={40} color="#4ECDC4" startX={width * 0.75} startY={height * 0.7} delay={1000} />
      <FloatingIcon name="book" size={45} color="#1A535C" startX={width * 0.15} startY={height * 0.65} delay={1500} />
      <FloatingIcon name="star" size={35} color="#FFE66D" startX={width * 0.5} startY={height * 0.05} delay={200} />
      <FloatingIcon name="airplane" size={40} color="#FF9F1C" startX={width * 0.4} startY={height * 0.85} delay={800} />
      <FloatingIcon name="teddy-bear" size={55} color="#D4A373" startX={width * 0.85} startY={height * 0.4} delay={1200} isMaterial={true} />
      <FloatingIcon name="rocket" size={40} color="#EF476F" startX={width * 0.05} startY={height * 0.45} delay={300} />
    </View>
  );
};

const styles = StyleSheet.create({
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
  floatingIcon: {
    position: 'absolute',
    opacity: 0.25, // keep it subtle so it doesn't distract from content
  }
});

export default KidsBackground;
