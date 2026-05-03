import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withTiming, 
  withSpring, 
  withRepeat, 
  withSequence, 
  useSharedValue,
  interpolate,
  interpolateColor,
  withDelay
} from 'react-native-reanimated';
import Svg, { 
  Circle, 
  Path, 
  Defs, 
  LinearGradient, 
  Stop, 
  RadialGradient,
  Rect,
  G
} from 'react-native-svg';
import { THEME } from '../constants/theme';
import { Color } from '../types/game';
import { HelpCircle } from 'lucide-react-native';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

interface ScrewProps {
  x: number;
  y: number;
  color: Color | 'mystery';
  isSelected?: boolean;
  isMystery?: boolean;
  mechanic?: 'normal' | 'icy' | 'oily';
  durability?: number;
  isStatic?: boolean;
}

export const Screw: React.FC<ScrewProps> = ({ x, y, color, isSelected, isMystery, mechanic, durability, isStatic }) => {
  const displayColor = isMystery ? 'mystery' : color;
  const radius = THEME.spacing.screwRadius;
  
  const posX = useSharedValue(x - radius);
  const posY = useSharedValue(y - radius);
  const activeScale = useSharedValue(1);
  const pulse = useSharedValue(1);
  const oilRotation = useSharedValue(0);
  const shimmer = useSharedValue(-1);
  const mysteryRotation = useSharedValue(0);
  const baseRotation = useSharedValue(0);

  useEffect(() => {
    posX.value = withSpring(x - radius);
    posY.value = withSpring(y - radius);
  }, [x, y]);

  useEffect(() => {
    activeScale.value = withSpring(isSelected ? 1.3 : 1);
    baseRotation.value = withSpring(isSelected ? 15 : 0);
  }, [isSelected]);

  useEffect(() => {
    if (mechanic === 'icy') {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 1500 }),
          withTiming(1, { duration: 1500 })
        ),
        -1,
        true
      );
    } else if (mechanic === 'oily') {
      oilRotation.value = withRepeat(
        withTiming(360, { duration: 10000 }),
        -1,
        false
      );
    }

    shimmer.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 }),
        withDelay(1000, withTiming(-1, { duration: 0 }))
      ),
      -1,
      false
    );

    if (isMystery) {
      mysteryRotation.value = withRepeat(
        withTiming(360, { duration: 4000 }),
        -1,
        false
      );
    }
  }, [mechanic, isMystery]);

  const animatedStyle = useAnimatedStyle(() => {
    const rotation = isMystery ? mysteryRotation.value : baseRotation.value;
    
    let bgColor;
    if (isMystery) {
      bgColor = interpolateColor(
        mysteryRotation.value,
        [0, 120, 240, 360],
        ['#475569', '#64748b', '#334155', '#475569']
      );
    } else {
      bgColor = withTiming(THEME.colors.screws[displayColor]);
    }

    const transform: any[] = [
      { scale: activeScale.value },
      { rotate: `${rotation}deg` },
    ];

    if (!isStatic) {
      transform.unshift(
        { translateX: posX.value },
        { translateY: posY.value }
      );
    }

    return {
      transform,
      backgroundColor: bgColor as any,
      zIndex: isSelected ? 100 : 50,
      position: isStatic ? 'relative' : 'absolute',
    };
  });

  const iceStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }] as any,
    opacity: interpolate(pulse.value, [1, 1.08], [0.7, 0.95]),
  }));

  const oilStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${oilRotation.value}deg` }] as any,
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmer.value, [-1, 1], [-radius * 3, radius * 3]) }] as any,
  }));

  const renderIce = () => (
    <Animated.View style={[styles.iceLayer, iceStyle]}>
      <Svg height="100%" width="100%" viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
        <Defs>
          <RadialGradient id="iceGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.4" />
            <Stop offset="70%" stopColor="#BAE6FD" stopOpacity="0.6" />
            <Stop offset="100%" stopColor="#7DD3FC" stopOpacity="0.8" />
          </RadialGradient>
        </Defs>
        <Circle cx={radius} cy={radius} r={radius} fill="url(#iceGrad)" />
        
        {/* Ice Cracks based on durability */}
        {(durability || 0) < 3 && (
          <Path 
            d={`M${radius * 0.5} ${radius * 0.5} L${radius * 1.5} ${radius * 1.5} M${radius * 1.5} ${radius * 0.5} L${radius * 0.5} ${radius * 1.5}`}
            stroke="white" 
            strokeWidth="1.5" 
            strokeOpacity="0.6"
          />
        )}
        {(durability || 0) < 2 && (
          <Path 
            d={`M${radius} ${radius * 0.2} L${radius} ${radius * 1.8} M${radius * 0.2} ${radius} L${radius * 1.8} ${radius}`}
            stroke="white" 
            strokeWidth="2" 
            strokeOpacity="0.8"
          />
        )}

        {/* Frost buildup pattern */}
        <Circle cx={radius * 0.4} cy={radius * 0.4} r={radius * 0.2} fill="white" fillOpacity="0.3" />
        <Circle cx={radius * 1.6} cy={radius * 0.7} r={radius * 0.15} fill="white" fillOpacity="0.2" />
        <Circle cx={radius * 0.7} cy={radius * 1.6} r={radius * 0.25} fill="white" fillOpacity="0.15" />
      </Svg>
    </Animated.View>
  );

  const renderOil = () => (
    <Animated.View style={[StyleSheet.absoluteFill, oilStyle]}>
      <Svg height="100%" width="100%" viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
        <Defs>
          <RadialGradient id="oilGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#1E293B" stopOpacity="0.2" />
            <Stop offset="40%" stopColor="#4F46E5" stopOpacity="0.3" />
            <Stop offset="70%" stopColor="#9333EA" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#0F172A" stopOpacity="0.5" />
          </RadialGradient>
        </Defs>
        <Circle cx={radius} cy={radius} r={radius} fill="url(#oilGrad)" />
        
        {/* Oil Swirls */}
        <Path 
          d={`M${radius * 0.4} ${radius * 0.4} Q${radius} ${radius * 0.1} ${radius * 1.6} ${radius * 0.4}`} 
          stroke="#A855F7" 
          strokeWidth="3" 
          strokeOpacity="0.2" 
          fill="none" 
        />
        <Path 
          d={`M${radius * 0.2} ${radius} Q${radius} ${radius * 1.5} ${radius * 1.8} ${radius}`} 
          stroke="#22D3EE" 
          strokeWidth="2" 
          strokeOpacity="0.15" 
          fill="none" 
        />
      </Svg>
    </Animated.View>
  );

  return (
    <Animated.View 
      pointerEvents="none"
      style={[styles.screw, animatedStyle]}
    >
      {/* Base Pattern */}
      <View style={styles.topPattern} />
      <View style={[styles.topPattern, { transform: [{ rotate: '-45deg' }] }]} />
      
      {/* Shine/Shimmer Effect */}
      <Animated.View style={[styles.shimmerContainer, shimmerStyle]}>
        <View style={styles.shimmerLine} />
      </Animated.View>

      {/* Specialty Layers */}
      {mechanic === 'icy' && renderIce()}
      
      {mechanic === 'oily' && renderOil()}

      {/* Decorative Shine */}
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
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 12,
    overflow: 'hidden',
  },
  topPattern: {
    position: 'absolute',
    width: '70%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
  },
  shine: {
    position: 'absolute',
    top: '10%',
    left: '10%',
    width: '30%',
    height: '30%',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 10,
    transform: [{ rotate: '-15deg' }],
  },
  shimmerContainer: {
    position: 'absolute',
    width: '300%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.4,
  },
  shimmerLine: {
    width: 20,
    height: '150%',
    backgroundColor: '#fff',
    transform: [{ rotate: '45deg' }],
  },
  iceLayer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: THEME.spacing.screwRadius,
    overflow: 'hidden',
  },
  mysteryIcon: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  }
});

