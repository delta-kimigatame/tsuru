import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import {
  SampleWavButton,
  SampleWavButtonProps,
} from "../../../src/features/InfoVBDialog/SampleWavButton";

describe("SampleWavButton", () => {
  it("sampleURlが与えられている場合、audio 要素がレンダリングされ、ボタンは有効", () => {
    const props: SampleWavButtonProps = {
      sampleUrl: "data:audio/wav;base64,dummyData",
    };

    render(<SampleWavButton {...props} />);
    // ボタンが有効であることを確認
    const button = screen.getByRole("button");
    expect(button).not.toBeDisabled();

    // audio 要素が存在することを確認
    const audio = screen.getByTestId("audio") as HTMLAudioElement;
    expect(audio).toBeInTheDocument();
  });
  it("sampleUrl が undefined の場合、audio 要素はレンダリングされず、ボタンは無効", () => {
    const props: SampleWavButtonProps = {
      sampleUrl: undefined,
    };

    render(<SampleWavButton {...props} />);
    // ボタンが無効であることを確認
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();

    // audio 要素が存在しないことを確認
    const audio = screen.queryByTestId("audio");
    expect(audio).toBeNull();
  });
  it("ボタンをクリックすると audio.play() が呼ばれる", () => {
    const playMock = vi.fn();
    // ダミーの audio 要素を作成して、play メソッドを spy するためのモックを設定
    const props: SampleWavButtonProps = {
      sampleUrl: "data:audio/wav;base64,dummyData",
    };

    // render 後に audio 要素の play メソッドをモック化
    render(<SampleWavButton {...props} />);
    const audio = screen.getByTestId("audio") as HTMLAudioElement;
    audio.play = playMock;

    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(playMock).toHaveBeenCalled();
  });
});
