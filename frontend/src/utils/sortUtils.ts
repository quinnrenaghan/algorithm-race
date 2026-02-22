const ARRAY_SIZE = 30;
const MIN_VAL = 5;
const MAX_VAL = 100;

export function createRandomArray(): number[] {
  const arr: number[] = [];
  for (let i = 0; i < ARRAY_SIZE; i++) {
    arr.push(MIN_VAL + Math.floor(Math.random() * (MAX_VAL - MIN_VAL + 1)));
  }
  return arr;
}
