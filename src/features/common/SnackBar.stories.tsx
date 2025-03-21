import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { useSnackBarStore } from "../../store/snackBarStore";
import { SnackBar } from "./SnackBar";

export default {
  title: "50_共通部品/スナックバー",
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
Closed.storyName = "閉じた状態";

export const OpenSuccess = Template.bind({});
OpenSuccess.play = async () => {
  // Snackbar を成功状態で開く
  initializeStore(true, "Operation successful!", "success");
};
OpenSuccess.storyName = "処理成功";
export const OpenInfo = Template.bind({});
OpenInfo.play = async () => {
  // Snackbar を成功状態で開く
  initializeStore(true, "info", "info");
};
OpenInfo.storyName = "情報";

export const OpenError = Template.bind({});
OpenError.play = async () => {
  // Snackbar をエラー状態で開く
  initializeStore(true, "An error occurred.", "error");
};
OpenError.storyName = "エラー";

export const OpenWarn = Template.bind({});
OpenWarn.play = async () => {
  // Snackbar をエラー状態で開く
  initializeStore(true, "An warn", "warning");
};

OpenWarn.storyName = "警告";
