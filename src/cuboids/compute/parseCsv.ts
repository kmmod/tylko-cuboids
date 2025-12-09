import type { Cuboid } from "../types";

export const parseCsv = (csv: string): Cuboid[] => {
  return csv
    .trim()
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => {
      const parts = line.trim().split(";").map(Number);
      if (!isCuboid(parts)) {
        throw new Error(`Invalid cuboid: ${line}`);
      }
      return parts;
    });
};

export const isCuboid = (arr: number[]): arr is Cuboid => {
  return (
    arr.length === 7 && arr.every((n) => typeof n === "number" && !isNaN(n))
  );
};
