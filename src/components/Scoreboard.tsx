import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, Dimensions } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { THEME } from '../constants/theme';
import { Trophy, Play, Home } from 'lucide-react-native';
import Animated, { FadeIn, SlideInUp, Layout, LinearTransition } from 'react-native-reanimated';
import { getLeaderboard, ScoreEntry } from '../lib/firebaseService';

const { width } = Dimensions.get('window');

interface ScoreboardProps {
  levelIndex: number;
  currentScore: number;
  moves: number;
  timeLeft: number;
  playerName: string;
  onNext: () => void;
  onMenu: () => void;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ 
  levelIndex, 
  currentScore,
  moves,
  timeLeft,
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

          let medalColor = '#FBBF24';
          if (isSecond) medalColor = '#94A3B8';
          if (isThird) medalColor = '#D97706';

          return (
            <Animated.View 
              key={entry.id || index} 
              layout={LinearTransition.springify()}
              entering={FadeIn.delay(index * 200)}
              style={[
                styles.podiumStep,
                isFirst ? styles.podiumFirst : (isSecond ? styles.podiumSecond : styles.podiumThird),
                isPlayer && styles.podiumPlayer,
                { borderColor: medalColor }
              ]}
            >
              <View style={styles.avatarContainer}>
                <View style={[styles.avatar, isPlayer && styles.playerAvatar, { borderColor: medalColor }]}>
                    <Text style={styles.avatarText}>{entry.playerName[0].toUpperCase()}</Text>
                </View>
                <View style={[styles.rankCircle, { backgroundColor: medalColor }]}>
                  <Text style={styles.rankCircleText}>{isFirst ? '1' : (isSecond ? '2' : '3')}</Text>
                </View>
              </View>
              <View style={styles.podiumInfo}>
                <Text style={styles.podiumName} numberOfLines={1}>{entry.playerName}</Text>
                <Text style={[styles.podiumScore, { color: medalColor }]}>{entry.score.toLocaleString()}</Text>
                <Text style={styles.podiumDetails}>{entry.moves}H • {Math.floor(entry.timeLeft / 60)}:{(entry.timeLeft % 60).toString().padStart(2, '0')}</Text>
              </View>
            </Animated.View>
          );
        })}
      </View>
    );
  };

  const renderListItem = (entry: ScoreEntry, index: number) => {
    const isPlayer = entry.playerName === playerName;
    const rank = index + 4;
    const isRanked = rank <= 5;
    
    return (
      <Animated.View 
        key={entry.id || index}
        layout={LinearTransition.springify()}
        entering={FadeIn.delay(600 + index * 100)}
        style={[styles.listItem, isPlayer && styles.listItemPlayer]}
      >
        <Text style={styles.listRank}>
          {isRanked ? rank : '-'}
        </Text>
        <View style={styles.listAvatar}>
           <Text style={styles.listAvatarText}>{entry.playerName[0].toUpperCase()}</Text>
        </View>
        <View style={styles.listNameContainer}>
          <Text style={styles.listName}>{entry.playerName}</Text>
          <Text style={styles.listDetails}>{entry.moves} Hamle • {Math.floor(entry.timeLeft / 60)}:{(entry.timeLeft % 60).toString().padStart(2, '0')}</Text>
        </View>
        <Text style={styles.listScore}>{entry.score.toLocaleString()}</Text>
      </Animated.View>
    );
  };

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      <Animated.View 
        entering={SlideInUp.springify().damping(15).duration(800)} 
        style={styles.modalContent}
      >
        <Text style={styles.title}>TEBRİKLER!</Text>
        <Text style={styles.subtitle}>Bölüm {levelIndex} Tamamlandı</Text>

        <View style={styles.scoreHighlight}>
            <View style={styles.scoreDetailRow}>
              <View style={styles.scoreDetailItem}>
                <Text style={styles.scoreDetailLabel}>SÜRE</Text>
                <Text style={styles.scoreDetailValue}>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</Text>
              </View>
              <View style={styles.scoreDetailDivider} />
              <View style={styles.scoreDetailItem}>
                <Text style={styles.scoreDetailLabel}>HAMLE</Text>
                <Text style={styles.scoreDetailValue}>{moves}</Text>
              </View>
            </View>
            <View style={styles.scoreMainRow}>
              <Text style={styles.scoreLabel}>TOPLAM PUAN</Text>
              <Text style={styles.scoreValue}>{currentScore.toLocaleString()}</Text>
            </View>
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
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 120, // Increased for better clearance
    zIndex: 3000,
  },
  modalContent: {
    width: '92%',
    backgroundColor: THEME.colors.surface,
    borderRadius: 36,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
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
    fontSize: 32,
    fontWeight: '900',
    color: THEME.colors.primary,
  },
  scoreDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 20,
  },
  scoreDetailItem: {
    alignItems: 'center',
  },
  scoreDetailLabel: {
    fontSize: 8,
    color: THEME.colors.secondary,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  scoreDetailValue: {
    fontSize: 18,
    color: THEME.colors.text,
    fontWeight: '900',
  },
  scoreDetailDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  scoreMainRow: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 10,
    width: '100%',
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
    width: (width * 0.8) / 3.2,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
    paddingTop: 45,
    position: 'relative',
    marginHorizontal: 4,
  },
  podiumInfo: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 4,
    marginTop: 10,
  },
  podiumEmpty: {
    width: (width * 0.8) / 3.2,
    marginHorizontal: 4,
  },
  podiumFirst: {
    height: 160,
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
    borderWidth: 2,
    zIndex: 2,
    elevation: 10,
  },
  podiumSecond: {
    height: 130,
    backgroundColor: 'rgba(148, 163, 184, 0.08)',
    borderWidth: 1.5,
  },
  podiumThird: {
    height: 110,
    backgroundColor: 'rgba(217, 119, 6, 0.08)',
    borderWidth: 1.5,
  },
  podiumPlayer: {
    backgroundColor: THEME.colors.primary + '15',
    borderColor: THEME.colors.primary,
    borderWidth: 2,
  },
  avatarContainer: {
    position: 'absolute',
    top: -35,
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
    color: THEME.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  podiumDetails: {
    color: THEME.colors.secondary,
    fontSize: 8,
    fontWeight: 'bold',
  },
  listNameContainer: {
    flex: 1,
  },
  listDetails: {
    color: THEME.colors.secondary,
    fontSize: 10,
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
