import React from "react";
import { EDITOR_CONFIG } from "../../../config/editor";
import { COLOR_PALLET } from "../../../config/pallet";
import { PIANOROLL_CONFIG } from "../../../config/pianoroll";
import { renderingConfig } from "../../../config/rendering";
import { useThemeMode } from "../../../hooks/useThemeMode";
import { useVerticalFooterMenu } from "../../../hooks/useVerticalFooterMenu";
import { useWindowSize } from "../../../hooks/useWindowSize";
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

  /**
   * 画面の左端から右端に収まっているノートを求める
   */
  const showRangeIndex = (
    /** tick単位 */
    notesLeft: Array<number>,
    /** pixel単位 */
    scrollLeft: number
  ): Array<number> => {
    /** pixel単位 */
    const left = scrollLeft;
    /** pixel単位 */
    const right =
      scrollLeft + windowSize.width - PIANOROLL_CONFIG.TONEMAP_WIDTH;

    /** tick単位の左端 */
    const leftTick = Math.floor(
      left / PIANOROLL_CONFIG.NOTES_WIDTH_RATE / horizontalZoom
    );
    /**tick単位の右端 */
    const rightTick = Math.ceil(
      right / PIANOROLL_CONFIG.NOTES_WIDTH_RATE / horizontalZoom
    );
    /** 最初のindex値、notesLeftの内、leftTicksより小さいものの中で最大 */
    const startIndex = Math.max(
      notesLeft.findIndex((n) => n > leftTick) - 1,
      0
    );
    /** 最後のindex値、notesLeftの内、rightTicksより大きいものの中で最小 */
    const endIndex = notesLeft.findIndex((n) => n > rightTick);
    return range(
      startIndex,
      Math.min(
        endIndex === -1 ? notesLeft.length : endIndex,
        notesLeft.length - 1
      )
    );
  };

  React.useEffect(() => {
    const rangeIndex = showRangeIndex(props.notesLeft, props.scrollLeft);
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
    let startFrame = 0;
    const poltaments = new Array<{ max: number; min: number }>(
      windowSize.width
    );
    const amp = PIANOROLL_CONFIG.WAVFORM_HEIGHT / 2;
    // 0～windowSize.widthまでをループし、ポリラインの各点を求める。
    for (let i = 0; i < windowSize.width; i++) {
      // 現在参照しているpixelのtick数を求める
      const refTick = Math.floor(
        props.scrollLeft +
          i / PIANOROLL_CONFIG.NOTES_WIDTH_RATE / horizontalZoom
      );
      // 現在参照しているpixelが何番目のノートの範囲に収まるか求める
      const noteIndex = props.notesLeft.findIndex((n) => n > refTick) - 1;
      const tempo = notes[noteIndex].tempo;
      // 現在参照している座標における、1ピクセル当たりのwavフレーム数を求める。
      const framePerPixel = calcFramePerPixel(
        renderingConfig.frameRate,
        tempo,
        horizontalZoom
      );
      const endFrame = startFrame + Math.ceil(framePerPixel);
      // 元の値がInt16Arrayであることを踏まえて、startFrameからendFrameの間のmaxとminを-PIANOROLL_CONFIG.WAVFORM_HEIGHT/2 ～ PIANOROLL_CONFIG.WAVFORM_HEIGHT/2の範囲に変換史求める。
      const segment = wavData.slice(startFrame, endFrame);
      const poltament = {
        max: isFinite(Math.max(...segment))
          ? (Math.max(...segment) / 32768) * amp
          : 0,
        min: isFinite(Math.min(...segment))
          ? (Math.min(...segment) / 32768) * amp
          : 0,
      };
      startFrame = endFrame;
      poltaments[i] = poltament;
    }
    const points = poltaments
      .map((p, i) => {
        const x = i;
        const yMax = amp - p.max;
        const yMin = amp - p.min;
        return `${x},${yMax} ${x},${yMin}`;
      })
      .join(" ");
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
  totalLength: number;
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
