import { Meta, StoryObj } from "@storybook/react";
import JSZip from "jszip";
import React, { useEffect, useState } from "react";
import { HeaderLogo } from "../../../src/features/Header/HeaderLogo";
import { VoiceBank } from "../../../src/lib/VoiceBanks/VoiceBank";
import { useMusicProjectStore } from "../../../src/store/musicProjectStore";
import { loadVB } from "../../../src/storybook/utils";

const HeaderLogoWrapper: React.FC<{ vbFileName?: string }> = ({
  vbFileName,
}) => {
  const { setVb } = useMusicProjectStore();
  const [loading, setLoading] = useState(!!vbFileName);

  useEffect(() => {
    if (!vbFileName) {
      setVb(null);
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const td = new TextDecoder("Shift-JIS");
        const buffer = await loadVB(vbFileName);
        const zip = new JSZip();
        await zip.loadAsync(buffer, {
          decodeFileName: (fileNameBinary: Uint8Array) =>
            td.decode(fileNameBinary),
        });
        const loadedVb = new VoiceBank(zip.files);
        await loadedVb.initialize();
        setVb(loadedVb);
      } catch (err) {
        console.error("Failed to load VB:", err);
        setVb(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [vbFileName, setVb]);

  if (loading) return <div>Loading voicebank...</div>;
  return <HeaderLogo />;
};

const meta: Meta<typeof HeaderLogoWrapper> = {
  title: "features/Header/HeaderLogo",
  component: HeaderLogoWrapper,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof HeaderLogoWrapper>;

export const NoVoiceBank: Story = {};

export const WithVoiceBank: Story = {
  args: {
    vbFileName: "minimumCV.zip",
  },
};
