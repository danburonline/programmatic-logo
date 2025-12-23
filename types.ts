export interface Dot {
  x: number;
  y: number;
  r: number;
  value: number; // 0.0 to 1.0 (where 1.0 is black)
  color: string; // Hex code
  index: number;
}

export interface GeneratorConfig {
  text: string;
  dotSize: number;
  spread: number;
  padding: number;
  seed: number;
}
