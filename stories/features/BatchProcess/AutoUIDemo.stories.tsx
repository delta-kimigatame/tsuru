import { Meta, StoryObj } from "@storybook/react";
import { BatchProcess } from "../../../src/features/BatchProcess/BatchProcess";
import { BaseBatchProcess } from "../../../src/lib/BaseBatchProcess";
import { Note } from "../../../src/lib/Note";
import {
  CheckboxUIProp,
  PaperGroup,
  SelectUIProp,
  SliderUIProp,
  SwitchUIProp,
  TextBoxNumberUIProp,
  TextBoxStringUIProp,
} from "../../../src/types/batchProcess";

/**
 * 自動UI生成機能のデモンストレーション用ダミーバッチプロセス（フラット構造）
 */
class DemoFlatUIBatchProcess extends BaseBatchProcess<any> {
  title = "demo.flatUI.title";
  summary = "Flat UI Demo";
  initialOptions = {
    checkboxOption: true,
    switchOption: false,
    selectOption: "option2",
    sliderOption: 50,
    textboxNumberOption: 100,
    textboxStringOption: "sample text",
  };
  ui = [
    {
      key: "checkboxOption",
      labelKey: "demo.checkbox.label",
      inputType: "checkbox",
      defaultValue: true,
    } as CheckboxUIProp,
    {
      key: "switchOption",
      labelKey: "demo.switch.label",
      inputType: "switch",
      defaultValue: false,
    } as SwitchUIProp,
    {
      key: "selectOption",
      labelKey: "demo.select.label",
      inputType: "select",
      options: ["option1", "option2", "option3"],
      displayOptionKey: "demo.select.options",
      defaultValue: "option2",
    } as SelectUIProp,
    {
      key: "sliderOption",
      labelKey: "demo.slider.label",
      inputType: "slider",
      min: 0,
      max: 100,
      step: 1,
      defaultValue: 50,
    } as SliderUIProp,
    {
      key: "textboxNumberOption",
      labelKey: "demo.textboxNumber.label",
      inputType: "textbox-number",
      min: 0,
      max: 200,
      defaultValue: 100,
    } as TextBoxNumberUIProp,
    {
      key: "textboxStringOption",
      labelKey: "demo.textboxString.label",
      inputType: "textbox-string",
      defaultValue: "sample text",
    } as TextBoxStringUIProp,
  ];
  protected _process(notes: Note[], options?: any): Note[] {
    return notes;
  }
}

/**
 * 自動UI生成機能のデモンストレーション用ダミーバッチプロセス（グループ構造）
 */
class DemoGroupedUIBatchProcess extends BaseBatchProcess<any> {
  title = "demo.groupedUI.title";
  summary = "Grouped UI Demo";
  initialOptions = {
    checkboxOption: true,
    switchOption: false,
    nestedOption: { mode: "VCV" },
    selectOption: "option2",
    sliderOption: 50,
    textboxNumberOption: 100,
    textboxStringOption: "sample text",
  };
  ui = [
    {
      titleKey: "demo.group.basic",
      items: [
        {
          key: "checkboxOption",
          labelKey: "demo.checkbox.label",
          inputType: "checkbox",
          defaultValue: true,
        } as CheckboxUIProp,
        {
          key: "switchOption",
          labelKey: "demo.switch.label",
          inputType: "switch",
          defaultValue: false,
        } as SwitchUIProp,
        {
          key: "nestedOption.mode",
          labelKey: "demo.nested.mode",
          inputType: "select",
          options: ["CV", "VCV"],
          displayOptionKey: "demo.nested.modeOptions",
          defaultValue: "VCV",
        } as SelectUIProp,
      ],
    } as PaperGroup,
    {
      titleKey: "demo.group.advanced",
      items: [
        {
          key: "selectOption",
          labelKey: "demo.select.label",
          inputType: "select",
          options: ["option1", "option2", "option3"],
          displayOptionKey: "demo.select.options",
          defaultValue: "option2",
        } as SelectUIProp,
        {
          key: "sliderOption",
          labelKey: "demo.slider.label",
          inputType: "slider",
          min: 0,
          max: 100,
          step: 1,
          defaultValue: 50,
        } as SliderUIProp,
        {
          key: "textboxNumberOption",
          labelKey: "demo.textboxNumber.label",
          inputType: "textbox-number",
          min: 0,
          max: 200,
          defaultValue: 100,
        } as TextBoxNumberUIProp,
        {
          key: "textboxStringOption",
          labelKey: "demo.textboxString.label",
          inputType: "textbox-string",
          defaultValue: "sample text",
        } as TextBoxStringUIProp,
      ],
    } as PaperGroup,
  ];
  protected _process(notes: Note[], options?: any): Note[] {
    return notes;
  }
}

const meta: Meta<typeof BatchProcess> = {
  title: "features/BatchProcess/AutoUIDemo",
  component: BatchProcess,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const FlatUI: Story = {
  args: {
    batchprocess: new DemoFlatUIBatchProcess(),
    selectedNotesIndex: [],
  },
};

export const GroupedUI: Story = {
  args: {
    batchprocess: new DemoGroupedUIBatchProcess(),
    selectedNotesIndex: [],
  },
};
