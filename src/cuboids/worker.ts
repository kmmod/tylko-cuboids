import { computeBoundingBox } from "./compute/boundingBox";
import { buildGroupsStreaming } from "./compute/buildGroups";
import { parseCsv } from "./compute/parseCsv";
import { buildSpatialHash } from "./compute/spatialHash";
import { type Box } from "./types";

self.onmessage = (e: MessageEvent<string>) => {
  const start = performance.now();

  const t0 = performance.now();
  const cuboids = parseCsv(e.data);
  console.log(`parseCsv: ${performance.now() - t0}ms`);

  const t1 = performance.now();
  const boundingBox = computeBoundingBox(cuboids);
  console.log(`boundingBox: ${performance.now() - t1}ms`);

  self.postMessage({ type: "boundingBox", boundingBox });

  const t2 = performance.now();
  const spatialHash = buildSpatialHash(cuboids);
  console.log(`buildSpatialHash: ${performance.now() - t2}ms`);

  let groupsCount = 0;
  const t3 = performance.now();
  buildGroupsStreaming(cuboids, spatialHash, (boxes: Box[]) => {
    groupsCount++;
    self.postMessage({ type: "boxes", boxes });
  });
  console.log(`buildAllGroups: ${performance.now() - t3}ms`);

  const end = performance.now();
  console.log(
    `Processed ${cuboids.length} cuboids in ${(end - start).toFixed(2)} ms. Found ${groupsCount} groups.`,
  );

  const message = `Processed ${cuboids.length} cuboids. Time: ${(end - start).toFixed(2)} ms. Found ${groupsCount} groups.`;
  self.postMessage({ type: "summary", message });

  self.postMessage({ type: "finished" });
};
