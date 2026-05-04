import { useMusicProjectStore } from "../../store/musicProjectStore";
import { SelectUIProp } from "../../types/batchProcess";
import { BaseBatchProcess } from "../BaseBatchProcess";
import { Note } from "../Note";

const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
const MINOR_SCALE_INTERVALS = [0, 2, 3, 5, 7, 8, 10];

export interface ScaleDegreeShiftBatchProcessOptions {
  degreeValue: number | string;
}

/**
 * プロジェクトのスケールに基づいて、指定した度数だけ音高を上下する。
 * 1度は変化なしとして扱い、UIでは 2..7 / -2..-7 のみ選択可能にする。
 */
export class ScaleDegreeShiftBatchProcess extends BaseBatchProcess<ScaleDegreeShiftBatchProcessOptions> {
  title = "batchprocess.scaleDegreeShiftBatchProcess.title";
  summary = "notenum:指定度数上下する";

  protected _process(
    notes: Note[],
    options: ScaleDegreeShiftBatchProcessOptions,
  ): Note[] {
    const newNotes = notes.map((n) => n.deepCopy());
    const tone = useMusicProjectStore.getState().tone;
    const isMinor = useMusicProjectStore.getState().isMinor;
    const scaleIntervals = isMinor
      ? MINOR_SCALE_INTERVALS
      : MAJOR_SCALE_INTERVALS;

    const degreeValue = Number(options.degreeValue);
    if (!this.isValidDegreeValue(degreeValue)) {
      return newNotes;
    }

    const degreeSteps = degreeValue > 0 ? degreeValue - 1 : degreeValue + 1;

    newNotes.forEach((n) => {
      if (n.lyric === "R") return;
      n.notenum = this.shiftNotenumByScaleDegree(
        n.notenum,
        tone,
        scaleIntervals,
        degreeSteps,
      );
    });

    return newNotes;
  }

  private isValidDegreeValue(value: number): boolean {
    return (
      Number.isInteger(value) &&
      ((value >= 2 && value <= 7) || (value <= -2 && value >= -7))
    );
  }

  private shiftNotenumByScaleDegree(
    notenum: number,
    tone: number,
    scaleIntervals: number[],
    degreeSteps: number,
  ): number {
    const snappedNotenum = this.snapToNearestScaleNote(
      notenum,
      tone,
      scaleIntervals,
    );
    const relativeInterval = this.mod(snappedNotenum - tone, 12);
    const currentDegreeIndex = scaleIntervals.indexOf(relativeInterval);
    if (currentDegreeIndex < 0) {
      return snappedNotenum;
    }

    const baseNotenum = snappedNotenum - relativeInterval;
    const rawTargetDegreeIndex = currentDegreeIndex + degreeSteps;
    const octaveShift = Math.floor(rawTargetDegreeIndex / 7);
    const targetDegreeIndex = this.mod(rawTargetDegreeIndex, 7);

    return baseNotenum + octaveShift * 12 + scaleIntervals[targetDegreeIndex];
  }

  private snapToNearestScaleNote(
    notenum: number,
    tone: number,
    scaleIntervals: number[],
  ): number {
    const relativeInterval = this.mod(notenum - tone, 12);
    if (scaleIntervals.includes(relativeInterval)) {
      return notenum;
    }

    const octaveBase = notenum - relativeInterval;
    let best = notenum;
    let bestDistance = Number.POSITIVE_INFINITY;

    scaleIntervals.forEach((interval) => {
      const candidates = [
        octaveBase + interval,
        octaveBase + interval - 12,
        octaveBase + interval + 12,
      ];
      candidates.forEach((candidate) => {
        const distance = Math.abs(candidate - notenum);
        // 同距離の場合は上方向を優先する。
        if (
          distance < bestDistance ||
          (distance === bestDistance && candidate > best)
        ) {
          bestDistance = distance;
          best = candidate;
        }
      });
    });

    return best;
  }

  private mod(value: number, divisor: number): number {
    return ((value % divisor) + divisor) % divisor;
  }

  ui: Array<SelectUIProp<number>> = [
    {
      key: "degreeValue",
      labelKey: "batchprocess.scaleDegreeShiftBatchProcess.degreeValue",
      inputType: "select",
      options: [-7, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 7],
      defaultValue: "3",
    } as SelectUIProp<number>,
  ];

  initialOptions: ScaleDegreeShiftBatchProcessOptions = {
    degreeValue: 3,
  };
}
