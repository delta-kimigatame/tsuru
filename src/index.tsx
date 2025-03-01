import React from "react";
import { CookiesProvider } from "react-cookie";
import { createRoot } from "react-dom/client";
import { App } from "./features/App";
// import { ErrorBoundary } from "react-error-boundary";
// import "./i18n/configs";
// import { ErrorPaper } from "./Component/ErrorPaper";

const root = createRoot(document.querySelector("#root") as HTMLElement);
root.render(
  // <ErrorBoundary FallbackComponent={ErrorPaper}>
  <CookiesProvider>
    <App />
  </CookiesProvider>
  // </ErrorBoundary>
);
