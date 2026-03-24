import React from 'react';
import { StyleSheet, View, Text, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { THEME } from './src/constants/theme';
import { useGameState } from './src/hooks/useGameState';
import { Plate } from './src/components/Plate';
import { Screw } from './src/components/Screw';
import { Hole } from './src/components/Hole';
import { RefreshCcw, Undo2, HelpCircle } from 'lucide-react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';

export default function App() {
  const { state, handleHolePress, undo, showTrollHint } = useGameState();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Bolt Sorter</Text>
            <Text style={styles.subtitle}>Zekiysen çözersin... (Pek sanmam)</Text>
          </View>
          <View style={styles.headerButtons}>
             <TouchableOpacity style={styles.headerIconButton} onPress={undo}>
                <Undo2 color={THEME.colors.primary} size={24} />
             </TouchableOpacity>
             <TouchableOpacity style={styles.headerIconButton} onPress={showTrollHint}>
                <HelpCircle color={THEME.colors.primary} size={24} />
             </TouchableOpacity>
             <View style={styles.statBox}>
                <Text style={styles.statLabel}>HAMLE</Text>
                <Text style={styles.statValue}>{state.moves}</Text>
              </View>
          </View>
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
          {/* Background Holes */}
          {Object.values(state.holes).map(hole => (
            <Hole
              key={hole.id}
              x={hole.x}
              y={hole.y}
              isSelected={state.selectedScrewId === hole.screwId}
              isHintTarget={state.isTrollHintActive && hole.id === 'h5'} // Fake h5 target
              onPress={() => handleHolePress(hole.id)}
            />
          ))}

          {/* Plates */}
          {Object.values(state.plates).map(plate => (
            <Plate
              key={plate.id}
              color={plate.color}
              zIndex={plate.zIndex}
              isRemoved={plate.isRemoved}
              attachedScrewCount={plate.holeIds.filter(hId => !!state.holes[hId].screwId).length}
              holes={plate.holeIds.map(id => state.holes[id])}
            />
          ))}

          {/* Screws */}
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
           {/* Progress bar could go here, but let's keep it simple for now */}
        </View>
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
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconButton: {
    backgroundColor: THEME.colors.surface,
    padding: 10,
    borderRadius: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: THEME.colors.text,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 12,
    color: THEME.colors.secondary,
    marginTop: 2,
  },
  statBox: {
    backgroundColor: THEME.colors.surface,
    padding: 10,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 70,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: THEME.colors.primary,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: THEME.colors.text,
  },
  insultBanner: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    backgroundColor: '#EF444433',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EF444488',
    zIndex: 1000,
    alignItems: 'center',
  },
  insultText: {
    color: '#FCA5A5',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  board: {
    flex: 1,
    position: 'relative',
    margin: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  }
});
