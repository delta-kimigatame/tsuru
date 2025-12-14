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

export const Default: Story = {};
