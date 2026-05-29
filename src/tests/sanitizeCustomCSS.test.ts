import { describe, it, expect } from "bun:test";
import { sanitizeCustomCSS } from "../dom/themeMaker";

describe("sanitizeCustomCSS (strict mode)", () => {
  it("returns input unchanged when strict=false", () => {
    const css = "@import url(http://evil.example/);\nbody { color: red; }";
    const { css: out, removed } = sanitizeCustomCSS(css, false);
    expect(out).toBe(css);
    expect(removed).toEqual([]);
  });

  it("strips @import statements", () => {
    const { css, removed } = sanitizeCustomCSS(
      "@import url(http://evil.example/track.css);\nbody { color: red; }",
      true,
    );
    expect(css).not.toMatch(/@import/);
    expect(removed.length).toBe(1);
    expect(removed[0]).toMatch(/^@import/);
  });

  it("strips remote http(s):// url() references", () => {
    const { css, removed } = sanitizeCustomCSS(
      "body { background: url(https://evil.example/pixel.png); }",
      true,
    );
    expect(css).not.toContain("evil.example");
    expect(css).toContain("about:blank");
    expect(removed[0]).toMatch(/remote url/);
  });

  it("keeps data: and relative url() references", () => {
    const css = "body { background: url(data:image/png;base64,AAAA); }";
    const { css: out, removed } = sanitizeCustomCSS(css, true);
    expect(out).toBe(css);
    expect(removed).toEqual([]);

    const css2 = "body { background: url('./local.png'); }";
    const { css: out2, removed: removed2 } = sanitizeCustomCSS(css2, true);
    expect(out2).toBe(css2);
    expect(removed2).toEqual([]);
  });

  it("strips javascript: and vbscript: pseudo-URLs", () => {
    const { css, removed } = sanitizeCustomCSS(
      "a { cursor: url(javascript:alert(1)); }",
      true,
    );
    expect(css).not.toContain("javascript:alert");
    expect(removed.some((r) => /script URL/.test(r))).toBe(true);
  });

  it("strips legacy expression() and behavior:", () => {
    const { css, removed } = sanitizeCustomCSS(
      "body { width: expression(alert(1)); behavior: url(#default#VML); }",
      true,
    );
    expect(css).not.toContain("expression(");
    expect(css).not.toMatch(/behavior\s*:/);
    expect(removed.length).toBeGreaterThanOrEqual(2);
  });

  it("strips protocol-relative // urls", () => {
    const { css, removed } = sanitizeCustomCSS(
      "body { background: url(//evil.example/pixel.png); }",
      true,
    );
    expect(css).not.toContain("//evil.example");
    expect(removed[0]).toMatch(/remote url/);
  });
});
