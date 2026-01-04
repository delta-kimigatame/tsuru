import type { Oto } from "utauoto";
import type OtoRecord from "utauoto/dist/OtoRecord";

/**
 * Otoインスタンスから全てのOtoRecordを取得する
 * @param oto Otoインスタンス
 * @returns 全てのOtoRecordの配列
 */
export function getAllOtoRecords(oto: Oto): OtoRecord[] {
  const allRecords: OtoRecord[] = [];

  // GetLines()でディレクトリパスの一覧を取得
  const lines = oto.GetLines();

  // 各ディレクトリを走査
  for (const dirPath in lines) {
    // ディレクトリ内のファイル名一覧を取得
    const filenames = oto.GetFileNames(dirPath);

    for (const filename of filenames) {
      // ファイル内のエイリアス一覧を取得
      const aliases = oto.GetAliases(dirPath, filename);

      for (const alias of aliases) {
        // 各エイリアスのOtoRecordを取得
        const record = oto.GetRecord(dirPath, filename, alias);
        if (record !== null) {
          allRecords.push(record);
        }
      }
    }
  }

  return allRecords;
}
