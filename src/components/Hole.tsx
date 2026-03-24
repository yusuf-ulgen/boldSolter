import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { THEME } from '../constants/theme';

interface HoleProps {
  x: number;
  y: number;
  onPress: () => void;
  isSelected?: boolean;
  isHintTarget?: boolean;
}

export const Hole: React.FC<HoleProps> = ({ x, y, onPress, isSelected, isHintTarget }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    borderWidth: withSpring(isSelected ? 2 : (isHintTarget ? 3 : 0)),
    borderColor: isHintTarget ? '#EF4444' : THEME.colors.primary,
    transform: [
      { scale: withSpring(isSelected ? 1.2 : (isHintTarget ? 1.4 : 1)) }
    ],
  }));

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, { left: x - THEME.spacing.holeRadius, top: y - THEME.spacing.holeRadius }]}
      activeOpacity={0.7}
    >
      <Animated.View style={[styles.hole, animatedStyle]} />
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
  },
});
