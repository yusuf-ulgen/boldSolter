import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import { THEME } from '../constants/theme';
import { Color } from '../types/game';

interface ScrewProps {
  x: number;
  y: number;
  color: Color | 'mystery';
  isSelected?: boolean;
  isMystery?: boolean;
}

export const Screw: React.FC<ScrewProps> = ({ x, y, color, isSelected, isMystery }) => {
  const displayColor = isMystery ? 'mystery' : color;
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: withSpring(x - THEME.spacing.screwRadius) },
      { translateY: withSpring(y - THEME.spacing.screwRadius) },
      { scale: withSpring(isSelected ? 1.3 : 1) },
      { rotate: withSpring(isSelected ? '15deg' : '0deg') },
    ],
    backgroundColor: withTiming(THEME.colors.screws[displayColor]),
    zIndex: isSelected ? 100 : 50,
  }));

  return (
    <Animated.View 
      pointerEvents="none"
      style={[styles.screw, animatedStyle]}
    >
      <View style={styles.topPattern} />
      <View style={styles.shine} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  screw: {
    position: 'absolute',
    width: THEME.spacing.screwRadius * 2,
    height: THEME.spacing.screwRadius * 2,
    borderRadius: THEME.spacing.screwRadius,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 10,
  },
  topPattern: {
    width: '60%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
  },
  shine: {
    position: 'absolute',
    top: '10%',
    left: '10%',
    width: '30%',
    height: '30%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
  }
});
