/// <reference types="vite/client" />
import { BasePhonemizer } from "../lib/BasePhonemizer";

const modules = import.meta.glob("../lib/Phonemizer/*.ts");

// 各モジュールを読み込み、エクスポートされたクラス一覧を取得する関数の例
export async function loadPhonemizerClasses(): Promise<
  Array<{ name: string; cls: new () => BasePhonemizer }>
> {
  const classes: Array<{ name: string; cls: any }> = [];
  for (const path in modules) {
    const module = await modules[path]();
    // ここではモジュールが複数のエクスポートを持つ可能性を考慮
    for (const exportKey in module as Record<string, any>) {
      const exported = module[exportKey];
      // BasePhonemizerのサブクラスであるかどうかをチェックする
      if (
        typeof exported === "function" &&
        exported.prototype instanceof BasePhonemizer
      ) {
        // インスタンス生成または静的メソッドで name を取得
        const instance = new exported();
        classes.push({ name: instance.name, cls: exported });
      }
    }
  }
  return classes;
}
