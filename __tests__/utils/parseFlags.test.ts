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
  it("numberタイプのフラグ:非数はdefaultへフォールバック", () => {
    const result1 = parseFlags("g-B-P-", testFlagKeys);
    expect(result1["g"]).toBe(0);
    expect(result1["B"]).toBe(50);
    expect(result1["P"]).toBe(86);
  });
});

describe("parseFlags: 2文字フラグと1文字フラグ", () => {
  // 定義順に依存しないことを確かめるため、短いフラグを先に定義する
  const flagKeys: FlagKeys[] = [
    { name: "G", type: "bool", default: undefined },
    { name: "t", type: "number", min: -100, max: 100, default: 0 },
    { name: "T", type: "number", min: -100, max: 100, default: 0 },
    { name: "w", type: "number", min: 0, max: 100, default: 0 },
    { name: "S", type: "number", min: -100, max: 100, default: 0 },
    { name: "O", type: "number", min: -100, max: 100, default: 0 },
    { name: "e", type: "bool", default: undefined },
    { name: "Mo", type: "number", min: -100, max: 100, default: 0, alias: "O" },
    { name: "Mt", type: "number", min: -100, max: 100, default: 0, alias: "T" },
    { name: "MG", type: "number", min: -100, max: 100, default: 0, alias: "w" },
    { name: "ME", type: "number", min: -100, max: 100, default: 0, alias: "S" },
  ];

  it("Mt50はtフラグとして解釈されず、Tへ反映される", () => {
    const result = parseFlags("Mt50", flagKeys);
    expect(result["t"]).toBe(0);
    expect(result["Mt"]).toBe(50);
    expect(result["T"]).toBe(50);
  });

  it("MG50はGフラグとして解釈されず、wへ反映される", () => {
    const result = parseFlags("MG50", flagKeys);
    expect(result["G"]).toBe(undefined);
    expect(result["MG"]).toBe(50);
    expect(result["w"]).toBe(50);
  });

  it("ME50はeフラグ(大文字小文字は区別)やSの誤検出なく、Sへ反映される", () => {
    const result = parseFlags("ME50", flagKeys);
    expect(result["e"]).toBe(undefined);
    expect(result["ME"]).toBe(50);
    expect(result["S"]).toBe(50);
  });

  it("Mo50はOへ反映される", () => {
    const result = parseFlags("Mo50", flagKeys);
    expect(result["Mo"]).toBe(50);
    expect(result["O"]).toBe(50);
  });

  it("エイリアスと1文字フラグを同時に指定できる", () => {
    const result = parseFlags("Mt30t-20", flagKeys);
    expect(result["Mt"]).toBe(30);
    expect(result["t"]).toBe(-20);
    expect(result["T"]).toBe(30);
  });

  it("正規フラグが指定されていれば、エイリアスで上書きしない", () => {
    const result = parseFlags("O80Mo20", flagKeys);
    expect(result["O"]).toBe(80);
    expect(result["Mo"]).toBe(20);
  });

  it("エイリアスフラグの値もmin/maxでクランプされる", () => {
    const result = parseFlags("Mt999", flagKeys);
    expect(result["Mt"]).toBe(100);
    expect(result["T"]).toBe(100);
  });

  it("MG50とGを同時に指定すると、Gはboolとして検出される", () => {
    const result = parseFlags("MG50G", flagKeys);
    expect(result["MG"]).toBe(50);
    expect(result["G"]).toBe(0);
  });

  it("1文字フラグ単独の指定は従来どおり解釈される", () => {
    const result = parseFlags("t30Ge", flagKeys);
    expect(result["t"]).toBe(30);
    expect(result["G"]).toBe(0);
    expect(result["e"]).toBe(0);
  });

  it("flagKeysの並びを変更しない", () => {
    const keys = [...flagKeys];
    parseFlags("Mt50", keys);
    expect(keys.map((k) => k.name)).toEqual(flagKeys.map((k) => k.name));
  });

  it("+記号は無視される", () => {
    const result = parseFlags("+Mt50+", flagKeys);
    expect(result["T"]).toBe(50);
  });
});
