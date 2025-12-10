// Using stack to avoid deep recursion
export type CuboidData = {
  groups: Map<number, number[]>;
  cuboidsArray: Uint16Array;
};

export const generateHashMapsB = (csv: string): CuboidData => {
  const offset = 7;
  const lines = csv.trim().split("\n");
  const count = lines.length;
  const cuboidsArray = new Uint16Array(count * offset);
  const groups = new Map<number, number[]>();
  const processedIds = new Set<number>();

  // Maps for all axes: index 1-3 are x1,y1,z1 and index 4-6 are x2,y2,z2
  const maps1 = [
    new Map<number, number[]>(), // x1
    new Map<number, number[]>(), // y1
    new Map<number, number[]>(), // z1
  ];
  const maps2 = [
    new Map<number, number[]>(), // x2
    new Map<number, number[]>(), // y2
    new Map<number, number[]>(), // z2
  ];

  for (let i = 0; i < count; i++) {
    const values = lines[i].trim().split(";").map(Number);
    values.forEach((value, j) => {
      cuboidsArray[i * offset + j] = value;
    });

    // Populate maps for all 3 axes
    for (let axis = 0; axis < 3; axis++) {
      const val1 = values[1 + axis];
      const val2 = values[4 + axis];

      if (!maps1[axis].has(val1)) maps1[axis].set(val1, []);
      maps1[axis].get(val1)!.push(i);

      if (!maps2[axis].has(val2)) maps2[axis].set(val2, []);
      maps2[axis].get(val2)!.push(i);
    }
  }

  // Check if two cuboids are face-adjacent
  const areFaceAdjacent = (idA: number, idB: number): boolean => {
    const a = idA * offset;
    const b = idB * offset;

    // X-face: x coordinates touch, y and z ranges overlap
    if (
      (cuboidsArray[a + 4] === cuboidsArray[b + 1] ||
        cuboidsArray[b + 4] === cuboidsArray[a + 1]) &&
      cuboidsArray[a + 5] > cuboidsArray[b + 2] &&
      cuboidsArray[b + 5] > cuboidsArray[a + 2] &&
      cuboidsArray[a + 6] > cuboidsArray[b + 3] &&
      cuboidsArray[b + 6] > cuboidsArray[a + 3]
    )
      return true;

    // Y-face: y coordinates touch, x and z ranges overlap
    if (
      (cuboidsArray[a + 5] === cuboidsArray[b + 2] ||
        cuboidsArray[b + 5] === cuboidsArray[a + 2]) &&
      cuboidsArray[a + 4] > cuboidsArray[b + 1] &&
      cuboidsArray[b + 4] > cuboidsArray[a + 1] &&
      cuboidsArray[a + 6] > cuboidsArray[b + 3] &&
      cuboidsArray[b + 6] > cuboidsArray[a + 3]
    )
      return true;

    // Z-face: z coordinates touch, x and y ranges overlap
    if (
      (cuboidsArray[a + 6] === cuboidsArray[b + 3] ||
        cuboidsArray[b + 6] === cuboidsArray[a + 3]) &&
      cuboidsArray[a + 4] > cuboidsArray[b + 1] &&
      cuboidsArray[b + 4] > cuboidsArray[a + 1] &&
      cuboidsArray[a + 5] > cuboidsArray[b + 2] &&
      cuboidsArray[b + 5] > cuboidsArray[a + 2]
    )
      return true;

    return false;
  };

  // Iterative function to find all connected cuboids along any axis
  const findConnected = (startId: number): number[] => {
    const visited = new Set<number>();
    const stack: number[] = [startId];

    while (stack.length > 0) {
      const cuboidId = stack.pop()!;

      if (visited.has(cuboidId)) continue;
      visited.add(cuboidId);

      // Check all 3 axes (0=X, 1=Y, 2=Z)
      for (let axis = 0; axis < 3; axis++) {
        const val1 = cuboidsArray[cuboidId * offset + 1 + axis];
        const val2 = cuboidsArray[cuboidId * offset + 4 + axis];

        // Find cuboids where their val2 equals this cuboid's val1
        const neighborsNeg = maps2[axis].get(val1);
        if (neighborsNeg) {
          for (const neighborId of neighborsNeg) {
            if (
              !visited.has(neighborId) &&
              areFaceAdjacent(cuboidId, neighborId)
            ) {
              stack.push(neighborId);
            }
          }
        }

        // Find cuboids where their val1 equals this cuboid's val2
        const neighborsPos = maps1[axis].get(val2);
        if (neighborsPos) {
          for (const neighborId of neighborsPos) {
            if (
              !visited.has(neighborId) &&
              areFaceAdjacent(cuboidId, neighborId)
            ) {
              stack.push(neighborId);
            }
          }
        }
      }
    }

    return Array.from(visited);
  };

  // Build groups of connected cuboids
  let groupId = 0;
  for (let i = 0; i < count; i++) {
    if (!processedIds.has(i)) {
      const connectedCuboids = findConnected(i);

      // Only create groups with more than 1 cuboid
      if (connectedCuboids.length > 1) {
        groups.set(groupId, connectedCuboids);
        groupId++;
      }

      // Mark all found cuboids as processed
      for (const id of connectedCuboids) {
        processedIds.add(id);
      }
    }
  }

  // console.log(groups);
  return { groups, cuboidsArray };
};
