import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AudiotrackIcon from "@mui/icons-material/Audiotrack";
import ClearIcon from "@mui/icons-material/Clear";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SpeedIcon from "@mui/icons-material/Speed";
import SyncIcon from "@mui/icons-material/Sync";
import VolumeDownIcon from "@mui/icons-material/VolumeDown";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import {
  Box,
  Checkbox,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Slider,
  TextField,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { Wave } from "utauwav";
import { renderingConfig } from "../../../config/rendering";
import { LOG } from "../../../lib/Logging";
import { useMusicProjectStore } from "../../../store/musicProjectStore";
import { estimateBeatOffset } from "../../../utils/estimateBeatOffset";
import { estimateBpm } from "../../../utils/estimateBpm";

export const FooterAudioTrackMenu: React.FC<FooterAudioTrackMenuProps> = (
  props
) => {
  const { t } = useTranslation();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { ustTempo, setUstTempo } = useMusicProjectStore();
  // テキストボックス用の生値管理
  const [textInputValue, setTextInputValue] = React.useState<string>(
    props.backgroundOffsetMs.toString()
  );
  // propsの値が変更された時にテキストボックスの値も同期
  React.useEffect(() => {
    setTextInputValue(props.backgroundOffsetMs.toString());
  }, [props.backgroundOffsetMs]);

  /**
   * 1小節の長さ（ミリ秒）を計算
   * 4/4拍子を前提とし、4分音符4つ分の時間を算出
   */
  const calculateOneBarMs = React.useMemo(() => {
    // 1分あたりの4分音符数がustTempo
    // 1小節 = 4分音符 × 4拍 = 4 * (60 / ustTempo) 秒
    const oneBarSeconds = 4 * (60 / ustTempo);
    return Math.round(oneBarSeconds * 1000); // ミリ秒に変換
  }, [ustTempo]);
  /**
   * オフセットの最大・最小値
   */
  const offsetRange = React.useMemo(() => {
    const maxOffset = calculateOneBarMs * 2;
    return {
      min: -maxOffset,
      max: maxOffset,
    };
  }, [calculateOneBarMs]);
  /**
   * inputのファイルを変更した際の動作
   * nullやファイル数が0の場合何もせず終了する。
   * ファイルが含まれている場合、1つ目のファイルをreadFileにセットする。
   * 実際のファイルの読込はloadVBDialogで行う。
   * @param e
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      LOG.warn("wavの読込がキャンセルされたか失敗しました", "FooterMenu");
      return;
    }

    const file = e.target.files[0];
    LOG.info(`wavの選択: ${file.name}`, "FooterMenu");

    try {
      // arrayBufferを取得（onLoadなし）
      const arrayBuffer = await file.arrayBuffer();
      // Blobから再作成してObject URLを生成
      const blob = new Blob([arrayBuffer], { type: file.type });
      const objectUrl = URL.createObjectURL(blob);

      props.setBackgroundWavUrl(objectUrl);
      const w = new Wave(arrayBuffer);
      w.sampleRate = renderingConfig.frameRate;
      w.bitDepth = 16;
      w.VolumeNormalize();
      props.setBackgroundAudioWav(w);
      props.setBackgroundOffsetMs(0);
      setTextInputValue("0");
      LOG.info(`wav読込完了: ${file.name}`, "FooterMenu");
    } catch (error) {
      LOG.error(`wav読込失敗: ${error}`, "FooterMenu");
      /** 読込失敗時初期化 */
      props.setBackgroundWavUrl("");
      props.setBackgroundAudioWav(null);
    }
  };

  const handleLoadBackgroundWavClick = () => {
    LOG.info("伴奏音声の読込", "FooterAudioTrackMenu");
    LOG.gtag("LoadBackgroundWav");
    inputRef.current?.click();
    props.handleClose();
  };
  const handleMuteToggleBackgroundWavClick = () => {
    LOG.info(
      `伴奏音声のミュート切替:${props.backgroundMuted ? "解除" : "ミュート"}`,
      "FooterAudioTrackMenu"
    );
    props.setBackgroundMuted(!props.backgroundMuted);
    props.handleClose();
  };
  const handleBackgroundAudioVolumeChange = (e, newValue: number) => {
    LOG.info("伴奏音声の音量変更", "FooterAudioTrackMenu");
    props.setBackgroundVolume(newValue);
  };
  const handleBackgroundAudioOffsetChange = (e, newValue: number) => {
    LOG.info("伴奏音声のオフセット変更", "FooterAudioTrackMenu");
    props.setBackgroundOffsetMs(newValue);
  };
  const handleBackgroundAudioOffsetResetClick = () => {
    LOG.info("伴奏音声のオフセットリセット", "FooterAudioTrackMenu");
    props.setBackgroundOffsetMs(0);
    setTextInputValue("0");
    props.handleClose();
  };
  const handleBackgroundAudioOffsetTextChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputValue = e.target.value;

    // テキストボックスの生値を更新（空欄も許可）
    setTextInputValue(inputValue);

    // 数値として有効な場合のみ実際の値を更新
    if (inputValue !== "" && inputValue !== "-") {
      const value = parseInt(inputValue);
      if (!isNaN(value)) {
        // 範囲内にクランプ
        const clampedValue = Math.max(
          offsetRange.min,
          Math.min(offsetRange.max, value)
        );
        props.setBackgroundOffsetMs(clampedValue);
      }
    }
  };
  const handleBackgroundAudioOffsetTextBlur = (
    e: React.FocusEvent<HTMLInputElement>
  ) => {
    const inputValue = e.target.value;

    // フォーカスが外れた時の処理
    if (inputValue === "" || inputValue === "-") {
      // 空欄や"-"だけの場合は0にリセット
      props.setBackgroundOffsetMs(0);
      setTextInputValue("0");
    } else {
      const value = parseInt(inputValue);
      if (isNaN(value)) {
        // 無効な値の場合は現在の実際の値に戻す
        setTextInputValue(props.backgroundOffsetMs.toString());
      } else {
        // 有効な値の場合は範囲内にクランプして同期
        const clampedValue = Math.max(
          offsetRange.min,
          Math.min(offsetRange.max, value)
        );
        props.setBackgroundOffsetMs(clampedValue);
        setTextInputValue(clampedValue.toString());
      }
    }
  };
  const handleClearClick = () => {
    props.setBackgroundWavUrl("");
    props.setBackgroundAudioWav(null);
    props.setBackgroundOffsetMs(0);
    setTextInputValue("0");
    props.handleClose();
  };

  const handleEstimateBpmClick = () => {
    LOG.info("伴奏音声のBPM推定開始", "FooterAudioTrackMenu");
    if (!props.backgroundAudioWav) {
      LOG.warn("伴奏音声が存在しないためBPM推定を中止", "FooterAudioTrackMenu");
      return;
    }
    const bpm = estimateBpm(props.backgroundAudioWav!);
    LOG.info(`推定されたBPM: ${bpm}`, "FooterAudioTrackMenu");
    setUstTempo(bpm);
    const offset = estimateBeatOffset(props.backgroundAudioWav, bpm);
    LOG.info(`推定された拍頭オフセット: ${offset} ms`, "FooterAudioTrackMenu");
    props.setBackgroundOffsetMs(offset);
    setTextInputValue(offset.toString());
    props.handleClose();
  };

  const handleEstimateBeatOffsetClick = () => {
    LOG.info("伴奏音声の拍頭オフセット推定開始", "FooterAudioTrackMenu");
    if (!props.backgroundAudioWav) {
      LOG.warn(
        "伴奏音声が存在しないため拍頭オフセット推定を中止",
        "FooterAudioTrackMenu"
      );
      return;
    }
    const offset = estimateBeatOffset(props.backgroundAudioWav, ustTempo);
    LOG.info(`推定された拍頭オフセット: ${offset} ms`, "FooterAudioTrackMenu");
    props.setBackgroundOffsetMs(offset);
    setTextInputValue(offset.toString());
    props.handleClose();
  };

  return (
    <>
      <input
        type="file"
        onChange={handleFileChange}
        hidden
        ref={inputRef}
        accept=".wav"
        data-testid="ust-audio-input"
      ></input>
      <Menu
        anchorEl={props.anchor}
        open={Boolean(props.anchor)}
        onClose={props.handleClose}
        anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
      >
        <MenuItem onClick={handleLoadBackgroundWavClick}>
          <ListItemIcon>
            <AudiotrackIcon />
          </ListItemIcon>
          <ListItemText>{t("editor.footer.loadAudioTrack")}</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={handleEstimateBpmClick}
          disabled={
            props.backgroundWavUrl === "" ||
            props.backgroundWavUrl === null ||
            props.backgroundWavUrl === undefined
          }
        >
          <ListItemIcon>
            <SpeedIcon />
          </ListItemIcon>
          <ListItemText>{t("editor.footer.estimateBpm")}</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={handleMuteToggleBackgroundWavClick}
          disabled={
            props.backgroundWavUrl === "" ||
            props.backgroundWavUrl === null ||
            props.backgroundWavUrl === undefined
          }
        >
          <ListItemIcon>
            <VolumeOffIcon />
          </ListItemIcon>
          <Checkbox
            checked={props.backgroundMuted}
            onChange={handleMuteToggleBackgroundWavClick}
            onClick={(e) => e.stopPropagation()}
          />
          <ListItemText>{t("editor.footer.audioTrackMute")}</ListItemText>
        </MenuItem>
        <MenuItem
          disabled={
            props.backgroundWavUrl === "" ||
            props.backgroundWavUrl === null ||
            props.backgroundWavUrl === undefined
          }
          sx={{ flexDirection: "column", alignItems: "stretch" }}
        >
          <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
            <VolumeDownIcon sx={{ mr: 1 }} />
            <Slider
              value={props.backgroundVolume}
              onChange={handleBackgroundAudioVolumeChange}
              step={0.1}
              min={0}
              max={1}
              sx={{ flex: 1, mx: 2 }}
            />
            <VolumeUpIcon sx={{ ml: 1 }} />
          </Box>
        </MenuItem>
        <MenuItem
          disabled={
            props.backgroundWavUrl === "" ||
            props.backgroundWavUrl === null ||
            props.backgroundWavUrl === undefined
          }
          sx={{ flexDirection: "column", alignItems: "stretch" }}
        >
          <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
            <AccessTimeIcon sx={{ mr: 1 }} />
            <Slider
              value={props.backgroundOffsetMs}
              onChange={handleBackgroundAudioOffsetChange}
              step={1}
              min={offsetRange.min}
              max={offsetRange.max}
              sx={{ flex: 1, mx: 2 }}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mt: 1,
              px: 2,
            }}
          >
            <TextField
              value={textInputValue}
              onChange={handleBackgroundAudioOffsetTextChange}
              onBlur={handleBackgroundAudioOffsetTextBlur}
              type="number"
              variant="outlined"
              size="small"
              slotProps={{
                htmlInput: {
                  min: offsetRange.min,
                  max: offsetRange.max,
                  step: 1,
                },
                input: {
                  endAdornment: (
                    <span
                      style={{ fontSize: "0.7rem", color: "text.secondary" }}
                    >
                      ms
                    </span>
                  ),
                },
              }}
              sx={{
                width: "100px",
                "& .MuiInputBase-input": {
                  textAlign: "center",
                  fontSize: "0.8rem",
                },
              }}
            />
          </Box>
        </MenuItem>
        <MenuItem
          disabled={
            props.backgroundWavUrl === "" ||
            props.backgroundWavUrl === null ||
            props.backgroundWavUrl === undefined
          }
          onClick={handleEstimateBeatOffsetClick}
        >
          <ListItemIcon>
            <SyncIcon />
          </ListItemIcon>
          <ListItemText>
            <ListItemText>
              {t("editor.footer.audioOffsetEstimate")}
            </ListItemText>
          </ListItemText>
        </MenuItem>
        <MenuItem
          disabled={
            props.backgroundWavUrl === "" ||
            props.backgroundWavUrl === null ||
            props.backgroundWavUrl === undefined
          }
          onClick={handleBackgroundAudioOffsetResetClick}
        >
          <ListItemIcon>
            <RestartAltIcon />
          </ListItemIcon>
          <ListItemText>
            <ListItemText>{t("editor.footer.audioOffsetReset")}</ListItemText>
          </ListItemText>
        </MenuItem>
        <MenuItem
          disabled={
            props.backgroundWavUrl === "" ||
            props.backgroundWavUrl === null ||
            props.backgroundWavUrl === undefined
          }
          onClick={handleClearClick}
        >
          <ListItemIcon>
            <ClearIcon />
          </ListItemIcon>
          <ListItemText>
            <ListItemText>{t("editor.footer.audioClear")}</ListItemText>
          </ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export interface FooterAudioTrackMenuProps {
  /** メニューの表示位置 */
  anchor: HTMLElement | null;
  /** メニューを閉じるためのコールバック */
  handleClose: () => void;
  backgroundAudioWav: Wave | null;
  /** 伴奏用wavのデータを更新するためのコールバック */
  setBackgroundAudioWav: (wav: Wave) => void;
  /** 伴奏音声のurl */
  backgroundWavUrl: string;
  /** 伴奏音声のURLを更新するためのコールバック */
  setBackgroundWavUrl: (url: string) => void;
  /** 伴奏音声のオフセット（ミリ秒） */
  backgroundOffsetMs: number;
  /** 伴奏音声のオフセット（ミリ秒）を更新するためのコールバック */
  setBackgroundOffsetMs: (offset: number) => void;
  /** 伴奏音声の音量 */
  backgroundVolume: number;
  /** 伴奏音声の音量を更新するためのコールバック */
  setBackgroundVolume: (volume: number) => void;
  /** 伴奏音声のミュート状態 */
  backgroundMuted: boolean;
  /** 伴奏音声のミュート状態を更新するためのコールバック */
  setBackgroundMuted: (muted: boolean) => void;
}
