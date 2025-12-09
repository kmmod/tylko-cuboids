import type { Box } from "../cuboids/types";
import { Signal } from "./Signal";

export class Api {
  public readonly onDataLoaded = new Signal<[data: string]>();
  public readonly onDataCleared = new Signal<[]>();

  public readonly onBoundingBoxSet = new Signal<[box: Box]>();
  public readonly onBoxesComputed = new Signal<[boxes: Box[]]>();
}
