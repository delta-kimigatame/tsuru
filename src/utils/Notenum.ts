export const TONE_MAP = {
  C: 0,
  "C#": 1,
  "C♯": 1,
  Db: 1,
  "D♭": 1,
  D: 2,
  "D#": 3,
  "D♯": 3,
  Eb: 3,
  "E♭": 3,
  E: 4,
  F: 5,
  "F#": 6,
  "F♯": 6,
  Gb: 6,
  "G♭": 6,
  G: 7,
  "G#": 8,
  "G♯": 8,
  Ab: 8,
  "A♭": 8,
  A: 9,
  "A#": 10,
  "A♯": 10,
  Bb: 10,
  "B♭": 10,
  B: 11,
};

export const NOTENUM_MAP = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];
export const toneToNoteNum = (tone: string): number => {
  const toneValue = parseInt(tone.slice(-1));
  const toneName = tone.slice(0, -1);
  return TONE_MAP[toneName] + (toneValue + 1) * 12;
};

export const noteNumToTone = (notenum: number): string => {
  const toneValue = Math.floor(notenum / 12) - 1;
  const toneName = NOTENUM_MAP[notenum % 12];
  return toneName + toneValue;
};
