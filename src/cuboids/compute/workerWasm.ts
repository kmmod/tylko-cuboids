import type { CuboidData, WasmWorkerMessage } from "../types";

let wasm: typeof import("../../lib/wasm-compute/wasm_cuboids") | null = null;

const warmupWasm = async () => {
  if (!wasm) {
    const t0 = performance.now();
    wasm = await import("../../lib/wasm-compute/wasm_cuboids");
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
  if (!wasm) {
    await warmupWasm();
  }

  const start = performance.now();
  const result = wasm!.groupCuboids(csv); // Non-null assertion since we ensured wasm is loaded
  const end = performance.now();
  console.log(`groupCuboids (wasm): ${end - start}ms`);

  const data: CuboidData = {
    cuboidsArray: result.cuboidsArray,
    groups: result.groups,
  };

  self.postMessage({ type: "cuboids", data });

  const message = `Processed ${data.cuboidsArray.length / 7} cuboids. Time: ${(end - start).toFixed(2)} ms. Found ${data.groups.size} groups.`;
  self.postMessage({ type: "summary", message });
};
