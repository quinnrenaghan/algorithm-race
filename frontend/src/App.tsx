import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Quadrant } from './components/Quadrant';
import { createRandomGrid } from './utils/gridUtils';
import { dijkstra, astar, bfs, dfs } from './algorithms/pathfinding';
import type { GridConfig } from './types';
import type { AlgorithmType } from './types';
import type { PathfindingResult } from './algorithms/pathfinding';
import './App.css';

const ALGORITHMS: AlgorithmType[] = ['dijkstra', 'astar', 'bfs', 'dfs'];

const ALGORITHM_LABELS: Record<AlgorithmType, string> = {
  dijkstra: 'Dijkstra',
  astar: 'A*',
  bfs: 'BFS',
  dfs: 'DFS',
};

function getRaceWinners(results: Record<AlgorithmType, PathfindingResult | null>) {
  if (!results.dijkstra) return null;
  const fastest = ALGORITHMS.reduce((best, algo) => {
    const r = results[algo]!;
    if (r.path.length === 0) return best;
    const explored = r.explored.length;
    if (!best || explored < best.explored) return { algo, explored };
    return best;
  }, null as { algo: AlgorithmType; explored: number } | null);

  const minPathLen = Math.min(
    ...ALGORITHMS.map((a) => results[a]!.path.length).filter((n) => n > 0)
  );
  const shortestPath = ALGORITHMS.filter(
    (a) => results[a]!.path.length === minPathLen && minPathLen > 0
  );

  return { fastest, shortestPath, minPathLen };
}

export default function App() {
  const [config, setConfig] = useState<GridConfig>(() => createRandomGrid());
  const [results, setResults] = useState<Record<AlgorithmType, PathfindingResult | null>>({
    dijkstra: null,
    astar: null,
    bfs: null,
    dfs: null,
  });
  const [animationState, setAnimationState] = useState<{
    exploredUpTo: Record<AlgorithmType, number>;
    pathUpTo: Record<AlgorithmType, number>;
  }>({
    exploredUpTo: { dijkstra: 0, astar: 0, bfs: 0, dfs: 0 },
    pathUpTo: { dijkstra: 0, astar: 0, bfs: 0, dfs: 0 },
  });
  const [isRunning, setIsRunning] = useState(false);
  const [raceComplete, setRaceComplete] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const winners = getRaceWinners(results);

  const runAlgorithms = useCallback(() => {
    const newResults: Record<AlgorithmType, PathfindingResult> = {
      dijkstra: dijkstra(config),
      astar: astar(config),
      bfs: bfs(config),
      dfs: dfs(config),
    };
    setResults(newResults);
    setRaceComplete(false);
    setAnimationState({
      exploredUpTo: { dijkstra: 0, astar: 0, bfs: 0, dfs: 0 },
      pathUpTo: { dijkstra: 0, astar: 0, bfs: 0, dfs: 0 },
    });
    setIsRunning(true);
  }, [config]);

  const newRace = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setConfig(createRandomGrid());
    setResults({ dijkstra: null, astar: null, bfs: null, dfs: null });
    setAnimationState({
      exploredUpTo: { dijkstra: 0, astar: 0, bfs: 0, dfs: 0 },
      pathUpTo: { dijkstra: 0, astar: 0, bfs: 0, dfs: 0 },
    });
    setIsRunning(false);
  }, []);

  useEffect(() => {
    if (!isRunning || !results.dijkstra) return;

    intervalRef.current = window.setInterval(() => {
      setAnimationState((prev) => {
        const nextExplored = { ...prev.exploredUpTo };
        const nextPath = { ...prev.pathUpTo };
        for (const algo of ALGORITHMS) {
          const res = results[algo]!;
          if (prev.exploredUpTo[algo] < res.explored.length) {
            nextExplored[algo] = Math.min(prev.exploredUpTo[algo] + 1, res.explored.length);
          } else if (prev.pathUpTo[algo] < res.path.length) {
            nextPath[algo] = Math.min(prev.pathUpTo[algo] + 1, res.path.length);
          }
        }
        return { exploredUpTo: nextExplored, pathUpTo: nextPath };
      });
    }, 25);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, results]);

  useEffect(() => {
    if (!results.dijkstra) return;
    const allDone = ALGORITHMS.every((algo) => {
      const r = results[algo]!;
      return (
        animationState.exploredUpTo[algo] >= r.explored.length &&
        animationState.pathUpTo[algo] >= r.path.length
      );
    });
    if (allDone) {
      setIsRunning(false);
      setRaceComplete(true);
    }
  }, [results, animationState]);

  return (
    <div className="app">
      <motion.header
        className="header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1>Algorithm Race</h1>
        <div className="controls">
          <motion.button
            className="btn btn-start"
            onClick={runAlgorithms}
            disabled={isRunning}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Start
          </motion.button>
          <motion.button
            className="btn btn-new"
            onClick={newRace}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            New Race
          </motion.button>
        </div>
      </motion.header>

      {raceComplete && winners && (
        <motion.div
          className="race-results"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {winners.fastest && (
            <p className="result-line">
              <span className="result-label">Fastest:</span>{' '}
              {ALGORITHM_LABELS[winners.fastest.algo]} (explored {winners.fastest.explored} cells)
            </p>
          )}
          {winners.shortestPath.length > 0 && (
            <p className="result-line">
              <span className="result-label">Shortest path:</span>{' '}
              {winners.shortestPath.map((a) => ALGORITHM_LABELS[a]).join(', ')} (
              {winners.minPathLen} steps)
            </p>
          )}
        </motion.div>
      )}

      <div className="quadrants">
        <div className="quadrants-inner">
          {ALGORITHMS.map((algo) => (
            <Quadrant
            key={algo}
            config={config}
            algorithm={algo}
            result={results[algo]}
            exploredUpTo={animationState.exploredUpTo[algo]}
            pathUpTo={animationState.pathUpTo[algo]}
          />
        ))}
        </div>
      </div>
    </div>
  );
}
