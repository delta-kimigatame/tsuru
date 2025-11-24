import { Menu, TextField } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { Note } from "../../lib/Note";
import { undoManager } from "../../lib/UndoManager";
import { useMusicProjectStore } from "../../store/musicProjectStore";

export const LyricTextBox: React.FC<LyricTextBoxProps> = (props) => {
  const { t } = useTranslation();
  const { notes, setNoteProperty } = useMusicProjectStore();
  const [lyric, setLyric] = React.useState("");

  const handleMenuClose = () => {
    RegistUndo(notes[props.targetNoteIndex], lyric);
    setNoteProperty(props.targetNoteIndex, "lyric", lyric);
    props.setTargetNoteIndex(undefined);
  };

  React.useEffect(() => {
    if (props.targetNoteIndex === undefined) {
      setLyric("");
    } else {
      setLyric(notes[props.targetNoteIndex].lyric);
    }
  }, [props.targetNoteIndex]);
  return (
    <>
      {props.targetNoteIndex !== undefined && (
        <Menu
          open={props.targetNoteIndex !== undefined}
          anchorReference="anchorPosition"
          onClose={handleMenuClose}
          sx={{ userSelect: "none" }}
          anchorPosition={{
            top: props.lyricAnchor.y,
            left: props.lyricAnchor.x,
          }}
        >
          <TextField
            variant="outlined"
            type="text"
            label={t("editor.noteProperty.lyric")}
            data-testid="propertyLyric"
            value={lyric}
            onChange={(e) => setLyric(e.target.value)}
          />
        </Menu>
      )}
    </>
  );
};
export interface LyricTextBoxProps {
  targetNoteIndex: number | undefined;
  setTargetNoteIndex: (index: number | undefined) => void;
  lyricAnchor: {
    x: number;
    y: number;
  } | null;
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
 * redo用のコマンド。undoManagerはNote[]を返すことを期待するので、元のノートを配列にして返す
 * @param oldNote 元のノート
 * @param state 編集後の値
 * @returns 編集後のノートを長さ1の配列にしたもの
 */
const redo = (args: { n: Note; lyric: string }): Note[] => {
  return [SetLyricCore(args.n.deepCopy(), args.lyric)];
};

const SetLyricCore = (n: Note, lyric: string): Note => {
  n.lyric = lyric;
  return n;
};

const RegistUndo = (note: Note, lyric: string) => {
  const oldNote = note.deepCopy();
  undoManager.register({
    undo: undo,
    undoArgs: oldNote,
    redo: redo,
    redoArgs: { n: oldNote, lyric: lyric },
    summary: `ノート歌詞変更。index:${note.index}、編集後歌詞:${lyric}`,
  });
  return SetLyricCore(note.deepCopy(), lyric);
};
