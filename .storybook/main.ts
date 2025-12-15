import type { StorybookConfig } from "@storybook/react-vite";
import { fileURLToPath } from "node:url";
import path from "path";
import { mergeConfig } from "vite";

// __dirnameを定義
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config: StorybookConfig = {
  stories: [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],

  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],

  framework: {
    name: "@storybook/react-vite",
    options: {},
  },

  features: {
    actions: true,
    backgrounds: true,
    controls: true,
    highlight: true,
    measure: true,
    outline: true,
    viewport: true,
  },

  // 静的ファイルのディレクトリを指定
  staticDirs: ["./public"],

  async viteFinal(config) {
    return mergeConfig(config, {
      base: process.env.NODE_ENV === "production" ? "/utalet/storybook/" : "/",
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "../src"),
        },
      },
    });
  },
};

export default config;
