import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { LOG } from "../../lib/Logging";
import { Note } from "../../lib/Note";
import { undoManager } from "../../lib/UndoManager";
import { useMusicProjectStore } from "../../store/musicProjectStore";
import { range } from "../../utils/array";
import { noteNumToTone } from "../../utils/Notenum";

const initialFormData: NoteState = {
  lyric: "あ",
  length: 480,
  notenum: 60,
  preutter: undefined,
  overlap: undefined,
  stp: undefined,
  velocity: undefined,
  intensity: undefined,
  modulation: undefined,
};

export const NotePropertyDialog: React.FC<NotePropertyDialogProps> = (
  props
) => {
  const { t } = useTranslation();
  const { vb, setNote } = useMusicProjectStore();

  const formReducer = (state: NoteState, action: NoteFormAction) => {
    switch (action.type) {
      case "UPDATE_FIELD":
        return { ...state, [action.key]: action.value };
      case "RESET":
        return action.initial;
      default:
        return state;
    }
  };
  const [formState, dispatch] = React.useReducer(formReducer, initialFormData);
  React.useEffect(() => {
    if (props.note) {
      dispatch({ type: "RESET", initial: pickNoteFields(props.note) });
    } else {
      dispatch({ type: "RESET", initial: initialFormData });
    }
  }, [props.note]);

  /**
   * ノートの編集を確定する処理。
   */
  const handleButtonClick = () => {
    LOG.info(
      `ノート編集確定。index:${
        props.note.index
      }、編集後パラメータ:${JSON.stringify(formState)}`,
      "NotePropertyDialog"
    );
    const oldNote = props.note.deepCopy();
    undoManager.register({
      undo: undo,
      undoArgs: oldNote,
      redo: redo,
      redoArgs: { n: oldNote, state: { ...formState } },
      summary: `ノート編集。index:${
        props.note.index
      }、編集後パラメータ:${JSON.stringify(formState)}`,
    });
    const n = apply(props.note.deepCopy(), formState);
    setNote(n.index, n);
    props.handleClose();
  };

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
  const redo = (args: { n: Note; state: NoteState }): Note[] => {
    return [apply(args.n, args.state)];
  };

  /**
   * 編集処理をノートに適用する
   * @param n 適用先のノート
   * @param state 編集値
   * @returns 適用後のノート
   */
  const apply = (n: Note, state: NoteState): Note => {
    n.lyric = state.lyric;
    n.length = state.length;
    n.notenum = state.notenum;
    if (n.lyric !== "R") {
      n.preutter = state.preutter;
      n.overlap = state.overlap;
      n.stp = state.stp;
      n.velocity = state.velocity;
      n.intensity = state.intensity;
      n.modulation = state.modulation;
    }
    return n;
  };

  return (
    <Dialog
      open={props.open && vb !== null}
      onClose={props.handleClose}
      fullScreen
    >
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
        <TextField
          fullWidth
          variant="outlined"
          sx={{
            m: 1,
          }}
          type="text"
          label={t("editor.noteProperty.lyric")}
          value={formState.lyric}
          onChange={(e) =>
            dispatch({
              type: "UPDATE_FIELD",
              key: "lyric",
              value: e.target.value,
            })
          }
        />
        <TextField
          fullWidth
          variant="outlined"
          sx={{
            m: 1,
          }}
          type="number"
          label={t("editor.noteProperty.length")}
          value={formState.length}
          onChange={(e) =>
            dispatch({
              type: "UPDATE_FIELD",
              key: "length",
              value:
                e.target.value === ""
                  ? 0
                  : Math.max(parseInt(e.target.value), 0),
            })
          }
        />
        <FormControl fullWidth sx={{ m: 1 }}>
          <InputLabel>{t("editor.noteProperty.notenum")}</InputLabel>
          <Select
            label={t("editor.noteProperty.notenum")}
            variant="filled"
            defaultValue=""
            value={formState.notenum.toString()}
            onChange={(e) =>
              dispatch({
                type: "UPDATE_FIELD",
                key: "notenum",
                value: parseInt(e.target.value),
              })
            }
            data-testid="notenum-select"
          >
            {range(24, 107).map((num) => (
              <MenuItem value={num.toString()}>{noteNumToTone(num)}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {formState.lyric !== "R" && (
          <>
            <TextField
              fullWidth
              variant="outlined"
              sx={{
                m: 1,
              }}
              type="number"
              label={t("editor.noteProperty.preutter")}
              value={formState.preutter}
              onChange={(e) =>
                dispatch({
                  type: "UPDATE_FIELD",
                  key: "preutter",
                  value:
                    e.target.value === ""
                      ? undefined
                      : Math.max(parseFloat(e.target.value), 0),
                })
              }
            />
            <TextField
              fullWidth
              variant="outlined"
              sx={{
                m: 1,
              }}
              type="number"
              label={t("editor.noteProperty.overlap")}
              value={formState.overlap}
              onChange={(e) =>
                dispatch({
                  type: "UPDATE_FIELD",
                  key: "overlap",
                  value:
                    e.target.value === ""
                      ? undefined
                      : parseFloat(e.target.value),
                })
              }
            />
            <TextField
              fullWidth
              variant="outlined"
              sx={{
                m: 1,
              }}
              type="number"
              label={t("editor.noteProperty.stp")}
              value={formState.stp}
              onChange={(e) =>
                dispatch({
                  type: "UPDATE_FIELD",
                  key: "stp",
                  value:
                    e.target.value === ""
                      ? undefined
                      : Math.max(parseFloat(e.target.value), 0),
                })
              }
            />
            <Box sx={{ m: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                {t("editor.noteProperty.velocity")}
              </Typography>
              <Slider
                aria-label={t("editor.noteProperty.velocity")}
                value={formState.velocity ?? 100}
                step={1}
                min={0}
                max={200}
                valueLabelDisplay="auto"
                onChange={(e, newValue: number) => {
                  dispatch({
                    type: "UPDATE_FIELD",
                    key: "velocity",
                    value: newValue,
                  });
                }}
                marks={[
                  { value: 0, label: "0" },
                  { value: 100, label: "100" },
                  { value: 200, label: "200" },
                ]}
                sx={{ mx: 1 }}
              />
            </Box>
            <Box sx={{ m: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                {t("editor.noteProperty.intensity")}
              </Typography>
              <Slider
                aria-label={t("editor.noteProperty.intensity")}
                value={formState.intensity ?? 100}
                step={1}
                min={0}
                max={200}
                valueLabelDisplay="auto"
                onChange={(e, newValue: number) => {
                  dispatch({
                    type: "UPDATE_FIELD",
                    key: "intensity",
                    value: newValue,
                  });
                }}
                marks={[
                  { value: 0, label: "0" },
                  { value: 100, label: "100" },
                  { value: 200, label: "200" },
                ]}
                sx={{ mx: 1 }}
              />
            </Box>
            <Box sx={{ m: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                {t("editor.noteProperty.modulation")}
              </Typography>
              <Slider
                aria-label={t("editor.noteProperty.modulation")}
                value={formState.modulation ?? 0}
                step={1}
                min={-200}
                max={200}
                valueLabelDisplay="auto"
                onChange={(e, newValue: number) => {
                  dispatch({
                    type: "UPDATE_FIELD",
                    key: "modulation",
                    value: newValue,
                  });
                }}
                marks={[
                  { value: -200, label: "-200" },
                  { value: -100, label: "-100" },
                  { value: 0, label: "0" },
                  { value: 100, label: "100" },
                  { value: 200, label: "200" },
                ]}
                sx={{ mx: 1 }}
              />
            </Box>
          </>
        )}
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
          {t("notePropertyDialog.submitButton")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export interface NotePropertyDialogProps {
  note: Note;
  open: boolean;
  handleClose: () => void;
}

type NoteState = {
  lyric: string;
  length: number;
  notenum: number;
  preutter: number | undefined;
  overlap: number | undefined;
  stp: number | undefined;
  velocity: number | undefined;
  intensity: number | undefined;
  modulation: number | undefined;
};
type NoteFormAction =
  | ({
      type: "UPDATE_FIELD";
    } & {
      [K in keyof NoteState]: {
        key: K;
        value: NoteState[K];
      };
    }[keyof NoteState])
  | {
      type: "RESET";
      initial: NoteState;
    };

const pickNoteFields = (note: Note): NoteState => ({
  lyric: note.lyric,
  length: note.length,
  notenum: note.notenum,
  preutter: note.preutter,
  overlap: note.overlap,
  stp: note.stp,
  velocity: note.velocity,
  intensity: note.intensity,
  modulation: note.modulation,
});
