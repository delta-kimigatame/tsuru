import React from "react";
import { Wave } from "utauwav";
import { EDITOR_CONFIG } from "../../../config/editor";
import { COLOR_PALLET } from "../../../config/pallet";
import { PIANOROLL_CONFIG } from "../../../config/pianoroll";
import { useThemeMode } from "../../../hooks/useThemeMode";
import { useVerticalFooterMenu } from "../../../hooks/useVerticalFooterMenu";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { useCookieStore } from "../../../store/cookieStore";
import { useMusicProjectStore } from "../../../store/musicProjectStore";
import { last } from "../../../utils/array";
import { calculatePolylinePoints, showRangeIndex } from "./PianorollWavForm";

export const PianorollBackgroundWavForm: React.FC<
  PianorollBackgroundWavFormProps
> = (props) => {
  const { notes, ustTempo } = useMusicProjectStore();
  const { colorTheme, horizontalZoom } = useCookieStore();
  const verticalMenu = useVerticalFooterMenu();
  const windowSize = useWindowSize();
  const mode = useThemeMode();
  // svgにおいてポリラインを描画するためのpointsを格納するための状態
  const [points, setPoints] = React.useState<string>("");

  React.useEffect(() => {
    /** backgroundwavがnullやundefinedの場合空で返す */
    if (props.backgroundWav === null || props.backgroundWav === undefined) {
      setPoints("");
      return;
    }
    /** backgroundwavのdata長が0の場合も空で返す */
    if (props.backgroundWav.data.length === 0) {
      setPoints("");
      return;
    }
    /** 画面の左端から右端のノートのインデックス */
    const rangeIndex = showRangeIndex(
      props.notesLeft,
      props.scrollLeft,
      windowSize.width,
      horizontalZoom
    );
    /**
     * 画面の左端をms換算で求める
     * props.notesLeftMs[rangeIndex[0]]が画面左端のノートの左端のms位置
     * そこから画面左端がノートの左端から何ピクセル離れているかを求め、
     * 1pixelあたりのms換算値を掛けることで画面左端のms位置を求める
     */
    const leftNoteMs = props.notesLeftMs[rangeIndex[0]];
    const leftPixelOffset =
      props.scrollLeft -
      props.notesLeft[rangeIndex[0]] *
        PIANOROLL_CONFIG.NOTES_WIDTH_RATE *
        horizontalZoom;
    const pixelPerMs =
      (PIANOROLL_CONFIG.NOTES_WIDTH_RATE * horizontalZoom * (ustTempo * 480)) /
      60000;
    const leftPixelOffsetMs = leftPixelOffset / pixelPerMs;
    const leftMs = leftNoteMs + leftPixelOffsetMs;
    /** 描画開始フレーム数 */
    const startFrame = Math.floor(
      (leftMs - props.backgroundWavOffsetMs) *
        (props.backgroundWav.sampleRate / 1000)
    );
    /** 描画開始フレーム数が総フレーム数より多い場合空を返す */
    if (startFrame > props.backgroundWav.data.length) {
      setPoints("");
      return;
    }

    /** 右端のノートの左端の位置(ms) */
    const rightNoteMs = props.notesLeftMs[last(rangeIndex)];
    /** 画面の右端がノートの左端から何ピクセル離れているかを求める */
    const rightPixelOffset =
      props.scrollLeft +
      windowSize.width -
      props.notesLeft[last(rangeIndex)] *
        PIANOROLL_CONFIG.NOTES_WIDTH_RATE *
        horizontalZoom;
    /** 画面の右端をms換算で求める */
    const rightMs = rightNoteMs + rightPixelOffset / pixelPerMs;
    /** 描画終了フレーム数 */
    const endFrame = Math.ceil(
      (rightMs - props.backgroundWavOffsetMs) *
        (props.backgroundWav.sampleRate / 1000)
    );
    /**
     * 開始フレームから終了フレームまで
     * ただし、startFrameが0未満の場合、startFrameの絶対値分の長さの0埋め配列を先頭に追加する
     */
    let wavData: number[];
    if (startFrame < 0) {
      // startFrameが負の場合、0埋めの配列を先頭に追加
      const paddingLength = Math.abs(startFrame);
      const actualData = props.backgroundWav.data.slice(0, endFrame);
      const padding = new Array(paddingLength).fill(0);
      wavData = [...padding, ...actualData];
    } else {
      wavData = props.backgroundWav.data.slice(startFrame, endFrame);
    }
    const points = calculatePolylinePoints(
      wavData,
      windowSize.width,
      props.scrollLeft,
      props.notesLeft,
      notes,
      horizontalZoom,
      ustTempo
    );
    setPoints(points);
  }, [
    notes,
    props.notesLeft,
    props.scrollLeft,
    windowSize.width,
    props.backgroundWav,
    props.notesLeftMs,
    props.backgroundWavOffsetMs,
  ]);

  return (
    <svg
      width={windowSize.width}
      height={PIANOROLL_CONFIG.WAVFORM_HEIGHT}
      style={{
        display: "block",
        position: "fixed",
        bottom: verticalMenu
          ? PIANOROLL_CONFIG.WAVFORM_HEIGHT
          : EDITOR_CONFIG.FOOTER_MENU_SIZE + PIANOROLL_CONFIG.WAVFORM_HEIGHT,
        zIndex: 8,
        pointerEvents: "none",
        userSelect: "none",
      }}
      data-testid="pianoroll-wavform"
    >
      <polyline
        points={points}
        fill="none"
        stroke={COLOR_PALLET[colorTheme][mode]["attention"]}
        strokeOpacity={0.5}
      />
    </svg>
  );
};

interface PianorollBackgroundWavFormProps {
  backgroundWav: Wave | null;
  backgroundWavOffsetMs: number;
  notesLeft: Array<number>;
  notesLeftMs: Array<number>;
  scrollLeft: number;
}
