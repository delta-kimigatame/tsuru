import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  envelopeApply,
  EnvelopeDialog,
  envelopeToPoint,
  getEnvelopePointToX,
  getEnvelopeValueToY,
  validationX,
  validationY,
} from "../../../../src/features/EditorView/EnvelopeDialog/EnvelopeDialog";
import { Note } from "../../../../src/lib/Note";
import { undoManager } from "../../../../src/lib/UndoManager";
import { Ust } from "../../../../src/lib/Ust";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";

describe("EnvelopeDialog", () => {
  const createNotes = (): Note[] => {
    const notes = new Array();
    notes.push(new Note());
    notes.push(new Note());
    notes.push(new Note());
    notes.push(new Note());
    notes.push(new Note());
    notes.forEach((n, i) => {
      n.index = i;
      n.length = 480;
      n.notenum = 60 + i;
      n.lyric = "あ";
      n.hasTempo = false;
      n.tempo = 120;
      n.preutter = 30;
      n.overlap = 10;
    });
    return notes;
  };
  beforeEach(() => {
    undoManager.clear();
  });
  it("getEnvelopeValueToY:0の時height、200の時0となるように割合で返す", () => {
    expect(getEnvelopeValueToY(0, 100)).toBe(100);
    expect(getEnvelopeValueToY(100, 100)).toBe(50);
    expect(getEnvelopeValueToY(200, 100)).toBe(0);
  });
  it("getEnvelopePointToX:0の時0、msLengthの時widthとなるように割合で返す", () => {
    expect(getEnvelopePointToX(0, 100, 200)).toBe(0);
    expect(getEnvelopePointToX(50, 100, 200)).toBe(100);
    expect(getEnvelopePointToX(100, 100, 200)).toBe(200);
  });

  it("envelopeToPoint:UTAUのenvelopeを全てノート頭からのmsに変換して返す。2点", () => {
    const point2 = envelopeToPoint({ point: [0, 0], value: [] }, 500);
    expect(point2.p).toEqual([0, 0]);
    expect(point2.v).toEqual([0, 0]);
  });
  it("envelopeToPoint:UTAUのenvelopeを全てノート頭からのmsに変換して返す。3点", () => {
    const point3 = envelopeToPoint(
      { point: [5, 5, 35], value: [0, 100, 100] },
      500
    );
    expect(point3.p).toEqual([5, 10, 500 - 35]);
    expect(point3.v).toEqual([0, 100, 100]);
  });
  it("envelopeToPoint:UTAUのenvelopeを全てノート頭からのmsに変換して返す。4点ポイントのみ", () => {
    const point4p = envelopeToPoint(
      { point: [5, 5, 35, 10], value: [0, 100, 100] },
      500
    );
    expect(point4p.p).toEqual([5, 10, 500 - 45, 500 - 10]);
    expect(point4p.v).toEqual([0, 100, 100, 0]);
  });
  it("envelopeToPoint:UTAUのenvelopeを全てノート頭からのmsに変換して返す。4点", () => {
    const point4 = envelopeToPoint(
      { point: [5, 5, 35, 10], value: [0, 100, 100, 60] },
      500
    );
    expect(point4.p).toEqual([5, 10, 500 - 45, 500 - 10]);
    expect(point4.v).toEqual([0, 100, 100, 60]);
  });
  it("envelopeToPoint:UTAUのenvelopeを全てノート頭からのmsに変換して返す。5点", () => {
    const point5 = envelopeToPoint(
      { point: [5, 5, 35, 10, 20], value: [0, 100, 100, 60, 50] },
      500
    );
    expect(point5.p).toEqual([5, 10, 500 - 45, 500 - 10, 30]);
    expect(point5.v).toEqual([0, 100, 100, 60, 50]);
  });

  it("validationY:値は0～200の整数にする。valueが''のときそのまま返す", () => {
    expect(validationY(0, "", [], [], 500)).toEqual({ p: [], v: [] });
  });
  it("validationY:値は0～200の整数にする。valueが負の数の時0", () => {
    expect(validationY(2, "-1", [0, 5, 35], [0, 100, 100], 500)).toEqual({
      p: [0, 5, 35],
      v: [0, 100, 0],
    });
  });
  it("validationY:値は0～200の整数にする。valueが200超過のとき200", () => {
    expect(validationY(2, "201", [0, 5, 35], [0, 100, 100], 500)).toEqual({
      p: [0, 5, 35],
      v: [0, 100, 200],
    });
  });
  it("validationY:値は0～200の整数にする。points.length===3でindexが3のときlengthを増やす", () => {
    expect(validationY(3, "50.1", [0, 5, 35], [0, 100, 100], 500)).toEqual({
      p: [0, 5, 35, 500],
      v: [0, 100, 100, 50],
    });
  });
  it("validationY:値は0～200の整数にする。points.length===3でindexが3のときlengthを2つ増やす", () => {
    expect(validationY(4, "50", [0, 5, 35], [0, 100, 100], 500)).toEqual({
      p: [0, 5, 35, 500, 5],
      v: [0, 100, 100, 0, 50],
    });
  });
  it("validationY:値は0～200の整数にする。points.length===4でindexが4のときlengthを増やす", () => {
    expect(
      validationY(4, "50", [0, 5, 35, 500], [0, 100, 100, 0], 500)
    ).toEqual({
      p: [0, 5, 35, 500, 5],
      v: [0, 100, 100, 0, 50],
    });
  });
  it("validationX:値は前後の値の範囲内の小数にする。valueが''のときそのまま返す", () => {
    expect(validationX(0, "", [], [], 500)).toEqual({ p: [], v: [] });
  });
  it("validationX:値は前後の値の範囲内の小数にする。indexが0でvalueが負の時0", () => {
    expect(validationX(0, "-1", [0, 5, 35], [0, 100, 100], 500)).toEqual({
      p: [0, 5, 35],
      v: [0, 100, 100],
    });
  });
  it("validationX:値は前後の値の範囲内の小数にする。indexが0でvalueがp2より大きいときp2", () => {
    expect(validationX(0, "10", [0, 5, 35], [0, 100, 100], 500)).toEqual({
      p: [5, 5, 35],
      v: [0, 100, 100],
    });
  });
  it("validationX:値は前後の値の範囲内の小数にする。indexが0正常系", () => {
    expect(validationX(0, "3", [0, 5, 35], [0, 100, 100], 500)).toEqual({
      p: [3, 5, 35],
      v: [0, 100, 100],
    });
  });
  it("validationX:値は前後の値の範囲内の小数にする。indexが1でvalueがp1未満の時p1", () => {
    expect(validationX(1, "3", [5, 10, 35], [0, 100, 100], 500)).toEqual({
      p: [5, 5, 35],
      v: [0, 100, 100],
    });
  });
  it("validationX:値は前後の値の範囲内の小数にする。indexが1でlengthが5未満valueがp3超過の時p3", () => {
    expect(validationX(1, "40", [5, 10, 35], [0, 100, 100], 500)).toEqual({
      p: [5, 35, 35],
      v: [0, 100, 100],
    });
  });
  it("validationX:値は前後の値の範囲内の小数にする。indexが1でlengthが5、valueがp5超過の時p5", () => {
    expect(
      validationX(1, "40", [5, 10, 35, 500, 20], [0, 100, 100, 0, 100], 500)
    ).toEqual({
      p: [5, 20, 35, 500, 20],
      v: [0, 100, 100, 0, 100],
    });
  });
  it("validationX:値は前後の値の範囲内の小数にする。indexが1正常系", () => {
    expect(validationX(1, "8", [5, 10, 35], [0, 100, 100], 500)).toEqual({
      p: [5, 8, 35],
      v: [0, 100, 100],
    });
  });
  it("validationX:値は前後の値の範囲内の小数にする。indexが2でlengthが5未満、valueがp1未満の時p1", () => {
    expect(validationX(2, "3", [5, 10, 35], [0, 100, 100], 500)).toEqual({
      p: [5, 10, 10],
      v: [0, 100, 100],
    });
  });
  it("validationX:値は前後の値の範囲内の小数にする。indexが2でlengthが5、valueがp5未満の時p5", () => {
    expect(
      validationX(2, "3", [5, 10, 35, 500, 20], [0, 100, 100, 0, 100], 500)
    ).toEqual({
      p: [5, 10, 20, 500, 20],
      v: [0, 100, 100, 0, 100],
    });
  });
  it("validationX:値は前後の値の範囲内の小数にする。indexが2でlengthが4未満、valueがmsLength超過の時msLength", () => {
    expect(validationX(2, "501", [5, 10, 35], [0, 100, 100], 500)).toEqual({
      p: [5, 10, 500],
      v: [0, 100, 100],
    });
  });
  it("validationX:値は前後の値の範囲内の小数にする。indexが2でlengthが4以上、valueがp4以上の時p4", () => {
    expect(
      validationX(2, "501", [5, 10, 35, 400], [0, 100, 100, 0], 500)
    ).toEqual({
      p: [5, 10, 400, 400],
      v: [0, 100, 100, 0],
    });
  });
  it("validationX:値は前後の値の範囲内の小数にする。indexが2正常系", () => {
    expect(
      validationX(2, "50", [5, 10, 35, 400], [0, 100, 100, 0], 500)
    ).toEqual({
      p: [5, 10, 50, 400],
      v: [0, 100, 100, 0],
    });
  });
  it("validationX:値は前後の値の範囲内の小数にする。indexが3でlengthが4未満の時lengthを増やす", () => {
    expect(validationX(3, "50", [5, 10, 35], [0, 100, 100], 500)).toEqual({
      p: [5, 10, 35, 50],
      v: [0, 100, 100, 0],
    });
  });
  it("validationX:値は前後の値の範囲内の小数にする。indexが3でvalueがp3未満の時p3", () => {
    expect(
      validationX(3, "30", [5, 10, 35, 50], [0, 100, 100, 100], 500)
    ).toEqual({
      p: [5, 10, 35, 35],
      v: [0, 100, 100, 100],
    });
  });
  it("validationX:値は前後の値の範囲内の小数にする。indexが3でvalueがmsLength超過の時msLength", () => {
    expect(
      validationX(3, "501", [5, 10, 35, 50], [0, 100, 100, 100], 500)
    ).toEqual({
      p: [5, 10, 35, 500],
      v: [0, 100, 100, 100],
    });
  });
  it("validationX:値は前後の値の範囲内の小数にする。indexが3正常系", () => {
    expect(
      validationX(3, "60", [5, 10, 35, 50], [0, 100, 100, 100], 500)
    ).toEqual({
      p: [5, 10, 35, 60],
      v: [0, 100, 100, 100],
    });
  });
  it("validationX:値は前後の値の範囲内の小数にする。indexが4でlengthが3の時lengthを2つ増やす", () => {
    expect(validationX(4, "20", [5, 10, 35], [0, 100, 100], 500)).toEqual({
      p: [5, 10, 35, 500, 20],
      v: [0, 100, 100, 0, 100],
    });
  });
  it("validationX:値は前後の値の範囲内の小数にする。indexが4でlengthが4の時lengthを増やす", () => {
    expect(
      validationX(4, "20", [5, 10, 35, 490], [0, 100, 100, 100], 500)
    ).toEqual({
      p: [5, 10, 35, 490, 20],
      v: [0, 100, 100, 100, 100],
    });
  });
  it("validationX:値は前後の値の範囲内の小数にする。indexが4でvalueがp2未満の時p2", () => {
    expect(
      validationX(4, "5", [5, 10, 35, 490, 20], [0, 100, 100, 100, 100], 500)
    ).toEqual({
      p: [5, 10, 35, 490, 10],
      v: [0, 100, 100, 100, 100],
    });
  });
  it("validationX:値は前後の値の範囲内の小数にする。indexが4でvalueがp3超過の時p3", () => {
    expect(
      validationX(4, "45", [5, 10, 35, 490, 20], [0, 100, 100, 100, 100], 500)
    ).toEqual({
      p: [5, 10, 35, 490, 35],
      v: [0, 100, 100, 100, 100],
    });
  });
  it("validationX:値は前後の値の範囲内の小数にする。indexが4正常系", () => {
    expect(
      validationX(4, "25", [5, 10, 35, 490, 20], [0, 100, 100, 100, 100], 500)
    ).toEqual({
      p: [5, 10, 35, 490, 25],
      v: [0, 100, 100, 100, 100],
    });
  });
  it("envelopeApply:編集結果をenvelopeに適用し、undoManagerに登録する。3点", () => {
    const n = new Note();
    n.index = 0;
    n.length = 480;
    n.notenum = 60;
    n.lyric = "あ";
    n.hasTempo = false;
    n.tempo = 120;
    n.preutter = 30;
    n.overlap = 10;
    expect(n.outputMs).toBe(530);
    const resultNotes = envelopeApply(n, [0, 5, 495], [0, 100, 100]);
    expect(resultNotes.envelope).toEqual({
      point: [0, 5, 35],
      value: [0, 100, 100],
    });
    const undoResult = undoManager.undo();
    const redoResult = undoManager.redo();
    expect(n).toEqual(undoResult[0]);
    expect(resultNotes).toEqual(redoResult[0]);
  });
  it("envelopeApply:編集結果をenvelopeに適用し、undoManagerに登録する。4点", () => {
    const n = new Note();
    n.index = 0;
    n.length = 480;
    n.notenum = 60;
    n.lyric = "あ";
    n.hasTempo = false;
    n.tempo = 120;
    n.preutter = 30;
    n.overlap = 10;
    expect(n.outputMs).toBe(530);
    const resultNotes = envelopeApply(n, [0, 5, 495, 520], [0, 100, 100, 0]);
    expect(resultNotes.envelope).toEqual({
      point: [0, 5, 25, 10],
      value: [0, 100, 100, 0],
    });
    const undoResult = undoManager.undo();
    const redoResult = undoManager.redo();
    expect(n).toEqual(undoResult[0]);
    expect(resultNotes).toEqual(redoResult[0]);
  });
  it("envelopeApply:編集結果をenvelopeに適用し、undoManagerに登録する。5点", () => {
    const n = new Note();
    n.index = 0;
    n.length = 480;
    n.notenum = 60;
    n.lyric = "あ";
    n.hasTempo = false;
    n.tempo = 120;
    n.preutter = 30;
    n.overlap = 10;
    expect(n.outputMs).toBe(530);
    const resultNotes = envelopeApply(
      n,
      [1, 5, 495, 520, 35],
      [0, 100, 100, 0, 100]
    );
    expect(resultNotes.envelope).toEqual({
      point: [1, 4, 25, 10, 30],
      value: [0, 100, 100, 0, 100],
    });
    const undoResult = undoManager.undo();
    const redoResult = undoManager.redo();
    expect(n).toEqual(undoResult[0]);
    expect(resultNotes).toEqual(redoResult[0]);
  });

  it("コンポーネント:noteがenvelopeを持たないとき、pointsとvaluesはデフォルト値", () => {
    const n = new Note();
    n.length = 480;
    n.tempo = 120;
    render(<EnvelopeDialog open={true} note={n} handleClose={() => {}} />);
    const pts = new Array();
    const vts = new Array();
    for (let i = 0; i < 5; i++) {
      pts.push(
        screen.getByRole("spinbutton", {
          name: `p${i + 1}`,
        })
      );
      vts.push(
        screen.getByRole("spinbutton", {
          name: `v${i + 1}`,
        })
      );
    }
    expect(pts[0]).toHaveValue(0);
    expect(pts[1]).toHaveValue(5);
    expect(pts[2]).toHaveValue(465);
    expect(pts[3]).toHaveValue(null);
    expect(pts[4]).toHaveValue(null);
    expect(vts[0]).toHaveValue(0);
    expect(vts[1]).toHaveValue(100);
    expect(vts[2]).toHaveValue(100);
    expect(vts[3]).toHaveValue(null);
    expect(vts[4]).toHaveValue(null);
  });
  it("コンポーネント:noteが再描画されたとき、値が更新される。", () => {
    const n = new Note();
    n.length = 480;
    n.tempo = 120;
    const n2 = new Note();
    n2.length = 480;
    n2.tempo = 120;
    n2.envelope = "5,10,30,0,100,100,0,%,10,20,100";

    const { rerender } = render(
      <EnvelopeDialog open={true} note={n} handleClose={() => {}} />
    );
    const pts = new Array();
    const vts = new Array();
    for (let i = 0; i < 5; i++) {
      pts.push(
        screen.getByRole("spinbutton", {
          name: `p${i + 1}`,
        })
      );
      vts.push(
        screen.getByRole("spinbutton", {
          name: `v${i + 1}`,
        })
      );
    }
    rerender(<EnvelopeDialog open={true} note={n2} handleClose={() => {}} />);
    expect(pts[0]).toHaveValue(5);
    expect(pts[1]).toHaveValue(15);
    expect(pts[2]).toHaveValue(460);
    expect(pts[3]).toHaveValue(490);
    expect(pts[4]).toHaveValue(35);
    expect(vts[0]).toHaveValue(0);
    expect(vts[1]).toHaveValue(100);
    expect(vts[2]).toHaveValue(100);
    expect(vts[3]).toHaveValue(0);
    expect(vts[4]).toHaveValue(100);
  });
  it("コンポーネント:各値の変更ができる", () => {
    const n = new Note();
    n.length = 480;
    n.tempo = 120;
    render(<EnvelopeDialog open={true} note={n} handleClose={() => {}} />);
    const pts = new Array();
    const vts = new Array();
    for (let i = 0; i < 5; i++) {
      pts.push(
        screen.getByRole("spinbutton", {
          name: `p${i + 1}`,
        })
      );
      vts.push(
        screen.getByRole("spinbutton", {
          name: `v${i + 1}`,
        })
      );
    }
    fireEvent.change(pts[0], { target: { value: "5" } });
    fireEvent.change(pts[1], { target: { value: "15" } });
    fireEvent.change(pts[2], { target: { value: "460" } });
    fireEvent.change(pts[3], { target: { value: "490" } });
    fireEvent.change(pts[4], { target: { value: "35" } });
    fireEvent.change(vts[0], { target: { value: "0" } });
    fireEvent.change(vts[1], { target: { value: "100" } });
    fireEvent.change(vts[2], { target: { value: "100" } });
    fireEvent.change(vts[3], { target: { value: "0" } });
    fireEvent.change(vts[4], { target: { value: "100" } });
    expect(pts[0]).toHaveValue(5);
    expect(pts[1]).toHaveValue(15);
    expect(pts[2]).toHaveValue(460);
    expect(pts[3]).toHaveValue(490);
    expect(pts[4]).toHaveValue(35);
    expect(vts[0]).toHaveValue(0);
    expect(vts[1]).toHaveValue(100);
    expect(vts[2]).toHaveValue(100);
    expect(vts[3]).toHaveValue(0);
    expect(vts[4]).toHaveValue(100);
  });
  it("コンポーネント:ボタンをクリックするとエンベロープの適用を確定する", () => {
    const n = new Note();
    n.length = 480;
    n.tempo = 120;
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes([n]);
    const dialogCloseSpy = vi.fn();
    const { rerender } = render(
      <EnvelopeDialog open={true} note={n} handleClose={dialogCloseSpy} />
    );
    const pts = new Array();
    const vts = new Array();
    for (let i = 0; i < 5; i++) {
      pts.push(
        screen.getByRole("spinbutton", {
          name: `p${i + 1}`,
        })
      );
      vts.push(
        screen.getByRole("spinbutton", {
          name: `v${i + 1}`,
        })
      );
    }
    fireEvent.change(pts[0], { target: { value: "5" } });
    fireEvent.change(pts[1], { target: { value: "15" } });
    fireEvent.change(pts[2], { target: { value: "460" } });
    fireEvent.change(pts[3], { target: { value: "490" } });
    fireEvent.change(pts[4], { target: { value: "35" } });
    fireEvent.change(vts[0], { target: { value: "0" } });
    fireEvent.change(vts[1], { target: { value: "100" } });
    fireEvent.change(vts[2], { target: { value: "100" } });
    fireEvent.change(vts[3], { target: { value: "0" } });
    fireEvent.change(vts[4], { target: { value: "100" } });
    //処理の実行

    const button = screen.getByRole("button", {
      name: /editor\.envelopeDialog\.submitButton/i,
    });
    fireEvent.click(button);
    //ダイアログが閉じているはず
    expect(dialogCloseSpy).toHaveBeenCalled();
    rerender(
      <EnvelopeDialog
        open={false}
        note={undefined}
        handleClose={dialogCloseSpy}
      />
    );
    const resultNotes = useMusicProjectStore.getState().notes;
    expect(resultNotes[0].envelope).toEqual({
      point: [5, 10, 30, 10, 20],
      value: [0, 100, 100, 0, 100],
    });
  });
});
