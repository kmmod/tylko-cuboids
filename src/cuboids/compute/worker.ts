import { groupCuboids } from "./groupCuboids";

self.onmessage = (e: MessageEvent<string>) => {
  const start = performance.now();
  const data = groupCuboids(e.data);
  const end = performance.now();
  console.log(`groupCuboids (js): ${end - start}ms`);

  self.postMessage({ type: "cuboids", data });

  const message = `Processed ${data.cuboidsArray.length / 7} cuboids. Time: ${(end - start).toFixed(2)} ms. Found ${data.groups.size} groups.`;
  self.postMessage({ type: "summary", message });
};
