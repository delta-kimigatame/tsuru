import { create } from "zustand";
interface SnackBarState {
  /**
   * snackbarの表示を扱う
   */
  open: boolean;
  /**
   * snackbarに表示するテキスト
   */
  value: string;
  /**
   * snackbarの種類。material-uiのAlertのseverityがとる値のいずれかをとる
   */
  severity: "success" | "info" | "warning" | "error";

  /**
   * snackbarの表示を設定する
   * @param open 表示する場合true
   */
  setOpen: (open: boolean) => void;
  /**
   * snackbarに表示する文字列を設定する
   * @param value 表示する文字列
   */
  setValue: (value: string) => void;
  /**
   * snackbarの種類を設定する
   * @param value material-uiのAlertのseverityがとる値のいずれかをとる。"success" | "info" | "warning" | "error"
   */
  setSeverity: (severity: "success" | "info" | "warning" | "error") => void;
}

/**
 * SnackBarStore の Zustand ストア
 */
export const useSnackBarStore = create<SnackBarState>((set) => ({
  open: false,
  value: "",
  severity: "info",

  setOpen: (open) => set({ open }),
  setValue: (value) => set({ value }),
  setSeverity: (severity) => set({ severity }),
}));
