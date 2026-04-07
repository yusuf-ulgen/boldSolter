import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import { THEME } from '../constants/theme';
import { Color, Point } from '../types/game';
import Svg, { Path, Circle } from 'react-native-svg';

interface PlateProps {
  shapePoints: Point[];
  color: Color;
  zIndex: number;
  isRemoved: boolean;
  attachedScrewCount: number;
}

export const Plate: React.FC<PlateProps> = ({ shapePoints, color, zIndex, isRemoved, attachedScrewCount }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isRemoved ? 0 : 1, { duration: 500 }),
      transform: [
        { translateY: withSpring(isRemoved ? 1000 : 0) },
        { rotate: isRemoved ? withSpring('45deg') : withSpring('0deg') },
      ] as any,
    };
  });

  if (shapePoints.length < 2) return null;

  // Calculate bounding box for SVG viewbox
  const minX = Math.min(...shapePoints.map(p => p.x)) - 50;
  const maxX = Math.max(...shapePoints.map(p => p.x)) + 50;
  const minY = Math.min(...shapePoints.map(p => p.y)) - 50;
  const maxY = Math.max(...shapePoints.map(p => p.y)) + 50;
  const width = maxX - minX;
  const height = maxY - minY;

  // Generate Path data
  const pathData = shapePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x - minX} ${p.y - minY}`).join(' ');

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.plateContainer,
        {
          zIndex,
          left: minX,
          top: minY,
          width,
          height,
        },
        animatedStyle,
      ]}
    >
      <Svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
        {/* Main Plate Body */}
        <Path
          d={pathData}
          stroke={THEME.colors.plates[color]}
          strokeWidth="45"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Inner Edge / 3D effect */}
        <Path
          d={pathData}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="35"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Hole cutouts (visual only) */}
        {shapePoints.map((p, i) => (
           <Circle 
             key={i} 
             cx={p.x - minX} 
             cy={p.y - minY} 
             r={THEME.spacing.holeRadius - 2} 
             fill="rgba(0,0,0,0.3)" 
           />
        ))}
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  plateContainer: {
    position: 'absolute',
  }
});
