import { describe, expect, it } from "vitest";
import { RESAMPLER_FLAGS } from "../../src/config/resamplerFlags";
import { translationEn } from "../../src/i18n/en";
import { translationJa } from "../../src/i18n/ja";
import { translationPt } from "../../src/i18n/pt";
import { translationZh } from "../../src/i18n/zh";
import { Fave } from "../../src/lib/FaveResamp";
import { Resamp } from "../../src/lib/Resamp";

describe("RESAMPLER_FLAGS", () => {
  it("resampのflagKeysは設定ファイルの定義を参照している", () => {
    expect(new Resamp(null).flagKeys).toBe(RESAMPLER_FLAGS.resamp);
  });

  it("faveのflagKeysは設定ファイルの定義を参照している", () => {
    expect(new Fave(null).flagKeys).toBe(RESAMPLER_FLAGS.fave);
  });

  it.each([
    ["ja", translationJa],
    ["en", translationEn],
    ["zh", translationZh],
    ["pt", translationPt],
  ])(
    "%sにエンジンごとにエイリアスを含むすべてのフラグの効果が定義されている",
    (_, translation) => {
      const effects = translation.resampler.flagEffect as Record<
        string,
        Record<string, string>
      >;
      (
        Object.keys(RESAMPLER_FLAGS) as Array<keyof typeof RESAMPLER_FLAGS>
      ).forEach((engine) => {
        RESAMPLER_FLAGS[engine].forEach((f) => {
          expect(
            effects[engine]?.[f.name],
            `flagEffect.${engine}.${f.name}`,
          ).toBeTruthy();
        });
      });
    },
  );

  it.each([
    ["ja", translationJa],
    ["en", translationEn],
    ["zh", translationZh],
    ["pt", translationPt],
  ])(
    "%sにエンジンが持たないフラグの効果は定義されていない",
    (_, translation) => {
      const effects = translation.resampler.flagEffect as Record<
        string,
        Record<string, string>
      >;
      (
        Object.keys(RESAMPLER_FLAGS) as Array<keyof typeof RESAMPLER_FLAGS>
      ).forEach((engine) => {
        const names = new Set(RESAMPLER_FLAGS[engine].map((f) => f.name));
        Object.keys(effects[engine]).forEach((name) => {
          expect(names.has(name), `flagEffect.${engine}.${name}`).toBe(true);
        });
      });
    },
  );
});
