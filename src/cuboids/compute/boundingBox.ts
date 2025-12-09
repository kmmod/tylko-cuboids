import { type Cuboid, type Box, CuboidIndex } from "../types";

const BOUNDING_BOX_GROUP_ID = -1;

export const computeBoundingBox = (cuboids: Cuboid[]): Box => {
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
    BOUNDING_BOX_GROUP_ID,
    minX + width / 2,
    minY + height / 2,
    minZ + depth / 2,
    width,
    height,
    depth,
  ];
};
