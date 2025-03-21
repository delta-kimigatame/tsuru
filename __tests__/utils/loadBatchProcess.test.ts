import { describe, expect, it } from "vitest";
import { EnvelopeNormalizeBatchProcess } from "../../src/lib/BatchProcess/EnvelopeNormalizeBatchProcess";
import { OctaveDownBatchProcess } from "../../src/lib/BatchProcess/OctaveDownBatchProcess";
import { OctaveUpBatchProcess } from "../../src/lib/BatchProcess/OctaveUpBatchProcess";
import { PreprocessingBatchProcess } from "../../src/lib/BatchProcess/PreprocessingBatchProcess";
import { ResetEditBatchProcess } from "../../src/lib/BatchProcess/ResetEditBatchProcess";
import { loadBatchProcessClasses } from "../../src/utils/loadBatchProcess";

describe("loadBatchProcess", () => {
  it("初期導入の5つのバッチプロセスが期待した通り読み込まれるか", async () => {
    const results = await loadBatchProcessClasses();
    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: "batchprocess.octaveUp",
          cls: OctaveUpBatchProcess,
        }),
        expect.objectContaining({
          title: "batchprocess.octaveDown",
          cls: OctaveDownBatchProcess,
        }),
        expect.objectContaining({
          title: "batchprocess.preprocessing.title",
          cls: PreprocessingBatchProcess,
        }),
        expect.objectContaining({
          title: "batchprocess.resetEdit.title",
          cls: ResetEditBatchProcess,
        }),
        expect.objectContaining({
          title: "batchprocess.envelopeNormalize",
          cls: EnvelopeNormalizeBatchProcess,
        }),
      ])
    );
  });
});
