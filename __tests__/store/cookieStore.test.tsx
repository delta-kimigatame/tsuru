import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
    horizontalZoom,
    workersCount,
    fastResamp,
    useCache,
    backgroundResamp,
    setMode,
    setLanguage,
    setColorTheme,
    setDefaultNote,
    setVerticalZoom,
    setHorizontalZoom,
    setWorkersCount,
    setFastResamp,
    setUseCache,
    setBackgroundResamp,
  } = useCookieStore();
  const [cookies] = useCookies();

  return (
    <div>
      <p data-testid="mode">{mode}</p>
      <p data-testid="language">{language}</p>
      <p data-testid="colorTheme">{colorTheme}</p>
      <p data-testid="defaultNote">{JSON.stringify(defaultNote)}</p>
      <p data-testid="verticalZoom">{verticalZoom.toString()}</p>
      <p data-testid="horizontalZoom">{horizontalZoom.toString()}</p>
      <p data-testid="workersCount">{workersCount.toString()}</p>
      <p data-testid="useCache">{useCache.toString()}</p>
      <p data-testid="fastResamp">{fastResamp.toString()}</p>
      <p data-testid="backgroundResamp">{backgroundResamp.toString()}</p>
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
      <button onClick={() => setHorizontalZoom(2)}>
        Set Horizontal Zoom 2
      </button>
      <button onClick={() => setWorkersCount(2)}>Set Workers Count 2</button>
      <button onClick={() => setFastResamp(true)}>Set FastResamp true</button>
      <button onClick={() => setUseCache(false)}>Set UseCache false</button>
      <button onClick={() => setBackgroundResamp(false)}>
        Set BackgroundResamp false
      </button>
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
      horizontalZoom: cookieDefaults.horizontalZoom,
      workersCount: cookieDefaults.workersCount,
      fastResamp: cookieDefaults.fastResamp,
      useCache: cookieDefaults.useCache,
      backgroundResamp: cookieDefaults.backgroundResamp,
      setModeInCookie: () => {},
      setLanguageInCookie: () => {},
      setColorThemeInCookie: () => {},
      setDefaultNoteInCookie: () => {},
      setVerticalZoomInCookie: () => {},
      setHorizontalZoomInCookie: () => {},
      setWorkersCountInCookie: () => {},
      setFastResampInCookie: () => {},
      setUseCacheInCookie: () => {},
      setBackgroundResampInCookie: () => {},
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

  it("Zustandのデフォルト値の確認", () => {
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
    expect(screen.getByTestId("horizontalZoom")).toHaveTextContent(
      cookieDefaults.horizontalZoom.toString()
    );
    expect(screen.getByTestId("workersCount")).toHaveTextContent(
      cookieDefaults.workersCount.toString()
    );
    expect(screen.getByTestId("fastResamp")).toHaveTextContent(
      cookieDefaults.fastResamp.toString()
    );
    expect(screen.getByTestId("useCache")).toHaveTextContent(
      cookieDefaults.useCache.toString()
    );
    expect(screen.getByTestId("backgroundResamp")).toHaveTextContent(
      cookieDefaults.backgroundResamp.toString()
    );
  });

  it("Cookieに値がある場合はCookieから読み込まれる", async () => {
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
    document.cookie = `${COOKIE_KEYS.horizontalZoom}=0.8`;
    document.cookie = `${COOKIE_KEYS.workersCount}=1`;
    document.cookie = `${COOKIE_KEYS.fastResamp}=true`;
    document.cookie = `${COOKIE_KEYS.useCache}=false`;
    document.cookie = `${COOKIE_KEYS.backgroundResamp}=false`;

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
      expect(screen.getByTestId("horizontalZoom")).toHaveTextContent("0.8");
      expect(screen.getByTestId("workersCount")).toHaveTextContent("1");
      expect(screen.getByTestId("fastResamp")).toHaveTextContent("true");
      expect(screen.getByTestId("useCache")).toHaveTextContent("false");
      expect(screen.getByTestId("backgroundResamp")).toHaveTextContent("false");
    });
  });

  it("setModeでmodeを変更するとZustandの値が更新される", () => {
    render(
      <CookiesProvider>
        <TestComponent />
      </CookiesProvider>
    );

    fireEvent.click(screen.getByText("Set Mode Dark"));
    expect(screen.getByTestId("mode")).toHaveTextContent("dark");
  });

  it("setLanguageでlanguageを変更するとZustandの値が更新される", () => {
    render(
      <CookiesProvider>
        <TestComponent />
      </CookiesProvider>
    );

    fireEvent.click(screen.getByText("Set Language EN"));
    expect(screen.getByTestId("language")).toHaveTextContent("en");
  });

  it("setColorThemeでcolorThemeを変更するとZustandの値が更新される", () => {
    render(
      <CookiesProvider>
        <TestComponent />
      </CookiesProvider>
    );

    fireEvent.click(screen.getByText("Set Color Theme Red"));
    expect(screen.getByTestId("colorTheme")).toHaveTextContent("red");
  });

  it("setDefaultNoteでdefaultNoteを変更するとZustandの値が更新される", () => {
    render(
      <CookiesProvider>
        <TestComponent />
      </CookiesProvider>
    );

    fireEvent.click(screen.getByText("Set Default Note"));
    expect(screen.getByTestId("defaultNote")).toHaveTextContent(
      JSON.stringify({
        velocity: 120,
        intensity: 90,
        modulation: 60,
        envelope: { point: [0, 2], value: [1, 3] },
      })
    );
  });

  it("setVerticalZoomでverticalZoomを変更するとZustandの値が更新される", () => {
    render(
      <CookiesProvider>
        <TestComponent />
      </CookiesProvider>
    );

    fireEvent.click(screen.getByText("Set Vertical Zoom 2"));
    expect(screen.getByTestId("verticalZoom")).toHaveTextContent("2");
  });

  it("setHorizontalZoomでhorizontalZoomを変更するとZustandの値が更新される", () => {
    render(
      <CookiesProvider>
        <TestComponent />
      </CookiesProvider>
    );

    fireEvent.click(screen.getByText("Set Horizontal Zoom 2"));
    expect(screen.getByTestId("horizontalZoom")).toHaveTextContent("2");
  });

  it("setWorkersCountでworkersCountを変更するとZustandの値が更新される", () => {
    render(
      <CookiesProvider>
        <TestComponent />
      </CookiesProvider>
    );

    fireEvent.click(screen.getByText("Set Workers Count 2"));
    expect(screen.getByTestId("workersCount")).toHaveTextContent("2");
  });

  it("setFastResampでfastResampを変更するとZustandの値が更新される", () => {
    render(
      <CookiesProvider>
        <TestComponent />
      </CookiesProvider>
    );

    fireEvent.click(screen.getByText("Set FastResamp true"));
    expect(screen.getByTestId("fastResamp")).toHaveTextContent("true");
  });

  it("setUseCacheでuseCacheを変更するとZustandの値が更新される", () => {
    render(
      <CookiesProvider>
        <TestComponent />
      </CookiesProvider>
    );

    fireEvent.click(screen.getByText("Set UseCache false"));
    expect(screen.getByTestId("useCache")).toHaveTextContent("false");
  });

  it("setBackgroundResampでbackgroundResampを変更するとZustandの値が更新される", () => {
    render(
      <CookiesProvider>
        <TestComponent />
      </CookiesProvider>
    );

    fireEvent.click(screen.getByText("Set BackgroundResamp false"));
    expect(screen.getByTestId("backgroundResamp")).toHaveTextContent("false");
  });

  it("setModeでmodeを変更するとCookieも更新される", async () => {
    render(
      <CookiesProvider>
        <TestComponent />
      </CookiesProvider>
    );

    fireEvent.click(screen.getByText("Set Mode Dark"));
    await waitFor(() => {
      expect(document.cookie).toContain(`${COOKIE_KEYS.mode}=dark`);
    });
  });

  it("setLanguageでlanguageを変更するとCookieも更新される", async () => {
    render(
      <CookiesProvider>
        <TestComponent />
      </CookiesProvider>
    );

    fireEvent.click(screen.getByText("Set Language EN"));
    await waitFor(() => {
      expect(document.cookie).toContain(`${COOKIE_KEYS.language}=en`);
    });
  });

  it("setColorThemeでcolorThemeを変更するとCookieも更新される", async () => {
    render(
      <CookiesProvider>
        <TestComponent />
      </CookiesProvider>
    );

    fireEvent.click(screen.getByText("Set Color Theme Red"));
    await waitFor(() => {
      expect(document.cookie).toContain(`${COOKIE_KEYS.colorTheme}=red`);
    });
  });

  it("setDefaultNoteでdefaultNoteを変更するとCookieも更新される", async () => {
    render(
      <CookiesProvider>
        <TestComponent />
      </CookiesProvider>
    );

    fireEvent.click(screen.getByText("Set Default Note"));
    await waitFor(() => {
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
    });
  });

  it("setVerticalZoomでverticalZoomを変更するとCookieも更新される", async () => {
    render(
      <CookiesProvider>
        <TestComponent />
      </CookiesProvider>
    );

    fireEvent.click(screen.getByText("Set Vertical Zoom 2"));
    await waitFor(() => {
      expect(document.cookie).toContain(`${COOKIE_KEYS.verticalZoom}=2`);
    });
  });

  it("setHorizontalZoomでhorizontalZoomを変更するとCookieも更新される", async () => {
    render(
      <CookiesProvider>
        <TestComponent />
      </CookiesProvider>
    );

    fireEvent.click(screen.getByText("Set Horizontal Zoom 2"));
    await waitFor(() => {
      expect(document.cookie).toContain(`${COOKIE_KEYS.horizontalZoom}=2`);
    });
  });

  it("setWorkersCountでworkersCountを変更するとCookieも更新される", async () => {
    render(
      <CookiesProvider>
        <TestComponent />
      </CookiesProvider>
    );

    fireEvent.click(screen.getByText("Set Workers Count 2"));
    await waitFor(() => {
      expect(document.cookie).toContain(`${COOKIE_KEYS.workersCount}=2`);
    });
  });

  it("setFastResampでfastResampを変更するとCookieも更新される", async () => {
    render(
      <CookiesProvider>
        <TestComponent />
      </CookiesProvider>
    );

    fireEvent.click(screen.getByText("Set FastResamp true"));
    await waitFor(() => {
      expect(document.cookie).toContain(`${COOKIE_KEYS.fastResamp}=true`);
    });
  });

  it("setUseCacheでuseCacheを変更するとCookieも更新される", async () => {
    render(
      <CookiesProvider>
        <TestComponent />
      </CookiesProvider>
    );

    fireEvent.click(screen.getByText("Set UseCache false"));
    await waitFor(() => {
      expect(document.cookie).toContain(`${COOKIE_KEYS.useCache}=false`);
    });
  });

  it("setBackgroundResampでbackgroundResampを変更するとCookieも更新される", async () => {
    render(
      <CookiesProvider>
        <TestComponent />
      </CookiesProvider>
    );

    fireEvent.click(screen.getByText("Set BackgroundResamp false"));
    await waitFor(() => {
      expect(document.cookie).toContain(
        `${COOKIE_KEYS.backgroundResamp}=false`
      );
    });
  });
});
