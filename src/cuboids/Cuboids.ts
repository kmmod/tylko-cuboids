import type { Api } from "../api/Api";
import type { WorkerResult } from "./types";

export class Cuboids {
  private readonly api: Api;
  private worker: Worker;

  constructor(api: Api) {
    this.api = api;

    this.worker = new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    });

    this.worker.onmessage = this.processWorkerMessage.bind(this);

    this.api.onDataLoaded.connect((data: string) =>
      this.worker.postMessage(data),
    );
  }

  private processWorkerMessage(e: MessageEvent<WorkerResult>) {
    const type = e.data.type;

    switch (type) {
      case "boundingBox":
        this.api.onBoundingBoxSet.emit(e.data.boundingBox);
        break;
      case "boxes":
        this.api.onBoxesComputed.emit(e.data.boxes);
        break;
      case "finished":
        console.log("Compute completed");
    }
  }
}
