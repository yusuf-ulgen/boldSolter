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
  mechanic?: 'normal' | 'icy' | 'oily';
  durability?: number;
}

export const Screw: React.FC<ScrewProps> = ({ x, y, color, isSelected, isMystery, mechanic, durability }) => {
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
      
      {mechanic === 'icy' && (
        <View style={styles.iceLayer}>
           <View style={[styles.iceCrack, { opacity: (durability || 0) > 2 ? 0.3 : 0.7 }]} />
           <View style={[styles.iceCrack, { transform: [{rotate: '90deg'}], opacity: (durability || 0) > 1 ? 0.3 : 0.8 }]} />
        </View>
      )}

      {mechanic === 'oily' && (
        <View style={styles.oilOverlay} />
      )}
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
  },
  iceLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(186, 230, 253, 0.5)',
    borderRadius: THEME.spacing.screwRadius,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  iceCrack: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: '#fff',
  },
  oilOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: THEME.spacing.screwRadius,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.6)',
  }
});
