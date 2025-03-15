import MusicNoteIcon from "@mui/icons-material/MusicNote";
import { IconButton } from "@mui/material";
import * as React from "react";
import { LOG } from "../../lib/Logging";

/**
 * infoVBDialog内に表示されるサンプル音声を再生するためのアイコンボタン
 * @param props
 * @returns
 */
export const SampleWavButton: React.FC<SampleWavButtonProps> = (props) => {
  const audioRef = React.useRef(null);

  /**
   * ボタンをクリックするとaudioを再生する。
   * 読み込まれていなければ何もしない
   * @returns
   */
  const handleClick = () => {
    LOG.debug("click", "SampleWavButton");
    if (audioRef === null) {
      LOG.warn(
        "audioRef === nullのときdisabledのはずなのにクリックを検出した",
        "SampleWavButton"
      );
      return;
    }
    LOG.info("サンプル音声の再生", "SampleWavButton");
    audioRef.current.play();
  };
  return (
    <>
      <IconButton
        disabled={props.sampleUrl === undefined}
        sx={{ m: 1, p: 1 }}
        onClick={handleClick}
      >
        <MusicNoteIcon
          color={props.sampleUrl === undefined ? "inherit" : "info"}
        />
      </IconButton>

      {props.sampleUrl !== undefined && (
        <>
          <audio
            src={props.sampleUrl}
            ref={audioRef}
            data-testid="audio"
          ></audio>
        </>
      )}
    </>
  );
};

export interface SampleWavButtonProps {
  sampleUrl: string | undefined;
}
