import type { GridConfig } from '../types';

const GRID_SIZE = 20;
const WALL_PROBABILITY = 0.3;

function key(row: number, col: number): string {
  return `${row},${col}`;
}

export function createRandomGrid(): GridConfig {
  const walls = new Set<string>();

  // Add random walls
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (Math.random() < WALL_PROBABILITY) {
        walls.add(key(r, c));
      }
    }
  }

  // Pick start and end - ensure they're not walls and not the same
  let start = { row: 0, col: 0 };
  let end = { row: GRID_SIZE - 1, col: GRID_SIZE - 1 };

  // Find valid start (top-left area)
  const startCandidates: { row: number; col: number }[] = [];
  for (let r = 0; r < Math.ceil(GRID_SIZE / 2); r++) {
    for (let c = 0; c < Math.ceil(GRID_SIZE / 2); c++) {
      if (!walls.has(key(r, c))) {
        startCandidates.push({ row: r, col: c });
      }
    }
  }
  if (startCandidates.length > 0) {
    start = startCandidates[Math.floor(Math.random() * startCandidates.length)];
  }

  // Remove start from walls if it was added
  walls.delete(key(start.row, start.col));

  // Find valid end (bottom-right area)
  const endCandidates: { row: number; col: number }[] = [];
  for (let r = Math.floor(GRID_SIZE / 2); r < GRID_SIZE; r++) {
    for (let c = Math.floor(GRID_SIZE / 2); c < GRID_SIZE; c++) {
      const k = key(r, c);
      if (!walls.has(k) && !(r === start.row && c === start.col)) {
        endCandidates.push({ row: r, col: c });
      }
    }
  }
  if (endCandidates.length > 0) {
    end = endCandidates[Math.floor(Math.random() * endCandidates.length)];
  }

  walls.delete(key(end.row, end.col));

  return {
    rows: GRID_SIZE,
    cols: GRID_SIZE,
    start,
    end,
    walls,
  };
}
