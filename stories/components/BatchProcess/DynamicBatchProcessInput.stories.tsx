import type { Meta, StoryObj } from "@storybook/react";
import { DynamicBatchProcessInput } from "../../../src/components/BatchProcess/DynamicBatchProcessInput";
import type {
  CheckboxUIProp,
  SelectUIProp,
  SliderUIProp,
  SwitchUIProp,
  TextBoxNumberUIProp,
  TextBoxStringUIProp,
} from "../../../src/types/batchProcess";

const meta = {
  title: "components/BatchProcess/DynamicBatchProcessInput",
  component: DynamicBatchProcessInput,
  tags: ["autodocs"],
} satisfies Meta<typeof DynamicBatchProcessInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CheckBox: Story = {
  args: {
    config: {
      key: "testCheckbox",
      labelKey: "batchprocess.example.checkbox",
      inputType: "checkbox",
      defaultValue: true,
    } as CheckboxUIProp,
    value: true,
    onChange: (key: string, value: boolean | string | number) =>
      console.log(`Changed ${key}: ${value}`),
  },
};

export const Switch: Story = {
  args: {
    config: {
      key: "testSwitch",
      labelKey: "batchprocess.example.switch",
      inputType: "switch",
      defaultValue: false,
    } as SwitchUIProp,
    value: false,
    onChange: (key: string, value: boolean | string | number) =>
      console.log(`Changed ${key}: ${value}`),
  },
};

export const Select: Story = {
  args: {
    config: {
      key: "testSelect",
      labelKey: "batchprocess.example.select",
      inputType: "select",
      options: ["option1", "option2", "option3"],
      displayOptionKey: "batchprocess.example.select.options",
      defaultValue: "option2",
    } as SelectUIProp,
    value: "option2",
    onChange: (key: string, value: boolean | string | number) =>
      console.log(`Changed ${key}: ${value}`),
  },
};

export const TextBoxNumber: Story = {
  args: {
    config: {
      key: "testTextBoxNumber",
      labelKey: "batchprocess.example.textboxNumber",
      inputType: "textbox-number",
      min: 0,
      max: 200,
      defaultValue: 100,
    } as TextBoxNumberUIProp,
    value: 100,
    onChange: (key: string, value: boolean | string | number) =>
      console.log(`Changed ${key}: ${value}`),
  },
};

export const TextBoxString: Story = {
  args: {
    config: {
      key: "testTextBoxString",
      labelKey: "batchprocess.example.textboxString",
      inputType: "textbox-string",
      defaultValue: "initial text",
    } as TextBoxStringUIProp,
    value: "initial text",
    onChange: (key: string, value: boolean | string | number) =>
      console.log(`Changed ${key}: ${value}`),
  },
};

export const Slider: Story = {
  args: {
    config: {
      key: "testSlider",
      labelKey: "batchprocess.example.slider",
      inputType: "slider",
      min: 0,
      max: 100,
      step: 5,
      defaultValue: 50,
    } as SliderUIProp,
    value: 50,
    onChange: (key: string, value: boolean | string | number) =>
      console.log(`Changed ${key}: ${value}`),
  },
};
