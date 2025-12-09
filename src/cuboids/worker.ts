import { type Cuboid, type Box, CuboidIndex } from "./types";

self.onmessage = (e: MessageEvent<string>) => {
  const start = performance.now();

  const t0 = performance.now();
  const cuboids = parseCsv(e.data);
  console.log(`parseCsv: ${performance.now() - t0}ms`);

  const t1 = performance.now();
  const boundingBox = computeBoundingBox(cuboids);
  console.log(`boundingBox: ${performance.now() - t1}ms`);

  const t2 = performance.now();
  const spatialHash = buildSpatialHash(cuboids);
  console.log(`buildSpatialHash: ${performance.now() - t2}ms`);

  const t3 = performance.now();
  const groups = buildGroups(cuboids, spatialHash);
  console.log(`buildGroups: ${performance.now() - t3}ms`);

  const t4 = performance.now();
  const boxes = buildGroupedBoxes(cuboids, groups);
  console.log(`buildGroupedBoxes: ${performance.now() - t4}ms`);

  self.postMessage({ cuboids, boxes, boundingBox });
  const end = performance.now();
  console.log(
    `Processed ${cuboids.length} cuboids in ${(end - start).toFixed(2)} ms, found ${groups.length} groups.`,
  );

  self.postMessage({ cuboids, boxes, boundingBox });
};

const parseCsv = (csv: string): Cuboid[] => {
  return csv
    .trim()
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => {
      const parts = line.trim().split(";").map(Number);
      if (!isCuboid(parts)) {
        throw new Error(`Invalid cuboid: ${line}`);
      }
      return parts;
    });
};

const isCuboid = (arr: number[]): arr is Cuboid => {
  return (
    arr.length === 7 && arr.every((n) => typeof n === "number" && !isNaN(n))
  );
};

const computeBoundingBox = (cuboids: Cuboid[]): Box => {
  const { X1, Y1, Z1, X2, Y2, Z2 } = CuboidIndex;

  let minX = Infinity,
    minY = Infinity,
    minZ = Infinity;
  let maxX = -Infinity,
    maxY = -Infinity,
    maxZ = -Infinity;

  for (const c of cuboids) {
    if (c[X1] < minX) minX = c[X1];
    if (c[Y1] < minY) minY = c[Y1];
    if (c[Z1] < minZ) minZ = c[Z1];
    if (c[X2] > maxX) maxX = c[X2];
    if (c[Y2] > maxY) maxY = c[Y2];
    if (c[Z2] > maxZ) maxZ = c[Z2];
  }

  const width = maxX - minX;
  const height = maxY - minY;
  const depth = maxZ - minZ;

  return [
    -1,
    minX + width / 2,
    minY + height / 2,
    minZ + depth / 2,
    width,
    height,
    depth,
  ];
};

const buildGroupedBoxes = (cuboids: Cuboid[], groups: number[][]): Box[] => {
  const { X1, Y1, Z1, X2, Y2, Z2 } = CuboidIndex;

  // Count total boxes needed
  let totalCount = 0;
  for (const group of groups) {
    totalCount += group.length;
  }

  const boxes: Box[] = new Array(totalCount);
  let boxIndex = 0;

  for (let groupId = 0; groupId < groups.length; groupId++) {
    for (const cuboidIndex of groups[groupId]) {
      const c = cuboids[cuboidIndex];
      const width = c[X2] - c[X1];
      const height = c[Y2] - c[Y1];
      const depth = c[Z2] - c[Z1];

      boxes[boxIndex++] = [
        groupId,
        c[X1] + width / 2,
        c[Y1] + height / 2,
        c[Z1] + depth / 2,
        width,
        height,
        depth,
      ];
    }
  }

  return boxes;
};

const CELL_SIZE = 800;

const buildSpatialHash = (cuboids: Cuboid[]): Map<string, number[]> => {
  const { X1, Y1, Z1, X2, Y2, Z2 } = CuboidIndex;
  const hash = new Map<string, number[]>();

  for (let i = 0; i < cuboids.length; i++) {
    const c = cuboids[i];

    const minCX = Math.floor(c[X1] / CELL_SIZE);
    const minCY = Math.floor(c[Y1] / CELL_SIZE);
    const minCZ = Math.floor(c[Z1] / CELL_SIZE);
    const maxCX = Math.floor((c[X2] - 1) / CELL_SIZE);
    const maxCY = Math.floor((c[Y2] - 1) / CELL_SIZE);
    const maxCZ = Math.floor((c[Z2] - 1) / CELL_SIZE);

    for (let cx = minCX; cx <= maxCX; cx++) {
      for (let cy = minCY; cy <= maxCY; cy++) {
        for (let cz = minCZ; cz <= maxCZ; cz++) {
          const key = `${cx},${cy},${cz}`;
          if (!hash.has(key)) hash.set(key, []);
          hash.get(key)!.push(i);
        }
      }
    }
  }

  return hash;
};

class UnionFind {
  parent: Int32Array;
  rank: Int8Array;

  constructor(n: number) {
    this.parent = new Int32Array(n);
    this.rank = new Int8Array(n);
    for (let i = 0; i < n; i++) {
      this.parent[i] = i;
    }
  }

  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]);
    }
    return this.parent[x];
  }

  union(x: number, y: number): void {
    const px = this.find(x);
    const py = this.find(y);
    if (px === py) return;

    if (this.rank[px] < this.rank[py]) {
      this.parent[px] = py;
    } else if (this.rank[px] > this.rank[py]) {
      this.parent[py] = px;
    } else {
      this.parent[py] = px;
      this.rank[px]++;
    }
  }
}

const buildGroups = (
  cuboids: Cuboid[],
  spatialHash: Map<string, number[]>,
): number[][] => {
  const n = cuboids.length;
  const uf = new UnionFind(n);

  // Process each cell directly — no intermediate neighbor structure
  for (const indices of spatialHash.values()) {
    for (let i = 0; i < indices.length; i++) {
      for (let j = i + 1; j < indices.length; j++) {
        const a = indices[i];
        const b = indices[j];

        // Skip if already in same group (huge optimization!)
        if (uf.find(a) === uf.find(b)) continue;

        if (areFaceAdjacent(cuboids[a], cuboids[b])) {
          uf.union(a, b);
        }
      }
    }
  }

  const groupMap = new Map<number, number[]>();
  for (let i = 0; i < n; i++) {
    const root = uf.find(i);
    if (!groupMap.has(root)) groupMap.set(root, []);
    groupMap.get(root)!.push(i);
  }

  return Array.from(groupMap.values()).filter((group) => group.length >= 2);
};

const areFaceAdjacent = (a: Cuboid, b: Cuboid): boolean => {
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
