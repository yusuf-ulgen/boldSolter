import { GameState, Hole, Plate, Screw, Point, Color } from '../types/game';

const COLORS: Color[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
const GRID_COLS = 5;
const GRID_ROWS = 7;
const SPACING = 65;
const OFFSET_X = 40;
const OFFSET_Y = 80;

export const generateLevel = (levelIndex: number): GameState => {
  const holes: Record<string, Hole> = {};
  const screws: Record<string, Screw> = {};
  const plates: Record<string, Plate> = {};

  // 1. Generate Hole Grid
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const id = `h_${r}_${c}`;
      holes[id] = {
        id,
        x: c * SPACING + OFFSET_X,
        y: r * SPACING + OFFSET_Y,
      };
    }
  }

  // 2. Determine complexity
  const numPlates = Math.min(3 + Math.floor(levelIndex / 5), 18);
  const holesArray = Object.values(holes);
  const usedHoleIds = new Set<string>();

  // 3. Create Plates
  for (let i = 0; i < numPlates; i++) {
    const plateId = `p${i}`;
    const plateHoleIds: string[] = [];
    
    // Pick a starting hole that isn't too crowded
    let startHole = holesArray[Math.floor(Math.random() * holesArray.length)];
    let attempts = 0;
    while (usedHoleIds.has(startHole.id) && attempts < 50) {
      startHole = holesArray[Math.floor(Math.random() * holesArray.length)];
      attempts++;
    }

    plateHoleIds.push(startHole.id);
    usedHoleIds.add(startHole.id);

    // Expand plate to 2-4 holes
    const plateSize = 2 + Math.floor(Math.random() * 2);
    for (let j = 1; j < plateSize; j++) {
      const lastHoleId = plateHoleIds[plateHoleIds.length - 1];
      const match = lastHoleId.match(/h_(\d+)_(\d+)/);
      if (!match) break;
      const r = parseInt(match[1]);
      const c = parseInt(match[2]);

      const neighbors = [
        `h_${r+1}_${c}`, `h_${r-1}_${c}`, `h_${r}_${c+1}`, `h_${r}_${c-1}`
      ].filter(id => holes[id] && !plateHoleIds.includes(id));

      if (neighbors.length > 0) {
        const nextId = neighbors[Math.floor(Math.random() * neighbors.length)];
        plateHoleIds.push(nextId);
        usedHoleIds.add(nextId);
      }
    }

    const color = COLORS[i % COLORS.length];
    plates[plateId] = {
      id: plateId,
      color,
      holeIds: plateHoleIds,
      zIndex: i + 1,
      isRemoved: false,
      shapePoints: plateHoleIds.map(hid => ({ x: holes[hid].x, y: holes[hid].y })),
    };

    // Add screws to these holes
    plateHoleIds.forEach(hid => {
      const screwId = `s_${hid}`;
      if (!screws[screwId]) {
         screws[screwId] = {
           id: screwId,
           color,
           holeId: hid,
           isMystery: Math.random() > 0.8,
         };
         holes[hid].screwId = screwId;
      }
    });
  }

  // 4. Ensure some empty holes
  const allHoleIds = Object.keys(holes);
  const emptyHoleCount = Math.max(1, 3 - Math.floor(levelIndex / 20));
  let cleared = 0;
  for (let i = 0; i < allHoleIds.length && cleared < emptyHoleCount; i++) {
     const hid = allHoleIds[i];
     if (holes[hid].screwId) {
       const sid = holes[hid].screwId!;
       delete screws[sid];
       holes[hid].screwId = undefined;
       cleared++;
     }
  }

  return {
    levelIndex,
    timeLeft: Math.max(30, 120 - levelIndex * 2), // 2 minutes to 30 seconds
    isLevelComplete: false,
    isGameOver: false,
    holes,
    screws,
    plates,
    moves: 0,
    history: [],
  };
};
