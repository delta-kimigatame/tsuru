/**
 * Fileオブジェクトを使い、zipの全体をメモリ空間に展開せずzip内のファイル一覧取得と指定ファイルの取り出しを行う。
 */

import {
  EncodingOption,
  getTextDecoderEncoding,
} from "../utils/EncodingMapping";

/** Zip内のファイル一覧のための型 */
type ZipFile = {
  /** ファイル名 */
  filename: string;
  /** 圧縮後サイズ */
  compressedSize: number;
  /** 解凍後ファイルサイズ */
  uncompressedSize: number;
  /** ローカルファイルヘッダのオフセット。実データ位置はこの値+30+localFilenameLength+localExtraFieldLengthとなる */
  localFileHeaderOffset: number;
  /** 圧縮方式 */
  compressionMethod: number;
  /** ファイル名のutf-8判定、暗号化、Data Descriptor の有無 */
  generalPurposeBitFlag: number;
  /** 展開結果が壊れていないか検証 */
  crc32: number;
  /** ディレクトリであればTrue */
  isDirectory: boolean;
};

export class zipReader {
  /** zipのファイルオブジェクト */
  private _f: File;
  /** zip内にあるファイル一覧 */
  private _files: Map<string, ZipFile>;
  /** zip内にあるファイル数 */
  private _entries: number;
  /** central directory size*/
  private _CDSize: number;
  /** central directory offset */
  private _CDOffset: number;
  /** ファイル名の文字コード。デフォルトではShift-JISを想定 */
  private _encoding: EncodingOption = EncodingOption.SHIFT_JIS;

  /**
   * constructor実行後、最初にInitializeをする運用を想定
   * @param f ファイルオブジェクト
   */
  constructor(f: File) {
    this._f = f;
  }

  async Initialize(encoding: EncodingOption = EncodingOption.SHIFT_JIS) {
    /** ファイル名読込用のエンコードを更新しておく */
    this._encoding = encoding;
    /** まず、Central Directory offset、Central Directory size、total entriesを特定する。 */
    await this.SearchCentralDirectory();
    await this.LoadFileLists(this._encoding);
  }

  /**
   * EOCDを分析し、Central Directory offset、Central Directory size、total entriesを探す。
   */
  private async SearchCentralDirectory() {
    /**
     * まず、ファイルオブジェクトのバイナリから、End of Central Directory Recordを探す。
     * 通常のzipであればEnd of Central Directory Recordは22バイト+コメント長が予定されており、
     * コメントの最大長さを踏まえて、65557バイトをスライスして読み込めば足りる。
     *
     * しかし、二度手間を防ぐ観点では、ZIP64への対応に備えてZIP64EOCDLocator分の20バイトを多めに読み込む
     * */
    const tailBlob = this._f.slice(-65577);
    const tailBuf = await tailBlob.arrayBuffer();
    //** EOCD開始シグネチャ 50 4B 05 06 を探す */
    const EOCDOffset = new Uint8Array(tailBuf).findIndex(
      (_, i, a) =>
        a[i] === 0x50 &&
        a[i + 1] === 0x4b &&
        a[i + 2] === 0x05 &&
        a[i + 3] === 0x06,
    );
    // EOCDoffsetが見つかなければ-1を返しているはずであり、例外的なファイルのためエラーを返す
    if (EOCDOffset === -1) {
      throw new Error("EOCD not found");
    }
    const tailView = new DataView(tailBuf);
    // Total EntriesはEOCDオフセットから10バイト目に2バイトであるはず
    this._entries = tailView.getUint16(EOCDOffset + 10, true);
    // CDSizeはEOCDオフセットから12バイト目に4バイトであるはず
    this._CDSize = tailView.getUint32(EOCDOffset + 12, true);
    // CDOffsetはEOCDオフセットから16バイト目に4バイトであるはず
    this._CDOffset = tailView.getUint32(EOCDOffset + 16, true);
    // Zip64の場合、値が0xFFFFなどになっているはず
    if (
      this._entries === 0xffff ||
      this._CDSize === 0xffffffff ||
      this._CDOffset === 0xffffffff
    ) {
      /** Zip64の場合の処理 */
      await this.SearchCentralDirectoryZIP64(tailBuf, tailView);
    }
  }

  /**
   * ZIP64EOCDLocatorとZIP64EOCDRecordを分析し、Central Directory offset、Central Directory size、total entriesを探す。
   * @param tailBuf zipの末尾65577バイトのArrayBuffer
   * @param tailView tailBufのDataView
   */
  private async SearchCentralDirectoryZIP64(
    tailBuf: ArrayBuffer,
    tailView: DataView,
  ) {
    //** ZIP64EOCD Locator開始シグネチャ 50 4B 06 07 を探す */
    const ZIP64EOCDLOffset = new Uint8Array(tailBuf).findIndex(
      (_, i, a) =>
        a[i] === 0x50 &&
        a[i + 1] === 0x4b &&
        a[i + 2] === 0x06 &&
        a[i + 3] === 0x07,
    );
    // ZIP64EOCDLOffsetが見つかなければ-1を返しているはずであり、例外的なファイルのためエラーを返す
    if (ZIP64EOCDLOffset === -1) {
      throw new Error("ZIP64EOCD Locator not found");
    }
    /**
     * ZIP64EOCDRecordのoffsetを取得する。ZIP64EOCDLocatorの8バイト目から8バイトのはず
     * ブラウザ上のNumberは2^53 - 1までしか扱えず、2^64に比べると扱える範囲が小さいが、
     * zipバイナリ内のオフセットという性質を考えれば、超過することは考え難く特にエラーハンドリング無しで安全に変換可能
     * */
    const ZIP64EOCDROffset = Number(
      tailView.getBigUint64(ZIP64EOCDLOffset + 8, true),
    );

    /** ZIP64EOCDRecordのbufを取得する。ここで関心があるのはTotal entries,Central Directory size,Central Directory offsetのみのため、
     * offsetから56バイト分読みだせば足りる
     */
    const ZIP64EOCDRBuf = await this._f
      .slice(ZIP64EOCDROffset, ZIP64EOCDROffset + 56)
      .arrayBuffer();
    const ZIP64EOCDRView = new DataView(ZIP64EOCDRBuf);
    // Total EntriesはZIP64EOCDROffsetから32バイト目に8バイトであるはず
    this._entries = Number(ZIP64EOCDRView.getBigUint64(32, true));
    // Central Directory sizeはZIP64EOCDROffsetから40バイト目に8バイトであるはず
    this._CDSize = Number(ZIP64EOCDRView.getBigUint64(40, true));
    // Central Directory offsetはZIP64EOCDROffsetから48バイト目に8バイトであるはず
    this._CDOffset = Number(ZIP64EOCDRView.getBigUint64(48, true));
  }

  /**
   * central directory全体を読み込みファイル一覧を得る。
   * このメソッドでは、全体の読込、初期化やファイル毎のループを担当する
   */
  async LoadFileLists(encoding: EncodingOption = EncodingOption.SHIFT_JIS) {
    /** ファイル名読込用のエンコードを更新しておく */
    this._encoding = encoding;
    // CDOffsetやCDSizeが未定義であったり、数値でない場合何かおかしい
    if (isNaN(this._CDOffset)) {
      throw new Error("CDOffset is not initialize");
    }
    if (isNaN(this._CDSize)) {
      throw new Error("CDSize is not initialize");
    }
    if (isNaN(this._entries)) {
      throw new Error("enties is not initialize");
    }
    // CDOffsetやCDSizeが負の数であったり、CDOffset+CDSizeがファイルサイズより大きい場合、何かがおかしい
    if (this._CDOffset < 0) {
      throw new Error(`CDOffset is negative number:${this._CDOffset}`);
    }
    if (this._CDSize < 0) {
      throw new Error(`CDSize is negative number:${this._CDSize}`);
    }
    if (this._CDOffset + this._CDSize > this._f.size) {
      throw new Error(
        `CDOffset+CDSize is over:${this._CDOffset + this._CDSize}`,
      );
    }
    if (this._entries < 0) {
      throw new Error(`entries is negative number:${this._entries}`);
    }

    /** 初期化 */
    this._files = new Map<string, ZipFile>();
    const cdBuf = await this._f
      .slice(this._CDOffset, this._CDOffset + this._CDSize)
      .arrayBuffer();
    const cdView = new DataView(cdBuf);
    let seek = 0;
    const td = new TextDecoder(getTextDecoderEncoding(this._encoding));
    for (let index = 0; index < this._entries; index++) {
      seek = this.LoadCDRecord(td, cdBuf, cdView, seek);
    }
  }

  /**
   * central directoryからファイル毎の値を読み込み、this._filesに新しいレコードを追加する
   * @param td ファイル名をデコードするためのテキストデコーダ、this._encodingでデコードする
   * @param cdBuf central directoryの全buffer
   * @param cdView central directoryのdataview
   * @param seek 読み込みたいファイルのcdView内でのシーク位置
   * @returns 次のファイルのcdView内でのシーク位置
   */
  private LoadCDRecord(
    td: TextDecoder,
    cdBuf: ArrayBuffer,
    cdView: DataView,
    seek: number,
  ): number {
    /** 通常のzipのレコード読み込み */
    const generalPurposeBitFlag = cdView.getUint16(seek + 8, true);
    const compressionMethod = cdView.getUint16(seek + 10, true);
    const crc32 = cdView.getUint32(seek + 16, true);
    let compressedSize = cdView.getUint32(seek + 20, true);
    let uncompressedSize = cdView.getUint32(seek + 24, true);
    const filenameLength = cdView.getUint16(seek + 28, true);
    const extraFieldLength = cdView.getUint16(seek + 30, true);
    const fileCommentLength = cdView.getUint16(seek + 32, true);
    let localFileHeaderOffset = cdView.getUint32(seek + 42, true);
    const filename = td.decode(
      new Uint8Array(cdBuf, seek + 46, filenameLength),
    );
    if ((generalPurposeBitFlag & 0x0001) !== 0) {
      throw new Error(`Encrypted ZIP entries are unsupported: ${filename}`);
    }
    const isDirectory = filename.slice(-1) === "/";
    /** 下記のいずれかの値が0xffffffffの場合、extradatafieldを読み込む必要がある */
    if (
      compressedSize === 0xffffffff ||
      uncompressedSize === 0xffffffff ||
      localFileHeaderOffset === 0xffffffff
    ) {
      const extraFieldOffset = seek + 46 + filenameLength;
      const extraView = new DataView(cdBuf, extraFieldOffset, extraFieldLength);
      let extraSeek = 0;
      while (extraSeek + 4 <= extraView.byteLength) {
        const headerId = extraView.getUint16(extraSeek, true);
        const dataSize = extraView.getUint16(extraSeek + 2, true);
        const dataOffset = extraSeek + 4;

        if (headerId === 0x0001) {
          let zip64Seek = dataOffset;

          if (uncompressedSize === 0xffffffff) {
            uncompressedSize = Number(extraView.getBigUint64(zip64Seek, true));
            zip64Seek += 8;
          }

          if (compressedSize === 0xffffffff) {
            compressedSize = Number(extraView.getBigUint64(zip64Seek, true));
            zip64Seek += 8;
          }

          if (localFileHeaderOffset === 0xffffffff) {
            localFileHeaderOffset = Number(
              extraView.getBigUint64(zip64Seek, true),
            );
          }

          break;
        }

        extraSeek = dataOffset + dataSize;
      }
    }
    this._files.set(filename, {
      filename: filename,
      compressedSize: compressedSize,
      uncompressedSize: uncompressedSize,
      localFileHeaderOffset: localFileHeaderOffset,
      compressionMethod: compressionMethod,
      generalPurposeBitFlag: generalPurposeBitFlag,
      crc32: crc32,
      isDirectory: isDirectory,
    });
    return seek + 46 + filenameLength + extraFieldLength + fileCommentLength;
  }

  /** zip内のファイル名一覧を返す */
  GetFileList(): string[] {
    return [...this._files.keys()];
  }

  /** 指定したファイルがzip内に存在するかを返す */
  HasFile(filename: string): boolean {
    return this._files.has(filename);
  }

  /** 指定したファイルを返す */
  async LoadFile(filename: string): Promise<ArrayBuffer> {
    const targetFile = this._files.get(filename);
    /** 指定したファイルが存在しなければエラーを返す。 */
    if (targetFile === undefined) {
      throw new Error(`${filename} is not found`);
    }
    /**
     * まずデータ位置を特定するために、LocalFileHeaderを読み込む
     * データ開始位置は、LocalFileHeaderOffset + 30(ファイルヘッダの固定長分) +localFilenameLength+localExtraFieldLengthで求められる
     * */
    const headerBuf = await this._f
      .slice(
        targetFile.localFileHeaderOffset,
        targetFile.localFileHeaderOffset + 30,
      )
      .arrayBuffer();
    const headerView = new DataView(headerBuf);
    if (headerView.getUint32(0, true) !== 0x04034b50) {
      throw new Error(`signature error :${filename}`);
    }
    const localFilenameLength = headerView.getUint16(26, true);
    const localExtraFieldLength = headerView.getUint16(28, true);
    const dataOffset =
      targetFile.localFileHeaderOffset +
      30 +
      localFilenameLength +
      localExtraFieldLength;
    /** 非圧縮の場合早期return */
    if (targetFile.compressionMethod === 0) {
      /** データを読み出す。 */
      const compressedData = await this._f
        .slice(dataOffset, dataOffset + targetFile.compressedSize)
        .arrayBuffer();
      return compressedData;
    } else if (targetFile.compressionMethod === 8) {
      /** deflate
       * 概ねdeflateに対応できていれば実運用上は十分なはず
       */
      const ds = this._f
        .slice(dataOffset, dataOffset + targetFile.compressedSize)
        .stream()
        .pipeThrough(new DecompressionStream("deflate-raw"));
      const uncompressedData = await new Response(ds).arrayBuffer();
      /** 検証 */
      if (uncompressedData.byteLength !== targetFile.uncompressedSize) {
        throw new Error(`extract failed`);
      }
      return uncompressedData;
    } else {
      throw new Error(
        `Unsupported compression method:${targetFile.compressionMethod}`,
      );
    }
  }
}
