import { beforeEach, describe, expect, it } from "vitest";
import { LOG } from "../../src/lib/Logging";

describe("Loggingのテスト", () => {
  beforeEach(() => {
    LOG.clear();
  });

  it("シンプルなログ操作", () => {
    LOG.debug("デバッグ", "Logging.test");
    expect(LOG.datas[0].endsWith("Logging.test\tDEBUG\tデバッグ")).toBe(true);
    LOG.info("インフォ", "Logging.test");
    expect(LOG.datas[1].endsWith("Logging.test\tINFO\tインフォ")).toBe(true);
    LOG.warn("警告", "Logging.test");
    expect(LOG.datas[2].endsWith("Logging.test\tWARN\t警告")).toBe(true);
    LOG.error("エラー", "Logging.test");
    expect(LOG.datas[3].endsWith("Logging.test\tERROR\tエラー")).toBe(true);
  });

  it("ログの値が変換される確認", () => {
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

  it("ログのクリア", () => {
    LOG.debug("デバッグ", "Logging.test");
    LOG.info("インフォ", "Logging.test");
    LOG.warn("警告", "Logging.test");
    LOG.error("エラー", "Logging.test");
    expect(LOG.datas.length).toBe(4);
    LOG.clear();
    expect(LOG.datas.length).toBe(0);
  });
});
