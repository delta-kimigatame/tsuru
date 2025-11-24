/// <reference types="vite/client" />
import { BaseBatchProcess } from "../lib/BaseBatchProcess";

const modules = import.meta.glob("../lib/BatchProcess/*.ts");

// 各モジュールを読み込み、エクスポートされたクラス一覧を取得する関数の例
export async function loadBatchProcessClasses(): Promise<
  Array<{ title: string; cls: new () => BaseBatchProcess }>
> {
  const classes: Array<{ title: string; cls: any; summary: string }> = [];
  for (const path in modules) {
    const module = await modules[path]();
    // ここではモジュールが複数のエクスポートを持つ可能性を考慮
    for (const exportKey in module as Record<string, any>) {
      const exported = module[exportKey];
      // BaseBatchProcessのサブクラスであるかどうかをチェックする
      if (
        typeof exported === "function" &&
        exported.prototype instanceof BaseBatchProcess
      ) {
        // インスタンス生成または静的メソッドで title を取得
        // ここでは一時的にインスタンス生成する例です
        const instance = new exported();
        classes.push({
          title: instance.title,
          cls: exported,
          summary: instance.summary,
        });
      }
    }
  }
  // summaryでソート
  classes.sort((a, b) => a.summary.localeCompare(b.summary));
  // summaryプロパティを除外して返す
  return classes.map(({ title, cls }) => ({ title, cls }));
}
