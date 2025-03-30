import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { EnvelopeTextGroup } from "../../../components/EditorView/EnvelopeDialog/EnvelopeTextGroup";
import { defaultNote } from "../../../config/note";
import { COLOR_PALLET } from "../../../config/pallet";
import { useThemeMode } from "../../../hooks/useThemeMode";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { LOG } from "../../../lib/Logging";
import { Note } from "../../../lib/Note";
import { undoManager } from "../../../lib/UndoManager";
import { useCookieStore } from "../../../store/cookieStore";
import { useMusicProjectStore } from "../../../store/musicProjectStore";
import { EnvelopeEditorSvg } from "./EnvelopeEditorSvg";

const getEnvelopeValueToY = (value: number, height: number): number => {
  return ((200 - value) / 200) * height;
};

const getEnvelopePointToX = (
  point: number,
  msLength: number,
  width: number
): number => {
  // 1pixelあたりの長さ
  const msPerPixel = width / msLength;
  return point * msPerPixel;
};
const ENVELOPE_POINT_SORT = [0, 1, 4, 2, 3] as const;

export const EnvelopeDialog: React.FC<EnvelopeDialogProps> = (props) => {
  const { t } = useTranslation();
  const { colorTheme } = useCookieStore();
  const mode = useThemeMode();
  const { setNote } = useMusicProjectStore();
  const windowSize = useWindowSize();
  const [points, setPoints] = React.useState<number[]>([]);
  const [values, setValues] = React.useState<number[]>([]);
  const [svgSize, setSvgSize] = React.useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });
  React.useEffect(() => {
    if (props.note === undefined) {
      setPoints([]);
      setValues([]);
      return;
    }
    const envelope =
      props.note.envelope === undefined
        ? defaultNote.envelope
        : props.note.envelope;
    //pointsの数を正として初期化する
    const { p, v } = envelopeToPoint(envelope, props.note.msLength);
    setPoints(p);
    setValues(v);
  }, [props.note]);

  const pointX = React.useMemo(() => {
    return points.map((p) =>
      getEnvelopePointToX(p, props.note.msLength, svgSize.width)
    );
  }, [points, props.note.msLength, svgSize]);

  const pointY = React.useMemo(() => {
    return values.map((v) => getEnvelopeValueToY(v, svgSize.height));
  }, [values, svgSize]);

  React.useEffect(() => {
    setSvgSize({
      width: windowSize.width * 0.9,
      height: windowSize.height * 0.5,
    });
  }, [windowSize]);

  const setPoint = (index: number, value: string) => {
    const { p, v } = validationX(
      index,
      value,
      points,
      values,
      props.note.msLength
    );
    if (v.length !== values.length) {
      setValues(v);
    }
    setPoints(p);
  };

  const setValue = (index: number, value: string) => {
    const { p, v } = validationY(
      index,
      value,
      points,
      values,
      props.note.msLength
    );
    if (p.length !== points.length) {
      setPoints(p);
    }
    setValues(v);
  };

  /**
   * ノートの編集を確定する処理。
   */
  const handleButtonClick = () => {
    LOG.info(
      `エンベロープ確定。index:${
        props.note.index
      }、編集後パラメータ。point:${JSON.stringify(
        points
      )} value:${JSON.stringify(values)}`,
      "EnvelopeDialog"
    );
    const n = envelopeApply(props.note.deepCopy(), points, values);
    setNote(n.index, n);
    props.handleClose();
  };

  return (
    <>
      {props.note !== undefined && (
        <Dialog open={props.open} onClose={props.handleClose} fullScreen>
          <DialogTitle sx={{ px: 3, py: 1 }}>
            <EnvelopeEditorSvg
              svgSize={svgSize}
              pallet={COLOR_PALLET[colorTheme][mode]}
              overlapX={getEnvelopePointToX(
                props.note.atOverlap ?? 0,
                props.note.msLength,
                svgSize.width
              )}
              preutterX={getEnvelopePointToX(
                props.note.atPreutter ?? 0,
                props.note.msLength,
                svgSize.width
              )}
              pointX={pointX}
              pointY={pointY}
              msLength={props.note.msLength}
              setPoint={setPoint}
              setValue={setValue}
            />
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
          <DialogContent sx={{ p: 2 }}>
            <Box
              sx={{
                display: "flex",
                width: "100%",
                flexWrap: "nowrap",
                justifyContent: "space-around",
              }}
            >
              {ENVELOPE_POINT_SORT.map((i) => (
                <EnvelopeTextGroup
                  points={points}
                  values={values}
                  index={i}
                  setPoint={setPoint}
                  setValue={setValue}
                />
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleButtonClick}
              size="small"
              sx={{ mx: 1 }}
            >
              {t("editor.envelopeDialog.submitButton")}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export interface EnvelopeDialogProps {
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
 */
const redo = (args: { n: Note; point: number[]; value: number[] }): Note[] => {
  return [envelopeApplyCore(args.n, args.point, args.value)];
};

/**
 * 編集処理をノートに適用する
 * @param n 適用先のノート
 * @param point エンベロープのポルタメントを前からのms時間に換算したもの
 * @param value エンベロープのポルタメントの値
 * @returns 適用後のノート
 */
const envelopeApplyCore = (n: Note, point: number[], value: number[]): Note => {
  const envelope = { point: new Array(), value: value };
  envelope.point.push(point[0]);
  envelope.point.push(point[1] - point[0]);
  if (point.length === 3) {
    envelope.point.push(n.msLength - point[2]);
  } else {
    envelope.point.push(n.msLength - point[3] - point[2]);
  }
  if (point.length >= 4) {
    envelope.point.push(n.msLength - point[3]);
  }
  if (point.length === 5) {
    envelope.point.push(point[4] - point[1]);
  }
  n.setEnvelope(envelope);
  return n;
};

/**
 * 編集処理をノートに適用する
 * @param n 適用先のノート
 * @param point エンベロープのポルタメントを前からのms時間に換算したもの
 * @param value エンベロープのポルタメントの値
 * @returns 適用後のノート
 */
export const envelopeApply = (
  note: Note,
  points: number[],
  values: number[]
): Note => {
  const oldNote = note.deepCopy();
  undoManager.register({
    undo: undo,
    undoArgs: oldNote,
    redo: redo,
    redoArgs: { n: oldNote, point: points.slice(), value: values.slice() },
    summary: `エンベロープ確定。index:${
      note.index
    }、編集後パラメータ。point:${JSON.stringify(points)} value:${JSON.stringify(
      values
    )}`,
  });
  const n = envelopeApplyCore(note.deepCopy(), points, values);
  return n;
};

export const envelopeToPoint = (
  envelope: { point: number[]; value: number[] },
  msLength: number
): { p: number[]; v: number[] } => {
  const p = new Array<number>();
  const v = new Array<number>();
  p.push(envelope.point[0]);
  p.push(envelope.point[0] + envelope.point[1]);
  v.push(envelope.value[0] ?? 0);
  v.push(envelope.value[1] ?? 0);
  if (envelope.point.length >= 4) {
    p.push(msLength - envelope.point[3] - envelope.point[2]);
    p.push(msLength - envelope.point[3]);
    v.push(envelope.value[2] ?? 0);
    v.push(envelope.value[3] ?? 0);
  } else if (envelope.point.length === 3) {
    p.push(msLength - envelope.point[2]);
    v.push(envelope.value[2] ?? 0);
  }
  if (envelope.point.length === 5) {
    p.push(envelope.point[0] + envelope.point[1] + envelope.point[4]);
    v.push(envelope.value[4] ?? 0);
  }
  return { p: p, v: v };
};

export const validationY = (
  index: number,
  value: string,
  points: number[],
  values: number[],
  msLength: number
): { p: number[]; v: number[] } => {
  const p = points.slice();
  const v = values.slice();
  if (value === "") {
    return;
  }
  if (index >= 3 && p.length === 3) {
    p.push(msLength);
    v.push(0);
  }
  if (index === 4 && p.length === 4) {
    p.push(p[1]);
    v.push(100);
  }
  v[index] = Math.min(Math.max(value === "" ? 0 : parseFloat(value), 0), 200);
  return { p: p, v: v };
};

export const validationX = (
  index: number,
  value: string,
  points: number[],
  values: number[],
  msLength: number
): { p: number[]; v: number[] } => {
  const p = points.slice();
  const v = values.slice();
  if (value === "") {
    return;
  }
  if (index === 0) {
    p[0] = Math.min(Math.max(value === "" ? 0 : parseFloat(value), 0), p[1]);
  } else if (index === 1) {
    p[1] = Math.min(
      Math.max(value === "" ? 0 : parseFloat(value), p[0]),
      p[p.length === 5 ? 4 : 2]
    );
  } else if (index === 2) {
    p[2] = Math.min(
      Math.max(value === "" ? 0 : parseFloat(value), p[p.length === 5 ? 4 : 1]),
      p.length < 4 ? msLength : p[3]
    );
  } else if (index === 3) {
    if (p.length === 3) {
      p.push(msLength);
      v.push(0);
    }
    p[3] = Math.min(
      Math.max(value === "" ? 0 : parseFloat(value), p[2]),
      msLength
    );
  } else if (index === 4) {
    if (p.length === 3) {
      p.push(msLength);
      v.push(0);
    }
    if (p.length === 4) {
      p.push(0);
      v.push(100);
    }
    p[4] = Math.min(Math.max(value === "" ? 0 : parseFloat(value), p[1]), p[2]);
  }
  return { p: p, v: v };
};
