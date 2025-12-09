import type { ComputeResult } from "../cuboids/types";
import { Signal } from "./Signal";

export class Api {
  public readonly onDataLoaded = new Signal<[data: string]>();
  public readonly onDataCleared = new Signal<[]>();
  public readonly onBoxesGenerated = new Signal<[result: ComputeResult]>();
}
