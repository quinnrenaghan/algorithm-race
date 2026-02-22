import { motion } from 'framer-motion';
import { SortingChart } from './SortingChart';
import type { SortAlgorithm } from '../algorithms/sorting';
import type { SortStep } from '../algorithms/sorting';

interface SortingQuadrantProps {
  algorithm: SortAlgorithm;
  steps: SortStep[];
  stepIndex: number;
  initialArray: number[];
}

const SORT_LABELS: Record<SortAlgorithm, string> = {
  bubble: 'Bubble Sort',
  selection: 'Selection Sort',
  quick: 'Quick Sort',
  merge: 'Merge Sort',
};

export function SortingQuadrant({
  algorithm,
  steps,
  stepIndex,
  initialArray,
}: SortingQuadrantProps) {
  return (
    <motion.div
      className="quadrant"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="quadrant-title">{SORT_LABELS[algorithm]}</h3>
      <div className="quadrant-grid-wrapper">
        <SortingChart
          steps={steps}
          stepIndex={stepIndex}
          initialArray={initialArray}
        />
      </div>
    </motion.div>
  );
}
