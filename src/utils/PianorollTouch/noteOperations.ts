import { PIANOROLL_CONFIG } from "../../config/pianoroll";
import { Note } from "../../lib/Note";
import { undoManager } from "../../lib/UndoManager";
import { last } from "../array";
import { getFrqFromNotenum } from "../pitch";

/**
 * 追加されるノートを生成する処理
 * @param notes グローバルな状態ノート
 * @param index ノートを追加するindex。undefinedの際はノート列の末尾に追加される
 * @param notenum 追加する音高
 * @param addNoteLyric 追加する歌詞
 * @param addNoteLength 追加する長さ
 * @param ustTempo プロジェクトのテンポ
 * @returns 追加されるノート
 */
export const createNewNote = (
  notes: Note[],
  index: number | undefined,
  notenum: number,
  addNoteLyric: string,
  addNoteLength: number,
  ustTempo: number
): Note => {
  const newNote = new Note();
  newNote.hasTempo = false;
  newNote.lyric = addNoteLyric;
  newNote.length = addNoteLength;
  newNote.notenum = notenum;
  newNote.tempo =
    notes === undefined || notes.length === 0
      ? ustTempo
      : index === undefined
      ? last(notes).tempo
      : notes[index].tempo;
  return newNote;
};

/**
 * ノートを追加する
 * @param notes 現在のノート配列
 * @param index 挿入位置のインデックス。undefinedの場合は末尾に追加
 * @param notenum 音高
 * @param addNoteLyric 歌詞
 * @param addNoteLength 長さ
 * @param ustTempo テンポ
 * @returns 新しいノート配列
 */
export const AddNote = (
  notes: Note[],
  index: number | undefined,
  notenum: number,
  addNoteLyric: string,
  addNoteLength: number,
  ustTempo: number
): Note[] => {
  const newNote = createNewNote(
    notes,
    index,
    notenum,
    addNoteLyric,
    addNoteLength,
    ustTempo
  );
  const newNotes =
    notes === undefined || notes.length === 0
      ? [newNote]
      : index === undefined
      ? notes.slice().concat([newNote])
      : notes.slice(0, index).concat([newNote], notes.slice(index));
  undoManager.register({
    undo: (oldNotes: Note[]): Note[] => oldNotes,
    undoArgs: notes === undefined ? [] : notes.map((n) => n.deepCopy()),
    redo: (newNotes: Note[]): Note[] => newNotes,
    redoArgs: newNotes.map((n) => n.deepCopy()),
    summary: `ノートの追加。追加位置${index},歌詞:${addNoteLyric},長さ:${addNoteLength}`,
    all: true,
  });
  return newNotes;
};

/**
 * プレビュー音を再生する
 * @param notenum 音高
 */
export const playPreviewTone = (notenum: number): void => {
  const frequency = getFrqFromNotenum(notenum);
  const audioContext = new (window.AudioContext ||
    (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  oscillator.type = "sine";

  gainNode.gain.setValueAtTime(
    PIANOROLL_CONFIG.PREVIEW_TONE_VOLUME,
    audioContext.currentTime
  );

  oscillator.start(audioContext.currentTime);
  oscillator.stop(
    audioContext.currentTime + PIANOROLL_CONFIG.PREVIEW_TONE_DURATION
  );
};
