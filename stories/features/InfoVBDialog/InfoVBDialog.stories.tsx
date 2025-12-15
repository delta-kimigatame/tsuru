import { Meta, StoryObj } from "@storybook/react";
import JSZip from "jszip";
import React, { useEffect, useState } from "react";
import { InfoVBDialog } from "../../../src/features/InfoVBDialog/InfoVBDialog";
import { VoiceBank } from "../../../src/lib/VoiceBanks/VoiceBank";
import { useMusicProjectStore } from "../../../src/store/musicProjectStore";
import { loadVB } from "../../../src/storybook/utils";

const InfoVBDialogWrapper: React.FC<{ vbFileName: string }> = ({
  vbFileName,
}) => {
  const { setVb } = useMusicProjectStore();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        setOpen(true);
      } catch (err) {
        console.error("Failed to load VB:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [vbFileName, setVb]);

  if (loading) return <div>Loading voicebank...</div>;
  return <InfoVBDialog open={open} setOpen={setOpen} />;
};

const meta: Meta<typeof InfoVBDialogWrapper> = {
  title: "features/InfoVBDialog/InfoVBDialog",
  component: InfoVBDialogWrapper,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof InfoVBDialogWrapper>;

export const Default: Story = {
  args: {
    vbFileName: "minimumCV.zip",
  },
};
