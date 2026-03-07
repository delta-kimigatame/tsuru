import { BaseBatchProcess } from "../BaseBatchProcess";
import { Note } from "../Note";

const PBW_TIME_JITTER_MS = 20;
const PITCH_JITTER_CENT = 5;

/**
 * ノートのpbyをランダムに揺らす
 */
export class PitchHumanizeBatchProcess extends BaseBatchProcess {
  title = "batchprocess.pitchHumanizeBatchProcess";
  summary = "pitch:ピッチをランダムに揺らす";

  protected _process(notes: Note[]): Note[] {
    const newNotes = notes.map((n) => n.deepCopy());
    newNotes.forEach((n) => {
      if (n.lyric === "R") return; // 休符は無視
      if (n.pby === null || n.pby === undefined || n.pby.length === 0) return; // pbyが無い場合無視
      // 時間（pbsTime / pbw）のヒューマナイズ
      if (n.pbs !== undefined && n.pbw !== undefined) {
        const absPositions: number[] = [n.pbs.time];
        n.pbw.forEach((w) => {
          absPositions.push(absPositions[absPositions.length - 1] + w);
        });
        const randomizedAbs: number[] = [];
        absPositions.forEach((pos, i) => {
          const jittered = Math.round(
            pos +
              (Math.random() * (PBW_TIME_JITTER_MS * 2) - PBW_TIME_JITTER_MS),
          );
          if (i === 0) {
            randomizedAbs.push(jittered);
          } else {
            const prev = randomizedAbs[i - 1];
            randomizedAbs.push(Math.max(jittered, prev));
          }
        });
        n.pbsTime = randomizedAbs[0];
        const randomizedPbw = randomizedAbs
          .slice(1)
          .map((pos, i) => Math.max(Math.round(pos - randomizedAbs[i]), 0));
        n.setPbw(randomizedPbw);
      }
      // 音高（pbsHeight / pby）のヒューマナイズ
      if (n.pbs !== undefined) {
        n.pbsHeight =
          n.pbs.height +
          (Math.random() * (PITCH_JITTER_CENT * 2) - PITCH_JITTER_CENT);
      }
      const randomizedPby = n.pby.map(
        (p) =>
          p + (Math.random() * (PITCH_JITTER_CENT * 2) - PITCH_JITTER_CENT),
      );
      n.setPby(randomizedPby);
    });
    return newNotes;
  }
}
