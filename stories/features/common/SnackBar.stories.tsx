import { Meta, StoryObj } from "@storybook/react";
import { SnackBar } from "../../../src/features/common/SnackBar";
import { useSnackBarStore } from "../../../src/store/snackBarStore";

const meta: Meta<typeof SnackBar> = {
  title: "features/common/SnackBar",
  component: SnackBar,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// 状態を初期化するためのヘルパー関数
const initializeStore = (
  open: boolean,
  value: string,
  severity: "success" | "info" | "warning" | "error"
) => {
  const store = useSnackBarStore.getState();
  store.setOpen(open);
  store.setValue(value);
  store.setSeverity(severity);
};

export const Closed: Story = {
  render: () => <SnackBar />,
  play: async () => {
    initializeStore(false, "", "info");
  },
};

export const OpenSuccess: Story = {
  render: () => <SnackBar />,
  play: async () => {
    initializeStore(true, "Operation successful!", "success");
  },
};

export const OpenInfo: Story = {
  render: () => <SnackBar />,
  play: async () => {
    initializeStore(true, "info", "info");
  },
};

export const OpenError: Story = {
  render: () => <SnackBar />,
  play: async () => {
    initializeStore(true, "An error occurred.", "error");
  },
};

// export const OpenWarn = Template.bind({});
// OpenWarn.play = async () => {
//   // Snackbar をエラー状態で開く
//   initializeStore(true, "An warn", "warning");
// };

// OpenWarn.storyName = "警告";
