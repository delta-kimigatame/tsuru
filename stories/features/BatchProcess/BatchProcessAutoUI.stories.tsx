import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Meta, StoryFn } from "@storybook/react";
import { getDesignTokens } from "../../../src/config/theme";
import {
  BatchProcess,
  BatchProcessProps,
} from "../../../src/features/BatchProcess/BatchProcess";
import i18n from "../../../src/i18n/configs";
import { PreprocessingBatchProcess } from "../../../src/lib/BatchProcess/PreprocessingBatchProcess";
import { ResetEditBatchProcess } from "../../../src/lib/BatchProcess/ResetEditBatchProcess";

// i18nの初期化
i18n.changeLanguage("ja");
const theme = createTheme(getDesignTokens("light"));

export default {
  title: "03_3_バッチプロセス/自動UI(実際のバッチプロセス)",
  component: BatchProcess,
  argTypes: {},
} as Meta;

const Template: StoryFn<BatchProcessProps> = (args) => (
  <ThemeProvider theme={theme}>
    <BatchProcess {...args} />
  </ThemeProvider>
);

/**
 * ResetEditBatchProcess の自動生成UIを確認するストーリー
 */
export const ResetEditAutoUI = Template.bind({});
ResetEditAutoUI.args = {
  batchprocess: new ResetEditBatchProcess(),
  selectedNotesIndex: [],
};
ResetEditAutoUI.storyName = "ベタ打ちに戻す";

/**
 * PreprocessingBatchProcess の自動生成UIを確認するストーリー
 */
export const PreprocessingAutoUI = Template.bind({});
PreprocessingAutoUI.args = {
  batchprocess: new PreprocessingBatchProcess(),
  selectedNotesIndex: [],
};
PreprocessingAutoUI.storyName = "おまかせ一括調声";
