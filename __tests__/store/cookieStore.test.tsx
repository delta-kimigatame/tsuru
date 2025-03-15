import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { CookiesProvider, useCookies } from "react-cookie";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { COOKIE_KEYS, cookieDefaults } from "../../src/config/cookie";
import {
  useCookieStore,
  useInitializeCookieStore,
} from "../../src/store/cookieStore";

// テスト用コンポーネント
const TestComponent = () => {
  useInitializeCookieStore(); // Zustand の初期化

  const {
    mode,
    language,
    colorTheme,
    defaultNote,
    verticalZoom,
    setMode,
    setLanguage,
    setColorTheme,
    setDefaultNote,
    setVerticalZoom,
  } = useCookieStore();
  const [cookies] = useCookies();

  return (
    <div>
      <p data-testid="mode">{mode}</p>
      <p data-testid="language">{language}</p>
      <p data-testid="colorTheme">{colorTheme}</p>
      <p data-testid="defaultNote">{JSON.stringify(defaultNote)}</p>
      <p data-testid="verticalZoom">{verticalZoom.toString()}</p>
      <button onClick={() => setMode("dark")}>Set Mode Dark</button>
      <button onClick={() => setLanguage("en")}>Set Language EN</button>
      <button onClick={() => setColorTheme("red")}>Set Color Theme Red</button>
      <button
        onClick={() =>
          setDefaultNote({
            velocity: 120,
            intensity: 90,
            modulation: 60,
            envelope: { point: [0, 2], value: [1, 3] },
          })
        }
      >
        Set Default Note
      </button>
      <button onClick={() => setVerticalZoom(2)}>Set Vertical Zoom 2</button>
    </div>
  );
};

describe("cookieStore", () => {
  beforeEach(() => {
    // Cookie をクリアして初期状態を確認しやすくする
    document.cookie = "";
    useCookieStore.setState({
      mode: cookieDefaults.mode,
      language: cookieDefaults.language,
      colorTheme: cookieDefaults.colorTheme,
      defaultNote: cookieDefaults.defaultNote,
      verticalZoom: cookieDefaults.verticalZoom,
      setModeInCookie: () => {},
      setLanguageInCookie: () => {},
      setColorThemeInCookie: () => {},
      setDefaultNoteInCookie: () => {},
      setVerticalZoomInCookie: () => {},
      isInitialized: false,
    });
  });

  afterEach(() => {
    document.cookie.split(";").forEach((cookie) => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie =
        name + "=;expires=" + new Date(0).toUTCString() + ";path=/";
    });
  });

  it("zustandDefault", () => {
    render(
      <CookiesProvider>
        <TestComponent />
      </CookiesProvider>
    );

    expect(screen.getByTestId("mode")).toHaveTextContent(cookieDefaults.mode);
    expect(screen.getByTestId("language")).toHaveTextContent(
      cookieDefaults.language
    );
    expect(screen.getByTestId("colorTheme")).toHaveTextContent(
      cookieDefaults.colorTheme
    );
    expect(screen.getByTestId("defaultNote")).toHaveTextContent(
      JSON.stringify(cookieDefaults.defaultNote)
    );
    expect(screen.getByTestId("verticalZoom")).toHaveTextContent(
      cookieDefaults.verticalZoom.toString()
    );
  });

  it("zustandLoadCookie", async () => {
    // クッキーに事前に値をセット
    document.cookie = `${COOKIE_KEYS.mode}=dark`;
    document.cookie = `${COOKIE_KEYS.language}=en`;
    document.cookie = `${COOKIE_KEYS.colorTheme}=red`;
    document.cookie = `${COOKIE_KEYS.defaultNote}=${JSON.stringify({
      velocity: 100,
      intensity: 80,
      modulation: 50,
      envelope: { point: [1, 2], value: [3, 4] },
    })}`;
    document.cookie = `${COOKIE_KEYS.verticalZoom}=0.8`;

    render(
      <CookiesProvider>
        <TestComponent />
      </CookiesProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("mode")).toHaveTextContent("dark");
      expect(screen.getByTestId("language")).toHaveTextContent("en");
      expect(screen.getByTestId("colorTheme")).toHaveTextContent("red");
      expect(screen.getByTestId("defaultNote")).toHaveTextContent(
        JSON.stringify({
          velocity: 100,
          intensity: 80,
          modulation: 50,
          envelope: { point: [1, 2], value: [3, 4] },
        })
      );
      expect(screen.getByTestId("verticalZoom")).toHaveTextContent("0.8");
    });
  });

  it("zustandChangeValue", () => {
    document.cookie = "";
    console.log(document.cookie);
    render(
      <CookiesProvider>
        <TestComponent />
      </CookiesProvider>
    );

    fireEvent.click(screen.getByText("Set Mode Dark"));
    fireEvent.click(screen.getByText("Set Language EN"));
    fireEvent.click(screen.getByText("Set Color Theme Red"));
    fireEvent.click(screen.getByText("Set Default Note"));
    fireEvent.click(screen.getByText("Set Vertical Zoom 2"));

    expect(screen.getByTestId("mode")).toHaveTextContent("dark");
    expect(screen.getByTestId("language")).toHaveTextContent("en");
    expect(screen.getByTestId("colorTheme")).toHaveTextContent("red");
    expect(screen.getByTestId("defaultNote")).toHaveTextContent(
      JSON.stringify({
        velocity: 120,
        intensity: 90,
        modulation: 60,
        envelope: { point: [0, 2], value: [1, 3] },
      })
    );
    expect(screen.getByTestId("verticalZoom")).toHaveTextContent("2");
  });

  it("changeCookieWhenChangeValue", async () => {
    render(
      <CookiesProvider>
        <TestComponent />
      </CookiesProvider>
    );

    fireEvent.click(screen.getByText("Set Mode Dark"));
    fireEvent.click(screen.getByText("Set Language EN"));
    fireEvent.click(screen.getByText("Set Color Theme Red"));
    fireEvent.click(screen.getByText("Set Default Note"));
    fireEvent.click(screen.getByText("Set Vertical Zoom 2"));

    await waitFor(() => {
      expect(document.cookie).toContain(`${COOKIE_KEYS.mode}=dark`);
      expect(document.cookie).toContain(`${COOKIE_KEYS.language}=en`);
      expect(document.cookie).toContain(`${COOKIE_KEYS.colorTheme}=red`);
      expect(document.cookie).toContain(
        `${COOKIE_KEYS.defaultNote}=${encodeURIComponent(
          JSON.stringify({
            velocity: 120,
            intensity: 90,
            modulation: 60,
            envelope: { point: [0, 2], value: [1, 3] },
          })
        )}`
      );
      expect(document.cookie).toContain(`${COOKIE_KEYS.verticalZoom}=2`);
    });
  });
});
