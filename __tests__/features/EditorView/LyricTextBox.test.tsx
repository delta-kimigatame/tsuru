import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LyricTextBox } from "../../../src/features/EditorView/LyricTextBox";
import { BaseVoiceBank } from "../../../src/lib/BaseVoiceBank";
import { Note } from "../../../src/lib/Note";
import { undoManager } from "../../../src/lib/UndoManager";
import { Ust } from "../../../src/lib/Ust";
import { useMusicProjectStore } from "../../../src/store/musicProjectStore";

describe("LyricTextBox", () => {
  beforeEach(() => {
    undoManager.clear();

    // Mock VoiceBank
    const mockVb = {
      getOtoRecord: vi.fn().mockReturnValue({}),
    } as unknown as BaseVoiceBank;

    const store = useMusicProjectStore.getState();
    store.setVb(mockVb);
  });

  it("LyricTextBox: targetNoteIndexがundefinedの時、Menuは表示されない", () => {
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes([]);
    const setTargetNoteIndexSpy = vi.fn();

    render(
      <LyricTextBox
        targetNoteIndex={undefined}
        setTargetNoteIndex={setTargetNoteIndexSpy}
        lyricAnchor={{ x: 100, y: 100 }}
      />
    );

    const textField = screen.queryByTestId("propertyLyric");
    expect(textField).not.toBeInTheDocument();
  });

  it("LyricTextBox: targetNoteIndexが定義されている時、Menuが表示され、ノートの歌詞が初期値になる", () => {
    const n1 = new Note();
    n1.lyric = "あ";
    n1.notenum = 60;
    n1.tempo = 120;
    n1.length = 480;
    n1.prev = { tempo: 120, length: 480, lyric: "R" };
    n1.index = 0;
    const n2 = new Note();
    n2.lyric = "い";
    n2.notenum = 62;
    n2.tempo = 120;
    n2.length = 480;
    n2.prev = { tempo: 120, length: 480, lyric: "あ" };
    n2.index = 1;

    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes([n1, n2]);
    const setTargetNoteIndexSpy = vi.fn();

    render(
      <LyricTextBox
        targetNoteIndex={1}
        setTargetNoteIndex={setTargetNoteIndexSpy}
        lyricAnchor={{ x: 100, y: 100 }}
      />
    );

    const textField = screen.getByRole("textbox");
    expect(textField).toBeInTheDocument();
    expect(textField).toHaveValue("い");
  });

  it("LyricTextBox: TextFieldの値を変更できる", async () => {
    const n = new Note();
    n.lyric = "あ";
    n.notenum = 60;
    n.tempo = 120;
    n.length = 480;
    n.prev = { tempo: 120, length: 480, lyric: "R" };
    n.index = 0;

    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes([n]);
    const setTargetNoteIndexSpy = vi.fn();

    render(
      <LyricTextBox
        targetNoteIndex={0}
        setTargetNoteIndex={setTargetNoteIndexSpy}
        lyricAnchor={{ x: 100, y: 100 }}
      />
    );

    const textField = screen.getByRole("textbox");
    expect(textField).toHaveValue("あ");

    const user = userEvent.setup();
    await user.clear(textField);
    await user.type(textField, "か");

    expect(textField).toHaveValue("か");
  });

  it("LyricTextBox: Menuを閉じると歌詞が更新され、setTargetNoteIndexが呼ばれ、undoManagerに登録される", async () => {
    const n = new Note();
    n.lyric = "あ";
    n.notenum = 60;
    n.tempo = 120;
    n.length = 480;
    n.prev = { tempo: 120, length: 480, lyric: "R" };
    n.index = 0;

    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes([n]);
    const setTargetNoteIndexSpy = vi.fn();

    const { container } = render(
      <LyricTextBox
        targetNoteIndex={0}
        setTargetNoteIndex={setTargetNoteIndexSpy}
        lyricAnchor={{ x: 100, y: 100 }}
      />
    );

    const textField = screen.getByRole("textbox");
    const user = userEvent.setup();
    await user.clear(textField);
    await user.type(textField, "さ");

    // EscキーでMenuを閉じる
    await user.keyboard("{Escape}");

    await waitFor(() => {
      // setTargetNoteIndexが呼ばれる
      expect(setTargetNoteIndexSpy).toHaveBeenCalledWith(undefined);
    });

    // notesが更新される
    const updatedNotes = useMusicProjectStore.getState().notes;
    expect(updatedNotes[0].lyric).toBe("さ");

    // undoManagerに登録される
    const undoResult = undoManager.undo();
    expect(undoResult[0].lyric).toBe("あ");

    const redoResult = undoManager.redo();
    expect(redoResult[0].lyric).toBe("さ");
  });

  it("LyricTextBox: targetNoteIndexがundefinedからインデックスに変わると、その歌詞が表示される", () => {
    const n = new Note();
    n.lyric = "た";
    n.notenum = 60;
    n.tempo = 120;
    n.length = 480;
    n.prev = { tempo: 120, length: 480, lyric: "R" };
    n.index = 0;

    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes([n]);
    const setTargetNoteIndexSpy = vi.fn();

    const { rerender } = render(
      <LyricTextBox
        targetNoteIndex={undefined}
        setTargetNoteIndex={setTargetNoteIndexSpy}
        lyricAnchor={{ x: 100, y: 100 }}
      />
    );

    // 最初はMenuが表示されない
    let textField = screen.queryByTestId("propertyLyric");
    expect(textField).not.toBeInTheDocument();

    // targetNoteIndexを設定
    rerender(
      <LyricTextBox
        targetNoteIndex={0}
        setTargetNoteIndex={setTargetNoteIndexSpy}
        lyricAnchor={{ x: 100, y: 100 }}
      />
    );

    // Menuが表示され、歌詞が設定される
    textField = screen.getByRole("textbox");
    expect(textField).toBeInTheDocument();
    expect(textField).toHaveValue("た");
  });

  it("LyricTextBox: targetNoteIndexがインデックスからundefinedに変わると、Menuが非表示になる", () => {
    const n = new Note();
    n.lyric = "な";
    n.notenum = 60;
    n.tempo = 120;
    n.length = 480;
    n.prev = { tempo: 120, length: 480, lyric: "R" };
    n.index = 0;

    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes([n]);
    const setTargetNoteIndexSpy = vi.fn();

    const { rerender } = render(
      <LyricTextBox
        targetNoteIndex={0}
        setTargetNoteIndex={setTargetNoteIndexSpy}
        lyricAnchor={{ x: 100, y: 100 }}
      />
    );

    // 最初はMenuが表示される
    let textField = screen.queryByTestId("propertyLyric");
    expect(textField).toBeInTheDocument();

    // targetNoteIndexをundefinedに設定
    rerender(
      <LyricTextBox
        targetNoteIndex={undefined}
        setTargetNoteIndex={setTargetNoteIndexSpy}
        lyricAnchor={{ x: 100, y: 100 }}
      />
    );

    // Menuが非表示になる
    textField = screen.queryByTestId("propertyLyric");
    expect(textField).not.toBeInTheDocument();
  });
});
