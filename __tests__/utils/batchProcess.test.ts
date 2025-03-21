import { beforeEach, describe, expect, it, vi } from "vitest";
import { LOG } from "../../src/lib/Logging";
import { Note } from "../../src/lib/Note";
import { executeBatchProcess } from "../../src/utils/batchProcess";

const createNote = (index: number, notenum: number): Note => {
  const n = new Note();
  n.index = index;
  n.notenum = notenum;
  n.lyric = "あ";
  n.length = 480;
  n.tempo = 120;
  n.hasTempo = false;
  return n;
};

const createNotes = (): Array<Note> => {
  const notes = new Array();
  notes.push(createNote(0, 60));
  notes.push(createNote(1, 61));
  notes.push(createNote(2, 62));
  notes.push(createNote(3, 63));
  notes.push(createNote(4, 64));
  notes.forEach((n, i) => {
    n.prev = i === 0 ? undefined : notes[i - 1];
    n.next = i === notes.length - 1 ? undefined : notes[i + 1];
  });
  return notes;
};

const dummyProcess = <T>(targetNotes: Note[], options?: T): Note[] => {
  const updatedNote = targetNotes.map((n) => n.deepCopy());
  updatedNote.forEach((n) => (n.notenum = n.notenum + 1));
  return updatedNote;
};
const dummyProcessWithOption = (
  targetNotes: Note[],
  options?: number
): Note[] => {
  const updatedNote = targetNotes.map((n) => n.deepCopy());
  updatedNote.forEach(
    (n) => (n.notenum = n.notenum + (options === undefined ? 0 : options))
  );
  return updatedNote;
};

const applyOtoSpy = vi
  .spyOn(Note.prototype, "applyOto")
  .mockImplementation(() => {});

describe("batchProcess", () => {
  let resultNotes: Note[];
  beforeEach(() => {
    LOG.datas = [];
    resultNotes = [];
    vi.clearAllMocks();
  });
  it("selectNotesIndexに沿ってtargetNotesが選択される", () => {
    // targetNotesは公開されていない変数だが、ログが出力されるはず
    executeBatchProcess<void>(
      [0, 1, 2],
      createNotes(),
      (n) => {},
      null,
      dummyProcess,
      undefined
    );
    expect(
      LOG.datas[0].endsWith(
        `selectedIndex:${[0, 1, 2]}、selectedNotes:${3}、target:${3}`
      )
    ).toBe(true);
  });
  it("selectNotesIndexが空配列のとき、全てのノートがターゲットになる", () => {
    // targetNotesは公開されていない変数だが、ログが出力されるはず
    executeBatchProcess<void>(
      [],
      createNotes(),
      (n) => {},
      null,
      dummyProcess,
      undefined
    );
    expect(
      LOG.datas[0].endsWith(
        `selectedIndex:${[]}、selectedNotes:${0}、target:${5}`
      )
    ).toBe(true);
  });
  it("selectNotesIndexに不正なindexが含まれていても無視される", () => {
    // targetNotesは公開されていない変数だが、ログが出力されるはず
    executeBatchProcess<void>(
      [-1, 1, 6],
      createNotes(),
      (n) => {},
      null,
      dummyProcess,
      undefined
    );
    expect(
      LOG.datas[0].endsWith(
        `selectedIndex:${[1]}、selectedNotes:${1}、target:${1}`
      )
    ).toBe(true);
  });
  it("selectNotesIndexが全て不正なindexの場合、空配列を渡した場合と等価", () => {
    // targetNotesは公開されていない変数だが、ログが出力されるはず
    executeBatchProcess<void>(
      [-1, 6],
      createNotes(),
      (n) => {},
      null,
      dummyProcess,
      undefined
    );
    expect(
      LOG.datas[0].endsWith(
        `selectedIndex:${[]}、selectedNotes:${0}、target:${5}`
      )
    ).toBe(true);
  });
  it("vbがnullであればapplyOtoは呼ばれない", () => {
    executeBatchProcess<void>(
      [],
      createNotes(),
      (n) => {},
      null,
      dummyProcess,
      undefined
    );
    expect(applyOtoSpy).not.toHaveBeenCalled();
  });
  it("vbが非nullであればapplyOtoがtargetNotesの数呼ばれる", () => {
    //@ts-expect-error testのためにわざと変な値を渡す
    executeBatchProcess<void>(
      [],
      createNotes(),
      (n) => {},
      {},
      dummyProcess,
      undefined
    );
    expect(applyOtoSpy).toHaveBeenCalledTimes(5);
    expect((applyOtoSpy.mock.instances[0] as unknown as Note).index).toBe(0);
    expect((applyOtoSpy.mock.instances[1] as unknown as Note).index).toBe(1);
    expect((applyOtoSpy.mock.instances[2] as unknown as Note).index).toBe(2);
    expect((applyOtoSpy.mock.instances[3] as unknown as Note).index).toBe(3);
    expect((applyOtoSpy.mock.instances[4] as unknown as Note).index).toBe(4);
  });
  it("vbが非nullでselectNotesがあった場合、狙ったnotesだけapplyOtoが呼ばれる", () => {
    //@ts-expect-error testのためにわざと変な値を渡す
    executeBatchProcess<void>(
      [0, 2, 4],
      createNotes(),
      (n) => {},
      {},
      dummyProcess,
      undefined
    );
    expect(applyOtoSpy).toHaveBeenCalledTimes(3);
    expect((applyOtoSpy.mock.instances[0] as unknown as Note).index).toBe(0);
    expect((applyOtoSpy.mock.instances[1] as unknown as Note).index).toBe(2);
    expect((applyOtoSpy.mock.instances[2] as unknown as Note).index).toBe(4);
  });
  it("selectNotesIndexに沿ってnoteが更新される", () => {
    const notes = createNotes();
    executeBatchProcess<void>(
      [0, 1, 2],
      notes,
      (n) => {
        resultNotes = n;
      },
      null,
      dummyProcess,
      undefined
    );
    expect(resultNotes.length).toBe(5);
    //0～2はnotenumが1上がる
    expect(resultNotes[0].notenum).toBe(61);
    expect(resultNotes[1].notenum).toBe(62);
    expect(resultNotes[2].notenum).toBe(63);
    //元のノートは変更されていない
    expect(notes[0].notenum).toBe(60);
    expect(notes[1].notenum).toBe(61);
    expect(notes[2].notenum).toBe(62);
    //3,4はnotenumがそのまま
    expect(resultNotes[3].notenum).toBe(63);
    expect(resultNotes[4].notenum).toBe(64);
    //リンクの修正は本来setNotes内で行われるが、このテストではモックしているため確認は行わない
  });
  it("selectNotesIndexが空配列の場合、全てのnoteが更新される", () => {
    const notes = createNotes();
    executeBatchProcess<void>(
      [],
      createNotes(),
      (n) => {
        resultNotes = n;
      },
      null,
      dummyProcess,
      undefined
    );
    expect(resultNotes.length).toBe(5);
    //0～2はnotenumが1上がる
    expect(resultNotes[0].notenum).toBe(61);
    expect(resultNotes[1].notenum).toBe(62);
    expect(resultNotes[2].notenum).toBe(63);
    expect(resultNotes[3].notenum).toBe(64);
    expect(resultNotes[4].notenum).toBe(65);
    //元のノートは変更されていない
    expect(notes[0].notenum).toBe(60);
    expect(notes[1].notenum).toBe(61);
    expect(notes[2].notenum).toBe(62);
    expect(notes[3].notenum).toBe(63);
    expect(notes[4].notenum).toBe(64);
    //リンクの修正は本来setNotes内で行われるが、このテストではモックしているため確認は行わない
  });
  it("processFnに適切に引数が渡る", () => {
    executeBatchProcess<number>(
      [],
      createNotes(),
      (n) => {
        resultNotes = n;
      },
      null,
      dummyProcessWithOption,
      2
    );
    expect(resultNotes.length).toBe(5);
    //0～2はnotenumが1上がる
    expect(resultNotes[0].notenum).toBe(62);
    expect(resultNotes[1].notenum).toBe(63);
    expect(resultNotes[2].notenum).toBe(64);
    expect(resultNotes[3].notenum).toBe(65);
    expect(resultNotes[4].notenum).toBe(66);
    //リンクの修正は本来setNotes内で行われるが、このテストではモックしているため確認は行わない
  });
});
