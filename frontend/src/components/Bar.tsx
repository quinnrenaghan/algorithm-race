import { motion } from 'framer-motion';

export type BarColor = 'default' | 'comparing' | 'sorted' | 'leftPartition' | 'rightPartition' | 'merged';

interface BarProps {
  value: number;
  maxValue: number;
  color: BarColor;
}

const BAR_COLORS: Record<BarColor, string> = {
  default: '#0f0f0f',
  comparing: '#facc15',
  sorted: '#22c55e',
  leftPartition: '#ef4444',
  rightPartition: '#3b82f6',
  merged: '#a855f7',
};

export function Bar({ value, maxValue, color }: BarProps) {
  const heightPercent = (value / maxValue) * 100;
  const bgColor = BAR_COLORS[color];

  return (
    <motion.div
      className="bar"
      layout
      initial={false}
      animate={{
        height: `${heightPercent}%`,
        backgroundColor: bgColor,
      }}
      transition={{
        height: { duration: 0.2 },
        backgroundColor: { duration: 0.15 },
      }}
    />
  );
}
