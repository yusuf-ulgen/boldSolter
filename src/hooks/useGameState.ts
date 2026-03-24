import { useState, useCallback } from 'react';
import { GameState, Color, Screw, Plate, Hole } from '../types/game';
import * as Haptics from 'expo-haptics';

const INITIAL_STATE: GameState = {
  holes: {
    'h1': { id: 'h1', x: 100, y: 100, screwId: 's1' },
    'h2': { id: 'h2', x: 200, y: 100, screwId: 's2' },
    'h3': { id: 'h3', x: 100, y: 250 },
    'h4': { id: 'h4', x: 200, y: 250, screwId: 's3' },
    'h5': { id: 'h5', x: 150, y: 400 },
  },
  screws: {
    's1': { id: 's1', color: 'red', holeId: 'h1' },
    's2': { id: 's2', color: 'blue', holeId: 'h2', isMystery: true },
    's3': { id: 's3', color: 'red', holeId: 'h4' },
  },
  plates: {
    'p1': { id: 'p1', color: 'red', holeIds: ['h1', 'h4'], zIndex: 1, isRemoved: false },
    'p2': { id: 'p2', color: 'blue', holeIds: ['h2'], zIndex: 2, isRemoved: false },
  },
  moves: 0,
  history: [],
};

export const useGameState = () => {
  const [state, setState] = useState<GameState>(INITIAL_STATE);

  const showInsult = useCallback(() => {
    const randomInsult = THEME.bait.insults[Math.floor(Math.random() * THEME.bait.insults.length)];
    setState(prev => ({ ...prev, insultMessage: randomInsult }));
  }, []);

  const selectScrew = useCallback((screwId: string) => {
    setState(prev => ({ ...prev, selectedScrewId: screwId, insultMessage: undefined }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const undo = useCallback(() => {
    setState(prev => {
      if (prev.history.length === 0) return { ...prev, insultMessage: "Neyi geri alacaksın? Hafızan mı silindi? 🧠" };
      const lastStateStr = prev.history[prev.history.length - 1];
      const lastState = JSON.parse(lastStateStr);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return { 
        ...lastState, 
        insultMessage: "Korkak gibi geri mi dönüyorsun? 😂",
        history: prev.history.slice(0, -1)
      };
    });
  }, []);

  const showTrollHint = useCallback(() => {
    const randomHint = THEME.bait.trollHints[Math.floor(Math.random() * THEME.bait.trollHints.length)];
    setState(prev => ({ ...prev, insultMessage: randomHint, isTrollHintActive: true }));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, []);

  const moveScrewToHole = useCallback((screwId: string, holeId: string) => {
    setState(prev => {
      const screw = prev.screws[screwId];
      const targetHole = prev.holes[holeId];

      if (targetHole.screwId) {
        return { ...prev, insultMessage: "Dolu deliğe girmeye çalışmak... Başarılar. 🤡" };
      }

      const sourceHoleId = screw.holeId;
      const newHoles = {
        ...prev.holes,
        [sourceHoleId]: { ...prev.holes[sourceHoleId], screwId: undefined },
        [holeId]: { ...prev.holes[holeId], screwId: screwId },
      };

      const newScrews = {
        ...prev.screws,
        [screwId]: { ...screw, holeId: holeId, isMystery: false }, // Reveal on move
      };

      const newPlates = { ...prev.plates };
      Object.values(newPlates).forEach(plate => {
        if (!plate.isRemoved) {
          const stillAttached = plate.holeIds.some(hId => newHoles[hId].screwId);
          if (!stillAttached) {
            plate.isRemoved = true;
          }
        }
      });

      // Save history for undo
      const stateToSave = { ...prev, history: [] }; // Don't save recursive history
      const newHistory = [...prev.history, JSON.stringify(stateToSave)].slice(-5); // Keep last 5 moves

      if (prev.moves % 10 === 0 && prev.moves > 0) showInsult();

      return {
        ...prev,
        holes: newHoles,
        screws: newScrews,
        plates: newPlates,
        selectedScrewId: undefined,
        moves: prev.moves + 1,
        history: newHistory,
        isTrollHintActive: false,
      };
    });
  }, [showInsult]);

  const handleHolePress = useCallback((holeId: string) => {
    setState(prev => {
      const hole = prev.holes[holeId];
      
      if (hole.screwId) {
        // Selection
        selectScrew(hole.screwId);
        return prev;
      } else if (prev.selectedScrewId) {
        // Moving
        moveScrewToHole(prev.selectedScrewId, holeId);
        return prev;
      }
      return prev;
    });
  }, [selectScrew, moveScrewToHole]);

  return {
    state,
    handleHolePress,
  };
};
