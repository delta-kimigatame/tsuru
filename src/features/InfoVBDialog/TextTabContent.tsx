import { Box, LinearProgress, Typography } from "@mui/material";
import JSZip from "jszip";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { LOG } from "../../lib/Logging";
import { extractFileFromZip } from "../../services/extractFileFromZip";
import { readTextFile } from "../../services/readTextFile";
import { useSnackBarStore } from "../../store/snackBarStore";
import {
  EncodingOption,
  getFileReaderEncoding,
} from "../../utils/EncodingMapping";

/**
 * このコンポーネントはInfoVBDialog内において、音源zip内に含まれるテキストファイルを表示するタブ要素の各タブの中身を扱う。
 * @param props
 * @returns
 */
export const TextTabContent: React.FC<TextTabContentProps> = (props) => {
  const { t } = useTranslation();
  /**
   * テキストファイルを行毎に分割したもの
   */
  const [lines, setLines] = React.useState<string[] | undefined>(undefined);

  /** snackbarの操作 */
  const snackBarStore = useSnackBarStore();
  /**
   * 与えられるテキストファイルもしくは文字コードが変更された際の処理
   */
  React.useEffect(() => {
    LOG.debug("ファイル内容もしくはエンコードの変更検知", "TextTabContent");
    let isCancelled = false;
    if (!props.textFile) {
      LOG.debug("ファイルはnull", "TextTabContent");
      setLines([]);
      return;
    }
    /**
     * テキストファイルを読み込むための非同期処理
     */
    const fetchLines = async () => {
      LOG.info(
        `音源zipからテキストファイル読み込み。${props.textFile}`,
        "TextTabContent"
      );
      try {
        const buf = await extractFileFromZip(props.textFile);
        const text = await readTextFile(
          buf,
          getFileReaderEncoding(props.encoding)
        );
        const newLines = text.replace(/\r\n/g, "\n").split("\n");
        if (!isCancelled) {
          LOG.info(
            `音源zipからテキストファイル読み込み完了。${props.textFile}`,
            "TextTabContent"
          );
          setLines(newLines);
        }
      } catch {
        if (!isCancelled) {
          LOG.warn(
            `音源zipからテキストファイル読み込み失敗。${props.textFile}`,
            "TextTabContent"
          );
          setLines([]);
          snackBarStore.setSeverity("error");
          snackBarStore.setValue(t("infoVBDialog.TextTabContent.error"));
          snackBarStore.setOpen(true);
        }
      }
    };
    fetchLines();
    /**
     * componentがアンマウントされた際の処理
     */
    return () => {
      LOG.debug("unmount", "TextTabContent");
      isCancelled = true;
    };
  }, [props.textFile, props.encoding]);

  return (
    <Box sx={{ m: 1 }}>
      {lines === undefined ? (
        <LinearProgress />
      ) : (
        <Typography variant="body2" data-testid="text-content">
          {lines.map((l, i) => (
            <React.Fragment key={i}>
              {l}
              <br />
            </React.Fragment>
          ))}
        </Typography>
      )}
    </Box>
  );
};

export interface TextTabContentProps {
  /** このコンポーネントで表示するzip内のtextファイル */
  textFile: JSZip.JSZipObject;
  /** テキストファイルを読み込むための文字コード */
  encoding: EncodingOption;
}
