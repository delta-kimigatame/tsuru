import CloseIcon from "@mui/icons-material/Close";
import { Button, DialogActions, IconButton } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import React from "react";
import { useTranslation } from "react-i18next";
import { CharacterInfo } from "../../components/InfoVBDialog/CharacterInfo";
import { useMusicProjectStore } from "../../store/musicProjectStore";
import { EncodingOption } from "../../utils/EncodingMapping";
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
  const { vb } = useMusicProjectStore.getState();

  /**
   * UTAU音源が更新された際の処理。
   * 非null更新の場合利用規約の同意状況を初期化し、dialogを開く。
   * */
  React.useEffect(() => {
    if (vb === null) return;
    setAgreed(false);
    props.setOpen(true);
  }, [vb]);

  /**
   * 指定した文字コードでUTAUの設定ファイルを読み直す
   */
  const ReInitializeVb = async () => {
    if (vb === null) return;
    await vb.initialize(encoding);
    setProgress(false);
  };

  /** 文字コードが変更された際の処理 */
  React.useEffect(() => {
    setProgress(true);
    ReInitializeVb();
  }, [encoding]);

  /**
   * ダイアログを閉じる処理
   */
  const handleClose = () => {
    props.setOpen(false);
  };

  /**
   * 利用規約に同意ボタンを押した際の動作
   */
  const handleButtonClick = () => {
    setAgreed(true);
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
          {vb !== null && <TextTabs zipFiles={vb.zip} encoding={encoding} />}
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
