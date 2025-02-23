import { describe, expect, it } from "vitest";
import { makeTimeAxis, interp1d, interp1dArray } from "../../src/utils/interp";

describe("interp", () => {
  it("make_time_axis", () => {
    expect(makeTimeAxis(5, 0, 13)).toEqual([0, 5, 10, 15]);
    expect(makeTimeAxis(5, 1, 16)).toEqual([1, 6, 11, 16]);
  });

  it("interp1d", () => {
    const newTimeAxis = makeTimeAxis(5, 0, 13);
    const values = [0, 4, 13];
    const timeAxis = [0, 4, 13];
    expect(interp1d(values, timeAxis, newTimeAxis)).toEqual([0, 5, 10, 15]);
    expect(interp1d([10, 100], [0, 10], [5])).toEqual([55]);
    expect(interp1d([10, 100], [0, 10], [4])).toEqual([46]);
  });
  it("interp1dArray", () => {
    const newTimeAxis = makeTimeAxis(2, 0, 10);
    const values = [
      [0, 0, 0],
      [5, 10, 20],
      [10, 100, 200],
    ];
    const timeAxis = [0, 5, 10];
    expect(interp1dArray(values, timeAxis, newTimeAxis)).toEqual([
      [0, 0, 0],
      [2, 4, 8],
      [4, 8, 16],
      [6, 28, 56],
      [8, 64, 128],
      [10, 100, 200],
    ]);
  });
});
