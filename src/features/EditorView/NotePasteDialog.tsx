import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { EDITOR_CONFIG } from "../../config/editor";
import { useWindowSize } from "../../hooks/useWindowSize";
import { LOG } from "../../lib/Logging";
import { Note } from "../../lib/Note";
import { undoManager } from "../../lib/UndoManager";
import { Ust } from "../../lib/Ust";
import { useMusicProjectStore } from "../../store/musicProjectStore";
import { getTargetNotes } from "./NoteMenu/NoteMenu";

const initialState: NoteState = {
  lyric: false,
  length: false,
  notenum: false,
  preutter: false,
  overlap: false,
  stp: false,
  velocity: false,
  intensity: false,
  modulation: false,
  pitch: false,
  envelope: false,
  vibrato: false,
  flags: false,
  direct: false,
  voiceColor: false,
};
type NoteState = {
  lyric: boolean;
  length: boolean;
  notenum: boolean;
  preutter: boolean;
  overlap: boolean;
  stp: boolean;
  velocity: boolean;
  intensity: boolean;
  modulation: boolean;
  pitch: boolean;
  envelope: boolean;
  vibrato: boolean;
  flags: boolean;
  direct: boolean;
  voiceColor: boolean;
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

export const NotePasteDialog: React.FC<NotePasteDialogProps> = (props) => {
  const { t } = useTranslation();
  const windowSize = useWindowSize();
  const { notes, setNotes } = useMusicProjectStore();
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

  const loadUstFromClipboard = async (): Promise<Ust> => {
    const clipUst = new Ust();
    try {
      const clipText = await navigator.clipboard.readText();
      try {
        clipUst.loadText(clipText.replace(/\r\n/g, "\n").split("\n"));
        return clipUst;
      } catch (e) {
        LOG.warn(
          "クリップボードのデータはustではありません。",
          "NotePasteDialog"
        );
        props.handleClose();
        return null;
      }
    } catch (e) {
      LOG.warn("クリップボードの確認に失敗", "NotePasteDialog");
      props.handleClose();
      return null;
    }
  };

  const [formState, dispatch] = React.useReducer(formReducer, initialState);

  const handleButtonClick = async () => {
    LOG.info("クリップボードから形式を指定して貼り付け", "NotePasteDialog");
    const filteredSelectNotesIndex = props.selectedNotesIndex.filter(
      (idx) => idx >= 0 && idx < notes.length
    );
    if (filteredSelectNotesIndex.length === 0) {
      return;
    }
    const targetNotes = getTargetNotes(notes, filteredSelectNotesIndex);
    const loadedUst = await loadUstFromClipboard();
    if (!loadedUst || !loadedUst.notes) {
      LOG.warn("クリップボードから有効なUSTデータを読み込めませんでした", "NotePasteDialog");
      props.handleClose();
      return;
    }
    const loadNotes = loadedUst.notes;
    const newNotes = NotePaste(targetNotes, loadNotes, formState);
    const updatedNotes = [...notes];
    filteredSelectNotesIndex.forEach((idx, i) => {
      updatedNotes[idx] = newNotes[i];
    });
    setNotes(updatedNotes);
    props.handleClose();
  };
  return (
    <Dialog
      open={props.open}
      onClose={props.handleClose}
      fullScreen={
        windowSize.width < EDITOR_CONFIG.FULLSCREEN_DIALOG_THRESHOLD_WIDTH
      }
      fullWidth={
        windowSize.width >= EDITOR_CONFIG.FULLSCREEN_DIALOG_THRESHOLD_WIDTH
      }
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
      <DialogActions>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleButtonClick}
          size="large"
          sx={{ mx: 1 }}
        >
          {t("editor.notePaste.submitButton")}
        </Button>
      </DialogActions>
      <DialogContent>
        <Box sx={{ mx: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formState.lyric}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  dispatch({
                    type: "UPDATE_FIELD",
                    key: "lyric",
                    value: e.target.checked,
                  });
                }}
              />
            }
            label={t("editor.notePaste.lyric")}
          />
        </Box>
        <Box sx={{ mx: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formState.length}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  dispatch({
                    type: "UPDATE_FIELD",
                    key: "length",
                    value: e.target.checked,
                  });
                }}
              />
            }
            label={t("editor.notePaste.length")}
          />
        </Box>
        <Box sx={{ mx: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formState.notenum}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  dispatch({
                    type: "UPDATE_FIELD",
                    key: "notenum",
                    value: e.target.checked,
                  });
                }}
              />
            }
            label={t("editor.notePaste.notenum")}
          />
        </Box>
        <Box sx={{ mx: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formState.preutter}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  dispatch({
                    type: "UPDATE_FIELD",
                    key: "preutter",
                    value: e.target.checked,
                  });
                }}
              />
            }
            label={t("editor.notePaste.preutter")}
          />
        </Box>
        <Box sx={{ mx: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formState.overlap}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  dispatch({
                    type: "UPDATE_FIELD",
                    key: "overlap",
                    value: e.target.checked,
                  });
                }}
              />
            }
            label={t("editor.notePaste.overlap")}
          />
        </Box>
        <Box sx={{ mx: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formState.stp}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  dispatch({
                    type: "UPDATE_FIELD",
                    key: "stp",
                    value: e.target.checked,
                  });
                }}
              />
            }
            label={t("editor.notePaste.stp")}
          />
        </Box>
        <Box sx={{ mx: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formState.velocity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  dispatch({
                    type: "UPDATE_FIELD",
                    key: "velocity",
                    value: e.target.checked,
                  });
                }}
              />
            }
            label={t("editor.notePaste.velocity")}
          />
        </Box>
        <Box sx={{ mx: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formState.intensity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  dispatch({
                    type: "UPDATE_FIELD",
                    key: "intensity",
                    value: e.target.checked,
                  });
                }}
              />
            }
            label={t("editor.notePaste.intensity")}
          />
        </Box>

        <Box sx={{ mx: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formState.modulation}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  dispatch({
                    type: "UPDATE_FIELD",
                    key: "modulation",
                    value: e.target.checked,
                  });
                }}
              />
            }
            label={t("editor.notePaste.modulation")}
          />
        </Box>

        <Box sx={{ mx: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formState.pitch}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  dispatch({
                    type: "UPDATE_FIELD",
                    key: "pitch",
                    value: e.target.checked,
                  });
                }}
              />
            }
            label={t("editor.notePaste.pitch")}
          />
        </Box>
        <Box sx={{ mx: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formState.vibrato}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  dispatch({
                    type: "UPDATE_FIELD",
                    key: "vibrato",
                    value: e.target.checked,
                  });
                }}
              />
            }
            label={t("editor.notePaste.vibrato")}
          />
        </Box>
        <Box sx={{ mx: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formState.envelope}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  dispatch({
                    type: "UPDATE_FIELD",
                    key: "envelope",
                    value: e.target.checked,
                  });
                }}
              />
            }
            label={t("editor.notePaste.envelope")}
          />
        </Box>
        <Box sx={{ mx: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formState.flags}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  dispatch({
                    type: "UPDATE_FIELD",
                    key: "flags",
                    value: e.target.checked,
                  });
                }}
              />
            }
            label={t("editor.notePaste.flags")}
          />
        </Box>
        <Box sx={{ mx: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formState.direct}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  dispatch({
                    type: "UPDATE_FIELD",
                    key: "direct",
                    value: e.target.checked,
                  });
                }}
              />
            }
            label={t("editor.notePaste.direct")}
          />
        </Box>
        <Box sx={{ mx: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formState.voiceColor}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  dispatch({
                    type: "UPDATE_FIELD",
                    key: "voiceColor",
                    value: e.target.checked,
                  });
                }}
              />
            }
            label={t("editor.notePaste.voiceColor")}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export interface NotePasteDialogProps {
  selectedNotesIndex: Array<number>;
  open: boolean;
  handleClose: () => void;
}

const undo = (oldNotes: Note[]): Note[] => {
  return oldNotes;
};

const redo = (args: {
  oldNotes: Note[];
  loadNotes: Note[];
  state: NoteState;
}): Note[] => {
  return NotePasteCore(args.oldNotes, args.loadNotes, args.state);
};
const NotePaste = (
  notes: Note[],
  loadNotes: Note[],
  formState: NoteState
): Note[] => {
  const oldNote = notes.map((n) => n.deepCopy());
  const loadNoteCopies = loadNotes.map((n) => n.deepCopy());
  undoManager.register({
    undo: undo,
    undoArgs: oldNote,
    redo: redo,
    redoArgs: {
      oldNotes: oldNote,
      loadNotes: loadNoteCopies,
      state: { ...formState },
    },
    summary: `クリップボードから形式張り付け:${JSON.stringify(formState)}`,
  });
  return NotePasteCore(notes, loadNotes, formState);
};

const NotePasteCore = (
  notes: Note[],
  loadNotes: Note[],
  formState: NoteState
): Note[] => {
  const newNotes: Note[] = notes.map((n, i) => {
    /** loadNotesの方が、notesより短い場合があり得る。iとloadNotesを使って対応indexを求める。 */
    const loadIndex = i % loadNotes.length;
    if (formState.lyric && loadNotes[loadIndex].lyric) {
      n.lyric = loadNotes[loadIndex].lyric;
    }
    if (formState.length && loadNotes[loadIndex].length) {
      n.length = loadNotes[loadIndex].length;
    }
    if (formState.notenum && loadNotes[loadIndex].notenum) {
      n.notenum = loadNotes[loadIndex].notenum;
    }
    if (formState.preutter && loadNotes[loadIndex].preutter !== undefined) {
      n.preutter = loadNotes[loadIndex].preutter;
    }
    if (formState.overlap && loadNotes[loadIndex].overlap !== undefined) {
      n.overlap = loadNotes[loadIndex].overlap;
    }
    if (formState.stp && loadNotes[loadIndex].stp !== undefined) {
      n.stp = loadNotes[loadIndex].stp;
    }
    if (formState.velocity && loadNotes[loadIndex].velocity !== undefined) {
      n.velocity = loadNotes[loadIndex].velocity;
    }
    if (formState.intensity && loadNotes[loadIndex].intensity !== undefined) {
      n.intensity = loadNotes[loadIndex].intensity;
    }
    if (formState.modulation && loadNotes[loadIndex].modulation !== undefined) {
      n.modulation = loadNotes[loadIndex].modulation;
    }
    if (formState.pitch) {
      if (loadNotes[loadIndex].pbs !== undefined) {
        if (loadNotes[loadIndex].pbs.time !== undefined) {
          n.pbsTime = loadNotes[loadIndex].pbs.time;
        }
        if (loadNotes[loadIndex].pbs.height !== undefined) {
          n.pbsHeight = loadNotes[loadIndex].pbs.height;
        }
      }
      if (loadNotes[loadIndex].pby !== undefined) {
        n.setPby(loadNotes[loadIndex].pby);
      }
      if (loadNotes[loadIndex].pbw !== undefined) {
        n.setPbw(loadNotes[loadIndex].pbw);
      }
      if (loadNotes[loadIndex].pbm !== undefined) {
        n.setPbm(loadNotes[loadIndex].pbm);
      }
    }
    if (formState.envelope && loadNotes[loadIndex].envelope) {
      n.setEnvelope(loadNotes[loadIndex].envelope);
    }
    if (formState.vibrato && loadNotes[loadIndex].vibrato) {
      n.vibratoLength = loadNotes[loadIndex].vibratoLength;
      n.vibratoCycle = loadNotes[loadIndex].vibratoCycle;
      n.vibratoDepth = loadNotes[loadIndex].vibratoDepth;
      n.vibratoFadeInTime = loadNotes[loadIndex].vibratoFadeInTime;
      n.vibratoFadeOutTime = loadNotes[loadIndex].vibratoFadeOutTime;
      n.vibratoPhase = loadNotes[loadIndex].vibratoPhase;
      n.vibratoHeight = loadNotes[loadIndex].vibratoHeight;
    }
    if (formState.flags && loadNotes[loadIndex].flags !== undefined) {
      n.flags = loadNotes[loadIndex].flags;
    }
    if (formState.direct && loadNotes[loadIndex].direct !== undefined) {
      n.direct = loadNotes[loadIndex].direct;
    }
    if (formState.voiceColor && loadNotes[loadIndex].voiceColor !== undefined) {
      n.voiceColor = loadNotes[loadIndex].voiceColor;
    }
    return n;
  });
  return newNotes;
};
