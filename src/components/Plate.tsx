import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, withSpring, withRepeat, withSequence } from 'react-native-reanimated';
import { THEME } from '../constants/theme';
import { Color, Hole } from '../types/game';

interface PlateProps {
  holes: Hole[];
  color: Color;
  zIndex: number;
  isRemoved: boolean;
  attachedScrewCount: number;
}

export const Plate: React.FC<PlateProps> = ({ holes, color, zIndex, isRemoved, attachedScrewCount }) => {
  const animatedStyle = useAnimatedStyle(() => {
    // Determine wobble based on how "loose" the plate is
    const isLoose = attachedScrewCount === 1;
    const wobble = isLoose 
      ? withRepeat(withSequence(withTiming(-2, { duration: 100 }), withTiming(2, { duration: 100 })), -1, true)
      : 0;

    return {
      opacity: withTiming(isRemoved ? 0 : 1, { duration: 500 }),
      transform: [
        { translateY: withSpring(isRemoved ? 1000 : 0) },
        { rotate: isRemoved ? withSpring('45deg') : withSpring(`${wobble}deg`) },
      ] as any,
    };
  });

  // Simple bounding box logic for prototype
  const minX = Math.min(...holes.map(h => h.x)) - 40;
  const maxX = Math.max(...holes.map(h => h.x)) + 40;
  const minY = Math.min(...holes.map(h => h.y)) - 40;
  const maxY = Math.max(...holes.map(h => h.y)) + 40;

  return (
    <Animated.View
      style={[
        styles.plate,
        {
          backgroundColor: THEME.colors.plates[color],
          zIndex,
          left: minX,
          top: minY,
          width: maxX - minX,
          height: maxY - minY,
        },
        animatedStyle,
      ]}
    >
      <Animated.View style={styles.edge} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  plate: {
    position: 'absolute',
    borderRadius: THEME.spacing.plateRounding,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 2,
    overflow: 'hidden',
  },
  edge: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
  }
});
