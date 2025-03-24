import { describe, expect, it } from "vitest";
import { last, range } from "../../src/utils/array";

describe("array", () => {
  it("last", () => {
    const strArray = ["a", "b", "c"];
    const numberArray = [1, 2, 3];
    expect(last(strArray)).toBe("c");
    expect(last(numberArray)).toBe(3);
  });
  it("range", () => {
    expect(range(0, 5)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(range(5, 0)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(range(-3, 5)).toEqual([-3, -2, -1, 0, 1, 2, 3, 4, 5]);
  });
});
