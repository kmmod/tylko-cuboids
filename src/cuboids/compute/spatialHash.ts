import { CuboidIndex, type Cuboid } from "../types";

const CELL_SIZE = 800;

export const buildSpatialHash = (cuboids: Cuboid[]): Map<string, number[]> => {
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
