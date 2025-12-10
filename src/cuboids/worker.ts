import { computeBoundingBox } from "./compute/boundingBox";
import {
  buildGroupsNaiveStreaming,
  buildGroupsStreaming,
} from "./compute/buildGroups";
import { generateHashMapsA } from "./compute/otherIdeas.ts/hashMapsA";
import { generateHashMapsB } from "./compute/otherIdeas.ts/hashMapsB";
import { parseCsv } from "./compute/parseCsv";
import { buildSpatialHash } from "./compute/spatialHash";
import { type Box } from "./types";

const useSpatialHashing = true;
const testHashMapsA = false;
const testHashMapsB = true;

self.onmessage = (e: MessageEvent<string>) => {
  const start = performance.now();

  if (testHashMapsA) {
    const tA = performance.now();
    generateHashMapsA(e.data);
    console.log(`generateHashMaps: ${performance.now() - tA}ms`);
  }

  if (testHashMapsB) {
    const tB = performance.now();
    const data = generateHashMapsB(e.data);
    self.postMessage({ type: "cuboids", data });
    console.log(`generateHashMapsB: ${performance.now() - tB}ms`);

    const message = `Processed ${data.cuboidsArray.length / 7} cuboids. Time: ${(performance.now() - tB).toFixed(2)} ms. Found ${data.groups.size} groups.`;
    self.postMessage({ type: "summary", message });
    return;
  }

  const t0 = performance.now();
  const cuboids = parseCsv(e.data);
  console.log(`parseCsv: ${performance.now() - t0}ms`);

  const t1 = performance.now();
  const boundingBox = computeBoundingBox(cuboids);
  console.log(`boundingBox: ${performance.now() - t1}ms`);

  self.postMessage({ type: "boundingBox", boundingBox });

  let groupsCount = 0;
  const t3 = performance.now();
  if (useSpatialHashing) {
    const t2 = performance.now();
    const spatialHash = buildSpatialHash(cuboids);
    console.log(`buildSpatialHash: ${performance.now() - t2}ms`);

    buildGroupsStreaming(cuboids, spatialHash, (boxes: Box[]) => {
      groupsCount++;
      self.postMessage({ type: "boxes", boxes });
    });
  } else {
    buildGroupsNaiveStreaming(cuboids, (boxes: Box[]) => {
      groupsCount++;
      self.postMessage({ type: "boxes", boxes });
    });
  }
  console.log(`buildAllGroups: ${performance.now() - t3}ms`);

  const end = performance.now();
  console.log(
    `Processed ${cuboids.length} cuboids in ${(end - start).toFixed(2)} ms. Found ${groupsCount} groups.`,
  );

  const message = `Processed ${cuboids.length} cuboids. Time: ${(end - start).toFixed(2)} ms. Found ${groupsCount} groups.`;
  self.postMessage({ type: "summary", message });

  self.postMessage({ type: "finished" });
};
