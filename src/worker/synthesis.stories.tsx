import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { sampleShortCVUst } from "../storybook/sampledata";
import { base64ToArrayBuffer } from "../storybook/utils";
import SynthesisWorkerDemo from "./SynthesisWorkerDemo";

const ustBuffer = base64ToArrayBuffer(sampleShortCVUst);

const meta: Meta = {
  title: "90_Workerテスト/synthテスト",
  component: SynthesisWorkerDemo,
};

export default meta;

// Story for minimumCV.zip
export const MinimumCV: StoryFn = () => (
  <SynthesisWorkerDemo
    vbFileName="minimumCV.zip"
    ustBuffer={base64ToArrayBuffer(sampleShortCVUst)}
    testDescription="休符が2つ、音符が7つの短い音声を合成します。"
  />
);
MinimumCV.storyName = "単独音で短いustを合成する時間の測定";

// Story for minimumCV.zip
export const noFrqCV: StoryFn = () => (
  <SynthesisWorkerDemo
    vbFileName="nofrqCV.zip"
    ustBuffer={base64ToArrayBuffer(sampleShortCVUst)}
    testDescription="休符が2つ、音符が7つの短い音声を合成します。(周波数表無し)"
  />
);
noFrqCV.storyName = "(周波数表無し)単独音で短いustを合成する時間の測定";
