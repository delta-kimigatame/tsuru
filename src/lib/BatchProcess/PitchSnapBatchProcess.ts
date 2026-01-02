import { useMusicProjectStore } from "../../store/musicProjectStore";
import { isNoteInScale } from "../../utils/scale";
import { BaseBatchProcess } from "../BaseBatchProcess";
import { Note } from "../Note";

/**
 * ノートのpbyをスケールにスナップする
 */

export class PitchSnapBatchProcess extends BaseBatchProcess {
  title = "batchprocess.pitchSnapBatchProcess";
  summary = "pitch:ピッチをスケールにスナップ";

  protected _process(notes: Note[]): Note[] {
    const newNotes = notes.map((n) => n.deepCopy());
    const tone = useMusicProjectStore.getState().tone;
    const isMinor = useMusicProjectStore.getState().isMinor;
    //pbyは1/10半音ごとの値で、閾値は-200～200の範囲である。つまり、上下20半音分
    newNotes.forEach((n) => {
      if (n.lyric === "R") return; // 休符は無視
      if (n.pby === null || n.pby === undefined || n.pby.length === 0) return; // pbyが無い場合無視
      /** とりあえずpbyを1の桁で四捨五入して10刻みの値にする */
      const roundedPby = n.pby.map((p) => Math.round(p / 10) * 10);
      /** notenum とpby/10を加算して、ピッチの音高を求める */
      const pitchValues = roundedPby.map((p) => n.notenum + p / 10);

      const snappedPby = pitchValues.map((pv, i) => {
        // 四捨五入結果が0の音はそのまま返す
        if (roundedPby[i] === 0) {
          return roundedPby[i];
        }
        if (isNoteInScale(Math.round(pv), tone, isMinor)) {
          return roundedPby[i]; // スケール内の音ならそのまま
        }
        /** pbyを0～11の範囲にする。負の数を正規化するために2オクターブ分(240)を足して正規化してから剰余を取る。 */
        const diffPitch = ((roundedPby[i] + 240) % 120) / 10;
        if (diffPitch === 1) {
          // 短2度がスケール外の場合、長2度にスナップ
          return roundedPby[i] + 10;
        } else if (diffPitch === 2) {
          // 長2度がスケール外の場合、短2度にスナップ
          return roundedPby[i] - 10;
        } else if (diffPitch === 3) {
          // 短3度がスケール外の場合、長3度にスナップ
          return roundedPby[i] + 10;
        } else if (diffPitch === 4) {
          // 長3度がスケール外の場合、短3度にスナップ
          return roundedPby[i] - 10;
        } else if (diffPitch === 5) {
          // 完全4度がスケール外の場合、増4度にスナップ
          return roundedPby[i] + 10;
        } else if (diffPitch === 6) {
          // 増4度がスケール外の場合、完全4度にスナップ
          return roundedPby[i] - 10;
        } else if (diffPitch === 7) {
          // 完全5度がスケール外の場合、減5度にスナップ
          return roundedPby[i] - 10;
        } else if (diffPitch === 8) {
          // 短6度がスケール外の場合、長6度にスナップ
          return roundedPby[i] + 10;
        } else if (diffPitch === 9) {
          // 長6度がスケール外の場合、短6度にスナップ
          return roundedPby[i] - 10;
        } else if (diffPitch === 10) {
          // 短7度がスケール外の場合、長7度にスナップ
          return roundedPby[i] + 10;
        } else if (diffPitch === 11) {
          // 長7度がスケール外の場合、短7度にスナップ
          return roundedPby[i] - 10;
        }
      });
      n.setPby(snappedPby);
    });
    return newNotes;
  }
}
