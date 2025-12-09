import { type Cuboid, type Box, CuboidIndex } from "../types";
import { UnionFind } from "./unionFind";

export const buildGroupsStreaming = (
  cuboids: Cuboid[],
  spatialHash: Map<string, number[]>,
  onGroup: (boxes: Box[]) => void,
): void => {
  const { X1, Y1, Z1, X2, Y2, Z2 } = CuboidIndex;
  const n = cuboids.length;
  const uf = new UnionFind(n);

  const t0 = performance.now();
  // Build unions
  // This is most consuming part and it looks like its difficult to parallelize it further.
  // The spatial hashing helps to reduce the number of comparisons significantly, but overall
  // we need to compare all cuboids to make sure we find all adjacent ones.
  for (const indices of spatialHash.values()) {
    for (let i = 0; i < indices.length; i++) {
      for (let j = i + 1; j < indices.length; j++) {
        const a = indices[i];
        const b = indices[j];
        if (areFaceAdjacentC(cuboids[a], cuboids[b])) {
          uf.union(a, b);
        }
      }
    }
  }
  console.log(`buildUnions: ${performance.now() - t0}ms`);

  // Collect groups
  const groupMap = new Map<number, number[]>();
  for (let i = 0; i < n; i++) {
    const root = uf.find(i);
    if (!groupMap.has(root)) groupMap.set(root, []);
    groupMap.get(root)!.push(i);
  }

  // Stream each group
  let groupId = 0;
  for (const indices of groupMap.values()) {
    if (indices.length < 2) continue;

    const t0 = performance.now();
    // Build boxes for this group
    const boxes: Box[] = new Array(indices.length);
    for (let i = 0; i < indices.length; i++) {
      const c = cuboids[indices[i]];
      const width = c[X2] - c[X1];
      const height = c[Y2] - c[Y1];
      const depth = c[Z2] - c[Z1];
      boxes[i] = [
        groupId,
        c[X1] + width / 2,
        c[Y1] + height / 2,
        c[Z1] + depth / 2,
        width,
        height,
        depth,
      ];
    }

    onGroup(boxes);
    groupId++;
    console.log(`buildGroup ${groupId}: ${performance.now() - t0}ms`);
  }
};

// @ts-ignore
const areFaceAdjacentA = (a: Cuboid, b: Cuboid): boolean => {
  const { X1, Y1, Z1, X2, Y2, Z2 } = CuboidIndex;

  if (a[X2] === b[X1] || b[X2] === a[X1]) {
    const yOverlap = Math.min(a[Y2], b[Y2]) - Math.max(a[Y1], b[Y1]);
    const zOverlap = Math.min(a[Z2], b[Z2]) - Math.max(a[Z1], b[Z1]);
    if (yOverlap > 0 && zOverlap > 0) return true;
  }

  if (a[Y2] === b[Y1] || b[Y2] === a[Y1]) {
    const xOverlap = Math.min(a[X2], b[X2]) - Math.max(a[X1], b[X1]);
    const zOverlap = Math.min(a[Z2], b[Z2]) - Math.max(a[Z1], b[Z1]);
    if (xOverlap > 0 && zOverlap > 0) return true;
  }

  if (a[Z2] === b[Z1] || b[Z2] === a[Z1]) {
    const xOverlap = Math.min(a[X2], b[X2]) - Math.max(a[X1], b[X1]);
    const yOverlap = Math.min(a[Y2], b[Y2]) - Math.max(a[Y1], b[Y1]);
    if (xOverlap > 0 && yOverlap > 0) return true;
  }

  return false;
};

// @ts-ignore
const areFaceAdjacentB = (a: Cuboid, b: Cuboid): boolean => {
  // Inline indices (avoid object destructuring in hot path)
  const ax1 = a[1],
    ay1 = a[2],
    az1 = a[3];
  const ax2 = a[4],
    ay2 = a[5],
    az2 = a[6];
  const bx1 = b[1],
    by1 = b[2],
    bz1 = b[3];
  const bx2 = b[4],
    by2 = b[5],
    bz2 = b[6];

  // X-face adjacency
  if (ax2 === bx1 || bx2 === ax1) {
    if (ay2 > by1 && by2 > ay1 && az2 > bz1 && bz2 > az1) return true;
  }

  // Y-face adjacency
  if (ay2 === by1 || by2 === ay1) {
    if (ax2 > bx1 && bx2 > ax1 && az2 > bz1 && bz2 > az1) return true;
  }

  // Z-face adjacency
  if (az2 === bz1 || bz2 === az1) {
    if (ax2 > bx1 && bx2 > ax1 && ay2 > by1 && by2 > ay1) return true;
  }

  return false;
};

// Fully inlined, no variables
// @ts-ignore
const areFaceAdjacentC = (a: Cuboid, b: Cuboid): boolean => {
  // X-face
  if (
    (a[4] === b[1] || b[4] === a[1]) &&
    a[5] > b[2] &&
    b[5] > a[2] &&
    a[6] > b[3] &&
    b[6] > a[3]
  )
    return true;
  // Y-face
  if (
    (a[5] === b[2] || b[5] === a[2]) &&
    a[4] > b[1] &&
    b[4] > a[1] &&
    a[6] > b[3] &&
    b[6] > a[3]
  )
    return true;
  // Z-face
  if (
    (a[6] === b[3] || b[6] === a[3]) &&
    a[4] > b[1] &&
    b[4] > a[1] &&
    a[5] > b[2] &&
    b[5] > a[2]
  )
    return true;
  return false;
};
