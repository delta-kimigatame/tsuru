import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotePasteDialog } from "../../../src/features/EditorView/NotePasteDialog";
import { Note } from "../../../src/lib/Note";
import { undoManager } from "../../../src/lib/UndoManager";
import { Ust } from "../../../src/lib/Ust";
import { useMusicProjectStore } from "../../../src/store/musicProjectStore";

// clipboard APIのモック
const mockClipboard = {
  readText: vi.fn(),
};

Object.assign(navigator, {
  clipboard: mockClipboard,
});

describe("NotePasteDialog", () => {
  beforeEach(() => {
    undoManager.clear();
    vi.clearAllMocks();
  });

  const createTestNotes = () => {
    const notes = [];
    for (let i = 0; i < 3; i++) {
      const n = new Note();
      n.index = i;
      n.lyric = ["あ", "い", "う"][i];
      n.length = 480;
      n.notenum = 60 + i;
      n.preutter = 10;
      n.overlap = 5;
      n.intensity = 100;
      n.tempo = 120;
      n.prev = { tempo: 120, length: 480, lyric: "R" };
      notes.push(n);
    }
    return notes;
  };

  const createClipboardUst = () => {
    return `[#VERSION]
UST Version1.2
[#SETTING]
Tempo=120.00
[#0000]
Length=480
Lyric=か
NoteNum=65
PreUtterance=15
[#0001]
Length=960
Lyric=き
NoteNum=66
PreUtterance=20
[#0002]
Length=240
Lyric=く
NoteNum=67
PreUtterance=25
[#TRACKEND]`;
  };

  it("NotePasteDialog: ダイアログが開く", () => {
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes(createTestNotes());
    const handleCloseSpy = vi.fn();

    render(
      <NotePasteDialog
        open={true}
        selectedNotesIndex={[0, 1, 2]}
        handleClose={handleCloseSpy}
      />
    );

    // チェックボックスが表示される
    const lyricCheckbox = screen.getByRole("checkbox", {
      name: /editor\.notePaste\.lyric/i,
    });
    const lengthCheckbox = screen.getByRole("checkbox", {
      name: /editor\.notePaste\.length/i,
    });
    expect(lyricCheckbox).toBeInTheDocument();
    expect(lengthCheckbox).toBeInTheDocument();
    expect(lyricCheckbox).not.toBeChecked();
    expect(lengthCheckbox).not.toBeChecked();
  });

  it("NotePasteDialog: チェックボックスをクリックすると状態が変わる", () => {
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes(createTestNotes());
    const handleCloseSpy = vi.fn();

    render(
      <NotePasteDialog
        open={true}
        selectedNotesIndex={[0, 1, 2]}
        handleClose={handleCloseSpy}
      />
    );

    const lyricCheckbox = screen.getByRole("checkbox", {
      name: /editor\.notePaste\.lyric/i,
    });
    const lengthCheckbox = screen.getByRole("checkbox", {
      name: /editor\.notePaste\.length/i,
    });

    // 初期状態はチェックされていない
    expect(lyricCheckbox).not.toBeChecked();
    expect(lengthCheckbox).not.toBeChecked();

    // クリックするとチェックされる
    fireEvent.click(lyricCheckbox);
    fireEvent.click(lengthCheckbox);

    expect(lyricCheckbox).toBeChecked();
    expect(lengthCheckbox).toBeChecked();
  });

  it("NotePasteDialog: 実行ボタンをクリックするとクリップボードから貼り付けが実行される", async () => {
    mockClipboard.readText.mockResolvedValue(createClipboardUst());

    const notes = createTestNotes();
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes(notes);
    const handleCloseSpy = vi.fn();

    render(
      <NotePasteDialog
        open={true}
        selectedNotesIndex={[0, 1, 2]}
        handleClose={handleCloseSpy}
      />
    );

    // lyricとlengthをチェック
    const lyricCheckbox = screen.getByRole("checkbox", {
      name: /editor\.notePaste\.lyric/i,
    });
    const lengthCheckbox = screen.getByRole("checkbox", {
      name: /editor\.notePaste\.length/i,
    });
    fireEvent.click(lyricCheckbox);
    fireEvent.click(lengthCheckbox);

    // 実行ボタンをクリック
    const button = screen.getByRole("button", {
      name: /editor\.notePaste\.submitButton/i,
    });
    fireEvent.click(button);

    // 非同期処理を待つ
    await waitFor(() => {
      expect(handleCloseSpy).toHaveBeenCalled();
    });

    // notesが更新される
    const updatedNotes = useMusicProjectStore.getState().notes;
    expect(updatedNotes[0].lyric).toBe("か");
    expect(updatedNotes[0].length).toBe(480);
    expect(updatedNotes[1].lyric).toBe("き");
    expect(updatedNotes[1].length).toBe(960);
    expect(updatedNotes[2].lyric).toBe("く");
    expect(updatedNotes[2].length).toBe(240);
  });

  it("NotePasteDialog: preutterをチェックすると貼り付けられる", async () => {
    mockClipboard.readText.mockResolvedValue(createClipboardUst());

    const notes = createTestNotes();
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes(notes);
    const handleCloseSpy = vi.fn();

    render(
      <NotePasteDialog
        open={true}
        selectedNotesIndex={[0, 1, 2]}
        handleClose={handleCloseSpy}
      />
    );

    // preutterをチェック
    const preutterCheckbox = screen.getByRole("checkbox", {
      name: /editor\.notePaste\.preutter/i,
    });
    fireEvent.click(preutterCheckbox);

    // 実行ボタンをクリック
    const button = screen.getByRole("button", {
      name: /editor\.notePaste\.submitButton/i,
    });
    fireEvent.click(button);

    await waitFor(
      () => {
        expect(handleCloseSpy).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );

    // preutterが更新される
    const updatedNotes = useMusicProjectStore.getState().notes;
    expect(updatedNotes[0].preutter).toBe(15);
    expect(updatedNotes[1].preutter).toBe(20);
    expect(updatedNotes[2].preutter).toBe(25);
  });

  it("NotePasteDialog: selectedNotesIndexが空の場合、何も実行されない", async () => {
    mockClipboard.readText.mockResolvedValue(createClipboardUst());

    const notes = createTestNotes();
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes(notes);
    const handleCloseSpy = vi.fn();

    render(
      <NotePasteDialog
        open={true}
        selectedNotesIndex={[]}
        handleClose={handleCloseSpy}
      />
    );

    const lyricCheckbox = screen.getByRole("checkbox", {
      name: /editor\.notePaste\.lyric/i,
    });
    fireEvent.click(lyricCheckbox);

    const button = screen.getByRole("button", {
      name: /editor\.notePaste\.submitButton/i,
    });
    fireEvent.click(button);

    await waitFor(() => {
      // クリップボード読み取りは実行されない
      expect(mockClipboard.readText).not.toHaveBeenCalled();
    });

    // notesは変更されない
    const updatedNotes = useMusicProjectStore.getState().notes;
    expect(updatedNotes[0].lyric).toBe("あ");
  });

  it("NotePasteDialog: selectedNotesIndexに負の値や範囲外の値が含まれる場合、フィルタリングされる", async () => {
    mockClipboard.readText.mockResolvedValue(createClipboardUst());

    const notes = createTestNotes();
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes(notes);
    const handleCloseSpy = vi.fn();

    render(
      <NotePasteDialog
        open={true}
        selectedNotesIndex={[-1, 0, 1, 100]}
        handleClose={handleCloseSpy}
      />
    );

    const lyricCheckbox = screen.getByRole("checkbox", {
      name: /editor\.notePaste\.lyric/i,
    });
    fireEvent.click(lyricCheckbox);

    const button = screen.getByRole("button", {
      name: /editor\.notePaste\.submitButton/i,
    });
    fireEvent.click(button);

    await waitFor(() => {
      expect(handleCloseSpy).toHaveBeenCalled();
    });

    // 有効なインデックス(0,1)のみ更新される
    const updatedNotes = useMusicProjectStore.getState().notes;
    expect(updatedNotes[0].lyric).toBe("か");
    expect(updatedNotes[1].lyric).toBe("き");
    expect(updatedNotes[2].lyric).toBe("う"); // 更新されない
  });

  it("NotePasteDialog: クリップボードが無効な場合、handleCloseが呼ばれる", async () => {
    mockClipboard.readText.mockRejectedValue(new Error("Clipboard error"));

    const notes = createTestNotes();
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes(notes);
    const handleCloseSpy = vi.fn();

    render(
      <NotePasteDialog
        open={true}
        selectedNotesIndex={[0]}
        handleClose={handleCloseSpy}
      />
    );

    const lyricCheckbox = screen.getByRole("checkbox", {
      name: /editor\.notePaste\.lyric/i,
    });
    fireEvent.click(lyricCheckbox);

    const button = screen.getByRole("button", {
      name: /editor\.notePaste\.submitButton/i,
    });
    fireEvent.click(button);

    // クリップボードエラー後、handleCloseが呼ばれる
    await waitFor(
      () => {
        expect(handleCloseSpy).toHaveBeenCalled();
      },
      { timeout: 2000 }
    );

    // notesは変更されない
    const updatedNotes = useMusicProjectStore.getState().notes;
    expect(updatedNotes[0].lyric).toBe("あ");
  });

  it("NotePasteDialog: 貼り付け後、undo/redoが正常に動作する", async () => {
    mockClipboard.readText.mockResolvedValue(createClipboardUst());

    const notes = createTestNotes();
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes(notes);
    const handleCloseSpy = vi.fn();

    render(
      <NotePasteDialog
        open={true}
        selectedNotesIndex={[0, 1]}
        handleClose={handleCloseSpy}
      />
    );

    const lyricCheckbox = screen.getByRole("checkbox", {
      name: /editor\.notePaste\.lyric/i,
    });
    fireEvent.click(lyricCheckbox);

    const button = screen.getByRole("button", {
      name: /editor\.notePaste\.submitButton/i,
    });
    fireEvent.click(button);

    await waitFor(() => {
      expect(handleCloseSpy).toHaveBeenCalled();
    });

    // undoで元に戻る
    const undoResult = undoManager.undo();
    expect(undoResult[0].lyric).toBe("あ");
    expect(undoResult[1].lyric).toBe("い");

    // redoで再度適用される
    const redoResult = undoManager.redo();
    expect(redoResult[0].lyric).toBe("か");
    expect(redoResult[1].lyric).toBe("き");
  });
});
