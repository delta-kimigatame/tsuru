import { CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import React from "react";
import { useTranslation } from "react-i18next";
import { Wave } from "utauwav";
import { Footer } from "../../components/Footer/Footer";
import { renderingConfig } from "../../config/rendering";
import { getDesignTokens } from "../../config/theme";
import { useThemeMode } from "../../hooks/useThemeMode";
import { type VideoExportFormContext } from "../../hooks/useVideoExportForm";
import i18n from "../../i18n/configs";
import type { Note } from "../../lib/Note";
import { Ust } from "../../lib/Ust";
import { useCookieStore } from "../../store/cookieStore";
import type { PianorollVideoOptions } from "../../utils/pianorollVideo";
import {
  generateMp4,
  type BackgroundOptions,
  type BgPaddingMode,
  type LyricsOptions,
  type PortraitOptions,
  type TextOptions,
  type VideoResolution,
  type WaveformEffectOptions,
} from "../../utils/videoExport";
import { Header } from "../components/Header/Header";
import { TopView } from "../components/TopView/TopView";
import { VideoEditorView } from "./EditorView/VideoEditorView";

const computeNotesLeftMs = (notes: Note[]): number[] => {
  const leftsMs: number[] = [];
  let totalMs = 0;
  for (let i = 0; i < notes.length; i++) {
    leftsMs.push(totalMs);
    totalMs += notes[i].msLength;
  }
  return leftsMs;
};

export const App: React.FC = () => {
  const { t } = useTranslation();
  const mode = useThemeMode();
  const { language, colorTheme, horizontalZoom, verticalZoom } =
    useCookieStore();
  const theme = React.useMemo(
    () => createTheme(getDesignTokens(mode, colorTheme)),
    [mode, colorTheme],
  );

  React.useMemo(() => {
    i18n.changeLanguage(language);
    document.documentElement.lang = language;
  }, [language]);

  const [notes, setNotes] = React.useState<Note[] | null>(null);
  const [notesLeftMs, setNotesLeftMs] = React.useState<number[] | null>(null);
  const [wavBuffer, setWavBuffer] = React.useState<ArrayBuffer | null>(null);
  const [portraitBlob, setPortraitBlob] = React.useState<Blob | null>(null);
  const [voiceIcon, setVoiceIcon] = React.useState<ArrayBuffer | undefined>(
    undefined,
  );
  const [editorMode, setEditorMode] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(
    undefined,
  );
  const [synthesisProgress, setSynthesisProgress] = React.useState(false);
  const [synthesisCount, setSynthesisCount] = React.useState(0);
  const [videoExportTotal, setVideoExportTotal] = React.useState<
    number | undefined
  >(undefined);
  const [ustFileName, setUstFileName] = React.useState<string | undefined>(
    undefined,
  );
  const [wavFileName, setWavFileName] = React.useState<string | undefined>(
    undefined,
  );
  const [portraitFileName, setPortraitFileName] = React.useState<
    string | undefined
  >(undefined);
  const [iconFileName, setIconFileName] = React.useState<string | undefined>(
    undefined,
  );

  const canLoadWav = notes !== null;
  const canOpenEditor = notes !== null && wavBuffer !== null;

  const formContext = React.useMemo<VideoExportFormContext>(
    () => ({
      colorTheme,
      horizontalZoom,
      verticalZoom,
      tone: 0,
      isMinor: false,
      themeMode: mode,
    }),
    [colorTheme, horizontalZoom, verticalZoom, mode],
  );

  const handleUstSelected = React.useCallback(
    async (file: File) => {
      try {
        setErrorMessage(undefined);
        const ust = new Ust();
        const buf = await file.arrayBuffer();
        await ust.load(buf);
        setNotes(ust.notes);
        setNotesLeftMs(computeNotesLeftMs(ust.notes));
        setUstFileName(file.name);
        if (wavBuffer) {
          setEditorMode(true);
        }
      } catch (e) {
        setErrorMessage(t("videoEditor.errorLoadUst", { error: String(e) }));
      }
    },
    [wavBuffer, t],
  );

  const handleWavSelected = React.useCallback(
    async (file: File) => {
      try {
        setErrorMessage(undefined);
        const arrayBuffer = await file.arrayBuffer();
        const wave = new Wave(arrayBuffer);
        wave.sampleRate = renderingConfig.frameRate;
        wave.bitDepth = 16;
        wave.VolumeNormalize();
        const wBuf = await wave.Output();
        setWavBuffer(wBuf);
        setWavFileName(file.name);
        if (notes) {
          setEditorMode(true);
        }
      } catch (e) {
        setErrorMessage(t("videoEditor.errorLoadWav", { error: String(e) }));
      }
    },
    [notes, t],
  );

  const handlePortraitSelected = React.useCallback(async (file: File) => {
    setPortraitBlob(
      await file
        .slice()
        .arrayBuffer()
        .then((buf) => new Blob([buf], { type: file.type || "image/png" })),
    );
    setPortraitFileName(file.name);
  }, []);

  const handleIconSelected = React.useCallback(async (file: File) => {
    setVoiceIcon(await file.arrayBuffer());
    setIconFileName(file.name);
  }, []);

  const handleVideoExportConfirm = React.useCallback(
    async (
      imageFile: File | null,
      resolution: VideoResolution,
      background: BackgroundOptions,
      bgPaddingMode: BgPaddingMode,
      bgImageOpacity: number,
      portraitOptions: PortraitOptions | null,
      mainTextOptions: TextOptions | null,
      subTextOptions: TextOptions | null,
      lyricsOptions: LyricsOptions | null,
      pianorollOptions: PianorollVideoOptions | null,
      waveformOptions: WaveformEffectOptions | null,
    ) => {
      if (!wavBuffer) return;
      setSynthesisProgress(true);
      setSynthesisCount(0);
      setVideoExportTotal(undefined);
      try {
        const mp4Buf = await generateMp4(
          wavBuffer,
          imageFile,
          resolution,
          background,
          bgPaddingMode,
          bgImageOpacity,
          portraitOptions,
          mainTextOptions,
          subTextOptions,
          lyricsOptions,
          pianorollOptions ?? undefined,
          waveformOptions ?? undefined,
          (current, total) => {
            setSynthesisCount(current);
            setVideoExportTotal(total);
          },
        );
        const dataUrl = URL.createObjectURL(
          new File([mp4Buf], "output.mp4", { type: "video/mp4" }),
        );
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = "output.mp4";
        a.click();
      } catch (e) {
        setErrorMessage(t("videoEditor.errorExport", { error: String(e) }));
      } finally {
        setSynthesisProgress(false);
        setVideoExportTotal(undefined);
      }
    },
    [wavBuffer, t],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header />
      {editorMode && canOpenEditor && notes && notesLeftMs ? (
        <VideoEditorView
          onBack={() => setEditorMode(false)}
          onConfirm={handleVideoExportConfirm}
          synthesisProgress={synthesisProgress}
          synthesisCount={synthesisCount}
          videoExportTotal={videoExportTotal}
          progressText={
            videoExportTotal
              ? t("videoEditor.progressFrames", {
                  current: synthesisCount,
                  total: videoExportTotal,
                })
              : undefined
          }
          portraitBlob={portraitBlob}
          voiceIcon={voiceIcon}
          notes={notes}
          notesLeftMs={notesLeftMs}
          selectNotesIndex={[]}
          formContext={formContext}
        />
      ) : (
        <>
          <br />
          <br />
          <TopView
            ustFileName={ustFileName}
            wavFileName={wavFileName}
            portraitFileName={portraitFileName}
            iconFileName={iconFileName}
            canLoadWav={canLoadWav}
            canOpenEditor={canOpenEditor}
            errorMessage={errorMessage}
            onUstSelected={handleUstSelected}
            onWavSelected={handleWavSelected}
            onPortraitSelected={handlePortraitSelected}
            onIconSelected={handleIconSelected}
            onOpenEditor={() => setEditorMode(true)}
          />
          <Footer />
        </>
      )}
    </ThemeProvider>
  );
};
