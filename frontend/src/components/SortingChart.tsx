import { motion } from 'framer-motion';
import { Bar, type BarColor } from './Bar';
import type { SortStep } from '../algorithms/sorting';

interface SortingChartProps {
  steps: SortStep[];
  stepIndex: number;
  initialArray: number[];
}

export function SortingChart({ steps, stepIndex, initialArray }: SortingChartProps) {
  const step = stepIndex >= 0 && stepIndex < steps.length ? steps[stepIndex] : null;
  const arr = step?.array ?? initialArray;
  const maxVal = Math.max(...arr, 1);

  const sortedRanges: [number, number][] = [];
  const mergedRanges: [number, number][] = [];
  let partition: { left: [number, number]; right: [number, number] } | null = null;
  for (let i = 0; i <= stepIndex && i < steps.length; i++) {
    const s = steps[i];
    if (s.type === 'sorted') sortedRanges.push([s.start, s.end]);
    if (s.type === 'merged') mergedRanges.push([s.start, s.end]);
    if (s.type === 'partition') partition = { left: s.left, right: s.right };
  }

  const compareIndices =
    step?.type === 'compare' || step?.type === 'swap' ? [step.i, step.j] : [];

  const isInSortedRange = (idx: number) =>
    sortedRanges.some(([s, e]) => idx >= s && idx < e);
  const isInMergedRange = (idx: number) =>
    mergedRanges.some(([s, e]) => idx >= s && idx < e);
  const isInLeftPartition = (idx: number) =>
    partition && idx >= partition.left[0] && idx <= partition.left[1];
  const isInRightPartition = (idx: number) =>
    partition && idx >= partition.right[0] && idx <= partition.right[1];

  const getBarColor = (idx: number): BarColor => {
    if (isInSortedRange(idx)) return 'sorted';
    if (compareIndices.includes(idx)) return 'comparing';
    if (isInLeftPartition(idx)) return 'leftPartition';
    if (isInRightPartition(idx)) return 'rightPartition';
    if (isInMergedRange(idx)) return 'merged';
    return 'default';
  };

  return (
    <div className="sorting-chart">
      <motion.div
        className="bars-container"
        layout
        initial={false}
      >
        {arr.map((val, idx) => (
          <Bar
            key={idx}
            value={val}
            maxValue={maxVal}
            color={getBarColor(idx)}
          />
        ))}
      </motion.div>
    </div>
  );
}
