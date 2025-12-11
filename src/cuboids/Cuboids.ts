import type { Api } from "../api/Api";
import type { WorkerResult } from "./types";

export class Cuboids {
  private readonly api: Api;
  private worker: Worker;
  private workerWasm: Worker;
  private useWasm: boolean = false;

  constructor(api: Api) {
    this.api = api;

    this.worker = new Worker(new URL("./compute/worker.ts", import.meta.url), {
      type: "module",
    });

    this.workerWasm = new Worker(
      new URL("./compute/workerWasm.ts", import.meta.url),
      {
        type: "module",
      },
    );

    this.worker.onmessage = this.processWorkerMessage.bind(this);
    this.workerWasm.onmessage = this.processWorkerMessage.bind(this);

    if (this.useWasm) {
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
      case "cuboids":
        this.api.onCuboidsComputed.emit(e.data.data);
        break;
      case "summary":
        this.api.onInfoMessage.emit(e.data.message);
        break;
      case "finished":
        console.log("Compute completed");
    }
  }
}
