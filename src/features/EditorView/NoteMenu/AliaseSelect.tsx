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

export const AliaseSelect: React.FC<AliasSelectProps> = (props) => {
  const { vb, notes, setNote } = useMusicProjectStore();
  const { t } = useTranslation();

  const aliases: string[] = React.useMemo(() => {
    if (props.selectedNotesIndex.length === 1) {
      const match = reg.exec(notes[props.selectedNotesIndex[0]].lyric);
      const targetLyric = match
        ? match[1] + match[2]
        : notes[props.selectedNotesIndex[0]].lyric;
      props.setAliasValue(notes[props.selectedNotesIndex[0]].lyric);
      return vb.oto.SearchAliases(targetLyric).sort();
    } else {
      [];
    }
  }, [props.selectedNotesIndex, notes]);

  const handleChange = (e: SelectChangeEvent) => {
    LOG.debug("alias変更", "AliaseSelect");
    LOG.info(`エイリアスの変更：${e.target.value}`, "AliaseSelect");
    props.setAliasValue(e.target.value);
    if (props.selectedNotesIndex.length === 1) {
      const newNote = aliasSelect(
        notes[props.selectedNotesIndex[0]],
        e.target.value
      );
      setNote(props.selectedNotesIndex[0], newNote);
    }
  };

  return (
    <>
      <ButtonGroup variant="contained" sx={{ width: "100%", my: 1 }}>
        <FormControl fullWidth size={"small"} variant="filled">
          <InputLabel>{t("notemenu.alias")}</InputLabel>
          <Select
            label={t("notemenu.alias")}
            variant="filled"
            defaultValue={notes[props.selectedNotesIndex[0]].lyric}
            value={props.aliasValue}
            onChange={handleChange}
          >
            {aliases.map((alias, i) => (
              <MenuItem value={alias} key={"ailias_" + i}>
                {alias}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </ButtonGroup>
      <br />
    </>
  );
};

export interface AliasSelectProps {
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
  setAliasValue: React.Dispatch<React.SetStateAction<string>>;
  /**選択されているノートの新しいエイリアス */
  aliasValue: string;
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
const redo = (args: { note: Note; newLyric: string }): Note[] => {
  return [aliasSelectCore(args.note, args.newLyric)];
};

/**
 * notes[index]を複製し、newLengthに従って長さを分割する。
 * @param note 適用前のノート列
 * @param index 適用先のノート
 * @param newLyric 新しい長さ
 * @returns 適用後のノート
 */
const aliasSelectCore = (note: Note, newLyric: string): Note => {
  const newNote = note.deepCopy();
  newNote.lyric = newLyric;
  return newNote;
};

export const aliasSelect = (note: Note, newLyric: string): Note => {
  const oldNote = note.deepCopy();
  undoManager.register({
    undo: undo,
    undoArgs: oldNote,
    redo: redo,
    redoArgs: { note: oldNote, newLyric: newLyric },
    summary: `エイリアス変更。:${newLyric}`,
    all: true,
  });
  return aliasSelectCore(note, newLyric);
};
