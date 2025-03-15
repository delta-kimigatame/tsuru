import React from "react";
import { CookiesProvider } from "react-cookie";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { App } from "./features/App";
import { ErrorPaper } from "./features/Logging/ErrorPaper";
import "./i18n/configs";

const root = createRoot(document.getElementById("root")!);

root.render(
  <ErrorBoundary
    fallbackRender={({ error, resetErrorBoundary }) => (
      <ErrorPaper error={error} resetErrorBoundary={resetErrorBoundary} />
    )}
  >
    <CookiesProvider>
      <App />
    </CookiesProvider>
  </ErrorBoundary>
);
