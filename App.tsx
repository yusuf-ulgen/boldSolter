import { StyleSheet, View, Text, TouchableOpacity, Modal, BackHandler, ToastAndroid, Platform } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { THEME } from './src/constants/theme';
import { useGameState } from './src/hooks/useGameState';
import { Plate } from './src/components/Plate';
import { Screw } from './src/components/Screw';
import { Hole } from './src/components/Hole';
import { Undo2, HelpCircle, Trophy, RotateCcw, Play, Pause } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export default function App() {
  const { state, handleHolePress, undo, nextLevel, retryLevel, togglePause, setIsPaused } = useGameState();
  const [currentScreen, setCurrentScreen] = useState<'menu' | 'game'>('menu');
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const lastBackPress = useRef<number>(0);
  const shownTutorials = useRef<Set<number>>(new Set());

  useEffect(() => {
    if ((state.levelIndex === 1 || state.levelIndex === 4) && currentScreen === 'game' && !shownTutorials.current.has(state.levelIndex)) {
      setShowTutorial(true);
      shownTutorials.current.add(state.levelIndex);
    }
  }, [state.levelIndex, currentScreen]);

  useEffect(() => {
    const onBackPress = () => {
      if (currentScreen === 'game') {
        if (state.isPaused) {
          setShowConfirmExit(true);
        } else {
          togglePause();
        }
        return true;
      }
      
      const now = Date.now();
      if (lastBackPress.current && (now - lastBackPress.current < 2000)) {
        BackHandler.exitApp();
        return true;
      }
      
      lastBackPress.current = now;
      if (Platform.OS === 'android') {
        ToastAndroid.show('Çıkmak için bir kez daha dokunun', ToastAndroid.SHORT);
      }
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [currentScreen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const renderGame = () => (
    <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title} numberOfLines={1}>Bolt Sorter</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>SEVİYE {state.levelIndex}</Text>
            </View>
          </View>
          
          <View style={styles.headerCenter}>
            <View style={[styles.statBox, state.timeLeft < 10 && styles.statBoxUrgent]}>
              <Text style={styles.statLabel}>SÜRE</Text>
              <Text style={styles.statValue}>{formatTime(state.timeLeft)}</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>HAMLE</Text>
              <Text style={styles.statValue}>{state.moves}</Text>
            </View>
            <TouchableOpacity style={styles.pauseIconButton} onPress={togglePause}>
              <Pause color={THEME.colors.text} size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Timer Progress Bar */}
        <View style={styles.timerBarContainer}>
           <View style={[styles.timerBar, { width: `${(state.timeLeft / 120) * 100}%` }]} />
        </View>

        {state.insultMessage && (
          <Animated.View 
            entering={FadeIn} 
            exiting={FadeOut} 
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
              isAvailable={!!state.selectedScrewId && !hole.screwId}
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
             <Animated.View entering={FadeIn} style={styles.modalContent}>
                <Trophy color="#FBBF24" size={60} />
                <Text style={styles.modalTitle}>HARİKA!</Text>
                <Text style={styles.modalSubtitle}>Seviye {state.levelIndex} tamamlandı.</Text>
                <TouchableOpacity style={styles.modalButton} onPress={nextLevel}>
                   <Play color="#fff" size={20} fill="#fff" />
                   <Text style={styles.modalButtonText}>SIRADAKİ</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                   style={[styles.modalButton, { backgroundColor: THEME.colors.surface, marginTop: 12 }]} 
                   onPress={() => {
                     nextLevel();
                     setCurrentScreen('menu');
                   }}
                >
                   <Text style={[styles.modalButtonText, { color: THEME.colors.text }]}>ANA MENÜ</Text>
                </TouchableOpacity>
             </Animated.View>
          </Animated.View>
        )}

        {/* Game Over Overlay */}
        {state.isGameOver && (
          <Animated.View entering={FadeIn} style={[styles.overlay, { backgroundColor: 'rgba(239,68,68,0.2)' }]}>
             <Animated.View entering={FadeIn} style={styles.modalContent}>
                <Text style={styles.modalEmoji}>💀</Text>
                <Text style={styles.modalTitle}>SÜRE DOLDU!</Text>
                <Text style={styles.modalSubtitle}>{state.insultMessage || "Hadi ama, biraz daha hızlı!"}</Text>
                <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#EF4444' }]} onPress={retryLevel}>
                   <RotateCcw color="#fff" size={20} />
                   <Text style={styles.modalButtonText}>TEKRAR DENE</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                   style={[styles.modalButton, { backgroundColor: THEME.colors.surface, marginTop: 12 }]} 
                   onPress={() => {
                     retryLevel();
                     setCurrentScreen('menu');
                   }}
                >
                   <Text style={[styles.modalButtonText, { color: THEME.colors.text }]}>ANA MENÜ</Text>
                </TouchableOpacity>
             </Animated.View>
          </Animated.View>
        )}

        {/* Pause Overlay */}
        {state.isPaused && !showConfirmExit && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.overlay}>
             <Animated.View entering={FadeIn} style={styles.modalContent}>
                <Pause color={THEME.colors.primary} size={60} />
                <Text style={styles.modalTitle}>OYUN DURAKLATILDI</Text>
                <TouchableOpacity style={styles.modalButton} onPress={togglePause}>
                   <Play color="#fff" size={20} fill="#fff" />
                   <Text style={styles.modalButtonText}>DEVAM ET</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                   style={[styles.modalButton, { backgroundColor: THEME.colors.surface, marginTop: 12 }]} 
                   onPress={() => setShowConfirmExit(true)}
                >
                   <Text style={[styles.modalButtonText, { color: THEME.colors.text }]}>ANA MENÜYE DÖN</Text>
                </TouchableOpacity>
             </Animated.View>
          </Animated.View>
        )}

        {/* Confirm Exit Overlay */}
        {showConfirmExit && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.overlay}>
             <Animated.View entering={FadeIn} style={styles.modalContent}>
                <HelpCircle color="#EF4444" size={60} />
                <Text style={styles.modalTitle}>EMİN MİSİNİZ?</Text>
                <Text style={styles.modalSubtitle}>Mevcut ilerlemeniz kaybolacak.</Text>
                <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#EF4444' }]} onPress={() => {
                  setShowConfirmExit(false);
                  setIsPaused(false);
                  setCurrentScreen('menu');
                }}>
                   <Text style={styles.modalButtonText}>ÇIK</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                   style={[styles.modalButton, { backgroundColor: THEME.colors.surface, marginTop: 12 }]} 
                   onPress={() => setShowConfirmExit(false)}
                >
                   <Text style={[styles.modalButtonText, { color: THEME.colors.text }]}>İPTAL</Text>
                </TouchableOpacity>
             </Animated.View>
          </Animated.View>
        )}

        {/* Tutorial Overlay */}
        {showTutorial && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.overlay}>
             <Animated.View entering={FadeIn} style={styles.modalContent}>
                <HelpCircle color={THEME.colors.primary} size={60} />
                <Text style={styles.modalTitle}>{state.levelIndex === 1 ? "NASIL OYNANIR?" : "YENİ ÖZELLİK!"}</Text>
                <Text style={styles.modalSubtitle}>
                  {state.levelIndex === 1 
                    ? "Vidaları boş deliklere taşıyarak üzerlerindeki plakaları düşürmeye çalış! Tüm plakalar düştüğünde kazanırsın." 
                    : "Bazı vidalar gizemli olabilir! Onlara tıkladığında gerçek renkleri ortaya çıkar. Stratejini ona göre kur!"}
                </Text>
                <TouchableOpacity style={styles.modalButton} onPress={() => setShowTutorial(false)}>
                   <Text style={styles.modalButtonText}>ANLADIM</Text>
                </TouchableOpacity>
             </Animated.View>
          </Animated.View>
        )}
    </SafeAreaView>
  );

  const renderMenu = () => (
    <SafeAreaView style={styles.menuContainer}>
      <StatusBar style="light" />
      <View style={styles.menuContent}>
        <Animated.View entering={FadeIn.delay(200)} style={styles.menuHeader}>
          <Text style={styles.menuTitle}>BOLT</Text>
          <Text style={[styles.menuTitle, { color: THEME.colors.primary }]}>SORTER</Text>
        </Animated.View>
        
        <Animated.View entering={FadeIn.delay(400)} style={styles.menuStats}>
           <Text style={styles.menuSubtitle}>EN YÜKSEK SEVİYE: {state.levelIndex}</Text>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(600)} style={styles.menuButtons}>
          <TouchableOpacity 
            style={styles.playButton} 
            onPress={() => setCurrentScreen('game')}
          >
            <Play color="#fff" size={32} fill="#fff" />
            <Text style={styles.playButtonText}>OYNA</Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.versionText}>v1.0.0</Text>
      </View>
    </SafeAreaView>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {currentScreen === 'menu' ? renderMenu() : renderGame()}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  menuContainer: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  menuContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  menuHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  menuStats: {
    alignItems: 'center',
    marginBottom: 20,
  },
  menuButtons: {
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 64,
    fontWeight: '900',
    color: THEME.colors.text,
    lineHeight: 64,
    letterSpacing: -2,
  },
  menuSubtitle: {
    fontSize: 16,
    color: THEME.colors.secondary,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 60,
  },
  playButton: {
    backgroundColor: THEME.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 24,
    gap: 15,
    elevation: 8,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 1,
  },
  versionText: {
    position: 'absolute',
    bottom: 40,
    color: 'rgba(255,255,255,0.2)',
    fontSize: 12,
    fontWeight: 'bold',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1.2,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    flex: 1.2,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
  pauseIconButton: {
    backgroundColor: THEME.colors.surface,
    padding: 8,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: THEME.colors.text,
    letterSpacing: -0.5,
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
