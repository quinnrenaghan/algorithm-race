import { motion } from 'framer-motion';
import type { GridConfig } from '../types';

interface CellProps {
  row: number;
  col: number;
  config: GridConfig;
  explored: boolean;
  isPath: boolean;
}

function getBackgroundColor(
  row: number,
  col: number,
  config: GridConfig,
  explored: boolean,
  isPath: boolean
): string {
  if (isPath) return '#facc15'; // yellow
  if (explored) return '#a855f7'; // purple
  if (config.walls.has(`${row},${col}`)) return '#4b5563'; // gray wall
  if (row === config.start.row && col === config.start.col) return '#22c55e'; // bright green
  if (row === config.end.row && col === config.end.col) return '#ef4444'; // bright red
  return '#0f0f0f'; // black
}

export function Cell({ row, col, config, explored, isPath }: CellProps) {
  const bg = getBackgroundColor(row, col, config, explored, isPath);

  return (
    <motion.div
      className="cell"
      initial={{ scale: 0.8, opacity: 0.6 }}
      animate={{
        backgroundColor: bg,
        scale: 1,
        opacity: 1,
      }}
      transition={{
        backgroundColor: { duration: 0.2 },
        scale: { duration: 0.15 },
        opacity: { duration: 0.15 },
      }}
    />
  );
}
