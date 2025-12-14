import { Meta, StoryObj } from "@storybook/react";
// TODO: Migrate to @storybook/test when implementing interactions
// import { fireEvent, userEvent, within } from "@storybook/test";
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

class DummyBatchProcessGrouped extends BaseBatchProcess<any> {
  title = "dummy.grouped";
  summary = "Dummy Grouped Batch Process";
  initialOptions = {
    checkboxOption: true,
    switchOption: false,
    selectOption: "option2",
    sliderOption: 50,
    textboxNumberOption: 100,
    textboxStringOption: "initial text",
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
      ],
    } as PaperGroup,
  ];
  protected _process(notes: Note[], options?: any): Note[] {
    return notes;
  }
}

const meta: Meta<typeof BatchProcess> = {
  title: "features/BatchProcess/BatchProcessIntegration",
  component: BatchProcess,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const FlatUI: Story = {
  args: {
    batchprocess: new DummyBatchProcessFlat(),
    selectedNotesIndex: [],
  },
};

export const GroupedUI: Story = {
  args: {
    batchprocess: new DummyBatchProcessGrouped(),
    selectedNotesIndex: [],
  },
};
