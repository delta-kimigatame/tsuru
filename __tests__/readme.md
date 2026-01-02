# テストのルール

## 使用するライブラリ

- vitest
- @testing-library/react

## ディレクトリ構造のルール

- src フォルダのミラー構造とする。
  `src/features/common/EncodingSelect.tsx`のテストは`__tests__/features/common/EncodingSelect.test.tsx`に格納する
- テストに必要な実物データは`__tests__/__fixtures__/`に格納する。

## テスト名称に関するルール

- discribe 名はコンポーネント名、クラス名、export された関数名などとする。
- it 名は以下のルールの日本語で生成する
  - 単純なテストは`XXを確認する`
  - 条件分岐テストは`XXの時YYになる`
  - シナリオテストは`AをしてBをするとXXになる`

## mock に関するルール

- useMusicProjectStore は極力 mock せず、シナリオ内で初期値を与える。

```Typescript
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes([]);
```
