import React from "react";
import { createRoot } from "react-dom/client";
// import { App } from "./Component/App";
import { CookiesProvider } from "react-cookie";
import { ErrorBoundary } from "react-error-boundary";
// import "./i18n/configs";
// import { ErrorPaper } from "./Component/ErrorPaper";

const root = createRoot(document.getElementById("root")!);
root.render(
  // <ErrorBoundary FallbackComponent={ErrorPaper}>
    <CookiesProvider>
      {/* <App /> */}
    </CookiesProvider>
  // </ErrorBoundary>
);