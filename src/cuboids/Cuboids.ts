import type { Api } from "../api/Api";
import type { ComputeResult } from "./types";

export class Cuboids {
  private readonly api: Api;
  private worker: Worker;

  constructor(api: Api) {
    this.api = api;

    this.worker = new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    });

    this.worker.onmessage = (e: MessageEvent<ComputeResult>) => {
      this.onComputeComplete(e.data);
    };

    this.api.onDataLoaded.connect((data: string) => this.generate(data));
  }

  private generate(csv: string) {
    this.worker.postMessage(csv);
  }

  private onComputeComplete(result: ComputeResult) {
    this.api.onBoxesGenerated.emit(result);
  }
}
