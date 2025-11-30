import { ButtonGroup, MenuItem } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import React from "react";
import { useTranslation } from "react-i18next";
import { LOG } from "../../../lib/Logging";
import { Note } from "../../../lib/Note";
import { undoManager } from "../../../lib/UndoManager";
import { useMusicProjectStore } from "../../../store/musicProjectStore";

const reg = /^([^ぁ-んァ-ヶ]*)([ぁ-んァ-ヶ]+)([^ ]*)$/;
const LENGTHES = [
  "1920",
  "1440",
  "960",
  "720",
  "480",
  "360",
  "320",
  "240",
  "160",
  "120",
  "80",
  "60",
  "30",
] as const;
export const LengthSelect: React.FC<LengthSelectProps> = (props) => {
  const { notes, setNote } = useMusicProjectStore();
  const { t } = useTranslation();

  const lengthes = [120, 160, 180, 240, 320, 360, 480, 720, 960, 1920];

  React.useEffect(() => {
    props.setLengthValue(notes[props.selectedNotesIndex[0]]?.length ?? 480);
  }, [notes, props.selectedNotesIndex]);

  const handleChange = (e: SelectChangeEvent) => {
    LOG.debug("length変更", "LengthSelect");
    LOG.info(`長さの変更：${e.target.value}`, "LengthSelect");
    props.setLengthValue(parseInt(e.target.value));
    if (props.selectedNotesIndex.length === 1) {
      const newNote = lengthSelect(
        notes[props.selectedNotesIndex[0]],
        parseInt(e.target.value)
      );
      setNote(props.selectedNotesIndex[0], newNote);
    }
  };

  return (
    <>
      <ButtonGroup variant="contained" sx={{ width: "100%", my: 1 }}>
        <FormControl fullWidth size={"small"} variant="filled">
          <InputLabel>{t("notemenu.length")}</InputLabel>
          <Select
            label={t("notemenu.length")}
            variant="filled"
            defaultValue={notes[props.selectedNotesIndex[0]].length.toString()}
            value={props.lengthValue.toString()}
            onChange={handleChange}
          >
            {LENGTHES.map((l, i) => (
              <MenuItem key={i} value={l}>
                {t("editor.noteAddPortal.length" + l)}
              </MenuItem>
            ))}
            {!lengthes.includes(notes[props.selectedNotesIndex[0]].length) && (
              <MenuItem
                value={notes[props.selectedNotesIndex[0]].length.toString()}
              >
                {notes[props.selectedNotesIndex[0]].length}
              </MenuItem>
            )}
          </Select>
        </FormControl>
      </ButtonGroup>
      <br />
    </>
  );
};

export interface LengthSelectProps {
  /**
   * 現在選択されているノートのインデックス
   */
  selectedNotesIndex: number[];
  /**
   * メニューを閉じるためのコールバック
   */
  handleClose: () => void;
  /**
   * 選択されているノートのエイリアスを変更するためのコールバック
   */
  setLengthValue: React.Dispatch<React.SetStateAction<number>>;
  /**選択されているノートの新しい長さ */
  lengthValue: number;
}

/**
 * undo用のコマンド。undoManagerはNote[]を返すことを期待するので、元のノートを配列にして返す
 * @param oldNote 元のノート
 * @returns 元のノートを長さ1の配列にしたもの
 */
const undo = (oldNote: Note): Note[] => {
  return [oldNote];
};

/**
 * redo用のコマンド。
 */
const redo = (args: { note: Note; newLength: number }): Note[] => {
  return [lengthSelectCore(args.note, args.newLength)];
};

/**
 * notes[index]を複製し、newLengthに従って長さを分割する。
 * @param note 適用前のノート列
 * @param index 適用先のノート
 * @param newLyric 新しい長さ
 * @returns 適用後のノート
 */
const lengthSelectCore = (note: Note, newLength: number): Note => {
  const newNote = note.deepCopy();
  newNote.length = newLength;
  return newNote;
};

export const lengthSelect = (note: Note, newLength: number): Note => {
  const oldNote = note.deepCopy();
  undoManager.register({
    undo: undo,
    undoArgs: oldNote,
    redo: redo,
    redoArgs: { note: oldNote, newLength: newLength },
    summary: `長さ変更。:${newLength}`,
    all: true,
  });
  return lengthSelectCore(note, newLength);
};
