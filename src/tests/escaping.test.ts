import { describe, it, expect } from "bun:test";
import { safeHtmlTags, unescapeUnicode } from "../escaping";

describe("safeHtmlTags", () => {
  it("should replace < with ＜ and > with ＞", () => {
    const input = "<div>Hello</div>";
    const expectedOutput = "＜div＞Hello＜/div＞";
    expect(safeHtmlTags(input)).toBe(expectedOutput);
  });

  it("should handle empty strings correctly", () => {
    expect(safeHtmlTags("")).toBe("");
  });
});

describe("unescapeUnicode", () => {
  it("should decode escaped unicode characters", () => {
    const input = "\\u0041\\u0026\\u003F";
    const expectedOutput = "A&?";
    expect(unescapeUnicode(input)).toBe(expectedOutput);
  });

  it("should handle no unicode to decode", () => {
    const input = "Hello World!";
    expect(unescapeUnicode(input)).toBe(input);
  });
});
