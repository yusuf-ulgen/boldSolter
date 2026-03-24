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
}

export interface GameState {
  holes: Record<string, Hole>;
  screws: Record<string, Screw>;
  plates: Record<string, Plate>;
  selectedScrewId?: string;
  moves: number;
  insultMessage?: string;
  isTrollHintActive?: boolean;
  history: string[]; // Simplistic undo stack (JSON strings)
}
