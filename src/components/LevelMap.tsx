import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { THEME } from '../constants/theme';
import { Lock, Star, Trophy, ChevronLeft } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { getPlayerRanks } from '../lib/firebaseService';

const { width } = Dimensions.get('window');

interface LevelMapProps {
  currentLevel: number;
  playerName: string;
  onSelectLevel: (level: number) => void;
  onBack: () => void;
}

export const LevelMap: React.FC<LevelMapProps> = ({ currentLevel, playerName, onSelectLevel, onBack }) => {
  const [ranks, setRanks] = useState<Record<number, number>>({});
  const totalLevels = 50;

  useEffect(() => {
    const fetchRanks = async () => {
      if (!playerName) return;
      const rankData = await getPlayerRanks(playerName);
      setRanks(rankData);
    };
    fetchRanks();
  }, [currentLevel, playerName]);

  const renderLevel = (index: number) => {
    const isUnlocked = index <= currentLevel;
    const isCurrent = index === currentLevel;
    const rank = ranks[index];

    return (
      <Animated.View 
        key={index}
        entering={FadeInUp.delay(index * 50).duration(400)}
        style={[
          styles.levelNode,
          index % 2 === 0 ? styles.nodeLeft : styles.nodeRight,
          !isUnlocked && styles.nodeLocked
        ]}
      >
        <TouchableOpacity 
          disabled={!isUnlocked}
          onPress={() => onSelectLevel(index)}
          style={[
            styles.nodeCircle,
            isCurrent && styles.nodeCurrent,
            !isUnlocked && styles.nodeLockedCircle
          ]}
        >
          {isUnlocked ? (
            <Text style={styles.levelNumber}>{index}</Text>
          ) : (
            <Lock color={THEME.colors.secondary} size={20} />
          )}
        </TouchableOpacity>
        
        {isUnlocked && (
          <View style={styles.rankBadge}>
            <Trophy color={rank && rank <= 3 ? "#FBBF24" : THEME.colors.primary} size={12} />
            <Text style={styles.rankText}>{rank ? `#${rank}` : '-'}</Text>
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ChevronLeft color={THEME.colors.text} size={28} />
        </TouchableOpacity>
        <Text style={styles.title}>BÖLÜMLER</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mapContainer}>
          {Array.from({ length: totalLevels }).map((_, i) => renderLevel(i + 1))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    backgroundColor: THEME.colors.surface,
    padding: 8,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: THEME.colors.text,
    letterSpacing: 2,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  mapContainer: {
    paddingHorizontal: 40,
    paddingTop: 20,
  },
  levelNode: {
    marginBottom: 40,
    alignItems: 'center',
    width: '100%',
  },
  nodeLeft: {
    alignItems: 'flex-start',
    paddingLeft: 40,
  },
  nodeRight: {
    alignItems: 'flex-end',
    paddingRight: 40,
  },
  nodeCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: THEME.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.1)',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  nodeCurrent: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primary + '22',
    transform: [{ scale: 1.1 }],
  },
  nodeLocked: {
    opacity: 0.6,
  },
  nodeLockedCircle: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  levelNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: THEME.colors.text,
  },
  rankBadge: {
    position: 'absolute',
    bottom: -10,
    backgroundColor: THEME.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 4,
  },
  rankText: {
    color: THEME.colors.text,
    fontSize: 10,
    fontWeight: 'bold',
  }
});
