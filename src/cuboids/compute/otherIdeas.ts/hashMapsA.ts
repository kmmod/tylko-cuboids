// using recursion - fails on bigger datasets due to call stack size

export const generateHashMapsA = (csv: string) => {
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
      const val1 = values[1 + axis]; // x1, y1, z1
      const val2 = values[4 + axis]; // x2, y2, z2

      if (!maps1[axis].has(val1)) maps1[axis].set(val1, []);
      maps1[axis].get(val1)!.push(i);

      if (!maps2[axis].has(val2)) maps2[axis].set(val2, []);
      maps2[axis].get(val2)!.push(i);
    }
  }

  // Recursive function to find all connected cuboids along any axis
  const findConnected = (cuboidId: number, visited: Set<number>): void => {
    if (visited.has(cuboidId)) return;
    visited.add(cuboidId);

    // Check all 3 axes (0=X, 1=Y, 2=Z)
    for (let axis = 0; axis < 3; axis++) {
      const val1 = cuboidsArray[cuboidId * offset + 1 + axis]; // x1, y1, z1
      const val2 = cuboidsArray[cuboidId * offset + 4 + axis]; // x2, y2, z2

      // Find cuboids where their val2 equals this cuboid's val1 (negative direction neighbors)
      const neighborsNeg = maps2[axis].get(val1) || [];
      for (const neighborId of neighborsNeg) {
        if (!visited.has(neighborId)) {
          findConnected(neighborId, visited);
        }
      }

      // Find cuboids where their val1 equals this cuboid's val2 (positive direction neighbors)
      const neighborsPos = maps1[axis].get(val2) || [];
      for (const neighborId of neighborsPos) {
        if (!visited.has(neighborId)) {
          findConnected(neighborId, visited);
        }
      }
    }
  };

  // Build groups of connected cuboids
  let groupId = 0;
  for (let i = 0; i < count; i++) {
    if (!processedIds.has(i)) {
      const visited = new Set<number>();
      findConnected(i, visited);

      const connectedCuboids = Array.from(visited);

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

  console.log(groups);
  return { cuboidsArray, groups, maps1, maps2 };
};
