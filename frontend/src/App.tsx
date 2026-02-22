import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Quadrant } from './components/Quadrant';
import { SortingQuadrant } from './components/SortingQuadrant';
import { createRandomGrid } from './utils/gridUtils';
import { createRandomArray } from './utils/sortUtils';
import { dijkstra, astar, bfs, dfs } from './algorithms/pathfinding';
import { runSortAlgorithm, type SortAlgorithm, type SortStep } from './algorithms/sorting';
import type { GridConfig } from './types';
import type { AlgorithmType } from './types';
import type { PathfindingResult } from './algorithms/pathfinding';
import './App.css';

type RaceMode = 'pathfinding' | 'sorting';

const PATHFINDING_ALGORITHMS: AlgorithmType[] = ['dijkstra', 'astar', 'bfs', 'dfs'];
const SORT_ALGORITHMS: SortAlgorithm[] = ['bubble', 'selection', 'quick', 'merge'];

const PATHFINDING_LABELS: Record<AlgorithmType, string> = {
  dijkstra: 'Dijkstra',
  astar: 'A*',
  bfs: 'BFS',
  dfs: 'DFS',
};

const SORT_LABELS: Record<SortAlgorithm, string> = {
  bubble: 'Bubble Sort',
  selection: 'Selection Sort',
  quick: 'Quick Sort',
  merge: 'Merge Sort',
};

function getPathfindingWinners(results: Record<AlgorithmType, PathfindingResult | null>) {
  if (!results.dijkstra) return null;
  const fastest = PATHFINDING_ALGORITHMS.reduce((best, algo) => {
    const r = results[algo]!;
    if (r.path.length === 0) return best;
    const explored = r.explored.length;
    if (!best || explored < best.explored) return { algo, explored };
    return best;
  }, null as { algo: AlgorithmType; explored: number } | null);

  const minPathLen = Math.min(
    ...PATHFINDING_ALGORITHMS.map((a) => results[a]!.path.length).filter((n) => n > 0)
  );
  const shortestPath = PATHFINDING_ALGORITHMS.filter(
    (a) => results[a]!.path.length === minPathLen && minPathLen > 0
  );

  return { fastest, shortestPath, minPathLen };
}

export default function App() {
  const [mode, setMode] = useState<RaceMode>('pathfinding');

  // User inputs
  const [gridSize, setGridSize] = useState(15);
  const [wallPercentage, setWallPercentage] = useState(0.2);
  const [arraySize, setArraySize] = useState(30);

  // Pathfinding state
  const [config, setConfig] = useState<GridConfig>(() =>
    createRandomGrid(15, 0.2)
  );
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

  // Sorting state
  const [sortArray, setSortArray] = useState<number[]>(() =>
    createRandomArray(30)
  );
  const [sortSteps, setSortSteps] = useState<Record<SortAlgorithm, SortStep[]>>({
    bubble: [],
    selection: [],
    quick: [],
    merge: [],
  });
  const [sortStepIndex, setSortStepIndex] = useState<Record<SortAlgorithm, number>>({
    bubble: 0,
    selection: 0,
    quick: 0,
    merge: 0,
  });
  const [sortFinishTimes, setSortFinishTimes] = useState<Record<SortAlgorithm, number | null>>({
    bubble: null,
    selection: null,
    quick: null,
    merge: null,
  });

  const [isRunning, setIsRunning] = useState(false);
  const [raceComplete, setRaceComplete] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const sortStartTimeRef = useRef<number>(0);

  const pathfindingWinners = getPathfindingWinners(results);

  // Regenerate when pathfinding inputs change
  useEffect(() => {
    if (mode === 'pathfinding' && !isRunning) {
      setConfig(createRandomGrid(gridSize, wallPercentage));
      setResults({ dijkstra: null, astar: null, bfs: null, dfs: null });
    }
  }, [mode, gridSize, wallPercentage]);

  // Regenerate when sorting input changes
  useEffect(() => {
    if (mode === 'sorting' && !isRunning) {
      setSortArray(createRandomArray(arraySize));
      setSortSteps({ bubble: [], selection: [], quick: [], merge: [] });
      setSortStepIndex({ bubble: 0, selection: 0, quick: 0, merge: 0 });
      setSortFinishTimes({ bubble: null, selection: null, quick: null, merge: null });
    }
  }, [mode, arraySize]);

  const runPathfinding = useCallback(() => {
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

  const runSorting = useCallback(() => {
    const arr = [...sortArray];
    const steps: Record<SortAlgorithm, SortStep[]> = {
      bubble: runSortAlgorithm('bubble', arr),
      selection: runSortAlgorithm('selection', arr),
      quick: runSortAlgorithm('quick', arr),
      merge: runSortAlgorithm('merge', arr),
    };
    setSortSteps(steps);
    setSortStepIndex({ bubble: 0, selection: 0, quick: 0, merge: 0 });
    setSortFinishTimes({ bubble: null, selection: null, quick: null, merge: null });
    setRaceComplete(false);
    sortStartTimeRef.current = performance.now();
    setIsRunning(true);
  }, [sortArray]);

  const newRace = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (mode === 'pathfinding') {
      setConfig(createRandomGrid(gridSize, wallPercentage));
      setResults({ dijkstra: null, astar: null, bfs: null, dfs: null });
      setAnimationState({
        exploredUpTo: { dijkstra: 0, astar: 0, bfs: 0, dfs: 0 },
        pathUpTo: { dijkstra: 0, astar: 0, bfs: 0, dfs: 0 },
      });
    } else {
      setSortArray(createRandomArray(arraySize));
      setSortSteps({ bubble: [], selection: [], quick: [], merge: [] });
      setSortStepIndex({ bubble: 0, selection: 0, quick: 0, merge: 0 });
      setSortFinishTimes({ bubble: null, selection: null, quick: null, merge: null });
    }
    setIsRunning(false);
    setRaceComplete(false);
  }, [mode, gridSize, wallPercentage, arraySize]);

  // Pathfinding animation
  useEffect(() => {
    if (mode !== 'pathfinding' || !isRunning || !results.dijkstra) return;

    intervalRef.current = window.setInterval(() => {
      setAnimationState((prev) => {
        const nextExplored = { ...prev.exploredUpTo };
        const nextPath = { ...prev.pathUpTo };
        for (const algo of PATHFINDING_ALGORITHMS) {
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
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [mode, isRunning, results]);

  // Pathfinding completion check
  useEffect(() => {
    if (mode !== 'pathfinding' || !results.dijkstra) return;
    const allDone = PATHFINDING_ALGORITHMS.every((algo) => {
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
  }, [mode, results, animationState]);

  // Sorting animation
  useEffect(() => {
    if (mode !== 'sorting' || !isRunning) return;

    intervalRef.current = window.setInterval(() => {
      const now = performance.now();
      setSortStepIndex((prev) => {
        const next = { ...prev };
        for (const algo of SORT_ALGORITHMS) {
          const steps = sortSteps[algo];
          const maxIdx = steps.length - 1;
          if (prev[algo] < maxIdx) {
            const newIdx = Math.min(prev[algo] + 1, maxIdx);
            next[algo] = newIdx;
            if (newIdx === maxIdx && maxIdx >= 0) {
              setSortFinishTimes((ft) => {
                if (ft[algo] === null) {
                  return { ...ft, [algo]: now - sortStartTimeRef.current };
                }
                return ft;
              });
            }
          }
        }
        return next;
      });
    }, 15);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [mode, isRunning, sortSteps]);

  // Sorting completion check
  useEffect(() => {
    if (mode !== 'sorting') return;
    const allDone = SORT_ALGORITHMS.every((algo) => {
      const steps = sortSteps[algo];
      return steps.length > 0 && sortStepIndex[algo] >= steps.length - 1;
    });
    if (allDone) {
      setIsRunning(false);
      setRaceComplete(true);
    }
  }, [mode, sortSteps, sortStepIndex]);

  const getSortedRankings = (): [SortAlgorithm, number][] => {
    const entries = Object.entries(sortFinishTimes) as [SortAlgorithm, number | null][];
    return entries
      .filter((entry): entry is [SortAlgorithm, number] => entry[1] !== null)
      .sort((a, b) => a[1] - b[1]);
  };

  const sortRankings = getSortedRankings();

  return (
    <div className="app">
      <motion.header
        className="header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1>Algorithm Race</h1>

        {mode === 'pathfinding' && (
          <div className="inputs">
            <label>
              Grid size
              <input
                type="number"
                min={5}
                max={25}
                value={gridSize}
                onChange={(e) =>
                  setGridSize(Math.min(25, Math.max(5, Number(e.target.value) || 5)))
                }
                disabled={isRunning}
              />
            </label>
            <label>
              Wall %
              <input
                type="number"
                min={0}
                max={0.5}
                step={0.05}
                value={wallPercentage}
                onChange={(e) =>
                  setWallPercentage(
                    Math.min(0.5, Math.max(0, Number(e.target.value) || 0))
                  )
                }
                disabled={isRunning}
              />
            </label>
          </div>
        )}

        {mode === 'sorting' && (
          <div className="inputs">
            <label>
              Array size
              <input
                type="number"
                min={10}
                max={100}
                value={arraySize}
                onChange={(e) =>
                  setArraySize(
                    Math.min(100, Math.max(10, Number(e.target.value) || 10))
                  )
                }
                disabled={isRunning}
              />
            </label>
          </div>
        )}

        <div className="controls">
          <motion.button
            className="btn btn-start"
            onClick={mode === 'pathfinding' ? runPathfinding : runSorting}
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
          <motion.button
            className="btn btn-mode"
            onClick={() => setMode((m) => (m === 'pathfinding' ? 'sorting' : 'pathfinding'))}
            disabled={isRunning}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {mode === 'pathfinding' ? 'Sorting Race' : 'Pathfinding Race'}
          </motion.button>
        </div>
      </motion.header>

      {raceComplete && mode === 'pathfinding' && pathfindingWinners && (
        <motion.div
          className="race-results"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {pathfindingWinners.fastest && (
            <p className="result-line">
              <span className="result-label">Fastest:</span>{' '}
              {PATHFINDING_LABELS[pathfindingWinners.fastest.algo]} (explored{' '}
              {pathfindingWinners.fastest.explored} cells)
            </p>
          )}
          {pathfindingWinners.shortestPath.length > 0 && (
            <p className="result-line">
              <span className="result-label">Shortest path:</span>{' '}
              {pathfindingWinners.shortestPath.map((a) => PATHFINDING_LABELS[a]).join(', ')} (
              {pathfindingWinners.minPathLen} steps)
            </p>
          )}
        </motion.div>
      )}

      {raceComplete && mode === 'sorting' && sortRankings.length > 0 && (
        <motion.div
          className="race-results"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {sortRankings.map(([algo, time], i) => (
            <p key={algo} className="result-line">
              {i + 1}. {SORT_LABELS[algo]} ({(time / 1000).toFixed(2)}s)
            </p>
          ))}
        </motion.div>
      )}

      {mode === 'pathfinding' && (
        <div className="quadrants">
          <div className="quadrants-inner">
            {PATHFINDING_ALGORITHMS.map((algo) => (
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
      )}

      {mode === 'sorting' && (
        <div className="quadrants">
          <div className="quadrants-inner">
            {SORT_ALGORITHMS.map((algo) => (
              <SortingQuadrant
                key={algo}
                algorithm={algo}
                steps={sortSteps[algo]}
                stepIndex={sortStepIndex[algo]}
                initialArray={sortArray}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
