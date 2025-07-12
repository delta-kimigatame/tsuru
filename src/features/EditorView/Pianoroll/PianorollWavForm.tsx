import React from "react";
import { EDITOR_CONFIG } from "../../../config/editor";
import { COLOR_PALLET } from "../../../config/pallet";
import { PIANOROLL_CONFIG } from "../../../config/pianoroll";
import { renderingConfig } from "../../../config/rendering";
import { useThemeMode } from "../../../hooks/useThemeMode";
import { useVerticalFooterMenu } from "../../../hooks/useVerticalFooterMenu";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { Note } from "../../../lib/Note";
import { resampCache } from "../../../lib/ResampCache";
import { Wavtool } from "../../../lib/Wavtool";
import { useCookieStore } from "../../../store/cookieStore";
import { useMusicProjectStore } from "../../../store/musicProjectStore";
import { AppendRequest } from "../../../types/request";
import { range } from "../../../utils/array";

export const PianorollWavForm: React.FC<PianorollWavFormProps> = (props) => {
  const { vb, notes, ustFlags, ustTempo } = useMusicProjectStore();
  const { colorTheme, verticalZoom, horizontalZoom, defaultNote } =
    useCookieStore();
  const vertcalMenu = useVerticalFooterMenu();
  const windowSize = useWindowSize();
  const mode = useThemeMode();
  // svgにおいてポリラインを描画するためのpointsを格納するための状態
  const [points, setPoints] = React.useState<string>("");

  React.useEffect(() => {
    const rangeIndex = showRangeIndex(
      props.notesLeft,
      props.scrollLeft,
      windowSize.width,
      horizontalZoom
    );
    const wavtool = new Wavtool();
    const requests: Array<AppendRequest> = rangeIndex.map((i) => {
      const params = notes[i].getRequestParam(vb, ustFlags, defaultNote);
      return {
        inputData: Array.from(
          resampCache.getByIndex(i) ||
            new Int16Array(
              (params[0].append.length / 1000) * renderingConfig.frameRate
            )
        ),
        ...params[0].append,
      };
    });
    requests.forEach((req) => {
      wavtool.append(req);
    });
    // 画面の左端が、props.notesLeft[rangeIndex[0]]から何フレーム分か求める。
    const offsetFrame = Math.floor(
      (props.scrollLeft -
        props.notesLeft[rangeIndex[0]] *
          PIANOROLL_CONFIG.NOTES_WIDTH_RATE *
          horizontalZoom) *
        calcFramePerPixel(
          renderingConfig.frameRate,
          notes[rangeIndex[0]].tempo,
          horizontalZoom
        )
    );
    const preutterOffsetFrame = Math.floor(
      (notes[rangeIndex[0]].atPreutter / 1000) * renderingConfig.frameRate
    );
    const wavData = wavtool.data.slice(offsetFrame + preutterOffsetFrame);
    const points = calculatePolylinePoints(
      wavData,
      windowSize.width,
      props.scrollLeft,
      props.notesLeft,
      notes,
      horizontalZoom
    );
    setPoints(points);
  }, [props.notesLeft, props.scrollLeft, windowSize.width]);

  return (
    <svg
      width={windowSize.width}
      height={PIANOROLL_CONFIG.WAVFORM_HEIGHT}
      style={{
        display: "block",
        position: "fixed",
        bottom: vertcalMenu ? 0 : EDITOR_CONFIG.FOOTER_MENU_SIZE,
        zIndex: 7,
        pointerEvents: "none",
        userSelect: "none",
      }}
      data-testid="pianoroll-wavform"
    >
      <polyline
        points={points}
        fill="none"
        stroke={COLOR_PALLET[colorTheme][mode]["selectedNote"]}
        strokeOpacity={0.5}
      />
    </svg>
  );
};

interface PianorollWavFormProps {
  notesLeft: Array<number>;
  scrollLeft: number;
}
/**
 * 1pixelあたりのwavフレーム数を計算する
 * @param sampleRate wavデータのサンプリングレート (例: 44,100Hz)
 * @param tempo ノートのBPM
 * @param horizontalZoom 水平方向の拡大率
 * @returns 1pixelあたりのwavフレーム数
 */
export const calcFramePerPixel = (
  sampleRate: number,
  tempo: number,
  horizontalZoom: number
): number => {
  // 1tickあたりの時間(ms)を計算
  const msPerTick = 60000 / (tempo * 480);

  // 1msあたりのwavフレーム数を計算
  const framesPerMs = sampleRate / 1000;

  // 1tickあたりのwavフレーム数を計算
  const framesPerTick = framesPerMs * msPerTick;

  const pixelsPerTick = PIANOROLL_CONFIG.NOTES_WIDTH_RATE * horizontalZoom;

  // 1pixelあたりのwavフレーム数を計算
  return framesPerTick / pixelsPerTick;
};

/**
 * ポリラインの各点を計算する
 * @param wavData 波形データ (Int16Array)
 * @param windowWidth 画面の幅 (pixel単位)
 * @param scrollLeft スクロール位置 (pixel単位)
 * @param notesLeft ノートの左端位置 (tick単位)
 * @param notes ノートデータ
 * @param horizontalZoom 水平方向の拡大率
 * @returns ポリラインの描画用points文字列
 */
export const calculatePolylinePoints = (
  wavData: Array<number>,
  windowWidth: number,
  scrollLeft: number,
  notesLeft: Array<number>,
  notes: Array<Note>,
  horizontalZoom: number
): string => {
  let startFrame = 0;
  const poltaments = new Array<{ max: number; min: number }>(windowWidth);
  const amp = PIANOROLL_CONFIG.WAVFORM_HEIGHT / 2;

  for (let i = 0; i < windowWidth; i++) {
    const refTick = Math.floor(
      scrollLeft + i / PIANOROLL_CONFIG.NOTES_WIDTH_RATE / horizontalZoom
    );
    const noteIndex = notesLeft.findIndex((n) => n > refTick) - 1;

    const tempo = notes[noteIndex].tempo;

    const framePerPixel = calcFramePerPixel(
      renderingConfig.frameRate,
      tempo,
      horizontalZoom
    );
    const endFrame = startFrame + Math.ceil(framePerPixel);
    const segment = wavData.slice(startFrame, endFrame);

    startFrame = endFrame;
    poltaments[i] = calculatePoltament(segment, amp);
  }

  return generatePolylinePoints(poltaments, amp);
};

/**
 * 波形データのセグメントから最大値と最小値を計算する
 * @param segment 波形データのセグメント
 * @param amp 振幅のスケール
 * @returns 最大値と最小値
 */
const calculatePoltament = (
  segment: Array<number>,
  amp: number
): { max: number; min: number } => {
  return {
    max: isFinite(Math.max(...segment))
      ? (Math.max(...segment) / 32768) * amp
      : 0,
    min: isFinite(Math.min(...segment))
      ? (Math.min(...segment) / 32768) * amp
      : 0,
  };
};

/**
 * ポリラインの各点を文字列として生成する
 * @param poltaments ポリラインの点データ
 * @param amp 振幅のスケール
 * @returns ポリラインの描画用points文字列
 */
const generatePolylinePoints = (
  poltaments: Array<{ max: number; min: number }>,
  amp: number
): string => {
  return poltaments
    .map((p, i) => {
      const x = i;
      const yMax = amp - p.max;
      const yMin = amp - p.min;
      return `${x},${yMax} ${x},${yMin}`;
    })
    .join(" ");
};

/**
 * 画面の左端から右端に収まっているノートを求める
 */
export const showRangeIndex = (
  /** tick単位 */
  notesLeft: Array<number>,
  /** pixel単位 */
  scrollLeft: number,
  windowWidth: number,
  horizontalZoom: number
): Array<number> => {
  const { leftTick, rightTick } = calculateTickRange(
    scrollLeft,
    windowWidth,
    horizontalZoom
  );
  return calculateRangeIndex(notesLeft, leftTick, rightTick);
};

/**
 * ピクセル単位のスクロール位置からtick単位の範囲を計算する
 * @param scrollLeft スクロール位置 (pixel単位)
 * @param windowWidth 画面の幅 (pixel単位)
 * @param horizontalZoom 水平方向の拡大率
 * @returns 左端と右端のtick値
 */
const calculateTickRange = (
  scrollLeft: number,
  windowWidth: number,
  horizontalZoom: number
): { leftTick: number; rightTick: number } => {
  const left = scrollLeft;
  const right = scrollLeft + windowWidth - PIANOROLL_CONFIG.TONEMAP_WIDTH;

  return {
    leftTick: Math.floor(
      left / PIANOROLL_CONFIG.NOTES_WIDTH_RATE / horizontalZoom
    ),
    rightTick: Math.ceil(
      right / PIANOROLL_CONFIG.NOTES_WIDTH_RATE / horizontalZoom
    ),
  };
};

/**
 * notesLeft配列から範囲内のインデックスを計算する
 * @param notesLeft ノートの左端位置 (tick単位)
 * @param leftTick 左端のtick値
 * @param rightTick 右端のtick値
 * @returns 範囲内のインデックス配列
 */
const calculateRangeIndex = (
  notesLeft: Array<number>,
  leftTick: number,
  rightTick: number
): Array<number> => {
  const startIndex = Math.max(notesLeft.findIndex((n) => n > leftTick) - 1, 0);
  const endIndex = notesLeft.findIndex((n) => n > rightTick);
  return range(
    startIndex,
    Math.min(
      endIndex === -1 ? notesLeft.length : endIndex,
      notesLeft.length - 1
    )
  );
};
