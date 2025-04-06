import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Slider,
  Switch,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { LOG } from "../../lib/Logging";
import { Note } from "../../lib/Note";
import { undoManager } from "../../lib/UndoManager";
import { useMusicProjectStore } from "../../store/musicProjectStore";

type VibratoState = {
  /** ノート長に対するビブラートの割合 */
  length: number;
  /** ビブラートにおけるsin派1周にかかる時間(ms) */
  cycle: number;
  /** ビブラートのsin派の高さ(cent) */
  depth: number;
  /** ビブラートの波の大きさが最大になるまでの時間をビブラート全体の長さに対する割合で指定 */
  fadeInTime: number;
  /** ビブラートの波の大きさが0になるまでの時間をビブラート全体の長さに対する割合で指定 */
  fadeOutTime: number;
  /** sin派の位相が一周の何%ずれているか */
  phase: number;
  /** 0のとき波の中心が、-100のとき波の頂点が0に、100のとき波の底が0となるような割合 */
  height: number;
};

type VibratoFormAction =
  | ({
      type: "UPDATE_FIELD";
    } & {
      [K in keyof VibratoState]: {
        key: K;
        value: VibratoState[K];
      };
    }[keyof VibratoState])
  | {
      type: "RESET";
      initial: VibratoState;
    };

const initialFormData: VibratoState = {
  length: 65,
  cycle: 180,
  depth: 35,
  fadeInTime: 20,
  fadeOutTime: 20,
  phase: 0,
  height: 0,
};

export const VibratoDialog: React.FC<VibratoDialogProps> = (props) => {
  const { t } = useTranslation();
  const { setNote } = useMusicProjectStore();
  const formReducer = (state: VibratoState, action: VibratoFormAction) => {
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
  const [useVibrato, setUseVibrato] = React.useState<boolean>(false);
  React.useEffect(() => {
    LOG.debug(`ノートの変更検知、編集内容の初期化`, "VibratoDialog");
    if (props.note && props.note.vibrato !== undefined) {
      setUseVibrato(true);
      dispatch({ type: "RESET", initial: props.note.vibrato });
    } else {
      setUseVibrato(false);
      dispatch({ type: "RESET", initial: initialFormData });
    }
  }, [props.note]);

  /**
   * ビブラートの編集を確定する処理。
   */
  const handleButtonClick = () => {
    LOG.info(
      `ビブラート編集確定。index:${
        props.note.index
      }、編集後パラメータ:${JSON.stringify(formState)}`,
      "VibratoDialog"
    );
    const n = VibratoEdit(props.note.deepCopy(), formState, useVibrato);
    setNote(n.index, n);
    props.handleClose();
  };
  return (
    <Dialog open={props.open} onClose={props.handleClose} fullScreen>
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
        <Box sx={{ mx: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={useVibrato}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setUseVibrato(e.target.checked);
                }}
                data-testid="useVibrato"
                aria-label="useVibrato"
              />
            }
            label={t("editor.vibratoDialog.useVibrato")}
          />
        </Box>
        <Box sx={{ m: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            {t("editor.vibratoDialog.length")}
          </Typography>
          <Slider
            aria-label={t("editor.vibratoDialog.length")}
            value={formState.length}
            step={1}
            min={0}
            max={100}
            valueLabelDisplay="auto"
            onChange={(e, newValue: number) => {
              dispatch({
                type: "UPDATE_FIELD",
                key: "length",
                value: newValue,
              });
            }}
            marks={[
              { value: 0, label: "0" },
              { value: 100, label: "100" },
            ]}
            sx={{ mx: 1 }}
            disabled={!useVibrato}
          />
        </Box>
        <Box sx={{ m: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            {t("editor.vibratoDialog.cycle")}
          </Typography>
          <Slider
            aria-label={t("editor.vibratoDialog.cycle")}
            value={formState.cycle}
            step={1}
            min={64}
            max={512}
            valueLabelDisplay="auto"
            onChange={(e, newValue: number) => {
              dispatch({
                type: "UPDATE_FIELD",
                key: "cycle",
                value: newValue,
              });
            }}
            marks={[
              { value: 64, label: "64" },
              { value: 512, label: "512" },
            ]}
            sx={{ mx: 1 }}
            disabled={!useVibrato}
          />
        </Box>
        <Box sx={{ m: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            {t("editor.vibratoDialog.depth")}
          </Typography>
          <Slider
            aria-label={t("editor.vibratoDialog.depth")}
            value={formState.depth}
            step={1}
            min={0}
            max={200}
            valueLabelDisplay="auto"
            onChange={(e, newValue: number) => {
              dispatch({
                type: "UPDATE_FIELD",
                key: "depth",
                value: newValue,
              });
            }}
            marks={[
              { value: 0, label: "0" },
              { value: 100, label: "100" },
              { value: 200, label: "200" },
            ]}
            sx={{ mx: 1 }}
            disabled={!useVibrato}
          />
        </Box>
        <Box sx={{ m: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            {t("editor.vibratoDialog.fadeInTime")}
          </Typography>
          <Slider
            aria-label={t("editor.vibratoDialog.fadeInTime")}
            value={formState.fadeInTime}
            step={1}
            min={0}
            max={100}
            valueLabelDisplay="auto"
            onChange={(e, newValue: number) => {
              dispatch({
                type: "UPDATE_FIELD",
                key: "fadeInTime",
                value: newValue,
              });
            }}
            marks={[
              { value: 0, label: "0" },
              { value: 100, label: "100" },
            ]}
            sx={{ mx: 1 }}
            disabled={!useVibrato}
          />
        </Box>
        <Box sx={{ m: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            {t("editor.vibratoDialog.fadeOutTime")}
          </Typography>
          <Slider
            aria-label={t("editor.vibratoDialog.fadeOutTime")}
            value={formState.fadeOutTime}
            step={1}
            min={0}
            max={100}
            valueLabelDisplay="auto"
            onChange={(e, newValue: number) => {
              dispatch({
                type: "UPDATE_FIELD",
                key: "fadeOutTime",
                value: newValue,
              });
            }}
            marks={[
              { value: 0, label: "0" },
              { value: 100, label: "100" },
            ]}
            sx={{ mx: 1 }}
            disabled={!useVibrato}
          />
        </Box>
        <Box sx={{ m: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            {t("editor.vibratoDialog.phase")}
          </Typography>
          <Slider
            aria-label={t("editor.vibratoDialog.phase")}
            value={formState.phase}
            step={1}
            min={0}
            max={100}
            valueLabelDisplay="auto"
            onChange={(e, newValue: number) => {
              dispatch({
                type: "UPDATE_FIELD",
                key: "phase",
                value: newValue,
              });
            }}
            marks={[
              { value: 0, label: "0" },
              { value: 100, label: "100" },
            ]}
            sx={{ mx: 1 }}
            disabled={!useVibrato}
          />
        </Box>
        <Box sx={{ m: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            {t("editor.vibratoDialog.height")}
          </Typography>
          <Slider
            aria-label={t("editor.vibratoDialog.height")}
            value={formState.height}
            step={1}
            min={-100}
            max={100}
            valueLabelDisplay="auto"
            onChange={(e, newValue: number) => {
              dispatch({
                type: "UPDATE_FIELD",
                key: "height",
                value: newValue,
              });
            }}
            marks={[
              { value: -100, label: "-100" },
              { value: 0, label: "0" },
              { value: 100, label: "100" },
            ]}
            sx={{ mx: 1 }}
            disabled={!useVibrato}
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
          {t("editor.vibratoDialog.submitButton")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export interface VibratoDialogProps {
  note: Note;
  open: boolean;
  handleClose: () => void;
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
const redo = (args: {
  n: Note;
  state: VibratoState;
  useVibrato: boolean;
}): Note[] => {
  return [VibratoEditCore(args.n.deepCopy(), args.state, args.useVibrato)];
};
/**
 * 編集処理をノートに適用する
 * @param n 適用先のノート
 * @param state 編集値
 * @returns 適用後のノート
 */
export const VibratoEdit = (
  note: Note,
  state: VibratoState,
  useVibrato: boolean
): Note => {
  const oldNote = note.deepCopy();
  undoManager.register({
    undo: undo,
    undoArgs: oldNote,
    redo: redo,
    redoArgs: { n: oldNote, state: { ...state }, useVibrato },
    summary: `ノート編集。index:${
      note.index
    }、編集後パラメータ:${JSON.stringify(state)}`,
  });
  return VibratoEditCore(note.deepCopy(), state, useVibrato);
};
/**
 * 編集処理をノートに適用する
 * @param n 適用先のノート
 * @param state 編集値
 * @returns 適用後のノート
 */
const VibratoEditCore = (
  n: Note,
  state: VibratoState,
  useVibrato: boolean
): Note => {
  if (useVibrato) {
    n.vibrato = `${state.length},${state.cycle},${state.depth},${state.fadeInTime},${state.fadeOutTime},${state.phase},${state.height},0`;
  } else {
    n.vibrato = undefined;
  }
  return n;
};
