import { describe, expect, it } from "vitest";
import { UndoManager } from "../../src/lib/UndoManager";

describe("UndoManager", () => {
  it("複数のコマンドを追加しUndoとRedoの動作を確認する", () => {
    const um = new UndoManager();
    let checker: any = 0;
    const set = (value) => {
      checker = value;
    };
    um.register({
      undo: set,
      undoArgs: 2,
      redo: set,
      redoArgs: 1,
      summary: "test1",
    });
    um.register({
      undo: set,
      undoArgs: 1,
      redo: set,
      redoArgs: "a",
      summary: "test2",
    });
    um.register({
      undo: set,
      undoArgs: "a",
      redo: set,
      redoArgs: 0,
      summary: "test3",
    });
    expect(checker).toBe(0);
    expect(um.undoSummary).toBe("test3");
    expect(um.redoSummary).toBe(undefined);
    um.undo();
    expect(checker).toBe("a");
    expect(um.undoSummary).toBe("test2");
    expect(um.redoSummary).toBe("test3");
    um.undo();
    expect(checker).toBe(1);
    expect(um.undoSummary).toBe("test1");
    expect(um.redoSummary).toBe("test2");
    um.undo();
    expect(checker).toBe(2);
    expect(um.undoSummary).toBe(undefined);
    expect(um.redoSummary).toBe("test1");
    um.redo();
    expect(checker).toBe(1);
    expect(um.undoSummary).toBe("test1");
    expect(um.redoSummary).toBe("test2");
    um.redo();
    expect(checker).toBe("a");
    expect(um.undoSummary).toBe("test2");
    expect(um.redoSummary).toBe("test3");
    um.redo();
    expect(checker).toBe(0);
    expect(um.undoSummary).toBe("test3");
    expect(um.redoSummary).toBe(undefined);
  });

  it("undo後に別のコマンドを登録し、redoが空になることを確認する", () => {
    const um = new UndoManager();
    let checker: any = 0;
    const set = (value) => {
      checker = value;
    };
    um.register({
      undo: set,
      undoArgs: 2,
      redo: set,
      redoArgs: 1,
      summary: "test1",
    });
    expect(checker).toBe(0);
    expect(um.undoSummary).toBe("test1");
    expect(um.redoSummary).toBe(undefined);
    um.undo();
    expect(um.undoSummary).toBe(undefined);
    expect(um.redoSummary).toBe("test1");
    um.register({
      undo: set,
      undoArgs: 1,
      redo: set,
      redoArgs: "a",
      summary: "test2",
    });
    expect(um.undoSummary).toBe("test2");
    expect(um.redoSummary).toBe(undefined);
  });
  it("Undoスタックが空になった後にUndoをしてもRedoスタックは変更されない。", () => {
    const um = new UndoManager();
    let checker: any = 0;
    const set = (value) => {
      checker = value;
    };
    um.register({
      undo: set,
      undoArgs: 2,
      redo: set,
      redoArgs: 1,
      summary: "test1",
    });
    um.register({
      undo: set,
      undoArgs: 1,
      redo: set,
      redoArgs: "a",
      summary: "test2",
    });
    um.register({
      undo: set,
      undoArgs: "a",
      redo: set,
      redoArgs: 0,
      summary: "test3",
    });
    expect(checker).toBe(0);
    expect(um.undoSummary).toBe("test3");
    expect(um.redoSummary).toBe(undefined);
    um.undo();
    expect(checker).toBe("a");
    expect(um.undoSummary).toBe("test2");
    expect(um.redoSummary).toBe("test3");
    um.undo();
    expect(checker).toBe(1);
    expect(um.undoSummary).toBe("test1");
    expect(um.redoSummary).toBe("test2");
    um.undo();
    expect(checker).toBe(2);
    expect(um.undoSummary).toBe(undefined);
    expect(um.redoSummary).toBe("test1");
    um.undo();
    expect(checker).toBe(2);
    expect(um.undoSummary).toBe(undefined);
    expect(um.redoSummary).toBe("test1");
    um.undo();
    expect(checker).toBe(2);
    expect(um.undoSummary).toBe(undefined);
    expect(um.redoSummary).toBe("test1");
  });
  it("Redoスタックが空のときRedoをしてもUndoスタックは変更されない。", () => {
    const um = new UndoManager();
    let checker: any = 0;
    const set = (value) => {
      checker = value;
    };
    um.register({
      undo: set,
      undoArgs: 2,
      redo: set,
      redoArgs: 1,
      summary: "test1",
    });
    um.register({
      undo: set,
      undoArgs: 1,
      redo: set,
      redoArgs: "a",
      summary: "test2",
    });
    um.register({
      undo: set,
      undoArgs: "a",
      redo: set,
      redoArgs: 0,
      summary: "test3",
    });
    expect(checker).toBe(0);
    expect(um.undoSummary).toBe("test3");
    expect(um.redoSummary).toBe(undefined);
    um.redo();
    expect(um.undoSummary).toBe("test3");
    expect(um.redoSummary).toBe(undefined);
    um.redo();
    expect(um.undoSummary).toBe("test3");
    expect(um.redoSummary).toBe(undefined);
  });
  it("ジェネリクスが期待した通り動いているか型テスト", () => {
    const um = new UndoManager();
    let checker: any = 0;
    const setString = (value: string) => {
      checker = value;
    };
    const setNumber = (value: number) => {
      checker = value;
    };
    um.register({
      undo: setNumber,
      undoArgs: 2,
      redo: setNumber,
      redoArgs: 1,
      summary: "test1",
    });
    um.register({
      undo: setNumber,
      undoArgs: 1,
      redo: setString,
      redoArgs: "a",
      summary: "test2",
    });
    um.register({
      undo: setString,
      undoArgs: "a",
      redo: setNumber,
      redoArgs: 0,
      summary: "test3",
    });
    expect(checker).toBe(0);
    expect(um.undoSummary).toBe("test3");
    expect(um.redoSummary).toBe(undefined);
    um.undo();
    expect(checker).toBe("a");
    expect(um.undoSummary).toBe("test2");
    expect(um.redoSummary).toBe("test3");
    um.undo();
    expect(checker).toBe(1);
    expect(um.undoSummary).toBe("test1");
    expect(um.redoSummary).toBe("test2");
    um.undo();
    expect(checker).toBe(2);
    expect(um.undoSummary).toBe(undefined);
    expect(um.redoSummary).toBe("test1");
    um.redo();
    expect(checker).toBe(1);
    expect(um.undoSummary).toBe("test1");
    expect(um.redoSummary).toBe("test2");
    um.redo();
    expect(checker).toBe("a");
    expect(um.undoSummary).toBe("test2");
    expect(um.redoSummary).toBe("test3");
    um.redo();
    expect(checker).toBe(0);
    expect(um.undoSummary).toBe("test3");
    expect(um.redoSummary).toBe(undefined);
  });
});
