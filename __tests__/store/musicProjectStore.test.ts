import fs from "fs";
import JSZip from "jszip";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { Note } from "../../src/lib/Note";
import { Ust } from "../../src/lib/Ust";
import { VoiceBank } from "../../src/lib/VoiceBanks/VoiceBank";
import { useMusicProjectStore } from "../../src/store/musicProjectStore";

describe("musicProjectStore", () => {
  let vb: VoiceBank;
  let u: Ust;

  beforeAll(async () => {
    // VoiceBankを読み込む準備
    const buffer = fs.readFileSync("./__tests__/__fixtures__/testVB.zip");
    const zip = new JSZip();
    const td = new TextDecoder("shift-jis");
    await zip.loadAsync(buffer, {
      decodeFileName: (fileNameBinary: Uint8Array) => td.decode(fileNameBinary),
    });
    vb = new VoiceBank(zip.files);
    await vb.initialize();
    const ustBuf = fs.readFileSync("./__tests__/__fixtures__/testustCV.ust");
    u = new Ust();
  });
  beforeEach(() => {
    useMusicProjectStore.setState({
      vb: null,
      ustTempo: 120,
      ustFlags: "",
      notes: [],
    });
  });
  it("defaultValue", () => {
    const store = useMusicProjectStore.getState();
    expect(store.ust).toBeNull();
    expect(store.vb).toBeNull();
    expect(store.ustTempo).toBe(120);
    expect(store.ustFlags).toBe("");
    expect(store.notes).toEqual([]);
  });
  it("setUst", () => {
    const { setUst } = useMusicProjectStore.getState();
    setUst(u);

    const store = useMusicProjectStore.getState();
    expect(store.ust).toBe(u);
  });
  it("setVb", () => {
    const { setVb } = useMusicProjectStore.getState();
    setVb(vb);

    const store = useMusicProjectStore.getState();
    expect(store.vb).toBe(vb);
  });
  it("setUstTempo", () => {
    const { setUstTempo } = useMusicProjectStore.getState();
    setUstTempo(150);

    const store = useMusicProjectStore.getState();
    expect(store.ustTempo).toBe(150);
  });
  it("setUstFlags", () => {
    const { setUstFlags } = useMusicProjectStore.getState();
    setUstFlags("some_flags");

    const store = useMusicProjectStore.getState();
    expect(store.ustFlags).toBe("some_flags");
  });

  it("setNoteProperty", () => {
    const { setNoteProperty } = useMusicProjectStore.getState();
    const n = new Note();
    n.length = 480;
    n.index = 0;
    n.lyric = "あ";
    const n2 = new Note();
    n.length = 480;
    n.index = 0;
    n.lyric = "あ";
    const initialStore = useMusicProjectStore.getState();
    initialStore.notes.push(n);
    initialStore.notes.push(n2);
    expect(initialStore.notes[0].lyric).toBe("あ");
    setNoteProperty(0, "lyric", "い");
    const updatedStore = useMusicProjectStore.getState();
    expect(updatedStore.notes[0].lyric).toBe("い");

    //setNotePropertyによってindexとリンクが更新されていることを確認
    expect(updatedStore.notes[0].index).toBe(0);
    expect(updatedStore.notes[0].prev).toBe(undefined);
    expect(updatedStore.notes[0].next).toBe(updatedStore.notes[1]);
    expect(updatedStore.notes[1].index).toBe(1);
    expect(updatedStore.notes[1].prev).toBe(updatedStore.notes[0]);
    expect(updatedStore.notes[1].next).toBe(undefined);
    // ust.notesとnotesが同じオブジェクトを参照していることの確認
    expect(updatedStore.notes).toBe(updatedStore.ust?.notes);
  });

  it("setNote", () => {
    const { setNote } = useMusicProjectStore.getState();
    const n = new Note();
    n.length = 480;
    n.index = 0;
    n.lyric = "あ";
    const n2 = new Note();
    n2.length = 480;
    n2.index = 1;
    n2.lyric = "あ";
    const newNote = new Note();
    newNote.length = 240;
    newNote.index = 0;
    newNote.lyric = "い";
    const initialStore = useMusicProjectStore.getState();
    initialStore.notes.push(n);
    initialStore.notes.push(n2);
    expect(initialStore.notes[0].lyric).toBe("あ");
    expect(initialStore.notes[0].length).toBe(480);
    expect(initialStore.notes[1].lyric).toBe("あ");
    expect(initialStore.notes[1].length).toBe(480);
    setNote(0, newNote);
    const updatedStore = useMusicProjectStore.getState();
    expect(updatedStore.notes[0].lyric).toBe("い");
    expect(updatedStore.notes[0].length).toBe(240);
    expect(updatedStore.notes[1].lyric).toBe("あ");
    expect(updatedStore.notes[1].length).toBe(480);
    //setNoteによってindexとリンクが更新されていることを確認
    expect(updatedStore.notes[0].index).toBe(0);
    expect(updatedStore.notes[0].prev).toBe(undefined);
    expect(updatedStore.notes[0].next).toBe(updatedStore.notes[1]);
    expect(updatedStore.notes[1].index).toBe(1);
    expect(updatedStore.notes[1].prev).toBe(updatedStore.notes[0]);
    expect(updatedStore.notes[1].next).toBe(undefined);
    // ust.notesとnotesが同じオブジェクトを参照していることの確認
    expect(updatedStore.notes).toBe(updatedStore.ust?.notes);
  });

  it("setNotes", () => {
    const { setNotes } = useMusicProjectStore.getState();
    const n = new Note();
    n.length = 480;
    n.index = 0;
    n.lyric = "あ";
    const n2 = new Note();
    n2.length = 480;
    n2.index = 1;
    n2.lyric = "あ";
    const newNote = new Note();
    newNote.length = 240;
    newNote.index = 0;
    newNote.lyric = "い";
    const notes = new Array<Note>();
    notes.push(n);
    notes.push(n2);
    const newNotes = new Array<Note>();
    newNotes.push(newNote);
    newNotes.push(n2);
    /** setNotesが初期化に使えることの確認 */
    setNotes(notes);
    const updatedStore = useMusicProjectStore.getState();
    expect(updatedStore.notes[0].lyric).toBe("あ");
    expect(updatedStore.notes[0].length).toBe(480);
    expect(updatedStore.notes[1].lyric).toBe("あ");
    expect(updatedStore.notes[1].length).toBe(480);
    //setNotesによってindexとリンクが更新されていることを確認
    expect(updatedStore.notes[0].index).toBe(0);
    expect(updatedStore.notes[0].prev).toBe(undefined);
    expect(updatedStore.notes[0].next).toBe(updatedStore.notes[1]);
    expect(updatedStore.notes[1].index).toBe(1);
    expect(updatedStore.notes[1].prev).toBe(updatedStore.notes[0]);
    expect(updatedStore.notes[1].next).toBe(undefined);
    // ust.notesとnotesが同じオブジェクトを参照していることの確認
    expect(updatedStore.notes).toBe(updatedStore.ust?.notes);
    /** setNotesが更新に使えることの確認 */
    setNotes(newNotes);
    const updatedStore2 = useMusicProjectStore.getState();
    expect(updatedStore2.notes[0].lyric).toBe("い");
    expect(updatedStore2.notes[0].length).toBe(240);
    expect(updatedStore2.notes[1].lyric).toBe("あ");
    expect(updatedStore2.notes[1].length).toBe(480);
    //setNotesによってindexとリンクが更新されていることを確認
    expect(updatedStore2.notes[0].index).toBe(0);
    expect(updatedStore2.notes[0].prev).toBe(undefined);
    expect(updatedStore2.notes[0].next).toBe(updatedStore2.notes[1]);
    expect(updatedStore2.notes[1].index).toBe(1);
    expect(updatedStore2.notes[1].prev).toBe(updatedStore2.notes[0]);
    expect(updatedStore2.notes[1].next).toBe(undefined);
    // ust.notesとnotesが同じオブジェクトを参照していることの確認
    expect(updatedStore2.notes).toBe(updatedStore2.ust?.notes);
  });

  it("無効なインデックスの場合、状態変更が行われない", () => {
    const initialStore = useMusicProjectStore.getState();
    // 2つのノートがある状態を用意
    const note1 = new Note();
    note1.length = 480;
    note1.index = 0;
    note1.lyric = "あ";
    const note2 = new Note();
    note2.length = 480;
    note2.index = 1;
    note2.lyric = "あ";
    initialStore.notes = [note1, note2];
    // 現在の状態を保存
    const originalNotes = [...initialStore.notes];

    // 負のインデックスの場合
    const { setNoteProperty, setNote } = useMusicProjectStore.getState();
    setNoteProperty(-1, "lyric", "い");
    setNoteProperty(2, "lyric", "い");
    // 配列の長さ以上の場合
    setNote(-1, new Note());
    setNote(2, new Note());

    const updatedStore = useMusicProjectStore.getState();
    // notesが変更されていないことを確認
    expect(updatedStore.notes).toEqual(originalNotes);
  });
});
