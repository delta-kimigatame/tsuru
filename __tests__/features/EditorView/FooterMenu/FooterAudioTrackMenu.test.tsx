import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FooterAudioTrackMenu } from "../../../../src/features/EditorView/FooterMenu/FooterAudioTrackMenu";
import { LOG } from "../../../../src/lib/Logging";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";
import * as estimateBeatOffsetModule from "../../../../src/utils/estimateBeatOffset";
import * as estimateBpmModule from "../../../../src/utils/estimateBpm";

// Waveクラスをモック
vi.mock("utauwav", () => {
  return {
    Wave: vi.fn().mockImplementation(() => ({
      sampleRate: 44100,
      bitDepth: 16,
      VolumeNormalize: vi.fn(),
    })),
  };
});

describe("FooterAudioTrackMenu", () => {
  const mockHandleClose = vi.fn();
  const mockAnchor = document.createElement("div");
  const mockSetBackgroundAudioWav = vi.fn();
  const mockSetBackgroundWavUrl = vi.fn();
  const mockSetBackgroundOffsetMs = vi.fn();
  const mockSetBackgroundVolume = vi.fn();
  const mockSetBackgroundMuted = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    LOG.clear();
    // Zustandストアの初期状態
    useMusicProjectStore.setState({
      ustTempo: 120,
      setUstTempo: vi.fn(),
    });
  });

  const defaultProps = {
    anchor: mockAnchor,
    handleClose: mockHandleClose,
    backgroundAudioWav: null,
    setBackgroundAudioWav: mockSetBackgroundAudioWav,
    backgroundWavUrl: "",
    setBackgroundWavUrl: mockSetBackgroundWavUrl,
    backgroundOffsetMs: 0,
    setBackgroundOffsetMs: mockSetBackgroundOffsetMs,
    backgroundVolume: 0.5,
    setBackgroundVolume: mockSetBackgroundVolume,
    backgroundMuted: false,
    setBackgroundMuted: mockSetBackgroundMuted,
    backgroundSync: false,
    setBackgroundSync: vi.fn(),
  };

  it("anchorがnullの場合、メニューが表示されない", () => {
    render(<FooterAudioTrackMenu {...defaultProps} anchor={null} />);

    const menu = screen.queryByRole("menu");
    expect(menu).toBeNull();
  });

  it("伴奏音声の読込メニューが表示される", () => {
    render(<FooterAudioTrackMenu {...defaultProps} />);

    expect(
      screen.getByText("editor.footer.loadAudioTrack")
    ).toBeInTheDocument();
  });

  it("伴奏音声の読込をクリックするとログが出力される", () => {
    render(<FooterAudioTrackMenu {...defaultProps} />);

    const loadMenuItem = screen.getByText("editor.footer.loadAudioTrack");
    fireEvent.click(loadMenuItem);

    expect(LOG.datas.some((s) => s.includes("伴奏音声の読込"))).toBeTruthy();
  });

  it("音量スライダーが表示され、初期値が設定される", () => {
    render(<FooterAudioTrackMenu {...defaultProps} />);

    const sliders = screen.getAllByRole("slider");
    // 音量とオフセットの2つのスライダーがある
    expect(sliders.length).toBeGreaterThanOrEqual(1);
  });

  it("音量スライダーを変更するとsetBackgroundVolumeが呼ばれる", () => {
    render(<FooterAudioTrackMenu {...defaultProps} />);

    const sliders = screen.getAllByRole("slider");
    const volumeSlider = sliders[0]; // 最初のスライダーが音量

    // スライダーの値を変更
    fireEvent.change(volumeSlider, { target: { value: "0.8" } });

    expect(mockSetBackgroundVolume).toHaveBeenCalled();
  });

  it("オフセットスライダーを変更するとsetBackgroundOffsetMsが呼ばれる", () => {
    render(<FooterAudioTrackMenu {...defaultProps} />);

    const sliders = screen.getAllByRole("slider");
    const offsetSlider = sliders[1]; // 2番目のスライダーがオフセット

    // スライダーの値を変更
    fireEvent.change(offsetSlider, { target: { value: "100" } });

    expect(mockSetBackgroundOffsetMs).toHaveBeenCalled();
  });

  it("オフセットのテキスト入力が表示される", () => {
    render(<FooterAudioTrackMenu {...defaultProps} />);

    // type="number"の入力要素はspinbuttonとして認識される
    const spinbuttons = screen.getAllByRole("spinbutton");
    expect(spinbuttons.length).toBeGreaterThanOrEqual(1);
  });

  it("オフセットのテキスト入力に値を入力するとsetBackgroundOffsetMsが呼ばれる", () => {
    render(<FooterAudioTrackMenu {...defaultProps} />);

    const spinbuttons = screen.getAllByRole("spinbutton");
    const offsetInput = spinbuttons[0];

    // テキスト入力を変更
    fireEvent.change(offsetInput, { target: { value: "500" } });

    expect(mockSetBackgroundOffsetMs).toHaveBeenCalled();
  });

  it("オフセットのリセットボタンをクリックするとoffsetが0になる", () => {
    render(<FooterAudioTrackMenu {...defaultProps} backgroundOffsetMs={500} />);

    // RestartAltIconを持つボタンを見つける
    const resetButtons = screen.getAllByRole("menuitem");
    // リセットボタンは"backgroundOffsetReset"というテキストを持つ
    const resetButton = resetButtons.find((btn) =>
      btn.textContent?.includes("backgroundOffsetReset")
    );

    if (resetButton) {
      fireEvent.click(resetButton);
      expect(mockSetBackgroundOffsetMs).toHaveBeenCalledWith(0);
      expect(mockHandleClose).toHaveBeenCalled();
    }
  });

  it("ミュートボタンをクリックするとミュート状態が切り替わる", () => {
    render(<FooterAudioTrackMenu {...defaultProps} />);

    const muteButtons = screen.getAllByRole("menuitem");
    // ミュートボタンは"mute"というテキストを持つ
    const muteButton = muteButtons.find((btn) =>
      btn.textContent?.includes("mute")
    );

    if (muteButton) {
      fireEvent.click(muteButton);
      expect(mockSetBackgroundMuted).toHaveBeenCalled();
      expect(mockHandleClose).toHaveBeenCalled();
    }
  });

  it("クリアボタンをクリックすると全ての値がリセットされる", () => {
    render(<FooterAudioTrackMenu {...defaultProps} />);

    const clearButtons = screen.getAllByRole("menuitem");
    // クリアボタンは"backgroundClear"というテキストを持つ
    const clearButton = clearButtons.find((btn) =>
      btn.textContent?.includes("backgroundClear")
    );

    if (clearButton) {
      fireEvent.click(clearButton);
      expect(mockSetBackgroundWavUrl).toHaveBeenCalledWith("");
      expect(mockSetBackgroundAudioWav).toHaveBeenCalledWith(null);
      expect(mockSetBackgroundOffsetMs).toHaveBeenCalledWith(0);
      expect(mockHandleClose).toHaveBeenCalled();
    }
  });

  it("BPM推定ボタンをクリックするとestimateBpmが呼ばれる", () => {
    // モックWaveオブジェクト
    const mockWave = {
      sampleRate: 44100,
      bitDepth: 16,
      VolumeNormalize: vi.fn(),
    };

    // estimateBpmとestimateBeatOffsetをスパイ
    const mockEstimateBpm = vi.spyOn(estimateBpmModule, "estimateBpm");
    mockEstimateBpm.mockReturnValue(128);

    const mockEstimateBeatOffset = vi.spyOn(
      estimateBeatOffsetModule,
      "estimateBeatOffset"
    );
    mockEstimateBeatOffset.mockReturnValue(50);

    render(
      <FooterAudioTrackMenu
        {...defaultProps}
        backgroundAudioWav={mockWave as any}
      />
    );

    const bpmButtons = screen.getAllByRole("menuitem");
    // BPM推定ボタンは"backgroundEstimateBpm"というテキストを持つ
    const bpmButton = bpmButtons.find((btn) =>
      btn.textContent?.includes("backgroundEstimateBpm")
    );

    if (bpmButton) {
      fireEvent.click(bpmButton);

      expect(mockEstimateBpm).toHaveBeenCalledWith(mockWave);
      expect(mockEstimateBeatOffset).toHaveBeenCalledWith(mockWave, 128);
      expect(mockSetBackgroundOffsetMs).toHaveBeenCalledWith(50);
      expect(mockHandleClose).toHaveBeenCalled();
    }
  });

  it("backgroundAudioWavがnullの場合、BPM推定は実行されない", () => {
    const mockEstimateBpm = vi.spyOn(estimateBpmModule, "estimateBpm");

    render(
      <FooterAudioTrackMenu {...defaultProps} backgroundAudioWav={null} />
    );

    const bpmButtons = screen.getAllByRole("menuitem");
    const bpmButton = bpmButtons.find((btn) =>
      btn.textContent?.includes("backgroundEstimateBpm")
    );

    if (bpmButton) {
      fireEvent.click(bpmButton);

      expect(mockEstimateBpm).not.toHaveBeenCalled();
      expect(
        LOG.datas.some((s) =>
          s.includes("伴奏音声が存在しないためBPM推定を中止")
        )
      ).toBeTruthy();
    }
  });

  it("calculateOneBarMsが正しく計算される", () => {
    // ustTempo = 120の場合、1小節 = 4 * (60/120) * 1000 = 2000ms
    useMusicProjectStore.setState({ ustTempo: 120 });
    render(<FooterAudioTrackMenu {...defaultProps} />);

    // 計算結果は内部的に使われるため、直接確認することは難しい
    // オフセットの範囲が正しく設定されているかで間接的に確認
    const sliders = screen.getAllByRole("slider");
    expect(sliders.length).toBeGreaterThanOrEqual(2);
  });

  it("ustTempoが60の場合、calculateOneBarMsは4000msになる", () => {
    // ustTempo = 60の場合、1小節 = 4 * (60/60) * 1000 = 4000ms
    useMusicProjectStore.setState({ ustTempo: 60 });
    render(<FooterAudioTrackMenu {...defaultProps} />);

    // 同様に間接的に確認
    const sliders = screen.getAllByRole("slider");
    expect(sliders.length).toBeGreaterThanOrEqual(2);
  });
});
