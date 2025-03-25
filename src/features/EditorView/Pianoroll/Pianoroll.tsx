import { Box } from "@mui/material";
import React from "react";
import { EDITOR_CONFIG } from "../../../config/editor";
import { PIANOROLL_CONFIG } from "../../../config/pianoroll";
import { useVerticalFooterMenu } from "../../../hooks/useVerticalFooterMenu";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { LOG } from "../../../lib/Logging";
import { useCookieStore } from "../../../store/cookieStore";
import { useMusicProjectStore } from "../../../store/musicProjectStore";
import { PianorollBackground } from "./PianorollBackground";
import { PianorollNotes } from "./PianorollNotes";
import { msToPoint, notenumToPoint, PianorollPitch } from "./PianorollPitch";
import { PianorollSeekbar } from "./PianorollSeekbar";
import { PianorollTonemap } from "./PianorollTonemap";
import { PianorollToutch } from "./PianorollTouch";
import { PianorollVibrato } from "./PianorollVibrato";

export const Pianoroll: React.FC<PianorollProps> = (props) => {
  const { verticalZoom, horizontalZoom } = useCookieStore();
  const { notes, vb } = useMusicProjectStore();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const c4Center = notenumToPoint(60, verticalZoom);
  const portraitUrl: string = React.useMemo(() => {
    LOG.debug("vbの更新検知", "Pianoroll");
    if (vb === null) return undefined;
    return vb.portrait === undefined
      ? undefined
      : URL.createObjectURL(new Blob([vb.portrait], { type: "image/png" }));
  }, [vb]);
  const vertcalMenu = useVerticalFooterMenu();
  const windowSize = useWindowSize();
  const [seekBarX, setSeekBarX] = React.useState<number>(0);

  /**
   * 各ノートのx座標描画位置を予め求めておく
   */
  const { notesLeft, notesLeftMs, totalLength } = React.useMemo(() => {
    LOG.debug("notesの更新検知", "Pianoroll");
    if (notes.length === 0)
      return { notesLeft: [], notesLeftMs: [], totalLength: 0 };
    LOG.debug("notesLeft,notesLeftMs,totalLengthの再計算", "Pianoroll");
    const leftsMs = new Array<number>();
    let totalMsLength = 0;
    const lefts = new Array<number>();
    let totalLength = 0;
    for (let i = 0; i < notes.length; i++) {
      lefts.push(totalLength);
      totalLength += notes[i].length;
      leftsMs.push(totalMsLength);
      totalMsLength += notes[i].msLength;
    }
    return { notesLeft: lefts, notesLeftMs: leftsMs, totalLength: totalLength };
  }, [notes]);

  React.useEffect(() => {
    LOG.debug(`コンポーネントマウント、c4Center:${c4Center}`, "Pianoroll");
    window.scrollTo(0, c4Center - window.innerHeight / 2);
  }, [c4Center]);

  React.useEffect(() => {
    if (
      notesLeftMs.length !== notes.length ||
      notesLeftMs.length !== notesLeft.length ||
      notes.length === 0
    )
      return;
    const targetNotesIndexOffset =
      props.selectedNotesIndex.length === 0 ? 0 : props.selectedNotesIndex[0];
    const notesOffsetMs = notesLeftMs[targetNotesIndexOffset];
    /** 選択中のノートより後ろ側をループし、条件に該当する1つめでtargetNotesIndexを更新する */
    let targetNotesIndex = targetNotesIndexOffset;
    for (let i = targetNotesIndex; i < notesLeftMs.length - 1; i++) {
      /** 再生開始位置から各ノートまでの時間を比較する */
      if (
        notesLeftMs[targetNotesIndexOffset + i + 1] - notesOffsetMs >
        props.playingMs
      ) {
        targetNotesIndex = i;
        break;
      }
    }
    /** 再生位置より前の部分では1msと1pixelの対応関係が不明のため、確実に対応しているtickを使ってオフセットを求める */
    const lengthOffset =
      notesLeft[targetNotesIndex] *
      PIANOROLL_CONFIG.NOTES_WIDTH_RATE *
      horizontalZoom;
    const x =
      lengthOffset +
      msToPoint(
        props.playingMs -
          (notesLeftMs[targetNotesIndex] - notesLeftMs[targetNotesIndexOffset]),
        notes[targetNotesIndex].tempo,
        horizontalZoom
      );
    console.log(notesOffsetMs, targetNotesIndexOffset, lengthOffset, x);

    /** 自動スクロール */
    if (x < containerRef.current.clientWidth / 2) {
      //シークバーが画面中央に来るまではスクロールしない
      containerRef.current.scrollTo(0, containerRef.current.scrollTop);
    } else {
      // シークバーが画面中央を超えるとスクロールする。最後はまたシークバーが動く
      containerRef.current.scrollTo(
        Math.min(
          x - containerRef.current.clientWidth / 2,
          containerRef.current.scrollWidth -
            containerRef.current.clientWidth / 2
        ),
        containerRef.current.scrollTop
      );
    }
    setSeekBarX(x);
  }, [horizontalZoom, props.playingMs]);

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        height: PIANOROLL_CONFIG.TOTAL_HEIGHT * verticalZoom + 40,
        overflowX: "hidden",
        overflowY: "auto",
        m: 0,
        p: 0,
      }}
    >
      <Box sx={{ display: "block", width: PIANOROLL_CONFIG.TONEMAP_WIDTH }}>
        <svg
          width={PIANOROLL_CONFIG.TONEMAP_WIDTH}
          height={PIANOROLL_CONFIG.TOTAL_HEIGHT * verticalZoom}
          style={{
            display: "block",
            position: "relative",
          }}
        >
          <PianorollTonemap />
        </svg>
      </Box>
      <Box
        sx={{ display: "block", overflowX: "scroll", position: "relative" }}
        ref={containerRef}
      >
        <svg
          width={
            (totalLength + 480 * 8) *
            PIANOROLL_CONFIG.NOTES_WIDTH_RATE *
            horizontalZoom
          }
          height={PIANOROLL_CONFIG.TOTAL_HEIGHT * verticalZoom}
          style={{
            display: "block",
            position: "relative",
          }}
        >
          <g id="background">
            <PianorollBackground totalLength={totalLength} />
          </g>
          <g id="notes">
            <PianorollNotes
              selectedNotesIndex={props.selectedNotesIndex}
              totalLength={totalLength}
              notesLeft={notesLeft}
            />
          </g>
          <g id="pitch">
            <PianorollPitch
              selectedNotesIndex={props.selectedNotesIndex}
              totalLength={totalLength}
              notesLeft={notesLeft}
            />
          </g>
          <g id="vibrato">
            <PianorollVibrato
              selectedNotesIndex={props.selectedNotesIndex}
              totalLength={totalLength}
              notesLeft={notesLeft}
            />
          </g>
          <g id="seekbar">
            {props.playing && (
              <PianorollSeekbar seekBarX={seekBarX} totalLength={totalLength} />
            )}
          </g>
          <g id="touch">
            <PianorollToutch
              selectedNotesIndex={props.selectedNotesIndex}
              setSelectedNotesIndex={props.setSelectedNotesIndes}
              totalLength={totalLength}
              notesLeft={notesLeft}
              selectMode={props.selectMode}
            />
          </g>
        </svg>
      </Box>
      {portraitUrl !== undefined && (
        <img
          src={portraitUrl}
          style={{
            maxHeight: `min(50%,${vb.portraitHeight}px)`,
            objectFit: "contain",
            position: "fixed",
            bottom: vertcalMenu ? 0 : EDITOR_CONFIG.FOOTER_MENU_SIZE,
            right: vertcalMenu ? EDITOR_CONFIG.FOOTER_MENU_SIZE : 0,
            zIndex: 10,
            maxWidth: "50%",
            pointerEvents: "none",
            userSelect: "none",
            opacity: vb.portraitOpacity,
          }}
        />
      )}
    </Box>
  );
};

export interface PianorollProps {
  /** 再生状況 */
  playing: boolean;
  /** 再生中の時間 */
  playingMs: number;
  /** 選択中のノートのインデックス */
  selectedNotesIndex: Array<number>;
  /** ノートを選択するためのコールバック */
  setSelectedNotesIndes: (indexes: number[]) => void;
  /** 選択モード */
  selectMode: "toggle" | "range";
}
