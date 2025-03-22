import { describe, expect, it } from "vitest";
import { Wavtool } from "../../src/lib/Wavtool";

describe("Wavtool", () => {
  it("getEnvelope_Rest", () => {
    const tool = new Wavtool();
    expect(tool.getEnvelope(100, { point: [0, 0], value: [] })).toEqual({
      framePoint: [0, 0],
      value: [0, 0],
    });
  });
  it("getEnvelope_3point", () => {
    const tool = new Wavtool();
    expect(
      tool.getEnvelope(100, { point: [0, 10, 50], value: [0, 100, 100] })
    ).toEqual({
      framePoint: [0, 441, 2205, 4410],
      value: [0, 100, 100, 0],
    });
  });
  it("getEnvelope_3point_p1notequal0", () => {
    const tool = new Wavtool();
    expect(
      tool.getEnvelope(100, { point: [10, 10, 50], value: [50, 100, 100] })
    ).toEqual({
      framePoint: [0, 441, 882, 2205, 4410],
      value: [0, 50, 100, 100, 0],
    });
  });
  it("getEnvelope_3point4value", () => {
    const tool = new Wavtool();
    expect(
      tool.getEnvelope(100, { point: [0, 10, 50], value: [0, 100, 100, 100] })
    ).toEqual({
      framePoint: [0, 441, 2205, 4410],
      value: [0, 100, 100, 100],
    });
  });
  it("getEnvelope_4point", () => {
    const tool = new Wavtool();
    expect(
      tool.getEnvelope(100, {
        point: [0, 10, 40, 10],
        value: [0, 100, 100, 100],
      })
    ).toEqual({
      framePoint: [0, 441, 2205, 3969, 4410],
      value: [0, 100, 100, 100, 0],
    });
  });
  it("getEnvelope_4point_p4is0", () => {
    const tool = new Wavtool();
    expect(
      tool.getEnvelope(100, {
        point: [0, 10, 50, 0],
        value: [0, 100, 100, 100],
      })
    ).toEqual({
      framePoint: [0, 441, 2205, 4410],
      value: [0, 100, 100, 100],
    });
  });
  it("getEnvelope_5point", () => {
    const tool = new Wavtool();
    expect(
      tool.getEnvelope(100, {
        point: [0, 10, 40, 10, 10],
        value: [0, 100, 100, 100, 50],
      })
    ).toEqual({
      framePoint: [0, 441, 882, 2205, 3969, 4410],
      value: [0, 100, 50, 100, 100, 0],
    });
  });

  it("applyEnvelope_rest", () => {
    const tool = new Wavtool();
    expect(
      tool.applyEnvelope(new Array(4410).fill(100), {
        framePoint: [0, 0],
        value: [0, 0],
      })
    ).toEqual(new Array(4410).fill(0));
  });
  it("applyEnvelope_simple", () => {
    const tool = new Wavtool();
    expect(
      tool.applyEnvelope(new Array(10).fill(100), {
        framePoint: [0, 5, 10],
        value: [0, 100, 0],
      })
    ).toEqual([0, 20, 40, 60, 80, 100, 80, 60, 40, 20]);
  });
  it("applyEnvelope_simple2", () => {
    const tool = new Wavtool();
    expect(
      tool.applyEnvelope(new Array(20).fill(100), {
        framePoint: [0, 5, 10, 20],
        value: [0, 100, 90, 0],
      })
    ).toEqual([
      0, 20, 40, 60, 80, 100, 98, 96, 94, 92, 90, 81, 72, 63, 54, 45, 36, 27,
      18, 9,
    ]);
  });

  it("concat_start", () => {
    const tool = new Wavtool();
    tool.concat(0, new Array(10).fill(100));
    expect(tool.data).toEqual(new Array(10).fill(100));
  });
  it("concat_start_with_overlap", () => {
    const tool = new Wavtool();
    tool.concat(5, new Array(10).fill(100));
    expect(tool.data).toEqual(new Array(10).fill(100));
  });
  it("concat_no_overlap", () => {
    const tool = new Wavtool();
    tool.concat(0, new Array(10).fill(100));
    tool.concat(0, new Array(10).fill(50));
    expect(tool.data).toEqual(
      new Array(10).fill(100).concat(new Array(10).fill(50))
    );
  });
  it("concat_overlap", () => {
    const tool = new Wavtool();
    tool.concat(0, [0, 10, 20, 30, 40, 50, 60, 70, 80, 90]);
    tool.concat(5, new Array(10).fill(50));
    expect(tool.data).toEqual(
      [0, 10, 20, 30, 40, 100, 110, 120, 130, 140].concat(new Array(5).fill(50))
    );
  });
  it("concat_overlap_less", () => {
    const tool = new Wavtool();
    tool.concat(0, [0, 10, 20, 30, 40, 50, 60, 70, 80, 90]);
    tool.concat(20, new Array(20).fill(50));
    expect(tool.data).toEqual(
      new Array(10)
        .fill(50)
        .concat([50, 60, 70, 80, 90, 100, 110, 120, 130, 140])
    );
  });
  it("concat_overlap_less_and_over", () => {
    const tool = new Wavtool();
    tool.concat(0, new Array(10).fill(100));
    tool.concat(50, new Array(20).fill(50));
    expect(tool.data).toEqual(
      new Array(10).fill(50).concat(new Array(10).fill(150))
    );
  });
  it("concat_overlap_inverse", () => {
    const tool = new Wavtool();
    tool.concat(0, [0, 10, 20, 30, 40, 50, 60, 70, 80, 90]);
    tool.concat(-5, new Array(10).fill(50));
    expect(tool.data).toEqual(
      [0, 10, 20, 30, 40, 50, 60, 70, 80, 90].concat(
        new Array(5).fill(0),
        new Array(10).fill(50)
      )
    );
  });
});
