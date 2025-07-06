import { defaultParam } from "../../types/note";
import { AppendRequestBase, ResampRequest } from "../../types/request";
import { noteNumToTone } from "../../utils/Notenum";
import { encodePitch } from "../../utils/pitch";
import { BasePhonemizer } from "../BasePhonemizer";
import { Note } from "../Note";
import { BaseVoiceBank } from "../VoiceBanks/BaseVoiceBank";

export class DefaultPhonemizer extends BasePhonemizer {
  name = "phonemizer.default";

  protected _applyOto(note: Note, vb: BaseVoiceBank): void {
    if (note.lyric === undefined) {
      throw new Error("lyric is not initial.");
    } else if (note.notenum === undefined) {
      throw new Error("notenum is not initial.");
    }
    const record = vb.getOtoRecord(
      note.lyric,
      note.notenum,
      note.voiceColor ? note.voiceColor : ""
    );
    if (record === null) {
      note.otoPreutter = 0;
      note.otoOverlap = 0;
      note.atAlias = "R";
      note.atFilename = "";
    } else {
      note.oto = record;
      note.otoPreutter = record.pre;
      note.otoOverlap = record.overlap;
      note.atAlias = record.alias !== "" ? record.alias : note.lyric;
      note.atFilename =
        record.dirpath + (record.dirpath !== "" ? "/" : "") + record.filename;
    }
  }
  protected _autoFitParam(note: Note): void {
    const rate = note.velocityRate;
    if (note.prev === undefined) {
      note.atPreutter =
        note.preutter !== undefined
          ? note.preutter * rate
          : note.otoPreutter !== undefined
          ? note.otoPreutter * rate
          : undefined;
      note.atOverlap =
        note.overlap !== undefined
          ? note.overlap * rate
          : note.otoOverlap !== undefined
          ? note.otoOverlap * rate
          : undefined;
      note.atStp = note.stp !== undefined ? note.stp : 0;
      return;
    }
    if (note.prev.length === undefined) {
      throw new Error("prev length is not initial.");
    } else if (note.prev.tempo === undefined) {
      throw new Error("prev tempo is not initial.");
    } else if (note.prev.lyric === undefined) {
      throw new Error("prev lyric is not initial.");
    }
    const prevMsLength =
      note.prev.phonemizer.getLastLength(note.prev) *
      (note.prev.lyric === "R" ? 1 : 0.5);
    const realPreutter =
      (note.preutter !== undefined ? note.preutter : note.otoPreutter) * rate;
    const realOverlap =
      (note.overlap !== undefined ? note.overlap : note.otoOverlap) * rate;
    const realStp = note.stp !== undefined ? note.stp : 0;
    if (Number.isNaN(realPreutter) || Number.isNaN(realOverlap)) {
    } else if (prevMsLength < realPreutter - realOverlap) {
      note.atPreutter =
        (realPreutter / (realPreutter - realOverlap)) * prevMsLength;
      note.atOverlap =
        (realOverlap / (realPreutter - realOverlap)) * prevMsLength;
      note.atStp = realPreutter - note.atPreutter + realStp;
    } else {
      note.atPreutter = realPreutter;
      note.atOverlap = realOverlap;
      note.atStp = realStp;
    }
  }

  protected _getLastPhoneme(note: Note): string {
    return "";
  }
  protected _getLastLength(note: Note): number {
    return note.msLength;
  }

  protected _getRequestParamm(
    vb: BaseVoiceBank,
    note: Note,
    flags: string,
    defaultValue: defaultParam
  ): { resamp: ResampRequest | undefined; append: AppendRequestBase }[] {
    if (note.oto === undefined) {
      note.applyOto(vb);
    } else {
      note.autoFitParam();
    }
    const params = [{ resamp: undefined, append: undefined }];
    if (note.oto !== undefined && !note.direct) {
      params[0]["resamp"] = {
        inputWav:
          note.oto.dirpath !== ""
            ? note.oto.dirpath + "/" + note.oto.filename
            : note.oto.filename,
        targetTone: noteNumToTone(note.notenum),
        velocity:
          note.velocity !== undefined &&
          note.velocity !== null &&
          !Number.isNaN(note.velocity)
            ? note.velocity
            : defaultValue.velocity,
        flags:
          note.flags !== null && note.flags !== undefined && note.flags !== ""
            ? note.flags
            : flags,
        offsetMs: note.oto.offset,
        targetMs: note.targetLength,
        fixedMs: note.oto.velocity,
        cutoffMs: note.oto.blank,
        intensity:
          note.intensity !== undefined &&
          note.intensity !== null &&
          !Number.isNaN(note.intensity)
            ? note.intensity
            : defaultValue.intensity,
        modulation:
          note.modulation !== undefined &&
          note.modulation !== null &&
          !Number.isNaN(note.modulation)
            ? note.modulation
            : defaultValue.modulation,
        tempo: `!${note.tempo.toFixed(2)}`,
        pitches: encodePitch(note.getRenderPitch()),
      } as ResampRequest;
    }
    if (note.oto !== undefined && note.direct) {
      params[0]["append"] = {
        inputWav:
          note.oto.dirpath !== ""
            ? note.oto.dirpath + "/" + note.oto.filename
            : note.oto.filename,
        stp: note.atStp + note.oto.offset,
        length: note.outputMs,
        envelope: note.envelope ? note.envelope : defaultValue.envelope,
        overlap: note.atOverlap,
      } as AppendRequestBase;
    } else if (note.oto !== undefined) {
      params[0]["append"] = {
        stp: note.atStp,
        length: note.outputMs,
        envelope: note.envelope ? note.envelope : defaultValue.envelope,
        overlap: note.atOverlap,
      } as AppendRequestBase;
    } else {
      params[0]["append"] = {
        stp: 0,
        length: note.outputMs,
        envelope: { point: [0, 0], value: [] },
        overlap: 0,
      } as AppendRequestBase;
    }
    return params;
  }
}
