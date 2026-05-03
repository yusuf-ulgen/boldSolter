import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, withRepeat, withTiming, useSharedValue } from 'react-native-reanimated';
import { THEME } from '../constants/theme';
import { Color } from '../types/game';

interface HoleProps {
  x: number;
  y: number;
  onPress?: () => void;
  isSelected?: boolean;
  isAvailable?: boolean;
  isHintTarget?: boolean;
  color?: Color;
  isStatic?: boolean;
}

export const Hole: React.FC<HoleProps> = ({ x, y, onPress, isSelected, isAvailable, isHintTarget, color, isStatic }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    borderWidth: withTiming(isSelected ? 2 : (isHintTarget ? 3 : (isAvailable ? 1.5 : 0)), { duration: 200 }),
    borderColor: withTiming(isHintTarget ? '#EF4444' : (isAvailable ? THEME.colors.primary : 'transparent'), { duration: 200 }),
    transform: [
      { scale: withSpring(isSelected ? 1.2 : (isHintTarget ? 1.4 : 1)) }
    ],
  }));

  const pulseAnim = useSharedValue(1);

  React.useEffect(() => {
    if (isAvailable) {
      pulseAnim.value = withRepeat(
        withTiming(1.06, { duration: 1200 }),
        -1,
        true
      );
    } else {
      pulseAnim.value = withTiming(1);
    }
  }, [isAvailable]);

  const betterPulsingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
    opacity: pulseAnim.value === 1 ? 1 : 0.8,
  }));

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isStatic}
      style={[
        styles.container, 
        isStatic 
          ? { position: 'relative' } 
          : { left: x - THEME.spacing.holeRadius, top: y - THEME.spacing.holeRadius }
      ]}
      activeOpacity={0.7}
    >
      <Animated.View style={[styles.hole, animatedStyle, betterPulsingStyle]}>
        {color && (
          <View style={[styles.colorRing, { borderColor: THEME.colors.screws[color] }]} />
        )}
        <View style={styles.crossContainer}>
          <View style={styles.crossLine} />
          <View style={[styles.crossLine, { transform: [{ rotate: '90deg' }] }]} />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: THEME.spacing.holeRadius * 2,
    height: THEME.spacing.holeRadius * 2,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  hole: {
    width: '100%',
    height: '100%',
    borderRadius: THEME.spacing.holeRadius,
    backgroundColor: THEME.colors.emptyHole,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crossContainer: {
    width: '40%',
    height: '40%',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.2,
    transform: [{ rotate: '45deg' }],
  },
  crossLine: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: '#fff',
    borderRadius: 1,
  },
  colorRing: {
    position: 'absolute',
    width: '115%',
    height: '115%',
    borderRadius: THEME.spacing.holeRadius * 1.5,
    borderWidth: 3,
    borderStyle: 'dashed',
    opacity: 0.8,
  }
});
