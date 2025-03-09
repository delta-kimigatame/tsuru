import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import {
  modernVCVUst,
  sampleShortCVUst,
  sampleShortVCVUst,
} from "../storybook/sampledata";
import { base64ToArrayBuffer } from "../storybook/utils";
import SynthesisWorkerDemo from "./SynthesisWorkerDemo";

const ustBuffer = base64ToArrayBuffer(sampleShortCVUst);

const meta: Meta = {
  title: "Worker/Synthesis Worker Demo",
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

// Story for standardVCV.zip
export const StandardVCV: StoryFn = () => (
  <SynthesisWorkerDemo
    vbFileName="standardVCV.zip"
    ustBuffer={base64ToArrayBuffer(sampleShortVCVUst)}
    testDescription="休符が2つ、音符が7つの短い音声を合成します。"
  />
);

// Story for
export const music: StoryFn = () => (
  <SynthesisWorkerDemo
    vbFileName="standardVCV.zip"
    ustBuffer={base64ToArrayBuffer(modernVCVUst)}
    testDescription="休符が132、音符が652の実際の楽曲を合成します"
  />
);
