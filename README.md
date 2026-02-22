# Algorithm Race

A visualization app that races pathfinding and sorting algorithms side by side.

Live: https://quinnrenaghan.github.io/algorithm-race/

---

## Screenshots

**Pathfinding race (completed)**

<!-- Add screenshot: pathfinding-race.png -->

**Sorting race (completed)**

<!-- Add screenshot: sorting-race.png -->

---

## Tech Stack

- React 19, TypeScript
- Vite
- Framer Motion (animations)

---

## Pathfinding Race

Four algorithms find a path from start (green) to end (red) on a 15x15 grid with random walls. Explored cells turn purple; the final path is yellow.

| Algorithm | Time | Space | Notes |
|-----------|------|-------|-------|
| Dijkstra | O((V+E) log V) | O(V) | Explores by distance; always finds shortest path |
| A* | O((V+E) log V) | O(V) | Uses heuristic; typically explores fewer cells |
| BFS | O(V+E) | O(V) | Explores in layers; shortest path on unweighted grid |
| DFS | O(V+E) | O(V) | Explores depth-first; path may not be shortest |

Implementation: `frontend/src/algorithms/pathfinding.ts`

---

## Sorting Race

Four algorithms sort an array of 30 random integers. Bars turn yellow when compared, green when sorted. Merge sort uses red/blue for partitions and purple for merged sub-arrays.

| Algorithm | Time (avg) | Time (worst) | Space | Notes |
|-----------|------------|--------------|-------|-------|
| Bubble Sort | O(n²) | O(n²) | O(1) | Compares adjacent pairs |
| Selection Sort | O(n²) | O(n²) | O(1) | Picks minimum of unsorted portion |
| Quick Sort | O(n log n) | O(n²) | O(log n) | Partition around pivot |
| Merge Sort | O(n log n) | O(n log n) | O(n) | Divide and merge |

Implementation: `frontend/src/algorithms/sorting.ts`

---

## Run Locally

```bash
cd frontend
npm install
npm run dev
```
