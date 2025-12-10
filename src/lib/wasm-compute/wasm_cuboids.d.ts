/* tslint:disable */
/* eslint-disable */

export class BoxesResult {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  readonly data: Float64Array;
  readonly offsets: Uint32Array;
}

export class CuboidData {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Get the cuboids array as Uint16Array
   */
  readonly cuboidsArray: Uint16Array;
  /**
   * Get groups as a JavaScript Map<number, number[]>
   */
  readonly groups: Map<any, any>;
}

export class CuboidProcessor {
  free(): void;
  [Symbol.dispose](): void;
  constructor();
  parse_csv(csv: string): string;
  compute_bounding_box(): Float64Array;
  build_spatial_hash(): void;
  build_groups(): BoxesResult;
  get_cuboid_count(): number;
}

/**
 * Generate hash maps and find connected cuboid groups from CSV data
 *
 * CSV format: id;x1;y1;z1;x2;y2;z2 per line
 *
 * Returns CuboidData matching TypeScript type:
 * { groups: Map<number, number[]>, cuboidsArray: Uint16Array }
 */
export function generateHashMaps(csv: string): CuboidData;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_cuboiddata_free: (a: number, b: number) => void;
  readonly cuboiddata_cuboidsArray: (a: number) => any;
  readonly cuboiddata_groups: (a: number) => any;
  readonly generateHashMaps: (a: number, b: number) => number;
  readonly __wbg_boxesresult_free: (a: number, b: number) => void;
  readonly boxesresult_data: (a: number) => any;
  readonly boxesresult_offsets: (a: number) => [number, number];
  readonly __wbg_cuboidprocessor_free: (a: number, b: number) => void;
  readonly cuboidprocessor_new: () => number;
  readonly cuboidprocessor_parse_csv: (a: number, b: number, c: number) => [number, number];
  readonly cuboidprocessor_compute_bounding_box: (a: number) => any;
  readonly cuboidprocessor_build_spatial_hash: (a: number) => void;
  readonly cuboidprocessor_build_groups: (a: number) => number;
  readonly cuboidprocessor_get_cuboid_count: (a: number) => number;
  readonly __wbindgen_externrefs: WebAssembly.Table;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
