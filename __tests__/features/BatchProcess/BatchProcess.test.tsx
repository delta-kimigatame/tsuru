/// <reference types="@testing-library/jest-dom" />
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { getDesignTokens } from "../../../src/config/theme";
import {
  BatchProcess,
  BatchProcessProps,
} from "../../../src/features/BatchProcess/BatchProcess";
import { BaseBatchProcess } from "../../../src/lib/BaseBatchProcess";
import { Note } from "../../../src/lib/Note";
import { useMusicProjectStore } from "../../../src/store/musicProjectStore";
import {
  CheckboxUIProp,
  PaperGroup,
  SelectUIProp,
  SliderUIProp,
  SwitchUIProp,
  TextBoxNumberUIProp,
  TextBoxStringUIProp,
} from "../../../src/types/batchProcess";

// ダミーのBatchProcessFlatを定義
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
    // テスト用に、各ノートの lyric を "updated" + 元の lyric に変更する例とする
    return notes.map((n) => {
      const newNote = n.deepCopy();
      newNote.lyric = "updated " + n.lyric;
      return newNote;
    });
  }
}
class DummyBatchProcessGrouped extends BaseBatchProcess<any> {
  title = "dummy.grouped";
  summary = "Dummy Grouped Batch Process for Nested Option";

  // 初期状態: lyricOptions.mode を "VCV" とする
  initialOptions = {
    lyricOptions: { mode: "VCV" },
  };

  // UI 定義: PaperGroup 内に Select 要素のみ
  ui = [
    {
      titleKey: "dummy.group.lyric",
      items: [
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
  ];

  protected _process(notes: Note[], options?: any): Note[] {
    return notes;
  }
}

// テーマプロバイダーのためのテーマ作成
const theme = createTheme(getDesignTokens("light"));

// BatchProcessコンポーネント用のラッパー
const renderBatchProcess = (props: BatchProcessProps) => {
  return render(
    <ThemeProvider theme={theme}>
      <BatchProcess {...props} />
    </ThemeProvider>
  );
};

describe("BatchProcess", () => {
  it("各UI要素がinitialOptionsの値を正しく反映している", () => {
    const dummyProcess = new DummyBatchProcessFlat();
    const props: BatchProcessProps = {
      batchprocess: dummyProcess,
      selectedNotesIndex: [],
    };
    renderBatchProcess(props);
    // チェックボックス
    const checkbox = screen.getByRole("checkbox", {
      name: /dummy\.checkbox\.label/i,
    });
    expect(checkbox).toBeChecked();

    // スイッチ
    // スイッチは内部的にはcheckboxとしてレンダリングされるので同様に検証
    const switchInput = screen.getAllByRole("checkbox", {
      name: /controlled/i,
    })[0];
    expect(switchInput).not.toBeChecked();

    // セレクトボックス: aria role "combobox"
    const selectBox = screen.getByRole("combobox");
    // 表示されている選択値の検証。dummy.select.optionsの2文字目"u"になる
    expect(selectBox).toHaveTextContent("u");

    // スライダー: role "slider"
    const slider = screen.getByRole("slider", {
      name: /dummy\.slider\.label/i,
    });
    expect(slider).toHaveAttribute("aria-valuenow", "50");

    // テキストボックス (数値)
    const textboxNumber = screen.getByRole("spinbutton", {
      name: /dummy\.textboxNumber\.label/i,
    });
    expect(textboxNumber).toHaveValue(100);

    // テキストボックス (文字列)
    const textboxString = screen.getByRole("textbox", {
      name: /dummy\.textboxString\.label/i,
    });
    expect(textboxString).toHaveValue("initial text");
  });

  it("ネストされたキーの更新が正しく反映される", async () => {
    // DummyBatchProcessGrouped を利用した BatchProcess コンポーネントをレンダリング
    const dummyProcess = new DummyBatchProcessGrouped();
    const user = userEvent.setup();
    const props: BatchProcessProps = {
      batchprocess: dummyProcess,
      selectedNotesIndex: [],
    };
    renderBatchProcess(props);

    const nestedSelect = screen.getByRole("combobox");
    await userEvent.click(nestedSelect);
    const optionCV = await screen.findByRole("option", { name: /d/i });
    await user.click(optionCV);
  });

  it("各DynamicBatchProcessInputコンポーネントに正しい値が渡される", async () => {
    const dummyProcess = new DummyBatchProcessFlat();
    const props: BatchProcessProps = {
      batchprocess: dummyProcess,
      selectedNotesIndex: [],
    };
    renderBatchProcess(props);
    const user = userEvent.setup();

    // 1. チェックボックス: 初期は true → クリックで false に更新
    const checkbox = screen.getByRole("checkbox", {
      name: /dummy\.checkbox\.label/i,
    });
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();

    // 2. スイッチ: 初期は false → クリックで true に更新
    const switchInput = screen.getAllByRole("checkbox", {
      name: /controlled/i,
    })[0];
    await user.click(switchInput);
    expect(switchInput).toBeChecked();

    // 3. セレクトボックス: 初期は "option2" → "option1" に変更
    const selectBox = screen.getByRole("combobox");
    await user.click(selectBox);
    const option1 = await screen.findByRole("option", { name: /d/i });
    await user.click(option1);
    expect(selectBox).toHaveTextContent("d");

    // 4. スライダー: 初期は 50 → 80 に変更
    const slider = screen.getByRole("slider", {
      name: /dummy\.slider\.label/i,
    });
    fireEvent.change(slider, { target: { value: "80" } });
    expect(slider).toHaveAttribute("aria-valuenow", "80");

    // 5. テキストボックス (数値): 初期は 100 → 150 に変更
    const spinbutton = screen.getByRole("spinbutton", {
      name: /dummy\.textboxNumber\.label/i,
    });
    await user.clear(spinbutton);
    await user.type(spinbutton, "150");
    expect(spinbutton).toHaveValue(150);

    // 6. テキストボックス (文字列): 初期は "initial text" → "changed text" に変更
    const textbox = screen.getByRole("textbox", {
      name: /dummy\.textboxString\.label/i,
    });
    await user.clear(textbox);
    await user.type(textbox, "changed text");
    expect(textbox).toHaveValue("changed text");
  });
});

describe("BatchProcess - 実行ボタン押下時の動作", () => {
  let dummyProcess: DummyBatchProcessFlat;
  let props: BatchProcessProps;
  let user: ReturnType<typeof userEvent.setup>;

  // グローバル状態の初期化: ここでは 3 つのダミーノートを用意する
  beforeEach(() => {
    // ダミーノートを作成
    const n0 = new Note();
    n0.index = 0;
    n0.lyric = "a";
    const n1 = new Note();
    n1.index = 1;
    n1.lyric = "b";
    const n2 = new Note();
    n2.index = 2;
    n2.lyric = "c";
    const dummyUst = { notes: [n0, n1, n2] };
    // store の notes を初期化する
    //@ts-expect-error テストのためにわざと異なる型を与えている
    useMusicProjectStore.setState({ ust: dummyUst, notes: [n0, n1, n2] });

    // DummyBatchProcess インスタンスを作成
    dummyProcess = new DummyBatchProcessFlat();
  });

  it("selectedNotesIndexが空配列の場合、全ノートが更新される", async () => {
    // BatchProcess コンポーネントの props を作成
    props = {
      batchprocess: dummyProcess,
      selectedNotesIndex: [], // このテストでは全ノート更新の場合
    };

    renderBatchProcess(props);
    user = userEvent.setup();
    // 実行ボタンを取得してクリック
    const processButton = screen.getByRole("button");
    await user.click(processButton);

    // BatchProcess 側の process が _process を呼び出し、各ノートの lyric が "updated " + 元の lyric に変更されるはず
    const updatedNotes = useMusicProjectStore.getState().notes;
    expect(updatedNotes[0].lyric).toBe("updated a");
    expect(updatedNotes[1].lyric).toBe("updated b");
    expect(updatedNotes[2].lyric).toBe("updated c");
  });

  it("selectedNotesIndexが[1,2]の場合、対象ノートのみが更新される", async () => {
    // props を更新して selectedNotesIndex を [1,2] に
    props = {
      batchprocess: dummyProcess,
      selectedNotesIndex: [1, 2],
    };
    // 再レンダリング
    renderBatchProcess(props);

    // 事前にグローバル状態のノートを取得
    const initialNotes = useMusicProjectStore.getState().notes;
    // 仮に n0 は更新されず、n1, n2 が更新されるとする

    // 実行ボタンをクリック
    const processButton = screen.getByRole("button");
    await user.click(processButton);

    const updatedNotes = useMusicProjectStore.getState().notes;
    // ノート 0 は更新されないはず
    expect(updatedNotes[0].lyric).toBe(initialNotes[0].lyric);
    // ノート 1,2 は更新されるはず
    expect(updatedNotes[1].lyric).toBe("updated " + initialNotes[1].lyric);
    expect(updatedNotes[2].lyric).toBe("updated " + initialNotes[2].lyric);
  });

  it("範囲外のselectedNotesIndexがフィルタリングされる", async () => {
    // 範囲外のインデックス（-1, 10）を含む配列
    props = {
      batchprocess: dummyProcess,
      selectedNotesIndex: [-1, 1, 10, 2],
    };
    renderBatchProcess(props);

    const initialNotes = useMusicProjectStore.getState().notes;
    const processButton = screen.getByRole("button");
    await user.click(processButton);

    const updatedNotes = useMusicProjectStore.getState().notes;
    // ノート 0 は更新されない（範囲外インデックスがフィルタリングされる）
    expect(updatedNotes[0].lyric).toBe(initialNotes[0].lyric);
    // ノート 1,2 のみ更新される
    expect(updatedNotes[1].lyric).toBe("updated " + initialNotes[1].lyric);
    expect(updatedNotes[2].lyric).toBe("updated " + initialNotes[2].lyric);
  });

  it("handleCloseが提供されている場合、実行後に呼び出される", async () => {
    let closeCalled = false;
    const handleClose = () => {
      closeCalled = true;
    };
    props = {
      batchprocess: dummyProcess,
      selectedNotesIndex: [],
      handleClose,
    };
    renderBatchProcess(props);

    const processButton = screen.getByRole("button");
    await user.click(processButton);

    expect(closeCalled).toBe(true);
  });
});

describe("BatchProcess - initializeOptions関数の動作", () => {
  it("initializeOptions関数が提供されている場合、その結果が初期値になる", () => {
    class DummyWithInitializeOptions extends BaseBatchProcess<any> {
      title = "dummy.init";
      summary = "Dummy with initializeOptions";
      initialOptions = {
        count: 0,
      };
      initializeOptions = (notes: Note[]) => {
        return { count: notes.length };
      };
      ui = [
        {
          key: "count",
          labelKey: "dummy.count",
          inputType: "textbox-number",
          min: 0,
          max: 100,
          defaultValue: 0,
        } as TextBoxNumberUIProp,
      ];
      protected _process(notes: Note[], options?: any): Note[] {
        return notes;
      }
    }

    // 3つのノートがある状態でテスト
    const n0 = new Note();
    n0.index = 0;
    n0.lyric = "a";
    const n1 = new Note();
    n1.index = 1;
    n1.lyric = "b";
    const n2 = new Note();
    n2.index = 2;
    n2.lyric = "c";
    //@ts-expect-error テストのためにわざと異なる型を与えている
    useMusicProjectStore.setState({
      ust: { notes: [n0, n1, n2] },
      notes: [n0, n1, n2],
    });

    const dummyProcess = new DummyWithInitializeOptions();
    const props: BatchProcessProps = {
      batchprocess: dummyProcess,
      selectedNotesIndex: [],
    };
    renderBatchProcess(props);

    // initializeOptions が notes.length (3) を返すので、初期値は3になるはず
    const textbox = screen.getByRole("spinbutton", {
      name: /dummy\.count/i,
    });
    expect(textbox).toHaveValue(3);
  });
});
