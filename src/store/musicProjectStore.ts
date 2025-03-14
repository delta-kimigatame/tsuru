import { create } from "zustand";
import { Note } from "../lib/Note";
import { Ust } from "../lib/Ust";
import { VoiceBank } from "../lib/VoiceBanks/VoiceBank";

/**
 * MusicProjectStore
 *
 * UTAU 楽譜データ (UST) や音声ライブラリを管理するストア。
 * 各項目はブラウザ上でアップロードされたファイルから読み込まれ、エディタ操作により更新される。
 */
interface MusicProjectStore {
  /**
   * 楽譜データ全体
   */
  ust: Ust | null;
  /**
   * 音声ライブラリ（UTAUのVoiceBank）
   * null の場合は未選択
   */
  vb: VoiceBank | null;

  /**
   * 楽譜全体のテンポ（BPM単位）
   */
  ustTempo: number;

  /**
   * 楽譜全体に適用される UTAU の合成フラグ
   * 例: "g+5Y50H30"
   */
  ustFlags: string;

  /**
   * 楽譜内のノートリスト
   */
  notes: Note[];

  /**
   * 楽譜を設定する
   * @param ust Ust のインスタンス
   */
  setUst: (ust: Ust) => void;

  /**
   * 音声ライブラリを設定する
   * @param vb VoiceBank のインスタンス
   */
  setVb: (vb: VoiceBank) => void;

  /**
   * 楽譜の BPM を設定する
   * @param tempo 設定する BPM
   */
  setUstTempo: (tempo: number) => void;

  /**
   * 楽譜全体に適用する合成フラグを設定する
   * @param flags UTAU の合成フラグ（例: "g+5Y50H30"）
   */
  setUstFlags: (flags: string) => void;

  /**
   * 指定したノートのプロパティを更新する
   * @param index 更新するノートのインデックス
   * @param key 更新するプロパティのキー
   * @param value 設定する値
   * @example
   * setNoteProperty(0, "_tempo", 150); // 0番目のノートのテンポを 150 に変更
   */
  setNoteProperty: <K extends keyof Note>(
    index: number,
    key: K,
    value: Note[K]
  ) => void;

  /**
   * 指定したノートを更新する
   * @param index 更新するノートのインデックス
   * @param value 設定するノート
   * @returns
   */
  setNote: (index: number, value: Note) => void;
}

/**
 * MusicProjectStore の Zustand ストア
 */
export const useMusicProjectStore = create<MusicProjectStore>((set) => ({
  ust: null,
  vb: null,
  ustTempo: 120,
  ustFlags: "",
  notes: [],
  setUst: (ust) => set({ ust }),
  setVb: (vb) => set({ vb }),

  setUstTempo: (tempo) => set({ ustTempo: tempo }),

  setUstFlags: (flags) => set({ ustFlags: flags }),

  setNoteProperty: (index, key, value) =>
    set((state) => {
      if (index < 0 || index >= state.notes.length) return state;

      const updatedNotes = [...state.notes];
      const updatedNote = updatedNotes[index].deepCopy();
      updatedNote[key] = value;

      updatedNotes[index] = updatedNote;
      return { notes: updatedNotes };
    }),

  setNote: (index, value) =>
    set((state) => {
      if (index < 0 || index >= state.notes.length) return state;

      const updatedNotes = [...state.notes];
      updatedNotes[index] = value;
      return { notes: updatedNotes };
    }),
}));
