import { TabContext, TabPanel } from "@mui/lab";
import { Box } from "@mui/material";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import JSZip from "jszip";
import React from "react";
import { useTranslation } from "react-i18next";
import { LOG } from "../../lib/Logging";
import type { BaseVoiceBank } from "../../lib/VoiceBanks/BaseVoiceBank";
import { EncodingOption } from "../../utils/EncodingMapping";
import { OtoAliasView } from "./OtoAliasView";
import { PrefixMapView } from "./PrefixMapView";
import { TextTabContent } from "./TextTabContent";
import { VoiceBankDiagnostics } from "./VoiceBankDiagnostics";

/**
 * InfoVBDialogにおいて、zip内に含まれるテキストを表示するためのタブ
 * rootにreadme.txtが含まれる場合defaultの要素として表示する。
 * character.txtとinstall.txtはUTAUの設定ファイルのため表示しない。
 * エイリアス一覧タブと音源診断タブも含む。
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
    if (!props.zipFiles && !props.files) {
      LOG.debug("zipファイルはnull", "TextTabs");
      return undefined;
    } else if (props.zipFiles) {
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
    } else if (props.files) {
      const fileList = Object.keys(props.files);
      const filterFileList = fileList.filter((f) => filterRule(f));
      /** readme.txtが存在する場合、必ず最初の要素として追加する。 */
      if (fileList.includes("readme.txt")) {
        filterFileList.unshift("readme.txt");
      }
      LOG.info(
        `フォルダ内、音源ルート以下のテキストファイル一覧:${filterFileList}`,
        "TextTabs"
      );
      return filterFileList;
    }
  }, [props.zipFiles, props.files]);

  /** タブを変更する操作 */
  const handleChange = (e: React.SyntheticEvent, newValue: number) => {
    LOG.debug(`タブの変更。${newValue}`, "TextTabs");
    setValue(newValue);
  };

  // タブの総数（テキストファイル数 + エイリアス一覧タブ + prefix.mapタブ + 診断タブ）
  const totalTabCount = textFileList ? textFileList.length + 3 : 3;
  const aliasTabIndex = textFileList ? textFileList.length : 0;
  const prefixMapTabIndex = aliasTabIndex + 1;
  const diagnosticsTabIndex = prefixMapTabIndex + 1;

  return (
    <>
      {textFileList === undefined && !props.vb ? (
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
              {textFileList &&
                textFileList.map((f, i) => <Tab key={f} label={f} value={i} />)}
              {/* エイリアス一覧タブ */}
              {props.vb && (
                <Tab
                  label={t("infoVBDialog.aliasView.tabName")}
                  value={aliasTabIndex}
                />
              )}
              {/* prefix.mapタブ */}
              {props.vb && (
                <Tab
                  label={t("infoVBDialog.prefixMapView.tabName")}
                  value={prefixMapTabIndex}
                />
              )}
              {/* 音源診断タブ */}
              {props.vb && (
                <Tab
                  label={t("infoVBDialog.diagnostics.tabName")}
                  value={diagnosticsTabIndex}
                />
              )}
            </Tabs>
            {textFileList &&
              textFileList.map((f, i) => (
                <TabPanel key={f} value={i} sx={{ p: 1 }}>
                  <TextTabContent
                    textFile={
                      props.zipFiles !== null
                        ? props.zipFiles[f]
                        : props.files[f]
                    }
                    encoding={props.encoding}
                  />
                </TabPanel>
              ))}
            {/* エイリアス一覧パネル */}
            {props.vb && (
              <TabPanel value={aliasTabIndex} sx={{ p: 1 }}>
                <OtoAliasView vb={props.vb} />
              </TabPanel>
            )}
            {/* prefix.mapパネル */}
            {props.vb && (
              <TabPanel value={prefixMapTabIndex} sx={{ p: 1 }}>
                <PrefixMapView vb={props.vb} />
              </TabPanel>
            )}
            {/* 音源診断パネル */}
            {props.vb && (
              <TabPanel value={diagnosticsTabIndex} sx={{ p: 1 }}>
                <VoiceBankDiagnostics vb={props.vb} />
              </TabPanel>
            )}
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
  files: { [key: string]: File };
  /** テキストファイルを読み込むための文字コード */
  encoding: EncodingOption;
  /** VoiceBankインスタンス（エイリアス一覧表示用） */
  vb: BaseVoiceBank | null;
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
