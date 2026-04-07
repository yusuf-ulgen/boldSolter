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

