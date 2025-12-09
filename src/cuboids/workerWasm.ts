import type { WasmWorkerMessage } from "./types";

let wasm: typeof import("../lib/wasm-compute/wasm_cuboids") | null = null;

const warmupWasm = async () => {
  if (!wasm) {
    const t0 = performance.now();
    wasm = await import("../lib/wasm-compute/wasm_cuboids");
    await wasm.default();
    console.log(`initWasm (warmup): ${performance.now() - t0}ms`);
  }
};

self.onmessage = async (e: MessageEvent<WasmWorkerMessage>) => {
  const type = e.data.type;
  switch (type) {
    case "warmup":
      await warmupWasm();
      return;
    case "compute":
      compute(e.data.csv);
      break;
  }
};

const compute = async (csv: string) => {
  // Functions in this method are called in the same way as in the non-wasm worker, so that performance can be compared.
  // This is redundant, and doing this in a single pass would be more readable and efficient,

  if (!wasm) {
    await warmupWasm();
  }

  const start = performance.now();

  // Wasm is ready, asserted by the warmup
  const processor = new wasm!.CuboidProcessor();

  const t0 = performance.now();
  processor.parse_csv(csv);
  console.log(`parseCsv (wasm): ${performance.now() - t0}ms`);

  const t1 = performance.now();
  const boundingBox = processor.compute_bounding_box();
  self.postMessage({ type: "boundingBox", boundingBox });
  console.log(`boundingBox (wasm): ${performance.now() - t1}ms`);

  const t2 = performance.now();
  processor.build_spatial_hash();
  console.log(`buildSpatialHash (wasm): ${performance.now() - t2}ms`);

  const t3 = performance.now();
  const boxesResult = processor.build_groups();
  const data = boxesResult.data; // Float64Array
  const offsets = boxesResult.offsets; // Uint32Array

  // Iterate groups:
  for (let i = 0; i < offsets.length - 1; i++) {
    const start = offsets[i] * 7;
    const boxCount = offsets[i + 1] - offsets[i];

    const boxes = Array.from({ length: boxCount }, (_, j) =>
      data.subarray(start + j * 7, start + j * 7 + 7),
    );

    self.postMessage({ type: "boxes", boxes });
  }
  // self.postMessage({ type: "boxes", boxes });
  console.log(`buildAllGroups (wasm): ${performance.now() - t3}ms`);

  const end = performance.now();
  console.log(
    `Processed ${processor.get_cuboid_count()} cuboids in ${(end - start).toFixed(2)} ms, found ${offsets.length - 1} groups.`,
  );

  const message = `Processed ${processor.get_cuboid_count()} cuboids. Time ${(end - start).toFixed(2)} ms. Found ${offsets.length - 1} groups.`;
  self.postMessage({ type: "summary", message });

  self.postMessage({ type: "finished" });
};
