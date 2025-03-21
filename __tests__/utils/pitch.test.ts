import { describe, expect, it } from "vitest";
import {
  encodeBase64,
  encodeRunLength,
  encodePitch,
  decodeBase64,
  decodeRunLength,
  decodePitch,
  getFrqFromTone,
} from "../../src/utils/pitch";

describe("pitchEncode", () => {
  it("base64_single", () => {
    const result = encodeBase64([0, 1, 25, 26, 27, 51, 52, 53, 61, 62, 63, 64]);
    expect(result).toEqual([
      "AA",
      "AB",
      "AZ",
      "Aa",
      "Ab",
      "Az",
      "A0",
      "A1",
      "A9",
      "A+",
      "A/",
      "BA",
    ]);
  });
  it("base64_negative", () => {
    const result = encodeBase64([
      -1, -25, -26, -27, -51, -52, -53, -61, -62, -63, -64,
    ]);
    expect(result).toEqual(
      encodeBase64([
        -1 + 4096,
        -25 + 4096,
        -26 + 4096,
        -27 + 4096,
        -51 + 4096,
        -52 + 4096,
        -53 + 4096,
        -61 + 4096,
        -62 + 4096,
        -63 + 4096,
        -64 + 4096,
      ])
    );
  });

  it("runLength", () => {
    expect(encodeRunLength(["AA", "AB", "AC", "AD"])).toBe("AAABACAD");
    expect(encodeRunLength(["AA", "AA", "AA", "AA"])).toBe("AA#3#");
    expect(encodeRunLength(["AA", "AA", "AB", "AC", "AC", "AC", "AD"])).toBe(
      "AA#1#ABAC#2#AD"
    );
  });
  it("encodePitch", () => {
    expect(encodePitch([0, 1, 2, 3])).toBe("AAABACAD");
    expect(encodePitch([0, 0, 0, 0])).toBe("AA#3#");
    expect(encodePitch([0, 0, 1, 2, 2, 2, 3])).toBe("AA#1#ABAC#2#AD");
  });
  it("decodeRunLength", () => {
    expect(decodeRunLength("AA#3#")).toEqual(["AA", "AA", "AA", "AA"]);
    expect(decodeRunLength("AAABACAD")).toEqual(["AA", "AB", "AC", "AD"]);
    expect(decodeRunLength("AA#1#ABAC#2#AD")).toEqual([
      "AA",
      "AA",
      "AB",
      "AC",
      "AC",
      "AC",
      "AD",
    ]);
  });
  it("decodeBase64", () => {
    expect(
      decodeBase64([
        "AA",
        "AB",
        "AZ",
        "Aa",
        "Ab",
        "Az",
        "A0",
        "A1",
        "A9",
        "A+",
        "A/",
        "BA",
      ])
    ).toEqual([0, 1, 25, 26, 27, 51, 52, 53, 61, 62, 63, 64]);
  });
  it("decodeBase64Negative", () => {
    expect(
      decodeBase64(
        encodeBase64([-1, -25, -26, -27, -51, -52, -53, -61, -62, -63, -64])
      )
    ).toEqual([-1, -25, -26, -27, -51, -52, -53, -61, -62, -63, -64]);
  });

  it("decodePitch", () => {
    expect(decodePitch("AA#1#ABAC#2#AD")).toEqual([0, 0, 1, 2, 2, 2, 3]);
    expect(decodePitch("AAABACAD")).toEqual([0, 1, 2, 3]);
    expect(decodePitch("AA#3#")).toEqual([0, 0, 0, 0]);
    expect(decodePitch("Sw#47#tQ#47#")).toEqual(new Array(48).fill(1200).concat(new Array(48).fill(-1200)));
  });

  it("getFrqFromTone", () => {
    expect(getFrqFromTone("A4")).toBe(440);
    expect(getFrqFromTone("A3")).toBe(220);
    expect(getFrqFromTone("C4")).toBeCloseTo(261.626);
    expect(getFrqFromTone("C#4")).toBeCloseTo(277.183);
    expect(getFrqFromTone("D4")).toBeCloseTo(293.665);
    expect(getFrqFromTone("D#4")).toBeCloseTo(311.127);
  });
});
