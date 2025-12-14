import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import {
  LanguageMenu,
  LanguageMenuProps,
} from "../../../src/features/Header/LanguageMenu";
import i18n from "../../../src/i18n/configs";

export default {
  title: "01_ヘッダ/ヘッダ部品/言語メニュー",
  component: LanguageMenu,
  argTypes: {},
} as Meta;

i18n.changeLanguage("ja");
// ダミーアンカー要素を作成し、ref を使って取得する方法
const Template: StoryFn<LanguageMenuProps> = (args) => {
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
      <LanguageMenu {...args} anchor={anchorEl} />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  onMenuClose: () => {
    console.log("Menu closed");
  },
};
Default.storyName = "LanguageMenu のデフォルト表示";
