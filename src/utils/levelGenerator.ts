import { GameState, Hole, Plate, Screw, Point, Color } from '../types/game';

const COLORS: Color[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
const GRID_COLS = 5;
const GRID_ROWS = 7;
const SPACING = 62;
const OFFSET_X = 40;
const OFFSET_Y = 40;

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
  const numPlates = Math.min(3 + Math.floor(levelIndex / 2.5), 22);
  const holesArray = Object.values(holes);
  const usedHoleIds = new Set<string>();

  // 3. Create Plates
  let maxGeneratedPlateSize = 2;
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

    // Expand plate to 2-5 holes (larger plates in higher levels)
    const maxPlateSize = levelIndex < 5 ? 3 : (levelIndex < 15 ? 4 : 5);
    const plateSize = 2 + Math.floor(Math.random() * (maxPlateSize - 1));
    maxGeneratedPlateSize = Math.max(maxGeneratedPlateSize, plateSize);
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
           isMystery: (levelIndex === 4 || levelIndex === 5) ? true : Math.random() > 0.8,
         };
         holes[hid].screwId = screwId;
      }
    });
  }

  // 4. Determine which holes are needed
  const neededHoleIds = new Set<string>();
  
  // Add holes that are part of plates
  Object.values(plates).forEach(plate => {
    plate.holeIds.forEach(hid => neededHoleIds.add(hid));
  });

  // Add holes that have screws
  Object.values(screws).forEach(screw => {
    neededHoleIds.add(screw.holeId);
  });

  // 5. Add a few extra empty "strategy" holes
  const allHoleIds = Object.keys(holes);
  const remainingHoleIds = allHoleIds.filter(id => !neededHoleIds.has(id));
  
  // Solvability: At least as many empty holes as the largest plate's screws
  const stagingHoleCount = Math.max(maxGeneratedPlateSize, 5 - Math.floor(levelIndex / 15)); 
  for (let i = 0; i < stagingHoleCount && remainingHoleIds.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * remainingHoleIds.length);
    const selectedId = remainingHoleIds.splice(randomIndex, 1)[0];
    neededHoleIds.add(selectedId);
  }

  // 6. Filter holes record
  const filteredHoles: Record<string, Hole> = {};
  neededHoleIds.forEach(id => {
    filteredHoles[id] = holes[id];
  });

  return {
    levelIndex,
    timeLeft: Math.max(20, 100 - levelIndex * 3.5),
    isLevelComplete: false,
    isGameOver: false,
    isPaused: false,
    holes: filteredHoles,
    screws,
    plates,
    moves: 0,
    history: [],
  };
};
