import { Avatar, Box, Divider, Link, Typography } from "@mui/material";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { SampleWavButton } from "../../features/InfoVBDialog/SampleWavButton";
import { urlValidation } from "../../utils/validation";

export const CharacterInfo: React.FC<CharacterInfoProps> = (props) => {
  const { t } = useTranslation();
  /** character.txtから読み込んだアイコン画像をdataurlに変換したもの */
  const imgUrl: string = React.useMemo(() => {
    return props.image === undefined
      ? undefined
      : URL.createObjectURL(new Blob([props.image], { type: "image/bmp" }));
  }, [props.image]);
  /** character.txtから読み込んだサンプル音声をdataurlに変換したもの */
  const sampleUrl: string = React.useMemo(() => {
    return props.sample === undefined
      ? undefined
      : URL.createObjectURL(new Blob([props.sample], { type: "audio/wav" }));
  }, [props.sample]);
  return (
    <Box
      sx={{
        m: 1,
        justifyContent: "space-between",
        display: "flex",
        flexWrap: "nowrap",
      }}
    >
      <Avatar
        alt="VoiceBank Icon"
        src={imgUrl}
        sx={{ width: 100, height: 100, m: 1 }}
        variant="square"
      />
      <Box sx={{ flexGrow: "1", m: 1 }}>
        <Typography variant="h6">
          {props.name} <SampleWavButton sampleUrl={sampleUrl} />
        </Typography>

        <Divider />
        <Typography variant="body2">
          {props.author !== undefined && (
            <>
              {t("infoVBDialog.characterInfo.author")}:{props.author}
              <Divider />
            </>
          )}
          {urlValidation(props.web) && (
            <>
              {t("infoVBDialog.characterInfo.web")}:
              <Link href={props.web} target="_blank">
                {props.web}
              </Link>
              <Divider />
            </>
          )}
          {props.voice !== undefined && (
            <>
              {t("infoVBDialog.characterInfo.voice")}:{props.voice}
              <Divider />
            </>
          )}
          {props.version !== undefined && (
            <>
              {t("infoVBDialog.characterInfo.version")}:{props.version}
              <Divider />
            </>
          )}
          {t("infoVBDialog.characterInfo.otoCounts")}:{props.otoCount}
          <br />
        </Typography>
      </Box>
    </Box>
  );
};

export interface CharacterInfoProps {
  /** character.txtから読み込んだ音源名 */
  name: string | undefined;
  /** character.txtから読み込んだアイコン画像のbuffer */
  image: ArrayBuffer | undefined;
  /** character.txtから読み込んだサンプル音声wavのbuffer */
  sample: ArrayBuffer | undefined;
  /** character.txtから読み込んだ管理人情報 */
  author: string | undefined;
  /** character.txtから読み込んだwebサイトの情報 */
  web: string | undefined;
  /** character.txtから読み込んだバージョン情報 */
  version: string | undefined;
  /** character.yamlから読み込んだ音声提供者情報 */
  voice: string | undefined;
  /** oto.iniから読み込んだエイリアスの数 */
  otoCount: number;
}
