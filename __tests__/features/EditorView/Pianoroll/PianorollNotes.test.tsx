import { render } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { PIANOROLL_CONFIG } from "../../../../src/config/pianoroll";
import { PianorollNotes } from "../../../../src/features/EditorView/Pianoroll/PianorollNotes";
import { Note } from "../../../../src/lib/Note";
import { useCookieStore } from "../../../../src/store/cookieStore";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";

// テスト用のノートを生成する関数（3件）
const createTestNotes = (): Note[] => {
  // 3件のノート、各ノートの length = 120, lyric は適当に設定、notenum は 107, 106, 105 とする
  const n1 = new Note();
  n1.lyric = "あ";
  n1.length = 120;
  n1.notenum = 107;

  const n2 = new Note();
  n2.lyric = "い";
  n2.length = 120;
  n2.notenum = 106;

  const n3 = new Note();
  n3.lyric = "う";
  n3.length = 120;
  n3.notenum = 105;

  return [n1, n2, n3];
};

describe("PianorollNotes", () => {
  beforeEach(() => {
    // 初期状態の設定
    useCookieStore.setState({
      colorTheme: "default",
      verticalZoom: 1,
      horizontalZoom: 1,
      // useThemeModeは cookieStore から mode を取得する前提なので、ここに mode を含める場合は合わせて設定する
      // mode: "light" など必要に応じて設定してください
    });
    useMusicProjectStore.setState({
      ust: null,
      vb: null,
      ustTempo: 120,
      ustFlags: "",
      notes: [],
    });
  });

  it("svgのwidthとrectのleftが期待した値か", () => {
    // テスト用ノートを設定
    const testNotes = createTestNotes();
    useMusicProjectStore.setState({ notes: testNotes });

    // 上記の場合の計算
    // 各ノートの length は 120, よって、累積 left 座標は [0, 120, 240]
    // totalLength = 240 + 120 = 360
    // NOTES_WIDTH_RATE は設定値として PIANOROLL_CONFIG.NOTES_WIDTH_RATE を使用
    // 例として、設定が LENGTH_PER_PIXEL: 1, NOTES_WIDTH_RATE: (44 * 1) / 120 = 0.366666...
    // horizontalZoom = 1 と仮定
    // 期待される svg width = 360 * NOTES_WIDTH_RATE * horizontalZoom = 360 * 0.3666666 ≒ 132
    // 各 rect の x は [0, 120 * 0.3666666, 240 * 0.3666666] ≒ [0, 44, 88]

    const { container } = render(<PianorollNotes selectedNotesIndex={[]} />);

    // svg 要素を取得
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();

    if (svg) {
      // SVG width 属性は文字列なので数値に変換してチェック
      const svgWidth = parseFloat(svg.getAttribute("width") || "0");
      const expectedSvgWidth = 360 * PIANOROLL_CONFIG.NOTES_WIDTH_RATE;
      expect(svgWidth).toBeCloseTo(expectedSvgWidth, 1);

      // 各 rect 要素を取得
      const rects = svg.querySelectorAll("rect");
      expect(rects.length).toBe(3);

      // 期待される x 座標の配列
      const expectedXs = [
        0,
        120 * PIANOROLL_CONFIG.NOTES_WIDTH_RATE,
        240 * PIANOROLL_CONFIG.NOTES_WIDTH_RATE,
      ];

      rects.forEach((rect, index) => {
        const x = parseFloat(rect.getAttribute("x") || "0");
        expect(x).toBeCloseTo(expectedXs[index], 1);
      });
    }
  });
});
