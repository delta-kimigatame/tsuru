import { beforeEach, describe, expect, it } from "vitest";
import { useSnackBarStore } from "../../src/store/snackBarStore";

describe("snackBarStore", () => {
  beforeEach(() => {
    useSnackBarStore.setState({
      open: false,
      value: "",
      severity: "info",
    });
  });
  it("デフォルト値の確認", () => {
    const store = useSnackBarStore.getState();
    expect(store.open).toBeFalsy();
    expect(store.value).toBe("");
    expect(store.severity).toBe("info");
  });

  it("setOpenをtrueにするとopenがtrueになる", () => {
    const { setOpen } = useSnackBarStore.getState();
    setOpen(true);
    const { open } = useSnackBarStore.getState();
    expect(open).toBeTruthy();
  });

  it("setValueで値を設定するとvalueが更新される", () => {
    const { setValue } = useSnackBarStore.getState();
    setValue("test");
    const { value } = useSnackBarStore.getState();
    expect(value).toBe("test");
  });

  it("setSeverityで重要度を設定するとseverityが更新される", () => {
    const { setSeverity } = useSnackBarStore.getState();
    setSeverity("error");
    const { severity } = useSnackBarStore.getState();
    expect(severity).toBe("error");
  });
});
