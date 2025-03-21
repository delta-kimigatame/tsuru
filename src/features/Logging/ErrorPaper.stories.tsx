import { Button } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Meta, StoryFn } from "@storybook/react";
import { userEvent, within } from "@storybook/testing-library";
import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { getDesignTokens } from "../../config/theme";
import i18n from "../../i18n/configs";
import { LOG } from "../../lib/Logging";
import { ErrorPaper } from "./ErrorPaper";

i18n.changeLanguage("ja");
const lightTheme = createTheme(getDesignTokens("light"));

export default {
  title: "80_ログ/エラー画面",
  component: ErrorPaper,
  argTypes: {},
} as Meta;
/**
 * 内部状態に基づいてレンダリング時にエラーを投げるコンポーネント
 */
const ErrorTrigger: React.FC = () => {
  const [shouldThrow, setShouldThrow] = React.useState(false);
  if (shouldThrow) {
    // エラー発生：レンダリング時に投げる
    const error = new Error("テストエラー");
    error.stack = "Error: テストエラー\n    at ErrorTrigger (test file)";
    throw error;
  }
  return <Button onClick={() => setShouldThrow(true)}>エラー発生</Button>;
};

const ErrorScenario: StoryFn = () => {
  // シンプルなエラーオブジェクトを作成
  const testError = new Error("テストエラー");
  testError.stack = "Error: テストエラー\n    at TestComponent (test file)";
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <ErrorPaper error={error} resetErrorBoundary={resetErrorBoundary} />
      )}
    >
      <ErrorTrigger />
    </ErrorBoundary>
  );
};

export const WithError = ErrorScenario.bind({});
WithError.args = {};
WithError.decorators = [
  (Story) => (
    <ThemeProvider theme={lightTheme}>
      <Story />
    </ThemeProvider>
  ),
];
WithError.storyName = "エラーが生じると自動で表示される";
/**
 * シナリオ2: ユーザー操作シミュレーション
 * ダウンロードボタンをクリックすることで、ErrorPaperに組み込まれたログダウンロード処理が発火することを確認する。
 * ※本来のファイルダウンロードはブラウザ依存のため、ここではクリックアクションの発火をシミュレートする。
 */
const DownloadScenario: StoryFn = () => {
  const testError = new Error("テストエラー");
  testError.stack = "Error: テストエラー\n    at TestComponent (test file)";
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <ErrorPaper error={error} resetErrorBoundary={resetErrorBoundary} />
      )}
    >
      <ErrorTrigger />
    </ErrorBoundary>
  );
};

export const DownloadAction = DownloadScenario.bind({});
DownloadAction.args = {};
DownloadAction.decorators = [
  (Story) => {
    // ダウンロード処理で確認するため、LOGにサンプルログを登録
    LOG.clear();
    LOG.debug("ログテスト", "storybook");
    LOG.info("ログテスト", "storybook");
    LOG.warn("ログテスト", "storybook");
    LOG.error("ログテスト", "storybook");
    return (
      <ThemeProvider theme={lightTheme}>
        <Story />
      </ThemeProvider>
    );
  },
];

DownloadAction.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  // テストUI専用のエラー発生ボタン
  const errorButton = await canvas.getByRole("button", {
    name: /エラー発生/i,
  });
  // ボタンのクリックアクションをシミュレート
  await userEvent.click(errorButton);
  // ダウンロードボタンを取得（ラベルはi18nで"error.download"が適用されている前提）
  const downloadButton = await canvas.findByRole("button", {
    name: /ログをダウンロード/i,
  });
  // ボタンのクリックアクションをシミュレート
  await userEvent.click(downloadButton);
};
DownloadAction.storyName = "ボタンをクリックしてログをダウンロード";
