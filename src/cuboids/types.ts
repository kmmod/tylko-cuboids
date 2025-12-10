// Pros: Worker offloads heavy computation from the main thread
// Pros: Easy to replace worker implementation with WASM module
// Cons: Without transferrable objects, data has to be copied between threads

import type { CuboidData } from "./compute/otherIdeas.ts/hashMapsB";

// Using discriminated unions to fake proper enums with data
export type WorkerResult =
  | { type: "boundingBox"; boundingBox: Box }
  | { type: "boxes"; boxes: Box[] }
  | { type: "cuboids"; data: CuboidData }
  | { type: "summary"; message: string }
  | { type: "finished" };

export type WasmWorkerMessage =
  | { type: "warmup" }
  | { type: "compute"; csv: string };

export interface ConvertCuboidsResult {
  boxes: Box[];
  boundingBox: Box;
}

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

export const BoxIndex = {
  GROUP_ID: 0,
  X: 1,
  Y: 2,
  Z: 3,
  WIDTH: 4,
  HEIGHT: 5,
  DEPTH: 6,
};

export type BoxIndex = (typeof BoxIndex)[keyof typeof BoxIndex];

export type Box = [
  groupId: number,
  x: number,
  y: number,
  z: number,
  width: number,
  height: number,
  depth: number,
];
