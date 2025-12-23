import { Dot } from '../types';

// The specific count requested by the user
const DOT_COUNT = 86;

// Deterministic Pseudo-Random Number Generator based on a seed
const mulberry32 = (a: number) => {
    return () => {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
}

const getPermutation = (n: number, seed: number) => {
  const indices = Array.from({ length: n }, (_, i) => i);
  let currentIndex = indices.length, randomIndex;
  
  const random = mulberry32(seed);

  while (currentIndex != 0) {
    randomIndex = Math.floor(random() * currentIndex);
    currentIndex--;
    [indices[currentIndex], indices[randomIndex]] = [
      indices[randomIndex], indices[currentIndex]];
  }
  return indices;
};

/**
 * Maps a character to a darkness value between 0.6 (60%) and 1.0 (100%).
 * Uses a hash function to ensure distinct visual contrast between similar characters.
 */
const getDarknessForToken = (char: string): number => {
  if (!char) return 0.6; 
  
  const code = char.charCodeAt(0);
  
  // High-contrast hashing:
  // Multiply by a prime (37) to scatter values, modulo 51 to get a 0-50 range.
  const hash = (code * 37) % 51; 
  
  // Normalize to 0.0 - 1.0
  const normalized = hash / 50; 
  
  // Shift to 0.6 - 1.0 range (60% to 100% black)
  return 0.6 + (normalized * 0.4);
};

const darknessToHex = (darkness: number): string => {
  // darkness 1.0 = black (0), darkness 0.0 = white (255)
  // Ensure we clamp between 0 and 1 just in case
  const d = Math.max(0, Math.min(1, darkness));
  const val = Math.round(255 * (1 - d));
  const hex = val.toString(16).padStart(2, '0');
  return `#${hex}${hex}${hex}`;
};

export const generateDots = (
  text: string, 
  dotRadius: number = 0.045, 
  radiusScale: number = 0.85,
  seed: number = 12345
): Dot[] => {
  const dots: Dot[] = [];
  const spatialMap = getPermutation(DOT_COUNT, seed);

  // Concentric Ring Layout for 86 dots
  // Ring 0: 1 (Center)
  // Ring 1: 6
  // Ring 2: 12
  // Ring 3: 18
  // Ring 4: 24
  // Ring 5: 25 (Outer boundary)
  const ringCounts = [1, 6, 12, 18, 24, 25];
  
  // Calculate step size to fit within radiusScale
  const step = radiusScale / 5;

  let globalIndex = 0;

  ringCounts.forEach((count, ringIndex) => {
    const r = ringIndex * step;

    for (let i = 0; i < count; i++) {
      let theta = 0;
      let x = 0;
      let y = 0;

      if (ringIndex > 0) {
         // Evenly distribute dots on the ring
         theta = (i / count) * 2 * Math.PI;
         theta -= Math.PI / 2; // Start from top

         // Rotate alternate rings slightly for better packing
         if (ringIndex % 2 !== 0) {
             theta += Math.PI / count;
         }
         
         x = r * Math.cos(theta);
         y = r * Math.sin(theta);
      } else {
        // Center dot
        x = 0;
        y = 0;
      }

      // Determine Value (Color)
      const mappedIndex = spatialMap[globalIndex];
      const char = text.length > 0 ? text[mappedIndex % text.length] : '';
      const darkness = text.length > 0 ? getDarknessForToken(char) : 0.6; // Default to 0.6 if empty

      dots.push({
        index: globalIndex,
        x,
        y,
        r: dotRadius,
        value: darkness,
        color: darknessToHex(darkness)
      });

      globalIndex++;
    }
  });

  return dots;
};