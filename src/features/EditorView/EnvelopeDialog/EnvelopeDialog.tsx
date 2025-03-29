import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { defaultNote } from "../../../config/note";
import { COLOR_PALLET } from "../../../config/pallet";
import { useThemeMode } from "../../../hooks/useThemeMode";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { LOG } from "../../../lib/Logging";
import { Note } from "../../../lib/Note";
import { undoManager } from "../../../lib/UndoManager";
import { useCookieStore } from "../../../store/cookieStore";
import { useMusicProjectStore } from "../../../store/musicProjectStore";

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
  const [targetIndex, setTargetIndex] = React.useState<number | undefined>(
    undefined
  );
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
    const p = new Array<number>();
    const v = new Array<number>();
    p.push(envelope.point[0]);
    p.push(envelope.point[0] + envelope.point[1]);
    v.push(envelope.value[0] ?? 0);
    v.push(envelope.value[1] ?? 0);
    if (envelope.point.length >= 4) {
      p.push(props.note.msLength - envelope.point[3] - envelope.point[2]);
      p.push(props.note.msLength - envelope.point[3]);
      v.push(envelope.value[2] ?? 0);
      v.push(envelope.value[3] ?? 0);
    } else if (envelope.point.length === 3) {
      p.push(props.note.msLength - envelope.point[2]);
      v.push(envelope.value[2] ?? 0);
    }
    if (envelope.point.length === 5) {
      p.push(envelope.point[0] + envelope.point[1] + envelope.point[4]);
      v.push(envelope.value[4] ?? 0);
    }
    setPoints(p);
    setValues(v);
  }, [props.note]);

  React.useEffect(() => {
    setSvgSize({
      width: windowSize.width * 0.9,
      height: windowSize.height * 0.5,
    });
  }, [windowSize]);

  const setPoint = (index: number, value: string) => {
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
        Math.max(
          value === "" ? 0 : parseFloat(value),
          p[p.length === 5 ? 4 : 1]
        ),
        p.length < 4 ? props.note.msLength : p[3]
      );
    } else if (index === 3) {
      if (p.length === 3) {
        p.push(props.note.msLength);
        v.push(0);
        setValues(v);
      }
      p[3] = Math.min(
        Math.max(value === "" ? 0 : parseFloat(value), p[2]),
        props.note.msLength
      );
    } else if (index === 4) {
      if (p.length === 3) {
        p.push(props.note.msLength);
        v.push(0);
        setValues(v);
      }
      if (p.length === 4) {
        p.push(0);
        v.push(100);
        setValues(v);
      }
      p[4] = Math.min(
        Math.max(value === "" ? 0 : parseFloat(value), p[1]),
        p[2]
      );
    }
    setPoints(p);
  };

  const setValue = (index: number, value: string) => {
    const p = points.slice();
    const v = values.slice();
    if (value === "") {
      return;
    }
    if (index >= 3 && p.length === 3) {
      p.push(props.note.msLength);
      v.push(0);
      setPoints(p);
    }
    if (index === 4 && p.length === 4) {
      p.push(p[1]);
      v.push(100);
      setPoints(p);
    }
    v[index] = Math.min(Math.max(value === "" ? 0 : parseFloat(value), 0), 200);
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
    const oldNote = props.note.deepCopy();
    undoManager.register({
      undo: undo,
      undoArgs: oldNote,
      redo: redo,
      redoArgs: { n: oldNote, point: points.slice(), value: values.slice() },
      summary: `エンベロープ確定。index:${
        props.note.index
      }、編集後パラメータ。point:${JSON.stringify(
        points
      )} value:${JSON.stringify(values)}`,
    });
    const n = apply(props.note.deepCopy(), points, values);
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
   */
  const redo = (args: {
    n: Note;
    point: number[];
    value: number[];
  }): Note[] => {
    return [apply(args.n, args.point, args.value)];
  };

  /**
   * 編集処理をノートに適用する
   * @param n 適用先のノート
   * @param point エンベロープのポルタメントを前からのms時間に換算したもの
   * @param value エンベロープのポルタメントの値
   * @returns 適用後のノート
   */
  const apply = (n: Note, point: number[], value: number[]): Note => {
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

  const handlePointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    const svg = event.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    // SVGの座標系に変換する
    const svgPoint = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    let minIndex: number | undefined = undefined;
    let minDistance: number = 40;
    points.forEach((p, i) => {
      const distance = Math.sqrt(
        (svgPoint.x -
          getEnvelopePointToX(p, props.note.msLength, svgSize.width)) **
          2 +
          (svgPoint.y - getEnvelopeValueToY(values[i], svgSize.height)) ** 2
      );
      if (distance <= minDistance) {
        minDistance = distance;
        minIndex = i;
      }
    });
    setTargetIndex(minIndex);
  };

  const handlePointerUp = () => {
    setTargetIndex(undefined);
  };

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (targetIndex === undefined) return;
    const svg = event.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    // SVGの座標系に変換する
    const svgPoint = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    const p = (svgPoint.x * props.note.msLength) / svgSize.width;
    const v = Math.floor(200 - (200 * svgPoint.y) / svgSize.height);
    setPoint(targetIndex, p.toString());
    setValue(targetIndex, v.toString());
  };

  return (
    <>
      {props.note !== undefined && (
        <Dialog open={props.open} onClose={props.handleClose} fullScreen>
          <DialogTitle sx={{ px: 3, py: 1 }}>
            <svg
              width={svgSize.width}
              height={svgSize.height}
              onPointerUp={handlePointerUp}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerCancel={handlePointerUp}
            >
              <g id="frame">
                <line
                  strokeWidth="1"
                  x1="0"
                  x2="0"
                  y1="0"
                  y2={svgSize.height}
                  stroke={COLOR_PALLET[colorTheme][mode]["verticalSeparator"]}
                />
                <line
                  strokeWidth="1"
                  x1={svgSize.width}
                  x2={svgSize.width}
                  y1="0"
                  y2={svgSize.height}
                  stroke={COLOR_PALLET[colorTheme][mode]["verticalSeparator"]}
                />
                <line
                  strokeWidth="1"
                  x1="0"
                  x2={svgSize.width}
                  y1="0"
                  y2="0"
                  stroke={COLOR_PALLET[colorTheme][mode]["verticalSeparator"]}
                />
                <line
                  strokeWidth="1"
                  x1="0"
                  x2={svgSize.width}
                  y1={svgSize.height / 2}
                  y2={svgSize.height / 2}
                  stroke={COLOR_PALLET[colorTheme][mode]["verticalSeparator"]}
                />
                <line
                  strokeWidth="1"
                  x1="0"
                  x2={svgSize.width}
                  y1={svgSize.height}
                  y2={svgSize.height}
                  stroke={COLOR_PALLET[colorTheme][mode]["verticalSeparator"]}
                />
                <line
                  strokeWidth="1"
                  x1={getEnvelopePointToX(
                    props.note.atOverlap ?? 0,
                    props.note.msLength,
                    svgSize.width
                  )}
                  x2={getEnvelopePointToX(
                    props.note.atOverlap ?? 0,
                    props.note.msLength,
                    svgSize.width
                  )}
                  y1="0"
                  y2={svgSize.height}
                  stroke={COLOR_PALLET[colorTheme][mode]["restNote"]}
                />
                <line
                  strokeWidth="1"
                  x1={getEnvelopePointToX(
                    props.note.atPreutter ?? 0,
                    props.note.msLength,
                    svgSize.width
                  )}
                  x2={getEnvelopePointToX(
                    props.note.atPreutter ?? 0,
                    props.note.msLength,
                    svgSize.width
                  )}
                  y1="0"
                  y2={svgSize.height}
                  stroke={COLOR_PALLET[colorTheme][mode]["note"]}
                />
              </g>
              <g id="poltament">
                {points.map((p, i) => (
                  <>
                    <circle
                      key={i}
                      r="10"
                      stroke={COLOR_PALLET[colorTheme][mode]["pitch"]}
                      fill="none"
                      cx={getEnvelopePointToX(
                        p,
                        props.note.msLength,
                        svgSize.width
                      )}
                      cy={getEnvelopeValueToY(values[i], svgSize.height)}
                    />
                    <line
                      stroke={COLOR_PALLET[colorTheme][mode]["pitch"]}
                      strokeWidth={1}
                      x1={getEnvelopePointToX(
                        points[0],
                        props.note.msLength,
                        svgSize.width
                      )}
                      x2={getEnvelopePointToX(
                        0,
                        props.note.msLength,
                        svgSize.width
                      )}
                      y1={getEnvelopeValueToY(values[0], svgSize.height)}
                      y2={getEnvelopeValueToY(0, svgSize.height)}
                    />
                    <line
                      stroke={COLOR_PALLET[colorTheme][mode]["pitch"]}
                      strokeWidth={1}
                      x1={getEnvelopePointToX(
                        points[1],
                        props.note.msLength,
                        svgSize.width
                      )}
                      x2={getEnvelopePointToX(
                        points[0],
                        props.note.msLength,
                        svgSize.width
                      )}
                      y1={getEnvelopeValueToY(values[1], svgSize.height)}
                      y2={getEnvelopeValueToY(values[0], svgSize.height)}
                    />
                    <line
                      stroke={COLOR_PALLET[colorTheme][mode]["pitch"]}
                      strokeWidth={1}
                      x1={getEnvelopePointToX(
                        points[1],
                        props.note.msLength,
                        svgSize.width
                      )}
                      x2={getEnvelopePointToX(
                        points[points.length === 5 ? 4 : 2],
                        props.note.msLength,
                        svgSize.width
                      )}
                      y1={getEnvelopeValueToY(values[1], svgSize.height)}
                      y2={getEnvelopeValueToY(
                        values[points.length === 5 ? 4 : 2],
                        svgSize.height
                      )}
                    />
                    {points.length >= 4 && (
                      <line
                        stroke={COLOR_PALLET[colorTheme][mode]["pitch"]}
                        strokeWidth={1}
                        x1={getEnvelopePointToX(
                          points[2],
                          props.note.msLength,
                          svgSize.width
                        )}
                        x2={getEnvelopePointToX(
                          points[3],
                          props.note.msLength,
                          svgSize.width
                        )}
                        y1={getEnvelopeValueToY(values[2], svgSize.height)}
                        y2={getEnvelopeValueToY(values[3], svgSize.height)}
                      />
                    )}
                    {points.length >= 5 && (
                      <line
                        stroke={COLOR_PALLET[colorTheme][mode]["pitch"]}
                        strokeWidth={1}
                        x1={getEnvelopePointToX(
                          points[4],
                          props.note.msLength,
                          svgSize.width
                        )}
                        x2={getEnvelopePointToX(
                          points[2],
                          props.note.msLength,
                          svgSize.width
                        )}
                        y1={getEnvelopeValueToY(values[4], svgSize.height)}
                        y2={getEnvelopeValueToY(values[2], svgSize.height)}
                      />
                    )}
                    <line
                      stroke={COLOR_PALLET[colorTheme][mode]["pitch"]}
                      strokeWidth={1}
                      x1={getEnvelopePointToX(
                        points[points.length >= 4 ? 3 : 2],
                        props.note.msLength,
                        svgSize.width
                      )}
                      x2={getEnvelopePointToX(
                        props.note.msLength,
                        props.note.msLength,
                        svgSize.width
                      )}
                      y1={getEnvelopeValueToY(
                        values[points.length >= 4 ? 3 : 2],
                        svgSize.height
                      )}
                      y2={getEnvelopeValueToY(0, svgSize.height)}
                    />
                  </>
                ))}
              </g>
            </svg>
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
              <EnvelopeTextGroup
                points={points}
                values={values}
                index={0}
                setPoint={setPoint}
                setValue={setValue}
              />
              <EnvelopeTextGroup
                points={points}
                values={values}
                index={1}
                setPoint={setPoint}
                setValue={setValue}
              />
              <EnvelopeTextGroup
                points={points}
                values={values}
                index={4}
                setPoint={setPoint}
                setValue={setValue}
              />
              <EnvelopeTextGroup
                points={points}
                values={values}
                index={2}
                setPoint={setPoint}
                setValue={setValue}
              />
              <EnvelopeTextGroup
                points={points}
                values={values}
                index={3}
                setPoint={setPoint}
                setValue={setValue}
              />
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
              {t("envelopeDialog.submitButton")}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

const EnvelopeTextGroup: React.FC<{
  points: number[];
  values: number[];
  index: number;
  setPoint: (index: number, value: string) => void;
  setValue: (index: number, value: string) => void;
}> = (props) => {
  return (
    <Box>
      <EnvelopeTextField
        label={`p${props.index + 1}`}
        value={props.points[props.index]}
        index={props.index}
        setValue={props.setPoint}
      />
      <br />
      <EnvelopeTextField
        label={`v${props.index + 1}`}
        value={props.values[props.index]}
        index={props.index}
        setValue={props.setValue}
      />
    </Box>
  );
};

const EnvelopeTextField: React.FC<{
  label: string;
  index: number;
  value: number;
  setValue: (index: number, value: string) => void;
}> = (props) => {
  return (
    <TextField
      sx={{ my: 1 }}
      label={props.label}
      size="small"
      type="number"
      variant="outlined"
      value={props.value ?? ""}
      onChange={(e) => props.setValue(props.index, e.target.value)}
    />
  );
};

export interface EnvelopeDialogProps {
  note: Note;
  open: boolean;
  handleClose: () => void;
}
