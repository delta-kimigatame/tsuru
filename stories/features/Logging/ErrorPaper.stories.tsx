import { Button } from "@mui/material";
import { Meta, StoryObj } from "@storybook/react";
// TODO: Migrate to @storybook/test when implementing interactions
// import { userEvent, within } from "@storybook/test";
import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorPaper } from "../../../src/features/Logging/ErrorPaper";

const ErrorTrigger: React.FC = () => {
  const [shouldThrow, setShouldThrow] = React.useState(false);
  if (shouldThrow) {
    const error = new Error("テストエラー");
    error.stack = "Error: テストエラー\n    at ErrorTrigger (test file)";
    throw error;
  }
  return <Button onClick={() => setShouldThrow(true)}>エラー発生</Button>;
};

const ErrorScenario = () => {
  const testError = new Error("テストエラー");
  testError.stack = "Error: テストエラー\n    at TestComponent (test file)";
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <ErrorPaper error={error} resetErrorBoundary={resetErrorBoundary} />
      )}
    >
      <ErrorTrigger />
    </ErrorBoundary>
  );
};

const meta: Meta<typeof ErrorScenario> = {
  title: "features/Logging/ErrorPaper",
  component: ErrorScenario,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithError: Story = {};

const DownloadScenario = () => {
  const testError = new Error("テストエラー");
  testError.stack = "Error: テストエラー\n    at TestComponent (test file)";
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <ErrorPaper error={error} resetErrorBoundary={resetErrorBoundary} />
      )}
    >
      <ErrorTrigger />
    </ErrorBoundary>
  );
};

export const DownloadAction: Story = {
  // TODO: Uncomment and migrate to @storybook/test
  // play: async ({ canvasElement }) => {
  //   const canvas = within(canvasElement);
  //   const errorButton = await canvas.getByRole("button", {
  //     name: /エラー発生/i,
  //   });
  //   await userEvent.click(errorButton);
  //   const downloadButton = await canvas.findByRole("button", {
  //     name: /ログをダウンロード/i,
  //   });
  //   await userEvent.click(downloadButton);
  // },
};
