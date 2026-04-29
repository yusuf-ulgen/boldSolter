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
  mechanic?: 'normal' | 'icy' | 'oily';
  durability?: number; // Buzlu vidalar için
}

export interface Hole {
  id: string;
  x: number;
  y: number;
  screwId?: string;
  plateId?: string;
  color?: Color; // Renkli delikler için
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
