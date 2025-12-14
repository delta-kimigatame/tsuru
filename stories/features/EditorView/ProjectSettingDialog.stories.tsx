import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { ProjectSettingDialog } from "../../../src/features/EditorView/ProjectSettingDialog";
import { useCookieStore } from "../../../src/store/cookieStore";
import { useMusicProjectStore } from "../../../src/store/musicProjectStore";

const meta: Meta<typeof ProjectSettingDialog> = {
  title: "features/EditorView/ProjectSettingDialog",
  component: ProjectSettingDialog,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト：ダイアログ非表示
 */
export const Default: Story = {
  decorators: [
    (Story) => {
      const [open, setOpen] = React.useState(false);

      React.useEffect(() => {
        useMusicProjectStore.setState({
          ustTempo: 120,
          ustFlags: "",
        });
      }, []);

      useCookieStore.setState({
        language: "ja",
      });

      return (
        <Story
          args={{
            open,
            handleClose: () => setOpen(false),
          }}
        />
      );
    },
  ],
};

/**
 * プロジェクト設定ダイアログ表示（デフォルト値）
 */
export const DialogOpen: Story = {
  decorators: [
    (Story) => {
      const [open, setOpen] = React.useState(true);

      React.useEffect(() => {
        useMusicProjectStore.setState({
          ustTempo: 120,
          ustFlags: "",
        });
      }, []);

      useCookieStore.setState({
        language: "ja",
      });

      return (
        <Story
          args={{
            open,
            handleClose: () => setOpen(false),
          }}
        />
      );
    },
  ],
};

/**
 * カスタムテンポとフラグが設定されている状態
 */
export const WithCustomSettings: Story = {
  decorators: [
    (Story) => {
      const [open, setOpen] = React.useState(true);

      React.useEffect(() => {
        useMusicProjectStore.setState({
          ustTempo: 140,
          ustFlags: "g-5Y0H0B0F0",
        });
      }, []);

      useCookieStore.setState({
        language: "ja",
      });

      return (
        <Story
          args={{
            open,
            handleClose: () => setOpen(false),
          }}
        />
      );
    },
  ],
};

/**
 * 低速テンポ設定
 */
export const SlowTempo: Story = {
  decorators: [
    (Story) => {
      const [open, setOpen] = React.useState(true);

      React.useEffect(() => {
        useMusicProjectStore.setState({
          ustTempo: 60,
          ustFlags: "P86",
        });
      }, []);

      useCookieStore.setState({
        language: "ja",
      });

      return (
        <Story
          args={{
            open,
            handleClose: () => setOpen(false),
          }}
        />
      );
    },
  ],
};

/**
 * 高速テンポ設定
 */
export const FastTempo: Story = {
  decorators: [
    (Story) => {
      const [open, setOpen] = React.useState(true);

      React.useEffect(() => {
        useMusicProjectStore.setState({
          ustTempo: 200,
          ustFlags: "Mt0.55L0C0c0Y0t+0.36H0N0P70G0",
        });
      }, []);

      useCookieStore.setState({
        language: "ja",
      });

      return (
        <Story
          args={{
            open,
            handleClose: () => setOpen(false),
          }}
        />
      );
    },
  ],
};
