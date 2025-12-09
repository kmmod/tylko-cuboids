import type { Api } from "../api/Api";
import type { WorkerResult } from "./types";

export class Cuboids {
  private readonly api: Api;
  private worker: Worker;
  private workerWasm: Worker;
  private useWasm: boolean = true;

  constructor(api: Api) {
    this.api = api;

    this.worker = new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    });

    this.workerWasm = new Worker(new URL("./workerWasm.ts", import.meta.url), {
      type: "module",
    });

    this.worker.onmessage = this.processWorkerMessage.bind(this);
    this.workerWasm.onmessage = this.processWorkerMessage.bind(this);

    if ((this, this.useWasm)) {
      this.workerWasm.postMessage({ type: "warmup" });
    }

    this.api.onDataLoaded.connect((data: string) =>
      this.processDataLoaded(data),
    );

    this.api.onUseWasmSet.connect((useWasm: boolean) => {
      this.useWasm = useWasm;
      if (this.useWasm) {
        this.workerWasm.postMessage({ type: "warmup" });
      }
    });
  }

  private processDataLoaded(data: string) {
    this.useWasm
      ? this.workerWasm.postMessage({ type: "compute", csv: data })
      : this.worker.postMessage(data);
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
