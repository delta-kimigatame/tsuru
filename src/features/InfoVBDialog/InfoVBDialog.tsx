import CloseIcon from "@mui/icons-material/Close";
import { Button, DialogActions, IconButton } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import React from "react";
import { useTranslation } from "react-i18next";
import { CharacterInfo } from "../../components/InfoVBDialog/CharacterInfo";
import { LOG } from "../../lib/Logging";
import { useMusicProjectStore } from "../../store/musicProjectStore";
import {
  EncodingOption,
  getFileReaderEncoding,
} from "../../utils/EncodingMapping";
import { EncodingSelect } from "../common/EncodingSelect";
import { TextTabs } from "./TextTabs";

export const InfoVBDialog: React.FC<InfoVBDialogProps> = (props) => {
  const { t } = useTranslation();
  /** UTAU音源内のテキストファイルを解釈するための文字コード */
  const [encoding, setEncoding] = React.useState<EncodingOption>(
    EncodingOption.SHIFT_JIS
  );
  /** 利用規約に同意済みか */
  const [agreed, setAgreed] = React.useState<boolean>(false);
  /** 音源の読込処理中か */
  const [progress, setProgress] = React.useState<boolean>(false);
  /** UTAU音源 */
  const { vb } = useMusicProjectStore();

  /**
   * UTAU音源が更新された際の処理。
   * 非null更新の場合利用規約の同意状況を初期化し、dialogを開く。
   * */
  React.useEffect(() => {
    LOG.debug("vb更新検知", "InfoVBDialog");
    if (vb === null) {
      LOG.debug("vbはnull", "InfoVBDialog");
      return;
    }
    LOG.info(
      "新しいvbに変更されたため、利用規約への同意状況を初期化しダイアログを開きます。",
      "InfoVBDialog"
    );
    setAgreed(false);
    props.setOpen(true);
  }, [vb]);

  /**
   * 指定した文字コードでUTAUの設定ファイルを読み直す
   */
  const ReInitializeVb = async () => {
    if (vb === null) {
      LOG.debug("vbはnull", "InfoVBDialog");
      setProgress(false);
      return;
    }
    LOG.info(`${encoding}に基づきVBを再度initialize`, "InfoVBDialog");
    await vb.initialize(getFileReaderEncoding(encoding));
    console.log(vb);
    LOG.info(`${encoding}に基づきVBをinitialize完了`, "InfoVBDialog");
    setProgress(false);
  };

  /** 文字コードが変更された際の処理 */
  React.useEffect(() => {
    LOG.debug("文字コードの変更検知", "InfoVBDialog");
    setProgress(true);
    ReInitializeVb();
  }, [encoding]);

  /**
   * ダイアログを閉じる処理
   */
  const handleClose = () => {
    LOG.info("音源情報ダイアログを閉じる", "InfoVBDialog");
    props.setOpen(false);
  };

  /**
   * 利用規約に同意ボタンを押した際の動作
   */
  const handleButtonClick = () => {
    LOG.info("音源利用規約に同意しました", "InfoVBDialog");
    setAgreed(true);
    // 利用規約に同意してダイアログを閉じるときにはファイル読込内容が確定している
    LOG.gtag("vbInfo", {
      name: vb.name,
      txtEncoding: encoding,
      hasIcon: vb.image !== undefined,
      hasSample: vb.sample !== undefined,
      hasPortrait: vb.portrait !== undefined,
    });
    LOG.info("音源情報ダイアログを閉じる", "InfoVBDialog");
    props.setOpen(false);
  };

  return (
    <>
      <Dialog open={props.open && vb !== null} onClose={handleClose} fullScreen>
        <DialogTitle>
          {vb !== null && (
            <CharacterInfo
              name={vb.name}
              image={vb.image}
              sample={vb.sample}
              author={vb.author}
              web={vb.web}
              version={vb.version}
              voice={vb.voice}
              otoCount={vb.oto.otoCount}
            />
          )}
          {agreed && (
            <IconButton
              onClick={handleClose}
              aria-label="close"
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
          <EncodingSelect
            value={encoding}
            setValue={setEncoding}
            disabled={progress}
          />
        </DialogTitle>
        <DialogContent>
          {vb !== null && (
            <TextTabs zipFiles={vb.zip} files={vb.files} encoding={encoding} />
          )}
        </DialogContent>
        {!agreed && (
          <DialogActions>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleButtonClick}
              size="large"
              sx={{ mx: 1 }}
            >
              {t("infoVBDialog.agreeButton")}
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </>
  );
};

export interface InfoVBDialogProps {
  /** dialogの開閉状態 */
  open: boolean;
  /** dialogの開閉状態を変更するコールバック */
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
