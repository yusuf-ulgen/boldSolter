import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { THEME } from './src/constants/theme';
import { useGameState } from './src/hooks/useGameState';
import { Plate } from './src/components/Plate';
import { Screw } from './src/components/Screw';
import { Hole } from './src/components/Hole';
import { Undo2, HelpCircle, Trophy, RotateCcw, Play } from 'lucide-react-native';
import Animated, { FadeInUp, FadeOutDown, FadeIn, ScaleInCenter } from 'react-native-reanimated';

export default function App() {
  const { state, handleHolePress, undo, nextLevel, retryLevel } = useGameState();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Bolt Sorter</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>SEVİYE {state.levelIndex}</Text>
            </View>
          </View>
          <View style={styles.headerStats}>
            <View style={[styles.statBox, state.timeLeft < 10 && styles.statBoxUrgent]}>
              <Text style={styles.statLabel}>SÜRE</Text>
              <Text style={styles.statValue}>{formatTime(state.timeLeft)}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>HAMLE</Text>
              <Text style={styles.statValue}>{state.moves}</Text>
            </View>
          </View>
        </View>

        {/* Timer Progress Bar */}
        <View style={styles.timerBarContainer}>
           <View style={[styles.timerBar, { width: `${(state.timeLeft / 120) * 100}%` }]} />
        </View>

        {state.insultMessage && (
          <Animated.View 
            entering={FadeInUp} 
            exiting={FadeOutDown} 
            style={styles.insultBanner}
          >
            <Text style={styles.insultText}>{state.insultMessage}</Text>
          </Animated.View>
        )}

        <View style={styles.board}>
          {Object.values(state.holes).map(hole => (
            <Hole
              key={hole.id}
              x={hole.x}
              y={hole.y}
              isSelected={state.selectedScrewId === hole.screwId}
              onPress={() => handleHolePress(hole.id)}
            />
          ))}

          {Object.values(state.plates).map(plate => (
            <Plate
              key={plate.id}
              color={plate.color}
              zIndex={plate.zIndex}
              isRemoved={plate.isRemoved}
              attachedScrewCount={plate.holeIds.filter(hId => !!state.holes[hId].screwId).length}
              shapePoints={plate.shapePoints}
            />
          ))}

          {Object.values(state.screws).map(screw => {
            const hole = state.holes[screw.holeId];
            return (
              <Screw
                key={screw.id}
                color={screw.color}
                x={hole.x}
                y={hole.y}
                isMystery={screw.isMystery}
                isSelected={state.selectedScrewId === screw.id}
              />
            );
          })}
        </View>

        <View style={styles.footer}>
           <TouchableOpacity style={styles.actionButton} onPress={undo}>
              <Undo2 color={THEME.colors.text} size={20} />
              <Text style={styles.actionButtonText}>GERİ AL</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.actionButton} onPress={retryLevel}>
              <RotateCcw color={THEME.colors.text} size={20} />
              <Text style={styles.actionButtonText}>TEKRAR</Text>
           </TouchableOpacity>
        </View>

        {/* Win Overlay */}
        {state.isLevelComplete && (
          <Animated.View entering={FadeIn} style={styles.overlay}>
             <Animated.View entering={ScaleInCenter} style={styles.modalContent}>
                <Trophy color="#FBBF24" size={60} />
                <Text style={styles.modalTitle}>HARİKA!</Text>
                <Text style={styles.modalSubtitle}>Seviye {state.levelIndex} tamamlandı.</Text>
                <TouchableOpacity style={styles.modalButton} onPress={nextLevel}>
                   <Play color="#fff" size={20} fill="#fff" />
                   <Text style={styles.modalButtonText}>SIRADAKİ</Text>
                </TouchableOpacity>
             </Animated.View>
          </Animated.View>
        )}

        {/* Game Over Overlay */}
        {state.isGameOver && (
          <Animated.View entering={FadeIn} style={[styles.overlay, { backgroundColor: 'rgba(239,68,68,0.2)' }]}>
             <Animated.View entering={ScaleInCenter} style={styles.modalContent}>
                <Text style={styles.modalEmoji}>💀</Text>
                <Text style={styles.modalTitle}>SÜRE DOLDU!</Text>
                <Text style={styles.modalSubtitle}>{state.insultMessage || "Hadi ama, biraz daha hızlı!"}</Text>
                <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#EF4444' }]} onPress={retryLevel}>
                   <RotateCcw color="#fff" size={20} />
                   <Text style={styles.modalButtonText}>TEKRAR DENE</Text>
                </TouchableOpacity>
             </Animated.View>
          </Animated.View>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerStats: {
    flexDirection: 'row',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: THEME.colors.text,
    letterSpacing: -1,
  },
  levelBadge: {
    backgroundColor: THEME.colors.primary + '33',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  levelText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.colors.primary,
  },
  timerBarContainer: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: 'hidden',
  },
  timerBar: {
    height: '100%',
    backgroundColor: THEME.colors.primary,
  },
  statBox: {
    backgroundColor: THEME.colors.surface,
    padding: 8,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 65,
  },
  statBoxUrgent: {
    borderWidth: 1,
    borderColor: '#EF4444',
    backgroundColor: '#EF444422',
  },
  statLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: THEME.colors.secondary,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: THEME.colors.text,
  },
  insultBanner: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: '#334155EE',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    zIndex: 1000,
  },
  insultText: {
    color: '#F8FAFC',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  },
  board: {
    flex: 1,
    position: 'relative',
    margin: 15,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  footer: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: THEME.colors.text,
    fontWeight: 'bold',
    fontSize: 12,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  modalContent: {
    backgroundColor: THEME.colors.surface,
    padding: 40,
    borderRadius: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    width: '80%',
  },
  modalEmoji: {
    fontSize: 50,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    color: THEME.colors.secondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  modalButton: {
    backgroundColor: THEME.colors.primary,
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 16,
    alignItems: 'center',
    gap: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
