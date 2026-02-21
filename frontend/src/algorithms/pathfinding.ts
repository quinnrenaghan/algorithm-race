import type { GridConfig } from '../types';

type CellKey = string;

function key(row: number, col: number): CellKey {
  return `${row},${col}`;
}

function getNeighbors(row: number, col: number, config: GridConfig): [number, number][] {
  const dirs = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  const neighbors: [number, number][] = [];
  for (const [dr, dc] of dirs) {
    const nr = row + dr;
    const nc = col + dc;
    if (nr >= 0 && nr < config.rows && nc >= 0 && nc < config.cols && !config.walls.has(key(nr, nc))) {
      neighbors.push([nr, nc]);
    }
  }
  return neighbors;
}

function reconstructPath(
  cameFrom: Map<CellKey, [number, number]>,
  end: { row: number; col: number }
): [number, number][] {
  const path: [number, number][] = [];
  let current: [number, number] | undefined = [end.row, end.col];
  while (current) {
    path.unshift(current);
    current = cameFrom.get(key(current[0], current[1]));
  }
  return path;
}

export interface PathfindingResult {
  explored: [number, number][];
  path: [number, number][];
}

export function dijkstra(config: GridConfig): PathfindingResult {
  const explored: [number, number][] = [];
  const cameFrom = new Map<CellKey, [number, number]>();
  const dist = new Map<CellKey, number>();
  dist.set(key(config.start.row, config.start.col), 0);

  const pq: [number, number, number][] = [[0, config.start.row, config.start.col]];
  const visited = new Set<CellKey>();

  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, row, col] = pq.shift()!;
    const k = key(row, col);
    if (visited.has(k)) continue;
    visited.add(k);
    explored.push([row, col]);

    if (row === config.end.row && col === config.end.col) {
      return { explored, path: reconstructPath(cameFrom, config.end) };
    }

    for (const [nr, nc] of getNeighbors(row, col, config)) {
      const nk = key(nr, nc);
      if (visited.has(nk)) continue;
      const nd = d + 1;
      const old = dist.get(nk);
      if (old === undefined || nd < old) {
        dist.set(nk, nd);
        cameFrom.set(nk, [row, col]);
        pq.push([nd, nr, nc]);
      }
    }
  }

  return { explored, path: [] };
}

function heuristic(row: number, col: number, end: { row: number; col: number }): number {
  return Math.abs(row - end.row) + Math.abs(col - end.col);
}

export function astar(config: GridConfig): PathfindingResult {
  const explored: [number, number][] = [];
  const cameFrom = new Map<CellKey, [number, number]>();
  const gScore = new Map<CellKey, number>();
  gScore.set(key(config.start.row, config.start.col), 0);

  const startKey = key(config.start.row, config.start.col);
  const fStart = heuristic(config.start.row, config.start.col, config.end);
  const openSet: [number, number, number][] = [[fStart, config.start.row, config.start.col]];
  const inOpen = new Set<CellKey>([startKey]);
  const closed = new Set<CellKey>();

  while (openSet.length > 0) {
    openSet.sort((a, b) => a[0] - b[0]);
    const [, row, col] = openSet.shift()!;
    const k = key(row, col);
    inOpen.delete(k);
    if (closed.has(k)) continue;
    closed.add(k);
    explored.push([row, col]);

    if (row === config.end.row && col === config.end.col) {
      return { explored, path: reconstructPath(cameFrom, config.end) };
    }

    for (const [nr, nc] of getNeighbors(row, col, config)) {
      const nk = key(nr, nc);
      if (closed.has(nk)) continue;
      const g = (gScore.get(k) ?? Infinity) + 1;
      const oldG = gScore.get(nk);
      if (oldG === undefined || g < oldG) {
        cameFrom.set(nk, [row, col]);
        gScore.set(nk, g);
        const f = g + heuristic(nr, nc, config.end);
        if (!inOpen.has(nk)) {
          openSet.push([f, nr, nc]);
          inOpen.add(nk);
        }
      }
    }
  }

  return { explored, path: [] };
}

export function bfs(config: GridConfig): PathfindingResult {
  const explored: [number, number][] = [];
  const cameFrom = new Map<CellKey, [number, number]>();
  const queue: [number, number][] = [[config.start.row, config.start.col]];
  const visited = new Set<CellKey>();

  while (queue.length > 0) {
    const [row, col] = queue.shift()!;
    const k = key(row, col);
    if (visited.has(k)) continue;
    visited.add(k);
    explored.push([row, col]);

    if (row === config.end.row && col === config.end.col) {
      return { explored, path: reconstructPath(cameFrom, config.end) };
    }

    for (const [nr, nc] of getNeighbors(row, col, config)) {
      const nk = key(nr, nc);
      if (!visited.has(nk) && !cameFrom.has(nk)) {
        cameFrom.set(nk, [row, col]);
        queue.push([nr, nc]);
      }
    }
  }

  return { explored, path: [] };
}

export function dfs(config: GridConfig): PathfindingResult {
  const explored: [number, number][] = [];
  const cameFrom = new Map<CellKey, [number, number]>();
  const stack: [number, number][] = [[config.start.row, config.start.col]];
  const visited = new Set<CellKey>();

  while (stack.length > 0) {
    const [row, col] = stack.pop()!;
    const k = key(row, col);
    if (visited.has(k)) continue;
    visited.add(k);
    explored.push([row, col]);

    if (row === config.end.row && col === config.end.col) {
      return { explored, path: reconstructPath(cameFrom, config.end) };
    }

    for (const [nr, nc] of getNeighbors(row, col, config)) {
      const nk = key(nr, nc);
      if (!visited.has(nk) && !cameFrom.has(nk)) {
        cameFrom.set(nk, [row, col]);
        stack.push([nr, nc]);
      }
    }
  }

  return { explored, path: [] };
}
