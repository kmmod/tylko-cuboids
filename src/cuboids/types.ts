// Pros: Worker offloads heavy computation from the main thread
// Pros: Easy to replace worker implementation with WASM module
// Cons: Without transferrable objects, data has to be copied between threads

export type CuboidData = {
  groups: Map<number, number[]>;
  cuboidsArray: Uint16Array;
};

// Using discriminated unions to fake proper enums with data
export type WorkerResult =
  | { type: "cuboids"; data: CuboidData }
  | { type: "summary"; message: string }
  | { type: "finished" };

export type WasmWorkerMessage =
  | { type: "warmup" }
  | { type: "compute"; csv: string };

// Cuboid index types for better readability
export const CuboidIndex = {
  ID: 0,
  X1: 1,
  Y1: 2,
  Z1: 3,
  X2: 4,
  Y2: 5,
  Z2: 6,
};

export type CuboidIndex = (typeof CuboidIndex)[keyof typeof CuboidIndex];

// Labeled tuple elements
export type Cuboid = [
  id: number,
  x1: number,
  y1: number,
  z1: number,
  x2: number,
  y2: number,
  z2: number,
];
