import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { CookiesProvider } from "react-cookie";
import { describe, expect, it } from "vitest";
import { cookieDefaults } from "../../src/config/cookie";
import { useProjectCookie } from "../../src/services/useProjectCookie";
const TestProjectCookieMode: React.FC = () => {
  const { mode, setMode } = useProjectCookie();
  return (
    <div>
      <p>Mode: {mode}</p>
      <button onClick={() => setMode("dark")}>Set Dark Mode</button>
    </div>
  );
};
const TestProjectCookieLanguage: React.FC = () => {
  const { language, setLanguage } = useProjectCookie();
  return (
    <div>
      <p>Language: {language}</p>
      <button onClick={() => setLanguage("en")}>Set en</button>
    </div>
  );
};
const TestProjectCookieColorTheme: React.FC = () => {
  const { colorTheme, setColorTheme } = useProjectCookie();
  return (
    <div>
      <p>ColorTheme: {colorTheme}</p>
      <button onClick={() => setColorTheme("red")}>Set red</button>
    </div>
  );
};
const TestProjectCookieVerticalZoom: React.FC = () => {
  const { verticalZoom, setVerticalZoom } = useProjectCookie();
  return (
    <div>
      <p>VerticalZoom: {verticalZoom}</p>
      <button onClick={() => setVerticalZoom(2)}>Set VerticalZoom</button>
    </div>
  );
};
const TestProjectCookieHorizontalZoom: React.FC = () => {
  const { horizontalZoom, setHorizontalZoom } = useProjectCookie();
  return (
    <div>
      <p>HorizontalZoom: {horizontalZoom}</p>
      <button onClick={() => setHorizontalZoom(2)}>Set HorizontalZoom</button>
    </div>
  );
};
const TestProjectCookieWorkersCount: React.FC = () => {
  const { workersCount, setWorkersCount } = useProjectCookie();
  return (
    <div>
      <p>WorkersCount: {workersCount}</p>
      <button onClick={() => setWorkersCount(2)}>Set WorkersCount</button>
    </div>
  );
};
const TestProjectCookieFastResamp: React.FC = () => {
  const { fastResamp, setFastResamp } = useProjectCookie();
  return (
    <div>
      <p>FastResamp: {fastResamp.toString()}</p>
      <button onClick={() => setFastResamp(true)}>Set FastResamp</button>
    </div>
  );
};
const TestProjectCookieUseCache: React.FC = () => {
  const { useCache, setUseCache } = useProjectCookie();
  return (
    <div>
      <p>UseCache: {useCache.toString()}</p>
      <button onClick={() => setUseCache(false)}>Set UseCache</button>
    </div>
  );
};
const TestProjectCookieBackgroundResamp: React.FC = () => {
  const { backgroundResamp, setBackgroundResamp } = useProjectCookie();
  return (
    <div>
      <p>BackgroundResamp: {backgroundResamp.toString()}</p>
      <button onClick={() => setBackgroundResamp(false)}>
        Set BackgroundResamp
      </button>
    </div>
  );
};

const TestProjectCookieDefaultNote: React.FC = () => {
  const { defaultNote, setDefaultNote } = useProjectCookie();
  return (
    <div>
      <p>Velocity: {defaultNote.velocity}</p>
      <p>Intensity: {defaultNote.intensity}</p>
      <p>Modulation: {defaultNote.modulation}</p>
      <p>Envelope Points: {defaultNote.envelope.point.join(", ")}</p>
      <p>Envelope Values: {defaultNote.envelope.value.join(", ")}</p>
      <button
        onClick={() =>
          setDefaultNote({
            velocity: 120,
            intensity: 90,
            modulation: 60,
            envelope: { point: [0, 2], value: [0, 2] },
          })
        }
      >
        Set Default Note
      </button>
    </div>
  );
};

describe("useProjectCookie", () => {
  it("defaultMode", () => {
    render(
      <CookiesProvider>
        <TestProjectCookieMode />
      </CookiesProvider>
    );
    expect(screen.getByText("Mode: system")).toBeInTheDocument();
  });
  it("hasMode", () => {
    document.cookie = "mode=dark; path=/;";
    render(
      <CookiesProvider>
        <TestProjectCookieMode />
      </CookiesProvider>
    );
    expect(screen.getByText("Mode: dark")).toBeInTheDocument();
  });
  it("changeMode", async () => {
    render(
      <CookiesProvider>
        <TestProjectCookieMode />
      </CookiesProvider>
    );
    const button = screen.getByRole("button");
    await fireEvent.click(button);
    expect(screen.getByText("Mode: dark")).toBeInTheDocument();
  });
  it("defaultLanguage", () => {
    render(
      <CookiesProvider>
        <TestProjectCookieLanguage />
      </CookiesProvider>
    );
    expect(screen.getByText("Language: en")).toBeInTheDocument();
  });
  it("hasLanguage", () => {
    document.cookie = "language=en; path=/;";
    render(
      <CookiesProvider>
        <TestProjectCookieLanguage />
      </CookiesProvider>
    );
    expect(screen.getByText("Language: en")).toBeInTheDocument();
  });
  it("changeLanguage", async () => {
    render(
      <CookiesProvider>
        <TestProjectCookieLanguage />
      </CookiesProvider>
    );
    const button = screen.getByRole("button");
    await fireEvent.click(button);
    expect(screen.getByText("Language: en")).toBeInTheDocument();
  });
  it("defaultColorTheme", () => {
    render(
      <CookiesProvider>
        <TestProjectCookieColorTheme />
      </CookiesProvider>
    );
    expect(screen.getByText("ColorTheme: default")).toBeInTheDocument();
  });
  it("hasColorTheme", () => {
    document.cookie = "colorTheme=red; path=/;";
    render(
      <CookiesProvider>
        <TestProjectCookieColorTheme />
      </CookiesProvider>
    );
    expect(screen.getByText("ColorTheme: red")).toBeInTheDocument();
  });
  it("changeColorTheme", async () => {
    render(
      <CookiesProvider>
        <TestProjectCookieColorTheme />
      </CookiesProvider>
    );
    const button = screen.getByRole("button");
    await fireEvent.click(button);
    expect(screen.getByText("ColorTheme: red")).toBeInTheDocument();
  });

  it("defaultDefaultNote", () => {
    // 初期状態（Cookieがない場合）でテスト
    render(
      <CookiesProvider>
        <TestProjectCookieDefaultNote />
      </CookiesProvider>
    );
    expect(
      screen.getByText(`Velocity: ${cookieDefaults.defaultNote.velocity}`)
    ).toBeInTheDocument();
    expect(
      screen.getByText(`Intensity: ${cookieDefaults.defaultNote.intensity}`)
    ).toBeInTheDocument();
    expect(
      screen.getByText(`Modulation: ${cookieDefaults.defaultNote.modulation}`)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        `Envelope Points: ${cookieDefaults.defaultNote.envelope.point.join(
          ", "
        )}`
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        `Envelope Values: ${cookieDefaults.defaultNote.envelope.value.join(
          ", "
        )}`
      )
    ).toBeInTheDocument();
  });
  it("hasDefaultNote", () => {
    // Cookieがすでに設定されている場合
    document.cookie =
      "defaultNote=" +
      JSON.stringify({
        velocity: 120,
        intensity: 90,
        modulation: 60,
        envelope: { point: [0, 2], value: [1, 3] },
      }) +
      "; path=/;";

    render(
      <CookiesProvider>
        <TestProjectCookieDefaultNote />
      </CookiesProvider>
    );

    // Cookieの値が反映されているか確認
    expect(screen.getByText("Velocity: 120")).toBeInTheDocument();
    expect(screen.getByText("Intensity: 90")).toBeInTheDocument();
    expect(screen.getByText("Modulation: 60")).toBeInTheDocument();
    expect(screen.getByText("Envelope Points: 0, 2")).toBeInTheDocument();
    expect(screen.getByText("Envelope Values: 1, 3")).toBeInTheDocument();
  });
  it("changeDefaultNote", async () => {
    // デフォルトの状態から変更
    render(
      <CookiesProvider>
        <TestProjectCookieDefaultNote />
      </CookiesProvider>
    );
    const button = screen.getByRole("button");
    await fireEvent.click(button);

    // 変更後の値が反映されているか確認
    expect(screen.getByText("Velocity: 120")).toBeInTheDocument();
    expect(screen.getByText("Intensity: 90")).toBeInTheDocument();
    expect(screen.getByText("Modulation: 60")).toBeInTheDocument();
    expect(screen.getByText("Envelope Points: 0, 2")).toBeInTheDocument();
    expect(screen.getByText("Envelope Values: 0, 2")).toBeInTheDocument();
  });
  it("defaultVerticalZoom", () => {
    render(
      <CookiesProvider>
        <TestProjectCookieVerticalZoom />
      </CookiesProvider>
    );
    expect(screen.getByText("VerticalZoom: 1")).toBeInTheDocument();
  });
  it("hasVerticalZoom", () => {
    document.cookie = "verticalZoom=0.8; path=/;";
    render(
      <CookiesProvider>
        <TestProjectCookieVerticalZoom />
      </CookiesProvider>
    );
    expect(screen.getByText("VerticalZoom: 0.8")).toBeInTheDocument();
  });
  it("changeVerticalZoom", async () => {
    render(
      <CookiesProvider>
        <TestProjectCookieVerticalZoom />
      </CookiesProvider>
    );
    const button = screen.getByRole("button");
    await fireEvent.click(button);
    expect(screen.getByText("VerticalZoom: 2")).toBeInTheDocument();
  });
  it("defaultHorizontalZoom", () => {
    render(
      <CookiesProvider>
        <TestProjectCookieHorizontalZoom />
      </CookiesProvider>
    );
    expect(screen.getByText("HorizontalZoom: 1")).toBeInTheDocument();
  });
  it("hasHorizontalZoom", () => {
    document.cookie = "horizontalZoom=0.8; path=/;";
    render(
      <CookiesProvider>
        <TestProjectCookieHorizontalZoom />
      </CookiesProvider>
    );
    expect(screen.getByText("HorizontalZoom: 0.8")).toBeInTheDocument();
  });
  it("changeHorizontalZoom", async () => {
    render(
      <CookiesProvider>
        <TestProjectCookieHorizontalZoom />
      </CookiesProvider>
    );
    const button = screen.getByRole("button");
    await fireEvent.click(button);
    expect(screen.getByText("HorizontalZoom: 2")).toBeInTheDocument();
  });
  it("defaultWorkersCount", () => {
    render(
      <CookiesProvider>
        <TestProjectCookieWorkersCount />
      </CookiesProvider>
    );
    expect(screen.getByText("WorkersCount: 3")).toBeInTheDocument();
  });
  it("hasWorkersCount", () => {
    document.cookie = "workersCount=1; path=/;";
    render(
      <CookiesProvider>
        <TestProjectCookieWorkersCount />
      </CookiesProvider>
    );
    expect(screen.getByText("WorkersCount: 1")).toBeInTheDocument();
  });
  it("changeWorkersCount", async () => {
    render(
      <CookiesProvider>
        <TestProjectCookieWorkersCount />
      </CookiesProvider>
    );
    const button = screen.getByRole("button");
    await fireEvent.click(button);
    expect(screen.getByText("WorkersCount: 2")).toBeInTheDocument();
  });
  it("defaultFastResamp", () => {
    render(
      <CookiesProvider>
        <TestProjectCookieFastResamp />
      </CookiesProvider>
    );
    expect(screen.getByText("FastResamp: false")).toBeInTheDocument();
  });
  it("hasFastResamp", () => {
    document.cookie = "fastResamp=true; path=/;";
    render(
      <CookiesProvider>
        <TestProjectCookieFastResamp />
      </CookiesProvider>
    );
    expect(screen.getByText("FastResamp: true")).toBeInTheDocument();
  });
  it("changeFastResamp", async () => {
    render(
      <CookiesProvider>
        <TestProjectCookieFastResamp />
      </CookiesProvider>
    );
    const button = screen.getByRole("button");
    await fireEvent.click(button);
    expect(screen.getByText("FastResamp: true")).toBeInTheDocument();
  });
  it("defaultUseCache", () => {
    render(
      <CookiesProvider>
        <TestProjectCookieUseCache />
      </CookiesProvider>
    );
    expect(screen.getByText("UseCache: true")).toBeInTheDocument();
  });
  it("hasUseCache", () => {
    document.cookie = "useCache=false; path=/;";
    render(
      <CookiesProvider>
        <TestProjectCookieUseCache />
      </CookiesProvider>
    );
    expect(screen.getByText("UseCache: false")).toBeInTheDocument();
  });
  it("changeUseCache", async () => {
    render(
      <CookiesProvider>
        <TestProjectCookieUseCache />
      </CookiesProvider>
    );
    const button = screen.getByRole("button");
    await fireEvent.click(button);
    expect(screen.getByText("UseCache: false")).toBeInTheDocument();
  });
  it("defaultBackgroundResamp", () => {
    render(
      <CookiesProvider>
        <TestProjectCookieBackgroundResamp />
      </CookiesProvider>
    );
    expect(screen.getByText("BackgroundResamp: true")).toBeInTheDocument();
  });
  it("hasBackgroundResamp", () => {
    document.cookie = "backgroundResamp=false; path=/;";
    render(
      <CookiesProvider>
        <TestProjectCookieBackgroundResamp />
      </CookiesProvider>
    );
    expect(screen.getByText("BackgroundResamp: false")).toBeInTheDocument();
  });
  it("changeBackgroundResamp", async () => {
    render(
      <CookiesProvider>
        <TestProjectCookieBackgroundResamp />
      </CookiesProvider>
    );
    const button = screen.getByRole("button");
    await fireEvent.click(button);
    expect(screen.getByText("BackgroundResamp: false")).toBeInTheDocument();
  });
});
