import { Note } from "../../src/lib/Note";

/**
 * テスト用にNoteインスタンスを作成するヘルパー関数
 */
export function createTestNote(params: {
  notenum: number;
  lyric: string;
  msLength?: number;
  length?: number;
  tempo?: number;
  pbs?: { time: number; height: number };
  pbw?: number[];
  pby?: number[];
  prev?: Note | null;
}): Note {
  const note = new Note();
  note.notenum = params.notenum;
  note.lyric = params.lyric;

  if (params.msLength !== undefined) {
    note.length = params.msLength;
  }

  if (params.length !== undefined) {
    note.length = params.length;
  }

  if (params.tempo !== undefined) {
    note.tempo = params.tempo;
  }

  if (params.pbs !== undefined) {
    note.pbsTime = params.pbs.time;
    note.pbsHeight = params.pbs.height;
  }

  if (params.pbw !== undefined) {
    note.setPbw(params.pbw);
  }

  if (params.pby !== undefined) {
    note.setPby(params.pby);
  }

  if (params.prev !== undefined) {
    note.prev = params.prev;
  }

  return note;
}
