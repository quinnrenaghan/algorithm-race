export type SortStep =
  | { type: 'compare'; i: number; j: number; array: number[] }
  | { type: 'swap'; i: number; j: number; array: number[] }
  | { type: 'sorted'; start: number; end: number; array: number[] }
  | { type: 'update'; array: number[] }
  | { type: 'partition'; left: [number, number]; right: [number, number]; array: number[] }
  | { type: 'merged'; start: number; end: number; array: number[] };

export type SortAlgorithm = 'bubble' | 'selection' | 'quick' | 'merge';

function* bubbleSort(arr: number[]): Generator<SortStep> {
  const a = [...arr];
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      yield { type: 'compare', i: j, j: j + 1, array: [...a] };
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        yield { type: 'swap', i: j, j: j + 1, array: [...a] };
      }
    }
    yield { type: 'sorted', start: n - 1 - i, end: n, array: [...a] };
  }
  yield { type: 'sorted', start: 0, end: n, array: [...a] };
}

function* quickSortGen(
  a: number[],
  low: number,
  high: number
): Generator<SortStep> {
  if (low >= high) {
    if (low === high) yield { type: 'sorted', start: low, end: low + 1, array: [...a] };
    return;
  }
  const pivot = a[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    yield { type: 'compare', i: j, j: high, array: [...a] };
    if (a[j] <= pivot) {
      i++;
      if (i !== j) {
        [a[i], a[j]] = [a[j], a[i]];
        yield { type: 'swap', i, j, array: [...a] };
      }
    }
  }
  i++;
  if (i !== high) {
    [a[i], a[high]] = [a[high], a[i]];
    yield { type: 'swap', i, j: high, array: [...a] };
  }
  yield { type: 'sorted', start: i, end: i + 1, array: [...a] };
  yield* quickSortGen(a, low, i - 1);
  yield* quickSortGen(a, i + 1, high);
}

function* quickSort(arr: number[]): Generator<SortStep> {
  const a = [...arr];
  yield* quickSortGen(a, 0, a.length - 1);
  yield { type: 'sorted', start: 0, end: a.length, array: [...a] };
}

function* merge(
  arr: number[],
  aux: number[],
  lo: number,
  mid: number,
  hi: number,
  n: number
): Generator<SortStep> {
  yield { type: 'partition', left: [lo, mid], right: [mid + 1, hi], array: [...arr] };
  for (let k = lo; k <= hi; k++) aux[k] = arr[k];
  let i = lo;
  let j = mid + 1;
  for (let k = lo; k <= hi; k++) {
    if (i > mid) {
      arr[k] = aux[j++];
      yield { type: 'update', array: [...arr] };
    } else if (j > hi) {
      arr[k] = aux[i++];
      yield { type: 'update', array: [...arr] };
    } else {
      yield { type: 'compare', i, j, array: [...arr] };
      if (aux[i] <= aux[j]) {
        arr[k] = aux[i++];
      } else {
        arr[k] = aux[j++];
      }
      yield { type: 'update', array: [...arr] };
    }
  }
  if (lo === 0 && hi === n - 1) {
    yield { type: 'sorted', start: 0, end: n, array: [...arr] };
  } else {
    yield { type: 'merged', start: lo, end: hi + 1, array: [...arr] };
  }
}

function* mergeSortGen(
  arr: number[],
  aux: number[],
  lo: number,
  hi: number,
  n: number
): Generator<SortStep> {
  if (lo >= hi) {
    return;
  }
  const mid = Math.floor((lo + hi) / 2);
  yield* mergeSortGen(arr, aux, lo, mid, n);
  yield* mergeSortGen(arr, aux, mid + 1, hi, n);
  yield* merge(arr, aux, lo, mid, hi, n);
}

function* mergeSort(arr: number[]): Generator<SortStep> {
  const a = [...arr];
  const aux = [...a];
  const n = a.length;
  if (n <= 1) {
    yield { type: 'sorted', start: 0, end: n, array: [...a] };
    return;
  }
  yield* mergeSortGen(a, aux, 0, n - 1, n);
}

function* selectionSort(arr: number[]): Generator<SortStep> {
  const a = [...arr];
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      yield { type: 'compare', i: minIdx, j, array: [...a] };
      if (a[j] < a[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      yield { type: 'swap', i, j: minIdx, array: [...a] };
    }
    yield { type: 'sorted', start: i, end: i + 1, array: [...a] };
  }
  yield { type: 'sorted', start: n - 1, end: n, array: [...a] };
}

export const SORT_ALGORITHMS: Record<SortAlgorithm, (arr: number[]) => Generator<SortStep>> = {
  bubble: bubbleSort,
  selection: selectionSort,
  quick: quickSort,
  merge: mergeSort,
};

export function runSortAlgorithm(algo: SortAlgorithm, arr: number[]): SortStep[] {
  const gen = SORT_ALGORITHMS[algo](arr);
  const steps: SortStep[] = [];
  let next = gen.next();
  while (!next.done) {
    steps.push(next.value);
    next = gen.next();
  }
  return steps;
}
