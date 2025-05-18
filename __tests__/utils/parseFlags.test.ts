import { describe, expect, it } from "vitest";
import { FlagKeys, parseFlags } from "../../src/utils/parseFlags";

const testFlagKeys: FlagKeys[] = [
  { name: "g", type: "number", min: -100, max: 100, default: 0 },
  { name: "B", type: "number", min: 0, max: 100, default: 50 },
  { name: "P", type: "number", min: 0, max: 100, default: 86 },
  { name: "N", type: "bool", default: undefined },
];

describe("parseFlags", () => {
  it("boolタイプのフラグ判定", () => {
    const result1 = parseFlags("g-5NB30", testFlagKeys);
    const result2 = parseFlags("g-5B30", testFlagKeys);
    expect(result1["N"]).toBe(0);
    expect(result2["N"]).toBe(undefined);
  });
  it("numberタイプのフラグ", () => {
    const result1 = parseFlags("g-5NB30", testFlagKeys);
    expect(result1["g"]).toBe(-5);
    expect(result1["B"]).toBe(30);
    expect(result1["P"]).toBe(86);
  });
  it("numberタイプのフラグ:下限", () => {
    const result1 = parseFlags("g-101NB-5", testFlagKeys);
    expect(result1["g"]).toBe(-100);
    expect(result1["B"]).toBe(0);
  });
  it("numberタイプのフラグ:上限", () => {
    const result1 = parseFlags("g101NB101", testFlagKeys);
    expect(result1["g"]).toBe(100);
    expect(result1["B"]).toBe(100);
  });
  it("全て初期値", () => {
    const result1 = parseFlags("", testFlagKeys);
    expect(result1["N"]).toBe(undefined);
    expect(result1["g"]).toBe(0);
    expect(result1["B"]).toBe(50);
    expect(result1["P"]).toBe(86);
  });
});
