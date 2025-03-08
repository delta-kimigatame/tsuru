/**
 * UTAUのプロジェクトファイルであるustファイルを扱う。
 * 基本的には本家UTAUの仕様に準拠するが、VoiceColorを使用するため拡張を行う。
 */

import { readTextFile } from "../services/readTextFile";
import type { defaultParam } from "../types/note";
import type { AppendRequestBase, ResampRequest } from "../types/request";
import { Note } from "./Note";
import type { VoiceBank } from "./VoiceBanks/VoiceBank";

export class Ust {
  /**プロジェクトのbpm */
  private _tempo: number;
  /** プロジェクトのフラグ */
  flags: string;
  /** ノート */
  notes: Array<Note>;

  /** bpm */
  get tempo(): number {
    return this._tempo;
  }

  /** bpm 10～512の浮動小数*/
  set tempo(value: number) {
    this._tempo = Math.max(Math.min(value, 512), 10);
  }

  /**
   * UTAUのプロジェクトファイルであるustファイルを扱う。
   * 基本的には本家UTAUの仕様に準拠するが、VoiceColorを使用するため拡張を行う。
   */
  constructor() {
    this._tempo = 120;
  }

  /**
   * プロジェクトを読み込む。
   * @param buf プロジェクトのバイナリデータ
   */
  async load(buf): Promise<void> {
    let utfData: string;
    return new Promise(async (resolve) => {
      const data = await readTextFile(buf);
      if (data.includes("Charset=UTF-8")) {
        utfData = await readTextFile(buf, "UTF8");
      }
      const lines = (utfData === undefined ? data : utfData)
        .replace(/\r/g, "")
        .split("\n");
      const noteStart = lines.indexOf("[#0000]");
      this.loadHeader(lines.slice(0, noteStart));
      this.loadNote(lines.slice(noteStart));
      for (let i = 1; i < this.notes.length; i++) {
        this.notes[i - 1].next = this.notes[i];
        this.notes[i].prev = this.notes[i - 1];
      }
      resolve();
    });
  }

  /**
   * ustのヘッダ部分を読み込む。PC上のパスに当たる内容はすべて無視する。
   * @param lines 1行毎に区切ったustヘッダ部分のデータ
   */
  private loadHeader(lines: Array<string>): void {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("Tempo=")) {
        this.tempo = parseFloat(lines[i].replace("Tempo=", ""));
      } else if (lines[i].startsWith("Flags=")) {
        this.flags = lines[i].replace("Flags=", "");
      }
    }
  }

  /**
   * ustのノート部分を読み込む。`@`から始まるエントリは無視する。
   * @param lines 1行毎に区切ったustノート部分のデータ
   */
  private loadNote(lines: Array<string>): void {
    this.notes = new Array<Note>();
    let note: Note | undefined;
    let nowTempo: number = this.tempo;
    lines.forEach((l) => {
      if (l === "[#TRACKEND]") {
        return;
      } else if (l.startsWith("[#")) {
        note = new Note();
        note.index = parseInt(l.slice(2, -1));
        note.tempo = nowTempo;
        this.notes.push(note);
      } else if (l.startsWith("Length=")) {
        note.length = parseInt(l.replace("Length=", ""));
      } else if (l.startsWith("Lyric=")) {
        note.lyric = l.replace("Lyric=", "");
      } else if (l.startsWith("NoteNum=")) {
        note.notenum = parseInt(l.replace("NoteNum=", ""));
      } else if (l.startsWith("Tempo=")) {
        note.tempo = parseFloat(l.replace("Tempo=", ""));
        nowTempo = note.tempo;
        note.hasTempo = true;
      } else if (l.startsWith("PreUtterance=")) {
        const pre = parseFloat(l.replace("PreUtterance=", ""));
        if (!isNaN(pre)) {
          note.preutter = pre;
        }
      } else if (l.startsWith("VoiceOverlap=")) {
        note.overlap = parseFloat(l.replace("VoiceOverlap=", ""));
      } else if (l.startsWith("StartPoint=")) {
        note.stp = parseFloat(l.replace("StartPoint=", ""));
      } else if (l.startsWith("Velocity=")) {
        note.velocity = parseInt(l.replace("Velocity=", ""));
      } else if (l.startsWith("Intensity=")) {
        note.intensity = parseInt(l.replace("Intensity=", ""));
      } else if (l.startsWith("Modulation=")) {
        note.modulation = parseInt(l.replace("Modulation=", ""));
      } else if (l.startsWith("PitchBend=")) {
        note.pitches = l.replace("PitchBend=", "");
      } else if (l.startsWith("PBStart=")) {
        note.pbStart = parseFloat(l.replace("PBStart=", ""));
      } else if (l.startsWith("PBS=")) {
        note.pbs = l.replace("PBS=", "");
      } else if (l.startsWith("PBY=")) {
        note.pby = l.replace("PBY=", "");
      } else if (l.startsWith("PBM=")) {
        note.pbm = l.replace("PBM=", "");
      } else if (l.startsWith("PBW=")) {
        note.pbw = l.replace("PBW=", "");
      } else if (l.startsWith("Flags=")) {
        note.flags = l.replace("Flags=", "");
      } else if (l.startsWith("VBR=")) {
        note.vibrato = l.replace("VBR=", "");
      } else if (l.startsWith("Envelope=")) {
        note.envelope = l.replace("Envelope=", "");
      } else if (l.startsWith("Label=")) {
        note.label = l.replace("Label=", "");
      } else if (l.startsWith("$direct=")) {
        note.direct = l.replace("$direct=", "").toLowerCase() === "true";
      } else if (l.startsWith("$region=")) {
        note.region = l.replace("$region=", "");
      } else if (l.startsWith("$region_end=")) {
        note.regionEnd = l.replace("$region_end=", "");
      }
    });
  }

  /**
   * ust内の全てのノートについて、歌唱用パラメータを出力する
   * @param vb 歌唱する音源
   * @param defaultValue ノートに値が設定されていないときに参照する初期値
   * @returns 歌唱用パラメータ
   */
  getRequestParam(
    vb: VoiceBank,
    defaultValue: defaultParam,
    selectNotes?: Array<number>
  ): Array<{
    resamp: ResampRequest | undefined;
    append: AppendRequestBase;
  }> {
    this.notes.forEach((n) => n.applyOto(vb));

    const targetNotes =
      selectNotes && selectNotes.length > 0
        ? selectNotes.map((idx) => this.notes[idx])
        : this.notes;
    const params = targetNotes.map((n) =>
      n.getRequestParam(vb, this.flags, defaultValue)
    );
    return params;
  }
}
