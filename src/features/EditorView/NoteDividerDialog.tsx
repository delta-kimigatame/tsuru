import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Slider,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { LOG } from "../../lib/Logging";
import { Note } from "../../lib/Note";
import { undoManager } from "../../lib/UndoManager";
import { useMusicProjectStore } from "../../store/musicProjectStore";

export const NoteDividerDialog: React.FC<NoteDividerDialogProps> = (props) => {
  const { t } = useTranslation();
  const [value, setValue] = React.useState<number>(0);
  const { notes, setNotes } = useMusicProjectStore();
  const marks = React.useMemo(() => {
    LOG.debug("noteIndexかnotesの更新検知", "NoteDiciderDialog");
    if (notes === null) return [];
    if (props.noteIndex === undefined || props.noteIndex >= notes.length)
      return [];
    const m = new Array<{ value: number; label: string }>();
    for (let i = 0; i <= notes[props.noteIndex].length / 480; i++) {
      m.push({ value: 480 * i, label: (480 * i).toString() });
    }
    if (notes[props.noteIndex].length % 480 !== 0) {
      m.push({
        value: notes[props.noteIndex].length,
        label: notes[props.noteIndex].length.toString(),
      });
    }
    LOG.debug(`mark:${JSON.stringify(m)}`, "NoteDiciderDialog");
    return m;
  }, [props.noteIndex, notes]);
  React.useEffect(() => {
    LOG.debug("noteIndexかnotesの更新検知", "NoteDiciderDialog");
    if (props.noteIndex === undefined) {
      setValue(0);
      return;
    }
    LOG.debug(
      `初期値:${Math.floor(notes[props.noteIndex].length / 2)}`,
      "NoteDiciderDialog"
    );
    setValue(Math.floor(notes[props.noteIndex].length / 2));
  }, [props.noteIndex, notes]);

  /**
   * ノートの編集を確定する処理。
   */
  const handleButtonClick = () => {
    LOG.info(
      `ノート分割確定。index:${props.noteIndex}、分割後長さ:${value}`,
      "NotePropertyDialog"
    );
    const n = noteDivide(notes, props.noteIndex, value);
    setNotes(n);
    props.handleClose();
  };

  return (
    <>
      {props.open && (
        <Dialog open={props.open} onClose={props.handleClose} fullWidth>
          <DialogTitle>
            <IconButton
              onClick={props.handleClose}
              aria-label="close"
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ m: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                {t("editor.noteDividerDialog.divider")}
              </Typography>
              <Slider
                aria-label={t("editor.noteDividerDialog.divider")}
                data-testid="noteDivideSlider"
                value={value}
                step={30}
                min={0}
                max={notes[props.noteIndex].length}
                valueLabelDisplay="auto"
                onChange={(e, newValue: number) => {
                  setValue(newValue);
                }}
                marks={marks}
                sx={{ mx: 1 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleButtonClick}
              size="large"
              sx={{ mx: 1 }}
            >
              {t("editor.noteDividerDialog.submitButton")}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export interface NoteDividerDialogProps {
  noteIndex: number;
  open: boolean;
  handleClose: () => void;
}

/**
 * undo用のコマンド。undoManagerはNote[]を返すことを期待するので、元のノートを配列にして返す
 * @param oldNote 元のノート
 * @returns 元のノートを長さ1の配列にしたもの
 */
const undo = (oldNote: Note[]): Note[] => {
  return oldNote;
};

/**
 * redo用のコマンド。
 */
const redo = (args: {
  notes: Note[];
  index: number;
  newLength: number;
}): Note[] => {
  return noteDivideCore(args.notes, args.index, args.newLength);
};

/**
 * notes[index]を複製し、newLengthに従って長さを分割する。
 * @param notes 適用前のノート列
 * @param index 適用先のノート
 * @param newLength 新しい長さ
 * @returns 適用後のノート
 */
const noteDivideCore = (
  notes: Note[],
  index: number,
  newLength: number
): Note[] => {
  const newNotes = notes
    .slice(0, index)
    .concat([notes[index]], notes.slice(index))
    .map((n) => n.deepCopy());
  newNotes[index + 1].length = newNotes[index].length - newLength;
  newNotes[index].length = newLength;
  return newNotes;
};

export const noteDivide = (
  notes: Note[],
  index: number,
  newLength: number
): Note[] => {
  const oldNote = notes.map((n) => n.deepCopy());
  undoManager.register({
    undo: undo,
    undoArgs: oldNote,
    redo: redo,
    redoArgs: { notes: oldNote, index: index, newLength: newLength },
    summary: `ノート分割確定。index:${index}、分割後長さ:${newLength}`,
  });
  return noteDivideCore(notes, index, newLength);
};
