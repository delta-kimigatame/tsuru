import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import i18n from "../../i18n/configs";
import { ThemeMenu, ThemeMenuProps } from "./ThemeMenu";

export default {
  title: "01_ヘッダ/ヘッダ部品/テーマメニュー",
  component: ThemeMenu,
  argTypes: {},
} as Meta;

i18n.changeLanguage("ja");
// ダミーアンカー要素を作成し、ref を使って取得する方法
const Template: StoryFn<ThemeMenuProps> = (args) => {
  // useRef でアンカー用の div を参照する
  const anchorRef = React.useRef<HTMLDivElement>(null);
  // アンカーエレメントを state で管理
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  // コンポーネントのマウント時に、anchorRef.current を state に設定する
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
      <ThemeMenu {...args} anchor={anchorEl} />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  onMenuClose: () => {
    console.log("Menu closed");
  },
};
Default.storyName = "ThemeMenu のデフォルト表示";
