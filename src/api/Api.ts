import type { CuboidData } from "../cuboids/compute/otherIdeas.ts/hashMapsB";
import type { Box } from "../cuboids/types";
import { Signal } from "./Signal";

export class Api {
  public readonly onDataLoaded = new Signal<[data: string]>();
  public readonly onDataCleared = new Signal<[]>();

  public readonly onRerunClicked = new Signal<[]>();
  public readonly onUseWasmSet = new Signal<[useWasm: boolean]>();
  public readonly onInfoMessage = new Signal<[message: string]>();

  public readonly onBoundingBoxSet = new Signal<[box: Box]>();
  public readonly onBoxesComputed = new Signal<[boxes: Box[]]>();

  public readonly onCuboidsComputed = new Signal<[cuboidData: CuboidData]>();
}
