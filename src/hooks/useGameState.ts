import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, Screw, Plate, Hole } from '../types/game';
import * as Haptics from 'expo-haptics';
import { THEME } from '../constants/theme';
import { generateLevel } from '../utils/levelGenerator';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@bolt_sorter_level';

export const useGameState = () => {
  const [state, setState] = useState<GameState>(generateLevel(1));
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load progress on mount
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const savedLevel = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedLevel) {
          const levelIndex = parseInt(savedLevel);
          setState(generateLevel(levelIndex));
        }
      } catch (e) {
        console.error("Failed to load level progress", e);
      }
    };
    loadProgress();
  }, []);

  // Timer logic
  useEffect(() => {
    if (state.isGameOver || state.isLevelComplete || state.isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setState(prev => {
        if (prev.timeLeft <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return { ...prev, timeLeft: 0, isGameOver: true, insultMessage: "Süren doldu kaplumbağa! 🐢" };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.isGameOver, state.isLevelComplete, state.isPaused]);

  const saveProgress = async (levelIndex: number) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, levelIndex.toString());
    } catch (e) {
      console.error("Failed to save progress", e);
    }
  };

  const nextLevel = useCallback(() => {
    const nextIdx = state.levelIndex + 1;
    setState(generateLevel(nextIdx));
    saveProgress(nextIdx);
  }, [state.levelIndex]);

  const retryLevel = useCallback(() => {
    setState(generateLevel(state.levelIndex));
  }, [state.levelIndex]);

  const togglePause = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const setIsPaused = useCallback((paused: boolean) => {
    setState(prev => ({ ...prev, isPaused: paused }));
  }, []);

  const selectScrew = useCallback((screwId: string) => {
    if (state.isGameOver || state.isLevelComplete || state.isPaused) return;
    setState(prev => ({ ...prev, selectedScrewId: screwId, insultMessage: undefined }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [state.isGameOver, state.isLevelComplete]);

  const moveScrewToHole = useCallback((screwId: string, holeId: string) => {
    if (state.isGameOver || state.isLevelComplete || state.isPaused) return;

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
        [screwId]: { ...screw, holeId: holeId, isMystery: false }, 
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

      const isWin = Object.values(newPlates).every(p => p.isRemoved);
      if (isWin) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      const stateToSave = { ...prev, history: [] };
      const newHistory = [...prev.history, JSON.stringify(stateToSave)].slice(-5);

      return {
        ...prev,
        holes: newHoles,
        screws: newScrews,
        plates: newPlates,
        selectedScrewId: undefined,
        moves: prev.moves + 1,
        history: newHistory,
        isLevelComplete: isWin,
      };
    });
  }, [state.isGameOver, state.isLevelComplete]);

  const undo = useCallback(() => {
    if (state.isGameOver || state.isLevelComplete || state.isPaused) return;
    setState(prev => {
      if (prev.history.length === 0) return { ...prev, insultMessage: "Neyi geri alacaksın? Hafızan mı silindi? 🧠" };
      const lastStateStr = prev.history[prev.history.length - 1];
      const lastState = JSON.parse(lastStateStr);
      return { 
        ...lastState, 
        insultMessage: "Korkak gibi geri mi dönüyorsun? 😂",
        history: prev.history.slice(0, -1)
      };
    });
  }, [state.isGameOver, state.isLevelComplete]);

  const handleHolePress = useCallback((holeId: string) => {
    const hole = state.holes[holeId];
    if (hole.screwId) {
      selectScrew(hole.screwId);
    } else if (state.selectedScrewId) {
      moveScrewToHole(state.selectedScrewId, holeId);
    }
  }, [state.holes, state.selectedScrewId, selectScrew, moveScrewToHole]);

  return {
    state,
    handleHolePress,
    undo,
    nextLevel,
    retryLevel,
    togglePause,
    setIsPaused,
  };
};
