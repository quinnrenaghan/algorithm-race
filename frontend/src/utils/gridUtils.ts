import type { GridConfig } from '../types';

function key(row: number, col: number): string {
  return `${row},${col}`;
}

export function createRandomGrid(
  gridSize: number,
  wallProbability: number
): GridConfig {
  const walls = new Set<string>();

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (Math.random() < wallProbability) {
        walls.add(key(r, c));
      }
    }
  }

  let start = { row: 0, col: 0 };
  let end = { row: gridSize - 1, col: gridSize - 1 };

  const startCandidates: { row: number; col: number }[] = [];
  for (let r = 0; r < Math.ceil(gridSize / 2); r++) {
    for (let c = 0; c < Math.ceil(gridSize / 2); c++) {
      if (!walls.has(key(r, c))) {
        startCandidates.push({ row: r, col: c });
      }
    }
  }
  if (startCandidates.length > 0) {
    start = startCandidates[Math.floor(Math.random() * startCandidates.length)];
  }

  walls.delete(key(start.row, start.col));

  const endCandidates: { row: number; col: number }[] = [];
  for (let r = Math.floor(gridSize / 2); r < gridSize; r++) {
    for (let c = Math.floor(gridSize / 2); c < gridSize; c++) {
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
    rows: gridSize,
    cols: gridSize,
    start,
    end,
    walls,
  };
}
