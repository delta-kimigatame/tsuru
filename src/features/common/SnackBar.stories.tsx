import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { useSnackBarStore } from "../../store/snackBarStore";
import { SnackBar } from "./SnackBar";

export default {
  title: "Common/SnackBar",
  component: SnackBar,
} as Meta<typeof SnackBar>;

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

const Template: StoryFn<typeof SnackBar> = () => <SnackBar />;

export const Closed = Template.bind({});
Closed.play = async () => {
  // Snackbar を閉じた状態にする
  initializeStore(false, "", "info");
};

export const OpenSuccess = Template.bind({});
OpenSuccess.play = async () => {
  // Snackbar を成功状態で開く
  initializeStore(true, "Operation successful!", "success");
};
export const OpenInfo = Template.bind({});
OpenInfo.play = async () => {
  // Snackbar を成功状態で開く
  initializeStore(true, "info", "info");
};

export const OpenError = Template.bind({});
OpenError.play = async () => {
  // Snackbar をエラー状態で開く
  initializeStore(true, "An error occurred.", "error");
};

export const OpenWarn = Template.bind({});
OpenWarn.play = async () => {
  // Snackbar をエラー状態で開く
  initializeStore(true, "An warn", "warning");
};
