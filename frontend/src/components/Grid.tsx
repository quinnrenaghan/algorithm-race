import { Cell } from './Cell';
import type { GridConfig } from '../types';

interface GridProps {
  config: GridConfig;
  exploredSet: Set<string>;
  pathSet: Set<string>;
}

export function Grid({ config, exploredSet, pathSet }: GridProps) {
  return (
    <div
      className="grid-container"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${config.cols}, 1fr)`,
        gridTemplateRows: `repeat(${config.rows}, 1fr)`,
        gap: 1,
        width: '100%',
        height: '100%',
      }}
    >
      {Array.from({ length: config.rows }, (_, row) =>
        Array.from({ length: config.cols }, (_, col) => (
          <Cell
            key={`${row}-${col}`}
            row={row}
            col={col}
            config={config}
            explored={exploredSet.has(`${row},${col}`)}
            isPath={pathSet.has(`${row},${col}`)}
          />
        ))
      )}
    </div>
  );
}
