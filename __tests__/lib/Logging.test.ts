import { beforeEach, describe, expect, it } from "vitest";
import { LOG } from "../../src/lib/Logging";

describe("Loggingのテスト", () => {
  beforeEach(() => {
    LOG.clear();
  });

  it("各ログレベルが正しく記録される", () => {
    LOG.debug("デバッグ", "Logging.test");
    expect(LOG.datas[0].endsWith("Logging.test\tDEBUG\tデバッグ")).toBe(true);
    LOG.info("インフォ", "Logging.test");
    expect(LOG.datas[1].endsWith("Logging.test\tINFO\tインフォ")).toBe(true);
    LOG.warn("警告", "Logging.test");
    expect(LOG.datas[2].endsWith("Logging.test\tWARN\t警告")).toBe(true);
    LOG.error("エラー", "Logging.test");
    expect(LOG.datas[3].endsWith("Logging.test\tERROR\tエラー")).toBe(true);
  });

  it("各型の値がログに変換される", () => {
    LOG.debug(2, "Logging.test");
    expect(LOG.datas[0].endsWith("Logging.test\tDEBUG\t2")).toBe(true);
    LOG.debug(true, "Logging.test");
    expect(LOG.datas[1].endsWith("Logging.test\tDEBUG\ttrue")).toBe(true);
    LOG.debug([0, 1], "Logging.test");
    expect(LOG.datas[2].endsWith("Logging.test\tDEBUG\t[0,1]")).toBe(true);
    LOG.debug({ a: "aaa", b: "bbb" }, "Logging.test");
    expect(
      LOG.datas[3].endsWith('Logging.test\tDEBUG\t{"a":"aaa","b":"bbb"}')
    ).toBe(true);
  });

  it("clearで全ログが削除される", () => {
    LOG.debug("デバッグ", "Logging.test");
    LOG.info("インフォ", "Logging.test");
    LOG.warn("警告", "Logging.test");
    LOG.error("エラー", "Logging.test");
    expect(LOG.datas.length).toBe(4);
    LOG.clear();
    expect(LOG.datas.length).toBe(0);
  });

  it("gtagが開発環境でdebugログに記録される", () => {
    // Node.js環境ではwindow.gtagは存在しないため、debugログに記録される想定
    LOG.gtag("test_event", { key1: "value1", key2: 123 });
    expect(LOG.datas.length).toBeGreaterThan(0);
    const lastLog = LOG.datas[LOG.datas.length - 1];
    expect(lastLog).toContain("DEBUG");
    expect(lastLog).toContain("test_event");
    expect(lastLog).toContain('"key1":"value1"');
    expect(lastLog).toContain('"key2":123');
  });
});
