import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { THEME } from '../constants/theme';
import { Trophy, Play, Home } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown, Layout } from 'react-native-reanimated';
import { getLeaderboard, ScoreEntry } from '../lib/firebaseService';

const { width } = Dimensions.get('window');

interface ScoreboardProps {
  levelIndex: number;
  currentScore: number;
  playerName: string;
  onNext: () => void;
  onMenu: () => void;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ 
  levelIndex, 
  currentScore, 
  playerName, 
  onNext, 
  onMenu 
}) => {
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      const scores = await getLeaderboard(levelIndex, 10);
      setLeaderboard(scores);
      setLoading(false);
    };
    fetchScores();
  }, [levelIndex]);

  const renderPodium = () => {
    const top3 = leaderboard.slice(0, 3);
    // Reorder for visual podium: [2, 1, 3]
    const visualOrder = [
      top3[1], // 2nd
      top3[0], // 1st
      top3[2]  // 3rd
    ];

    return (
      <View style={styles.podiumContainer}>
        {visualOrder.map((entry, index) => {
          if (!entry) return <View key={index} style={styles.podiumEmpty} />;
          
          const isPlayer = entry.playerName === playerName;
          const isFirst = index === 1;
          const isSecond = index === 0;
          const isThird = index === 2;

          return (
            <Animated.View 
              key={entry.id || index} 
              layout={Layout.spring()}
              entering={FadeInDown.delay(index * 200)}
              style={[
                styles.podiumStep,
                isFirst ? styles.podiumFirst : (isSecond ? styles.podiumSecond : styles.podiumThird),
                isPlayer && styles.podiumPlayer
              ]}
            >
              <View style={styles.avatarContainer}>
                <View style={[styles.avatar, isPlayer && styles.playerAvatar]}>
                    <Text style={styles.avatarText}>{entry.playerName[0].toUpperCase()}</Text>
                </View>
                <View style={[styles.rankCircle, { backgroundColor: isFirst ? '#FBBF24' : (isSecond ? '#94A3B8' : '#D97706') }]}>
                  <Text style={styles.rankCircleText}>{isFirst ? '1' : (isSecond ? '2' : '3')}</Text>
                </View>
              </View>
              <Text style={styles.podiumName} numberOfLines={1}>{entry.playerName}</Text>
              <Text style={styles.podiumScore}>{entry.score}</Text>
            </Animated.View>
          );
        })}
      </View>
    );
  };

  const renderListItem = (entry: ScoreEntry, index: number) => {
    const isPlayer = entry.playerName === playerName;
    return (
      <Animated.View 
        key={entry.id || index}
        layout={Layout.spring()}
        entering={FadeInDown.delay(600 + index * 100)}
        style={[styles.listItem, isPlayer && styles.listItemPlayer]}
      >
        <Text style={styles.listRank}>{index + 4}</Text>
        <View style={styles.listAvatar}>
           <Text style={styles.listAvatarText}>{entry.playerName[0].toUpperCase()}</Text>
        </View>
        <Text style={styles.listName}>{entry.playerName}</Text>
        <Text style={styles.listScore}>{entry.score}</Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn} style={styles.modalContent}>
        <Text style={styles.title}>TEBRİKLER!</Text>
        <Text style={styles.subtitle}>Bölüm {levelIndex} Tamamlandı</Text>

        <View style={styles.scoreHighlight}>
            <Text style={styles.scoreLabel}>PUANIN</Text>
            <Text style={styles.scoreValue}>{currentScore}</Text>
        </View>

        {loading ? (
          <Text style={{ color: THEME.colors.secondary }}>Yükleniyor...</Text>
        ) : (
          <>
            {renderPodium()}
            <View style={styles.listContainer}>
              {leaderboard.slice(3, 6).map((entry, i) => renderListItem(entry, i))}
            </View>
          </>
        )}

        <View style={styles.footer}>
          <TouchableOpacity style={styles.menuButton} onPress={onMenu}>
            <Home color={THEME.colors.text} size={24} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextButton} onPress={onNext}>
            <Play color="#fff" size={24} fill="#fff" />
            <Text style={styles.nextButtonText}>DEVAM ET</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3000,
  },
  modalContent: {
    width: '90%',
    backgroundColor: THEME.colors.surface,
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: THEME.colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: THEME.colors.secondary,
    marginBottom: 20,
  },
  scoreHighlight: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 30,
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.colors.secondary,
    letterSpacing: 1,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '900',
    color: THEME.colors.text,
  },
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 180,
    marginBottom: 20,
    width: '100%',
    justifyContent: 'center',
  },
  podiumStep: {
    width: (width * 0.8) / 3,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignItems: 'center',
    paddingTop: 40,
    position: 'relative',
  },
  podiumEmpty: {
    width: (width * 0.8) / 3,
  },
  podiumFirst: {
    height: 140,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderColor: '#FBBF24',
    borderWidth: 1,
    zIndex: 2,
  },
  podiumSecond: {
    height: 110,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    borderColor: '#94A3B8',
    borderWidth: 1,
  },
  podiumThird: {
    height: 90,
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
    borderColor: '#D97706',
    borderWidth: 1,
  },
  podiumPlayer: {
    backgroundColor: THEME.colors.primary + '22',
    borderColor: THEME.colors.primary,
  },
  avatarContainer: {
    position: 'absolute',
    top: -30,
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: THEME.colors.surface,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerAvatar: {
    borderColor: THEME.colors.primary,
    borderWidth: 3,
  },
  avatarText: {
    color: THEME.colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  rankCircle: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankCircleText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  podiumName: {
    color: THEME.colors.text,
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 10,
    paddingHorizontal: 4,
  },
  podiumScore: {
    color: THEME.colors.secondary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  listContainer: {
    width: '100%',
    gap: 8,
    marginBottom: 30,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 12,
    borderRadius: 16,
    gap: 12,
  },
  listItemPlayer: {
    backgroundColor: THEME.colors.primary + '11',
    borderWidth: 1,
    borderColor: THEME.colors.primary + '33',
  },
  listRank: {
    color: THEME.colors.secondary,
    fontWeight: 'bold',
    width: 20,
  },
  listAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listAvatarText: {
    color: THEME.colors.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  listName: {
    flex: 1,
    color: THEME.colors.text,
    fontWeight: '600',
  },
  listScore: {
    color: THEME.colors.primary,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  menuButton: {
    backgroundColor: THEME.colors.surface,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  nextButton: {
    flex: 1,
    backgroundColor: THEME.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 20,
    gap: 10,
    elevation: 4,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  }
});
