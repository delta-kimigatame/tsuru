import React from "react";
import { CookiesProvider } from "react-cookie";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorPaper } from "../features/Logging/ErrorPaper";
import "../i18n/configs";
import { App } from "./features/App";

const root = createRoot(document.getElementById("root-videoeditor")!);

root.render(
  <ErrorBoundary
    fallbackRender={({ error, resetErrorBoundary }) => (
      <ErrorPaper error={error} resetErrorBoundary={resetErrorBoundary} />
    )}
  >
    <CookiesProvider>
      <App />
    </CookiesProvider>
  </ErrorBoundary>,
);
