import { describe, expect, it } from "vitest";
import { DefaultPhonemizer } from "../../src/lib/Phonemizer/DefaultPhonemizer";
import { JPCVorVCVPhonemizer } from "../../src/lib/Phonemizer/JPCVorVCVPhonemizer";
import { loadPhonemizerClasses } from "../../src/utils/loadPhonemizer";

describe("loadPhonemizer", () => {
  it("初期導入の2つのPhonemizerが期待した通り読み込まれるか", async () => {
    const results = await loadPhonemizerClasses();
    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "phonemizer.default",
          cls: DefaultPhonemizer,
        }),
        expect.objectContaining({
          name: "phonemizer.JPCVorVCVPhonemizer",
          cls: JPCVorVCVPhonemizer,
        }),
      ])
    );
  });
});
