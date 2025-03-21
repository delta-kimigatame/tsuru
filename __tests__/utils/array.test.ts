import { describe, expect, it } from "vitest";
import { last } from "../../src/utils/array";

describe("array", () => {
  it("last", () => {
    const strArray = ["a", "b", "c"];
    const numberArray = [1, 2, 3];
    expect(last(strArray)).toBe("c");
    expect(last(numberArray)).toBe(3);
  });
});
