const MIN_VAL = 5;
const MAX_VAL = 100;

export function createRandomArray(arraySize: number): number[] {
  const arr: number[] = [];
  for (let i = 0; i < arraySize; i++) {
    arr.push(MIN_VAL + Math.floor(Math.random() * (MAX_VAL - MIN_VAL + 1)));
  }
  return arr;
}
