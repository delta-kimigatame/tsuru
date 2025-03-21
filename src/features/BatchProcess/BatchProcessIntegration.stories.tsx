// src/features/BatchProcess/BatchProcessIntegration.stories.tsx

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Meta, StoryFn } from "@storybook/react";
import { fireEvent, userEvent, within } from "@storybook/testing-library";
import React from "react";
import { getDesignTokens } from "../../config/theme";
import i18n from "../../i18n/configs";
import { BaseBatchProcess } from "../../lib/BaseBatchProcess";
import { Note } from "../../lib/Note";
import {
  CheckboxUIProp,
  PaperGroup,
  SelectUIProp,
  SliderUIProp,
  SwitchUIProp,
  TextBoxNumberUIProp,
  TextBoxStringUIProp,
} from "../../types/batchProcess";
import { BatchProcess, BatchProcessProps } from "./BatchProcess";

// i18n の初期化
i18n.changeLanguage("ja");
const theme = createTheme(getDesignTokens("light"));

/**
 * DummyBatchProcessFlat
 * ・UI 定義はフラット（PaperGroup を使用しない）ケース
 * ・6種類の UI 要素をそれぞれ定義する
 */
class DummyBatchProcessFlat extends BaseBatchProcess<any> {
  title = "dummy.flat";
  summary = "Dummy Flat Batch Process";
  initialOptions = {
    checkboxOption: true,
    switchOption: false,
    selectOption: "option2",
    sliderOption: 50,
    textboxNumberOption: 100,
    textboxStringOption: "initial text",
  };
  ui = [
    {
      key: "checkboxOption",
      labelKey: "dummy.checkbox.label",
      inputType: "checkbox",
      defaultValue: true,
    } as CheckboxUIProp,
    {
      key: "switchOption",
      labelKey: "dummy.switch.label",
      inputType: "switch",
      defaultValue: false,
    } as SwitchUIProp,
    {
      key: "selectOption",
      labelKey: "dummy.select.label",
      inputType: "select",
      options: ["option1", "option2", "option3"],
      displayOptionKey: "dummy.select.options",
      defaultValue: "option2",
    } as SelectUIProp,
    {
      key: "sliderOption",
      labelKey: "dummy.slider.label",
      inputType: "slider",
      min: 0,
      max: 100,
      step: 1,
      defaultValue: 50,
    } as SliderUIProp,
    {
      key: "textboxNumberOption",
      labelKey: "dummy.textboxNumber.label",
      inputType: "textbox-number",
      min: 0,
      max: 200,
      defaultValue: 100,
    } as TextBoxNumberUIProp,
    {
      key: "textboxStringOption",
      labelKey: "dummy.textboxString.label",
      inputType: "textbox-string",
      defaultValue: "initial text",
    } as TextBoxStringUIProp,
  ];
  protected _process(notes: Note[], options?: any): Note[] {
    return notes;
  }
}

/**
 * DummyBatchProcessGrouped
 * ・UI 定義は PaperGroup を含むグループ化ケース
 */
class DummyBatchProcessGrouped extends BaseBatchProcess<any> {
  title = "dummy.grouped";
  summary = "Dummy Grouped Batch Process";
  initialOptions = {
    // フラットに統一したキーにする
    checkboxOption: true,
    switchOption: false,
    selectOption: "option2",
    sliderOption: 50,
    textboxNumberOption: 100,
    textboxStringOption: "initial text",
    // ネストされたキー例
    lyricOptions: { mode: "VCV" },
  };
  ui = [
    {
      titleKey: "dummy.group.lyric",
      items: [
        {
          key: "checkboxOption",
          labelKey: "dummy.checkbox.label",
          inputType: "checkbox",
          defaultValue: true,
        } as CheckboxUIProp,
        {
          key: "switchOption",
          labelKey: "dummy.switch.label",
          inputType: "switch",
          defaultValue: false,
        } as SwitchUIProp,
        {
          key: "lyricOptions.mode",
          labelKey: "dummy.nested.mode",
          inputType: "select",
          options: ["CV", "VCV"],
          displayOptionKey: "dummy.nested.modeOptions",
          defaultValue: "VCV",
        } as SelectUIProp,
      ],
    } as PaperGroup,
    {
      titleKey: "dummy.group.others",
      items: [
        {
          key: "selectOption",
          labelKey: "dummy.select.label",
          inputType: "select",
          options: ["option1", "option2", "option3"],
          displayOptionKey: "dummy.select.options",
          defaultValue: "option2",
        },
        {
          key: "sliderOption",
          labelKey: "dummy.slider.label",
          inputType: "slider",
          min: 0,
          max: 100,
          step: 1,
          defaultValue: 50,
        },
        {
          key: "textboxNumberOption",
          labelKey: "dummy.textboxNumber.label",
          inputType: "textbox-number",
          min: 0,
          max: 200,
          defaultValue: 100,
        },
        {
          key: "textboxStringOption",
          labelKey: "dummy.textboxString.label",
          inputType: "textbox-string",
          defaultValue: "initial text",
        },
      ],
    } as PaperGroup,
  ];
  protected _process(notes: Note[], options?: any): Note[] {
    return notes;
  }
}

export default {
  title: "03_3_バッチプロセス/自動UI(動作確認用)",
  component: BatchProcess,
  argTypes: {},
} as Meta;

const Template: StoryFn<BatchProcessProps> = (args) => (
  <ThemeProvider theme={theme}>
    <BatchProcess {...args} />
  </ThemeProvider>
);

/** Flat UI - Desktop */
export const FlatDesktop = Template.bind({});
FlatDesktop.args = {
  batchprocess: new DummyBatchProcessFlat(),
  selectedNotesIndex: [],
};
FlatDesktop.storyName = "フラット配置";
/** Flat UI - Mobile */
export const FlatMobile = Template.bind({});
FlatMobile.args = {
  batchprocess: new DummyBatchProcessFlat(),
  selectedNotesIndex: [],
};
FlatMobile.decorators = [
  (Story) => (
    <div style={{ width: "360px" }}>
      <Story />
    </div>
  ),
];
FlatMobile.storyName = "フラット配置(小さな画面)";

/** Grouped UI - Desktop */
export const GroupedDesktop = Template.bind({});
GroupedDesktop.args = {
  batchprocess: new DummyBatchProcessGrouped(),
  selectedNotesIndex: [],
};
GroupedDesktop.storyName = "グループにまとめて配置";

/** Grouped UI - Mobile */
export const GroupedMobile = Template.bind({});
GroupedMobile.args = {
  batchprocess: new DummyBatchProcessGrouped(),
  selectedNotesIndex: [],
};
GroupedMobile.decorators = [
  (Story) => (
    <div style={{ width: "360px" }}>
      <Story />
    </div>
  ),
];
GroupedMobile.storyName = "グループにまとめて配置(小さい画面)";

/** インタラクション検証 - 各子コンポーネント更新 */
export const InteractivityChildComponents = Template.bind({});
InteractivityChildComponents.args = {
  batchprocess: new DummyBatchProcessFlat(),
  selectedNotesIndex: [],
};
InteractivityChildComponents.storyName = "パラメータ変更テスト(フラット)";
InteractivityChildComponents.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  // チェックボックス：dummy.checkbox.label を持つ要素をクリックしてチェック状態を反転
  const checkbox = canvas.getByRole("checkbox", {
    name: /dummy\.checkbox\.label/i,
  });
  await userEvent.click(checkbox);

  // スイッチ：dummy.switch.label を持つ要素をクリックして状態を切り替え
  const labelEl = canvas.getByText(/dummy\.switch\.label/i);
  const switchInput = labelEl
    .closest("label")
    ?.querySelector("input[type='checkbox']");
  await userEvent.click(switchInput);

  // テキストボックス(数値)：dummy.textboxNumber.label を持つスピンボタンの値を "150" に変更
  const textboxNumber = canvas.getByRole("spinbutton", {
    name: /dummy\.textboxNumber\.label/i,
  });
  await userEvent.clear(textboxNumber);
  await userEvent.type(textboxNumber, "150");

  // テキストボックス(文字列)：dummy.textboxString.label を持つテキストボックスの値を "changed text" に変更
  const textboxString = canvas.getByRole("textbox", {
    name: /dummy\.textboxString\.label/i,
  });
  await userEvent.clear(textboxString);
  await userEvent.type(textboxString, "changed text");

  // セレクトボックス：dummy.select.label を持つコンボボックスから "option1" を選択
  const selectBox = canvas.getByRole("combobox");
  await userEvent.click(selectBox);
  const optionElement = await within(document.body).findByRole("option", {
    name: /d/i,
  });
  await userEvent.click(optionElement);

  // スライダー：dummy.slider.label を持つスライダーの値を "80" に変更
  const slider = canvas.getByRole("slider", { name: /dummy\.slider\.label/i });
  fireEvent.change(slider, { target: { value: "80" } });
};

/** インタラクション検証 - ネストされたオプション */
export const InteractivityNestedOption = Template.bind({});
InteractivityNestedOption.storyName = "パラメータ変更テスト(グループ)";
InteractivityNestedOption.args = {
  batchprocess: new DummyBatchProcessGrouped(),
  // 例として、特定のノートを選択して更新対象にするシナリオ
  selectedNotesIndex: [0, 1, 2],
};
// ※ Controls を用いて "lyricOptions.mode" などネストされた項目の更新を検証

InteractivityNestedOption.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  // チェックボックス：dummy.checkbox.label を持つ要素をクリックしてチェック状態を反転
  const checkbox = canvas.getByRole("checkbox", {
    name: /dummy\.checkbox\.label/i,
  });
  await userEvent.click(checkbox);

  // スイッチ：dummy.switch.label を持つ要素をクリックして状態を切り替え
  const labelEl = canvas.getByText(/dummy\.switch\.label/i);
  const switchInput = labelEl
    .closest("label")
    ?.querySelector("input[type='checkbox']");
  await userEvent.click(switchInput);

  // テキストボックス(数値)：dummy.textboxNumber.label を持つスピンボタンの値を "150" に変更
  const textboxNumber = canvas.getByRole("spinbutton", {
    name: /dummy\.textboxNumber\.label/i,
  });
  await userEvent.clear(textboxNumber);
  await userEvent.type(textboxNumber, "150");

  // テキストボックス(文字列)：dummy.textboxString.label を持つテキストボックスの値を "changed text" に変更
  const textboxString = canvas.getByRole("textbox", {
    name: /dummy\.textboxString\.label/i,
  });
  await userEvent.clear(textboxString);
  await userEvent.type(textboxString, "changed text");

  // スライダー：dummy.slider.label を持つスライダーの値を "80" に変更
  const slider = canvas.getByRole("slider", { name: /dummy\.slider\.label/i });
  fireEvent.change(slider, { target: { value: "80" } });

  // "dummy.group.lyric" というタイトルを持つPaperGroupのタイトル要素を取得
  const groupTitle = await canvas.findByText(/dummy\.group\.lyric/i);
  // タイトル要素の親要素がPaperGroup全体のコンテナとなっている前提で、その中から対象のセレクトボックスを取得する
  const groupContainer = groupTitle.parentElement;
  if (!groupContainer) {
    throw new Error("PaperGroup container not found");
  }
  // PaperGroup 内から、"dummy.nested.mode" のラベルが付いたセレクトボックスを絞り込む
  const selectBox = within(groupContainer).getByRole("combobox");
  // セレクトボックスをクリックしてドロップダウンを開く
  await userEvent.click(selectBox);
  // document.body からオプションの1つを取得してクリックする
  const optionElement = await within(document.body).findByRole("option", {
    name: /d/i,
  });
  await userEvent.click(optionElement);
};
