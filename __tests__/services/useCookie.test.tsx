import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { CookiesProvider } from "react-cookie";
import { describe, expect, it } from "vitest";
import { useCookie } from "../../src/services/useCookie";

const TestStringCookie: React.FC = () => {
  const { getStringCookie, setStringCookie } = useCookie();
  return (
    <div>
      <p>Cookie: {getStringCookie("test", "default")}</p>
      <button onClick={() => setStringCookie("test", "cookie-value")}>
        Set Cookie
      </button>
    </div>
  );
};

const TestObjectCookie: React.FC = () => {
  const { getObjectCookie, setObjectCookie } = useCookie();
  return (
    <div>
      <p>
        Cookie.foo:{" "}
        {getObjectCookie("test", { foo: "defaultFoo", bar: "defaultBar" }).foo},
        Cookie.bar:{" "}
        {getObjectCookie("test", { foo: "defaultFoo", bar: "defaultBar" }).bar}
      </p>
      <button
        onClick={() =>
          setObjectCookie("test", { foo: "testFoo", bar: "testBar" })
        }
      >
        Set Cookie
      </button>
    </div>
  );
};

describe("testStringCookie", () => {
  it("testDefault", () => {
    render(
      <CookiesProvider>
        <TestStringCookie />
      </CookiesProvider>
    );
    expect(screen.getByText("Cookie: default")).toBeInTheDocument();
  });
  it("testSetValue", async () => {
    render(
      <CookiesProvider>
        <TestStringCookie />
      </CookiesProvider>
    );
    const button = screen.getByRole("button");
    await fireEvent.click(button);
    expect(screen.getByText("Cookie: cookie-value")).toBeInTheDocument();
  });
});

describe("testObjectCookie", () => {
  it("testDefault", () => {
    render(
      <CookiesProvider>
        <TestObjectCookie />
      </CookiesProvider>
    );
    expect(
      screen.getByText("Cookie.foo: defaultFoo, Cookie.bar: defaultBar")
    ).toBeInTheDocument();
  });
  it("testSetValue", async () => {
    render(
      <CookiesProvider>
        <TestObjectCookie />
      </CookiesProvider>
    );
    const button = screen.getByRole("button");
    await fireEvent.click(button);
    const c = decodeURIComponent(document.cookie.replace("test=", ""));
    expect(JSON.parse(c)).toEqual({ foo: "testFoo", bar: "testBar" });
  });
  it("testValue", () => {
    const testCookieValue = JSON.stringify({ foo: "testFoo", bar: "testBar" });
    Object.defineProperty(document, "cookie", {
      value: "test=" + encodeURIComponent(testCookieValue),
      writable: true,
    });
    render(
      <CookiesProvider>
        <TestObjectCookie />
      </CookiesProvider>
    );
    expect(
      screen.getByText("Cookie.foo: testFoo, Cookie.bar: testBar")
    ).toBeInTheDocument();
  });
});
