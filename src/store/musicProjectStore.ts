import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BasePhonemizer } from "../lib/BasePhonemizer";
import { dumpNotes, Note } from "../lib/Note";
import { JPCVorVCVPhonemizer } from "../lib/Phonemizer/JPCVorVCVPhonemizer";
import { Ust } from "../lib/Ust";
import { BaseVoiceBank } from "../lib/VoiceBanks/BaseVoiceBank";

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
  vb: BaseVoiceBank | null;

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
   * Phonemizer
   */
  phonemizer: BasePhonemizer;

  /**
   * 楽譜を設定する
   * @param ust Ust のインスタンス
   */
  setUst: (ust: Ust) => void;

  /**
   * 音声ライブラリを設定する
   * @param vb VoiceBank のインスタンス
   */
  setVb: (vb: BaseVoiceBank) => void;

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
   */
  setNote: (index: number, value: Note) => void;

  /**
   * ノート列を渡し全てのノートを更新する
   * @param newNotes 新しいノート列
   */
  setNotes: (newNotes: Array<Note>) => void;

  setPhonemizer: (newPhonemizer: BasePhonemizer) => void;

  clearUst: () => void;
}

/**
 * MusicProjectStore の Zustand ストア
 */
export const useMusicProjectStore = create<MusicProjectStore>()(
  persist(
    (set, get) => ({
      ust: null,
      vb: null,
      ustTempo: 120,
      ustFlags: "",
      notes: [],
      // phonemizer: new DefaultPhonemizer(),
      phonemizer: new JPCVorVCVPhonemizer(),
      setUst: (ust) => set({ ust }),
      setVb: (vb) => set({ vb }),

      setUstTempo: (tempo) =>
        set((state) => {
          const updatedNotes = [...state.notes];
          updatedNotes.forEach((_, i) => {
            if (i === 0 && !updatedNotes[0].hasTempo) {
              updatedNotes[i].tempo = tempo;
            } else if (
              updatedNotes[i].prev !== undefined &&
              !updatedNotes[i].hasTempo
            ) {
              updatedNotes[i].tempo = updatedNotes[i].prev.tempo;
            }
          });
          //ustの更新は通知しなくていいので直接更新
          state.ust.tempo = tempo;
          return { ustTempo: tempo, notes: updatedNotes };
        }),

      setUstFlags: (flags) =>
        set((state) => {
          //ustの更新は通知しなくていいので直接更新
          state.ust.flags = flags;
          return { ustFlags: flags };
        }),

      setNoteProperty: (index, key, value) =>
        set((state) => {
          if (index < 0 || index >= state.notes.length) return state;

          const updatedNotes = [...state.notes];
          const updatedNote = updatedNotes[index].deepCopy();
          updatedNote[key] = value;

          updatedNotes[index] = updatedNote;
          updatedNotes.forEach((_, i) => {
            updatedNotes[i].index = i;
            updatedNotes[i].prev = i === 0 ? undefined : updatedNotes[i - 1];
            if (
              updatedNotes[i].prev !== undefined &&
              !updatedNotes[i].hasTempo
            ) {
              updatedNotes[i].tempo = updatedNotes[i].prev.tempo;
            }
            updatedNotes[i].next =
              i === updatedNotes.length - 1 ? undefined : updatedNotes[i + 1];
          });
          //ustの更新は通知しなくていいので直接更新
          state.ust.notes = updatedNotes;
          return { notes: updatedNotes };
        }),

      setNote: (index, value) =>
        set((state) => {
          if (index < 0 || index >= state.notes.length) return state;

          const updatedNotes = [...state.notes];
          updatedNotes[index] = value;
          updatedNotes[index].phonemizer = state.phonemizer;
          updatedNotes[index].applyOto(state.vb);
          updatedNotes.forEach((_, i) => {
            updatedNotes[i].index = i;
            updatedNotes[i].prev = i === 0 ? undefined : updatedNotes[i - 1];
            if (
              updatedNotes[i].prev !== undefined &&
              !updatedNotes[i].hasTempo
            ) {
              updatedNotes[i].tempo = updatedNotes[i].prev.tempo;
            }
            updatedNotes[i].next =
              i === updatedNotes.length - 1 ? undefined : updatedNotes[i + 1];
          });
          //ustの更新は通知しなくていいので直接更新
          state.ust.notes = updatedNotes;
          return { notes: updatedNotes };
        }),

      setNotes: (newNotes) =>
        set((state) => {
          newNotes.forEach((_, i) => {
            newNotes[i].index = i;
            newNotes[i].prev = i === 0 ? undefined : newNotes[i - 1];
            if (newNotes[i].prev !== undefined && !newNotes[i].hasTempo) {
              newNotes[i].tempo = newNotes[i].prev.tempo;
            }
            newNotes[i].next =
              i === newNotes.length - 1 ? undefined : newNotes[i + 1];
            newNotes[i].phonemizer = state.phonemizer;
            if (state.vb !== null && "getOtoRecord" in state.vb) {
              //test時以外は常にtrueのはず
              newNotes[i].applyOto(state.vb);
            }
          });
          //ustの更新は通知しなくていいので直接更新
          state.ust.notes = newNotes;
          return { notes: newNotes };
        }),
      setPhonemizer: (newPhonemizer) =>
        set((state) => {
          const updatedNotes = [...state.notes];
          updatedNotes.forEach((n) => {
            n.phonemizer = newPhonemizer;
            n.applyOto(state.vb);
          });
          state.ust.notes = updatedNotes;
          return { phonemizer: newPhonemizer, notes: updatedNotes };
        }),
      clearUst: () =>
        set((state) => {
          return { notes: [], ustTempo: 120, ustFlags: "", ust: null };
        }),
    }),
    {
      name: "music-project", // localStorage のキー
      partialize: (state) => {
        if (!state.ust) return {};
        if (!state.ust.notes) return {};
        if (state.ust.notes.length === 0) return {};
        return {
          ustText: dumpNotes(state.ust.notes, state.ust.tempo, state.ust.flags),
        };
      },
      // 初期化時に復元
      onRehydrateStorage: () => (state) => {
        const raw = localStorage.getItem("music-project");
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw);
          if (parsed.state?.ustText) {
            const restoredUst = new Ust();
            restoredUst.loadText(
              parsed.state.ustText.replace(/\r/g, "").split("\n")
            );
            if (restoredUst.notes.length !== 0) {
              state.setUst(restoredUst);
              state.setUstTempo(restoredUst.tempo);
              state.setUstFlags(restoredUst.flags);
              state.setNotes(restoredUst.notes);
            }
          }
        } catch (e) {
          state.setUst(null);
          state.setUstTempo(120);
          state.setUstFlags("");
          state.setNotes([]);
        }
      },
    }
  )
);
