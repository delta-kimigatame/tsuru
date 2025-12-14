import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { getDesignTokens } from "../../../../src/config/theme";
import {
  FooterBatchProcessMenu,
  FooterBatchProcessMenuProps,
} from "../../../../src/features/EditorView/FooterMenu/FooterBatchProcessMenu";
import i18n from "../../../../src/i18n/configs";
import { BaseBatchProcess } from "../../../../src/lib/BaseBatchProcess";

export default {
  title: "03_1_エディタ下部メニュー/部品/一括処理メニュー",
  component: FooterBatchProcessMenu,
  argTypes: {},
} as Meta;

i18n.changeLanguage("ja");
const lightTheme = createTheme(getDesignTokens("light"));
const darkTheme = createTheme(getDesignTokens("dark"));

// ダミーのバッチプロセスクラス
class DummyBatchProcess extends BaseBatchProcess {
  title = "dummy.process";
  summary = "ダミー処理";
  protected _process(notes: any, options?: any): any {
    return notes;
  }
}
const dummyBatchProcesses = [
  { title: "dummy.process", cls: DummyBatchProcess },
  { title: "dummy.process", cls: DummyBatchProcess },
  { title: "dummy.process", cls: DummyBatchProcess },
];

const Template: StoryFn<FooterBatchProcessMenuProps> = (args) => {
  // アンカー要素用の ref と state
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    if (anchorRef.current) {
      setAnchorEl(anchorRef.current);
    }
  }, []);

  return (
    <div>
      <div
        ref={anchorRef}
        style={{
          display: "inline-block",
          padding: "8px",
          background: "#eee",
          marginBottom: "16px",
        }}
      >
        アンカー要素
      </div>
      <FooterBatchProcessMenu
        {...args}
        anchor={anchorEl}
        handleClose={() => {}}
      />
    </div>
  );
};

export const LightMode = Template.bind({});
LightMode.args = {
  batchProcesses: dummyBatchProcesses,
  process: (index: number) => {
    console.log("Process called with index", index);
  },
};
LightMode.storyName = "ライトモード";
LightMode.decorators = [
  (Story) => (
    <ThemeProvider theme={lightTheme}>
      <Story />
    </ThemeProvider>
  ),
];

export const DarkMode = Template.bind({});
DarkMode.args = {
  batchProcesses: dummyBatchProcesses,
  process: (index: number) => {
    console.log("Process called with index", index);
  },
};
DarkMode.decorators = [
  (Story) => (
    <ThemeProvider theme={darkTheme}>
      <Story />
    </ThemeProvider>
  ),
];
DarkMode.storyName = "ダークモード";
