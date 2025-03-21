import { describe, expect, it } from "vitest";
import { urlValidation } from "../../src/utils/validation";

describe("validation", () => {
  it("urlValidation", () => {
    expect(urlValidation("https://google.com")).toBeTruthy();
    expect(urlValidation("https://k-uta.jp/gakuya/")).toBeTruthy();
    expect(urlValidation("https://utau2008.xrea.jp/")).toBeTruthy();
    expect(urlValidation("http://utau2008.blog47.fc2.com/")).toBeTruthy();
    expect(urlValidation("mail:xxx@k-uta.jp")).toBeFalsy();
    expect(urlValidation("javascript:alert()")).toBeFalsy();
  });
});
