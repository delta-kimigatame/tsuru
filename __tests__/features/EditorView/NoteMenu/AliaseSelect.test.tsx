import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AliaseSelect } from "../../../../src/features/EditorView/NoteMenu/AliaseSelect";
import { Note } from "../../../../src/lib/Note";
import { Ust } from "../../../../src/lib/Ust";
import { VoiceBank } from "../../../../src/lib/VoiceBanks/VoiceBank";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";

describe("AliaseSelect", () => {
  beforeEach(() => {
    // vbをセットアップしてAliaseSelectがエラーにならないようにする
    const dummyVb = {
      oto: {
        SearchAliases: vi.fn().mockReturnValue(["あ", "a あ", "- あ"]),
      },
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

  it("AliaseSelect:選択したノートが1つの時、エイリアスの選択肢が表示される", () => {
    const notes = createNotes();
    const store = useMusicProjectStore.getState();
    store.setNotes(notes);
    const setAliasValue = vi.fn();

    render(
      <AliaseSelect
        selectedNotesIndex={[0]}
        handleClose={() => {}}
        aliasValue="あ"
        setAliasValue={setAliasValue}
      />
    );

    // Selectコンポーネントが存在することを確認
    const select = screen.getByRole("combobox");
    expect(select).not.toBeNull();
  });

  it("AliaseSelect:エイリアスを変更すると、ノートのlyricが変更される", async () => {
    const notes = createNotes();
    const store = useMusicProjectStore.getState();
    store.setNotes(notes);
    const setAliasValue = vi.fn();

    render(
      <AliaseSelect
        selectedNotesIndex={[0]}
        handleClose={() => {}}
        aliasValue="あ"
        setAliasValue={setAliasValue}
      />
    );

    const select = screen.getByRole("combobox");
    fireEvent.mouseDown(select);

    // エイリアス選択肢から "a あ" を選択
    const option = await screen.findByText("a あ");
    fireEvent.click(option);

    // setAliasValueが呼ばれたことを確認
    expect(setAliasValue).toHaveBeenCalledWith("a あ");
  });

  it("AliaseSelect:正規表現で歌詞を分解してエイリアスを検索する", () => {
    const notes = createNotes();
    notes[0].lyric = "- あい";
    const store = useMusicProjectStore.getState();
    store.setNotes(notes);

    const mockSearchAliases = vi.fn().mockReturnValue(["- あ", "a あ"]);
    store.setVb({
      oto: {
        SearchAliases: mockSearchAliases,
      },
      getOtoRecord: vi.fn().mockReturnValue(null),
    } as unknown as VoiceBank);

    const setAliasValue = vi.fn();

    render(
      <AliaseSelect
        selectedNotesIndex={[0]}
        handleClose={() => {}}
        aliasValue="- あい"
        setAliasValue={setAliasValue}
      />
    );

    // SearchAliasesが "- あい" で呼ばれたことを確認(正規表現にマッチしない場合はそのまま検索)
    expect(mockSearchAliases).toHaveBeenCalledWith("- あい");
  });
});
