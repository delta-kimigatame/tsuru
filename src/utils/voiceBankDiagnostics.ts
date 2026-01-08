import { LOG } from "../lib/Logging";
import type { BaseVoiceBank } from "../lib/VoiceBanks/BaseVoiceBank";
import { getAllOtoRecords } from "./otoHelper";

/**
 * 診断結果の型
 */
export interface DiagnosticResult {
  warnings: DiagnosticItem[];
  errors: DiagnosticItem[];
}

/**
 * 診断項目の型
 */
export interface DiagnosticItem {
  type: DiagnosticType;
  message: string;
  details?: string;
}

/**
 * 診断の種類
 */
export enum DiagnosticType {
  // Warnings
  WAV_WITHOUT_OTO = "wav_without_oto",
  MISSING_FRQ = "missing_frq",
  OTO_OUTSIDE_ROOT = "oto_outside_root",
  CONFIG_FILE_MISPLACED = "config_file_misplaced",

  // Errors
  INVALID_WAV_FORMAT = "invalid_wav_format",
  OTO_WITHOUT_WAV = "oto_without_wav",
  NO_STRETCH_RANGE = "no_stretch_range",
}

/**
 * 診断タイプの重要度
 */
export enum DiagnosticSeverity {
  WARNING = "warning",
  ERROR = "error",
}

/**
 * 診断タイプのメタデータ
 */
export const DIAGNOSTIC_TYPE_METADATA: Record<
  DiagnosticType,
  { severity: DiagnosticSeverity }
> = {
  [DiagnosticType.WAV_WITHOUT_OTO]: { severity: DiagnosticSeverity.WARNING },
  [DiagnosticType.MISSING_FRQ]: { severity: DiagnosticSeverity.WARNING },
  [DiagnosticType.OTO_OUTSIDE_ROOT]: { severity: DiagnosticSeverity.WARNING },
  [DiagnosticType.CONFIG_FILE_MISPLACED]: {
    severity: DiagnosticSeverity.WARNING,
  },
  [DiagnosticType.INVALID_WAV_FORMAT]: { severity: DiagnosticSeverity.ERROR },
  [DiagnosticType.OTO_WITHOUT_WAV]: { severity: DiagnosticSeverity.ERROR },
  [DiagnosticType.NO_STRETCH_RANGE]: { severity: DiagnosticSeverity.ERROR },
};

/**
 * 音源の診断を実行する
 * @param vb 診断対象の音源
 * @returns 診断結果
 */
export async function diagnoseVoiceBank(
  vb: BaseVoiceBank
): Promise<DiagnosticResult> {
  LOG.debug("音源診断を開始", "VoiceBankDiagnostics");

  const warnings: DiagnosticItem[] = [];
  const errors: DiagnosticItem[] = [];

  try {
    // Warning チェック
    const wavWithoutOto = await checkWavWithoutOto(vb);
    warnings.push(...wavWithoutOto);

    const missingFrq = await checkMissingFrq(vb);
    warnings.push(...missingFrq);

    const otoOutsideRoot = await checkOtoOutsideRoot(vb);
    warnings.push(...otoOutsideRoot);

    const configMisplaced = await checkConfigFileMisplaced(vb);
    warnings.push(...configMisplaced);

    // Error チェック
    const invalidFormat = await checkWavFormat(vb);
    errors.push(...invalidFormat);

    const otoWithoutWav = await checkOtoWithoutWav(vb);
    errors.push(...otoWithoutWav);

    const noStretch = await checkStretchRange(vb);
    errors.push(...noStretch);

    LOG.debug(
      `音源診断完了: Error ${errors.length}件, Warning ${warnings.length}件`,
      "VoiceBankDiagnostics"
    );
  } catch (error) {
    LOG.debug(`音源診断中にエラー: ${error}`, "VoiceBankDiagnostics");
  }

  return { warnings, errors };
}

/**
 * wavファイルに対応するoto.iniレコードがないかチェック
 */
async function checkWavWithoutOto(
  vb: BaseVoiceBank
): Promise<DiagnosticItem[]> {
  LOG.debug("wavファイルに対応するoto.iniチェック開始", "VoiceBankDiagnostics");
  const warnings: DiagnosticItem[] = [];

  try {
    const allRecords = getAllOtoRecords(vb.oto);
    const otoWavFiles = new Set(
      allRecords.map((r) =>
        r.dirpath ? `${r.dirpath}/${r.filename}` : r.filename
      )
    );

    // zip/filesからwavファイル一覧を取得
    const wavFiles = getWavFiles(vb);

    for (const wavFile of wavFiles) {
      if (!otoWavFiles.has(wavFile)) {
        warnings.push({
          type: DiagnosticType.WAV_WITHOUT_OTO,
          message: "wav_without_oto",
          details: wavFile,
        });
      }
    }

    LOG.debug(
      `wavファイル without oto: ${warnings.length}件`,
      "VoiceBankDiagnostics"
    );
  } catch (error) {
    LOG.debug(`checkWavWithoutOtoでエラー: ${error}`, "VoiceBankDiagnostics");
  }

  return warnings;
}

/**
 * frqファイルが存在しないかチェック
 */
async function checkMissingFrq(vb: BaseVoiceBank): Promise<DiagnosticItem[]> {
  LOG.debug("frqファイル存在チェック開始", "VoiceBankDiagnostics");
  const warnings: DiagnosticItem[] = [];

  try {
    const allRecords = getAllOtoRecords(vb.oto);

    // 重複を除外
    const uniqueWavs = new Set(
      allRecords.map((r) =>
        r.dirpath ? `${r.dirpath}/${r.filename}` : r.filename
      )
    );

    for (const wavFile of uniqueWavs) {
      // WAVファイルが存在しない場合はFRQチェックをスキップ
      try {
        await vb.getWave(wavFile);
      } catch {
        continue;
      }

      // WAVファイルが存在する場合のみFRQチェック
      try {
        await vb.getFrq(wavFile);
      } catch {
        warnings.push({
          type: DiagnosticType.MISSING_FRQ,
          message: "missing_frq",
          details: wavFile,
        });
      }
    }

    LOG.debug(`frqファイル欠損: ${warnings.length}件`, "VoiceBankDiagnostics");
  } catch (error) {
    LOG.debug(`checkMissingFrqでエラー: ${error}`, "VoiceBankDiagnostics");
  }

  return warnings;
}

/**
 * wavファイルのフォーマットが正しいかチェック
 */
async function checkWavFormat(vb: BaseVoiceBank): Promise<DiagnosticItem[]> {
  LOG.debug("wavフォーマットチェック開始", "VoiceBankDiagnostics");
  const errors: DiagnosticItem[] = [];

  try {
    const allRecords = getAllOtoRecords(vb.oto);
    const uniqueWavs = new Set(
      allRecords.map((r) =>
        r.dirpath ? `${r.dirpath}/${r.filename}` : r.filename
      )
    );

    for (const wavFile of uniqueWavs) {
      try {
        const wave = await vb.getWave(wavFile);

        if (
          wave.sampleRate !== 44100 ||
          wave.bitDepth !== 16 ||
          wave.channels !== 1
        ) {
          errors.push({
            type: DiagnosticType.INVALID_WAV_FORMAT,
            message: "invalid_wav_format",
            details: `${wavFile} (${wave.sampleRate}Hz/${wave.bitDepth}bit/${wave.channels}ch)`,
          });
        }
      } catch (error) {
        LOG.debug(`wav読込エラー: ${wavFile}`, "VoiceBankDiagnostics");
      }
    }

    LOG.debug(
      `wavフォーマット不正: ${errors.length}件`,
      "VoiceBankDiagnostics"
    );
  } catch (error) {
    LOG.debug(`checkWavFormatでエラー: ${error}`, "VoiceBankDiagnostics");
  }

  return errors;
}

/**
 * otoが指し示すwavファイルが存在するかチェック
 */
async function checkOtoWithoutWav(
  vb: BaseVoiceBank
): Promise<DiagnosticItem[]> {
  LOG.debug("oto → wav存在チェック開始", "VoiceBankDiagnostics");
  const errors: DiagnosticItem[] = [];

  try {
    const allRecords = getAllOtoRecords(vb.oto);

    for (const record of allRecords) {
      const wavFile = record.dirpath
        ? `${record.dirpath}/${record.filename}`
        : record.filename;

      try {
        await vb.getWave(wavFile);
      } catch {
        errors.push({
          type: DiagnosticType.OTO_WITHOUT_WAV,
          message: "oto_without_wav",
          details: `${record.alias} → ${wavFile}`,
        });
      }
    }

    LOG.debug(`oto without wav: ${errors.length}件`, "VoiceBankDiagnostics");
  } catch (error) {
    LOG.debug(`checkOtoWithoutWavでエラー: ${error}`, "VoiceBankDiagnostics");
  }

  return errors;
}

/**
 * 伸縮範囲が存在するかチェック
 */
async function checkStretchRange(vb: BaseVoiceBank): Promise<DiagnosticItem[]> {
  LOG.debug("伸縮範囲チェック開始", "VoiceBankDiagnostics");
  const errors: DiagnosticItem[] = [];

  try {
    const allRecords = getAllOtoRecords(vb.oto);

    for (const record of allRecords) {
      const wavFile = record.dirpath
        ? `${record.dirpath}/${record.filename}`
        : record.filename;

      try {
        const wave = await vb.getWave(wavFile);
        const waveData = wave.data;
        if (!waveData) {
          continue;
        }
        const wavLength = (waveData.length / wave.sampleRate) * 1000; // ms

        const velPos = record.offset + record.velocity;
        let blankPos: number;

        if (record.blank >= 0) {
          // 正の値: ファイル末尾からの時間
          blankPos = wavLength - record.blank;
        } else {
          // 負の値: offsetからの絶対位置
          blankPos = record.offset + Math.abs(record.blank);
        }

        if (velPos >= blankPos) {
          errors.push({
            type: DiagnosticType.NO_STRETCH_RANGE,
            message: "no_stretch_range",
            details: `${record.alias} (vel: ${velPos.toFixed(
              2
            )}ms, blank: ${blankPos.toFixed(2)}ms)`,
          });
        }
      } catch (error) {
        LOG.debug(
          `伸縮範囲チェックエラー: ${record.alias}`,
          "VoiceBankDiagnostics"
        );
      }
    }

    LOG.debug(`伸縮範囲なし: ${errors.length}件`, "VoiceBankDiagnostics");
  } catch (error) {
    LOG.debug(`checkStretchRangeでエラー: ${error}`, "VoiceBankDiagnostics");
  }

  return errors;
}

/**
 * 音源ルートフォルダ外のoto.iniファイルをチェック
 */
async function checkOtoOutsideRoot(
  vb: BaseVoiceBank
): Promise<DiagnosticItem[]> {
  LOG.debug(
    "音源ルートフォルダ外のoto.iniチェック開始",
    "VoiceBankDiagnostics"
  );
  const warnings: DiagnosticItem[] = [];

  try {
    const root = vb.root !== undefined && vb.root !== "" ? vb.root + "/" : "";
    const allOtoFiles = vb.filenames.filter((f) => f.endsWith("oto.ini"));
    const outsideOtoFiles = allOtoFiles.filter((f) => !f.startsWith(root));

    for (const otoFile of outsideOtoFiles) {
      warnings.push({
        type: DiagnosticType.OTO_OUTSIDE_ROOT,
        message: "oto_outside_root",
        details: otoFile,
      });
    }

    LOG.debug(
      `音源ルート外のoto.ini: ${warnings.length}件`,
      "VoiceBankDiagnostics"
    );
  } catch (error) {
    LOG.debug(`checkOtoOutsideRootでエラー: ${error}`, "VoiceBankDiagnostics");
  }

  return warnings;
}

/**
 * 設定ファイルが正しい位置に配置されているかチェック
 */
async function checkConfigFileMisplaced(
  vb: BaseVoiceBank
): Promise<DiagnosticItem[]> {
  LOG.debug("設定ファイル配置チェック開始", "VoiceBankDiagnostics");
  const warnings: DiagnosticItem[] = [];

  try {
    const root = vb.root !== undefined && vb.root !== "" ? vb.root + "/" : "";
    const configFiles = ["prefix.map", "character.yaml", "presamp.ini"];

    for (const configFile of configFiles) {
      const correctPath = root + configFile;
      const allMatches = vb.filenames.filter((f) => f.endsWith(configFile));
      const misplacedFiles = allMatches.filter((f) => f !== correctPath);

      for (const file of misplacedFiles) {
        warnings.push({
          type: DiagnosticType.CONFIG_FILE_MISPLACED,
          message: "config_file_misplaced",
          details: file,
        });
      }
    }

    LOG.debug(
      `配置ミスの設定ファイル: ${warnings.length}件`,
      "VoiceBankDiagnostics"
    );
  } catch (error) {
    LOG.debug(
      `checkConfigFileMisplacedでエラー: ${error}`,
      "VoiceBankDiagnostics"
    );
  }

  return warnings;
}

/**
 * 音源からwavファイル一覧を取得
 */
function getWavFiles(vb: BaseVoiceBank): string[] {
  const wavFiles: string[] = [];

  try {
    // zipまたはfilesからwavファイルを抽出
    const files = vb.zip || vb.files;
    if (files) {
      for (const filename of Object.keys(files)) {
        if (filename.toLowerCase().endsWith(".wav")) {
          wavFiles.push(filename);
        }
      }
    }
  } catch (error) {
    LOG.debug(`wavファイル一覧取得エラー: ${error}`, "VoiceBankDiagnostics");
  }

  return wavFiles;
}
