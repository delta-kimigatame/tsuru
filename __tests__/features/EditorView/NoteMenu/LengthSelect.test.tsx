import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LengthSelect } from "../../../../src/features/EditorView/NoteMenu/LengthSelect";
import { Note } from "../../../../src/lib/Note";
import { Ust } from "../../../../src/lib/Ust";
import { VoiceBank } from "../../../../src/lib/VoiceBanks/VoiceBank";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";

describe("LengthSelect", () => {
  beforeEach(() => {
    const dummyVb = {
      getOtoRecord: vi.fn().mockReturnValue(null),
    } as unknown as VoiceBank;
    const store = useMusicProjectStore.getState();
    store.setVb(dummyVb);
    store.setUst({} as Ust);
  });

  const createNotes = (): Note[] => {
    const dummyNotes: Note[] = [];
    for (let i = 0; i < 5; i++) {
      const note = new Note();
      note.notenum = 60 + i;
      note.lyric = "あ";
      note.length = 480;
      note.prev = { tempo: 120, length: 0, lyric: "R" };
      note.tempo = 120;
      dummyNotes.push(note);
    }
    return dummyNotes;
  };

  it("LengthSelect:選択したノートが1つの時、長さの選択肢が表示される", () => {
    const notes = createNotes();
    const store = useMusicProjectStore.getState();
    store.setNotes(notes);
    const setLengthValue = vi.fn();

    render(
      <LengthSelect
        selectedNotesIndex={[0]}
        handleClose={() => {}}
        lengthValue={480}
        setLengthValue={setLengthValue}
      />
    );

    // Selectコンポーネントが存在することを確認
    const select = screen.getByRole("combobox");
    expect(select).not.toBeNull();
  });

  it("LengthSelect:長さを変更すると、ノートのlengthが変更される", async () => {
    const notes = createNotes();
    const store = useMusicProjectStore.getState();
    store.setNotes(notes);
    const setLengthValue = vi.fn();

    render(
      <LengthSelect
        selectedNotesIndex={[0]}
        handleClose={() => {}}
        lengthValue={480}
        setLengthValue={setLengthValue}
      />
    );

    const select = screen.getByRole("combobox");
    fireEvent.mouseDown(select);

    // 長さ選択肢から 960 を選択(data-value属性で検索)
    const options = screen.getAllByRole("option");
    const option960 = options.find(
      (opt) => opt.getAttribute("data-value") === "960"
    );
    fireEvent.click(option960!);

    // setLengthValueが呼ばれたことを確認
    expect(setLengthValue).toHaveBeenCalledWith(960);
  });

  it("LengthSelect:プリセットにない長さの場合、その値も選択肢に追加される", () => {
    const notes = createNotes();
    notes[0].length = 500; // プリセットにない長さ
    const store = useMusicProjectStore.getState();
    store.setNotes(notes);
    const setLengthValue = vi.fn();

    render(
      <LengthSelect
        selectedNotesIndex={[0]}
        handleClose={() => {}}
        lengthValue={500}
        setLengthValue={setLengthValue}
      />
    );

    // カスタム長さ500が表示されることを確認
    expect(screen.getByText("500")).not.toBeNull();
  });
});
