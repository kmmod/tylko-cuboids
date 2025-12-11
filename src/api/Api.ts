import type { CuboidData } from "../cuboids/types";
import { Signal } from "./Signal";

export class Api {
  public readonly onDataLoaded = new Signal<[data: string]>();
  public readonly onDataCleared = new Signal<[]>();

  public readonly onRerunClicked = new Signal<[]>();
  public readonly onUseWasmSet = new Signal<[useWasm: boolean]>();
  public readonly onInfoMessage = new Signal<[message: string]>();

  public readonly onCuboidsComputed = new Signal<[cuboidData: CuboidData]>();
}
