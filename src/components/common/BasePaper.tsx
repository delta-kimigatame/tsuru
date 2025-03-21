import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { SxProps, Theme } from "@mui/system";
import * as React from "react";

/**
 * BasePaperコンポーネントに渡すプロパティの型定義。
 * 各プロパティはBasePaperコンポーネントの外観や動作を制御します。
 */
export interface BasePaperProps {
  /**
   * 見出し部分のテキスト。
   * Paper内でタイトルとして表示されます。
   */
  title: string;
  /**
   * 本文部分のコンテンツ。
   * 任意のReactノードを指定できます。
   */
  children: React.ReactNode;
  /**
   * Paperコンポーネントの陰影（elevation）を指定します。
   * デフォルトは2です。
   */
  elevation?: number;
  /**
   * Paperコンポーネントに適用する追加のスタイル。
   * `sx`プロパティを通じて、スタイルを柔軟に変更できます。
   */
  sx?: SxProps<Theme>;
}
/**
 * BasePaperは、基本的なPaperコンポーネントをラップし、タイトルと内容を表示するためのコンポーネントです。
 * - デフォルトで`elevation`は2に設定されており、カスタマイズが可能です。
 * - `sx`を使用してスタイルを追加できます。
 * - `title`と`children`を受け取り、`children`はPaperの中身として表示されます。
 *
 * @param {string} title - Paperのタイトルを指定します。
 * @param {React.ReactNode} children - Paperの中身として表示される内容を指定します。
 * @param {number} [elevation=2] - Paperのelevation（影）の強さを指定します。デフォルトは2です。
 * @param {SxProps<Theme>} [sx={}] - Paperの追加スタイルを指定するためのsxプロパティです。
 *
 * @returns {React.Element} - ラップされたPaperコンポーネント。
 */
export const BasePaper: React.FC<BasePaperProps> = ({
  title,
  children,
  elevation = 2,
  sx = {},
}) => {
  return (
    <Paper elevation={elevation} sx={{ m: 1, p: 2, ...sx }}>
      <Typography variant="h6">{title}</Typography>
      <Divider sx={{ my: 1 }} />
      {children}
    </Paper>
  );
};
