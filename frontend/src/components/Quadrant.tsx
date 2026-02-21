import { motion } from 'framer-motion';
import { Grid } from './Grid';
import type { GridConfig } from '../types';
import type { AlgorithmType } from '../types';
import type { PathfindingResult } from '../algorithms/pathfinding';

interface QuadrantProps {
  config: GridConfig;
  algorithm: AlgorithmType;
  result: PathfindingResult | null;
  exploredUpTo: number;
  pathUpTo: number;
}

const ALGORITHM_LABELS: Record<AlgorithmType, string> = {
  dijkstra: 'Dijkstra',
  astar: 'A*',
  bfs: 'BFS',
  dfs: 'DFS',
};

export function Quadrant({
  config,
  algorithm,
  result,
  exploredUpTo,
  pathUpTo,
}: QuadrantProps) {
  const exploredSet = new Set<string>();
  const pathSet = new Set<string>();

  if (result) {
    result.explored.slice(0, exploredUpTo).forEach(([r, c]) => exploredSet.add(`${r},${c}`));
    result.path.slice(0, pathUpTo).forEach(([r, c]) => pathSet.add(`${r},${c}`));
  }

  return (
    <motion.div
      className="quadrant"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="quadrant-title">{ALGORITHM_LABELS[algorithm]}</h3>
      <div className="quadrant-grid-wrapper">
        <Grid config={config} exploredSet={exploredSet} pathSet={pathSet} />
      </div>
    </motion.div>
  );
}
