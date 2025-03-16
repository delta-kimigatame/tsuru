import { Avatar, Box, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React from "react";
import { useTranslation } from "react-i18next";
import { setting } from "../../config/siteConfig";
import { LOG } from "../../lib/Logging";
import { useMusicProjectStore } from "../../store/musicProjectStore";
import { useSnackBarStore } from "../../store/snackBarStore";
import { InfoVBDialog } from "../InfoVBDialog/InfoVBDialog";

/**
 * ヘッダに表示されるロゴ。
 * 音源が未読込の場合、アプリのアイコンとアプリ名を表示し、音源ロード済みの場合音源アイコンと名前を表示する。
 * 画面サイズの横幅が小さい場合文字は表示しない。
 * 音源読込済みの場合クリックした際に音源情報ダイアログを開く。
 * @returns
 */
export const HeaderLogo: React.FC = () => {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState<boolean>(false);
  /** snackbarの操作 */
  const snackBarStore = useSnackBarStore();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("sm"));
  const { vb } = useMusicProjectStore();
  /** character.txtから読み込んだアイコン画像をdataurlに変換したもの */
  const imgUrl: string = React.useMemo(() => {
    LOG.debug("vb更新検知", "HeaderLogo");
    if (vb === null) {
      LOG.debug("vbはnull", "HeaderLogo");
      return undefined;
    }
    return vb.image === undefined
      ? undefined
      : URL.createObjectURL(new Blob([vb.image], { type: "image/bmp" }));
  }, [vb]);

  /**
   * ロゴをクリックした際の動作。
   * 音源がロード済みであればInfoVBDialogを開く。
   */
  const handleClick = () => {
    LOG.debug("click", "HeaderLogo");
    if (vb !== null) {
      LOG.info("vbInfoDialogを開く", "HeaderLogo");
      setOpen(true);
    } else {
      LOG.info("音源がロードされていません", "HeaderLogo");
      snackBarStore.setSeverity("info");
      snackBarStore.setValue(t("header.clickInfo")); //defaultの表示：音源が未選択です。音源を選択して始めよう!
      snackBarStore.setOpen(true);
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", flexWrap: "nowrap", alignItems: "center" }}>
        <Avatar
          sx={{ width: 40, height: 40, mx: 1 }}
          variant="square"
          src={vb === null ? "./static/logo192.png" : imgUrl}
          alt={vb === null ? "logo" : vb.name}
          onClick={handleClick}
        />
        {matches && (
          <Typography variant="subtitle2">
            {vb === null ? setting.productName : vb.name}
          </Typography>
        )}
      </Box>
      <InfoVBDialog open={open} setOpen={setOpen} />
    </>
  );
};
