export interface GridConfig {
  rows: number;
  cols: number;
  start: { row: number; col: number };
  end: { row: number; col: number };
  walls: Set<string>;
}

export type AlgorithmType = 'dijkstra' | 'astar' | 'bfs' | 'dfs';
