export type Color = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';

export interface Point {
  x: number;
  y: number;
}

export interface Screw {
  id: string;
  color: Color | 'mystery';
  holeId: string;
  isMystery?: boolean;
}

export interface Hole {
  id: string;
  x: number;
  y: number;
  screwId?: string;
  plateId?: string;
}

export interface Plate {
  id: string;
  color: Color;
  holeIds: string[];
  zIndex: number;
  isRemoved: boolean;
  shapePoints: Point[];
}

export interface GameState {
  levelIndex: number;
  timeLeft: number;
  isLevelComplete: boolean;
  isGameOver: boolean;
  isPaused: boolean;
  holes: Record<string, Hole>;
  screws: Record<string, Screw>;
  plates: Record<string, Plate>;
  moves: number;
  history: string[];
  selectedScrewId?: string;
  insultMessage?: string;
}
