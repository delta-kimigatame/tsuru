import { TabContext, TabPanel } from "@mui/lab";
import { Box } from "@mui/material";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import JSZip from "jszip";
import React from "react";
import { useTranslation } from "react-i18next";
import { LOG } from "../../lib/Logging";
import { EncodingOption } from "../../utils/EncodingMapping";
import { TextTabContent } from "./TextTabContent";

/**
 * InfoVBDialogにおいて、zip内に含まれるテキストを表示するためのタブ
 * rootにreadme.txtが含まれる場合defaultの要素として表示する。
 * character.txtとinstall.txtはUTAUの設定ファイルのため表示しない。
 * @param props
 * @returns
 */
export const TextTabs: React.FC<TextTabsProps> = (props) => {
  const { t } = useTranslation();
  /** 表示するタブを制御する */
  const [value, setValue] = React.useState<number>(0);

  /**
   * zipファイルが渡されたとき、txtファイルのリストを返す。
   */
  const textFileList = React.useMemo(() => {
    LOG.debug("zipファイルの更新検知", "TextTabs");
    if (!props.zipFiles) {
      LOG.debug("zipファイルはnull", "TextTabs");
      return undefined;
    }
    const fileList = Object.keys(props.zipFiles);
    /** character.txt,install.txt,readme.txt以外のtxtファイルの相対パス */
    const filterFileList = fileList.filter((f) => filterRule(f));
    /** readme.txtが存在する場合、必ず最初の要素として追加する。 */
    if (fileList.includes("readme.txt")) {
      filterFileList.unshift("readme.txt");
    }
    LOG.info(
      `zip内、音源ルート以下のテキストファイル一覧:${filterFileList}`,
      "TextTabs"
    );
    return filterFileList;
  }, [props.zipFiles]);

  /** タブを変更する操作 */
  const handleChange = (e: React.SyntheticEvent, newValue: number) => {
    LOG.debug(`タブの変更。${newValue}`, "TextTabs");
    setValue(newValue);
  };
  return (
    <>
      {textFileList === undefined ? (
        <Box sx={{ m: 1 }}>{t("infoVBDialog.TextTabs.notFound")}</Box>
      ) : (
        <>
          <TabContext value={value}>
            <Tabs
              value={value}
              onChange={handleChange}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="textfile tabs"
            >
              {textFileList.map((f, i) => (
                <Tab label={f} value={i} />
              ))}
            </Tabs>
            {textFileList.map((f, i) => (
              <TabPanel key={f} value={i}>
                <TextTabContent
                  textFile={props.zipFiles[f]}
                  encoding={props.encoding}
                />
              </TabPanel>
            ))}
          </TabContext>
        </>
      )}
    </>
  );
};

export interface TextTabsProps {
  /**
   * 音声ライブラリを構成するzip
   * root以下に含まれるファイル情報のみにフィルタリングされており、
   * かつkeyはroot空の相対パスとなっている。
   *
   * なお、VoiceBank関数はcharacter.txtがあるパスをrootと判定する。
   *  */
  zipFiles: { [key: string]: JSZip.JSZipObject };
  /** テキストファイルを読み込むための文字コード */
  encoding: EncodingOption;
}

/**
 * ファイル一覧からtxtファイルのみをフィルターする処理。
 * ただし、character.txt、install.txt、readme.txtはプロジェクトが想定する特殊な設定ファイルのため除外する。
 * @param f ファイル名
 * @returns 条件に一致するか
 */
export const filterRule = (f: string): boolean => {
  return (
    f.endsWith(".txt") &&
    !f.endsWith("readme.txt") &&
    !f.endsWith("character.txt") &&
    !f.endsWith("install.txt")
  );
};
