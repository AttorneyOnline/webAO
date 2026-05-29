import { describe, it, expect } from "bun:test";
import { packet } from "../schema";
import { str, num, opt, lit } from "../fields";

describe("packet()", () => {
  it("sets $header and fields", () => {
    const MC = packet("MC", { name: str(), char_id: num() });
    expect(MC.$header).toBe("MC");
    expect(MC.fields.name.kind).toBe("string");
    expect(MC.fields.char_id.kind).toBe("number");
  });

  it("optional fields and literal fields are preserved on the schema", () => {
    const CC = packet("CC", {
      _0: lit(0),
      char_id: num(),
      char_pw: opt(str(), ""),
    });
    expect(CC.fields._0.kind).toBe("literal");
    expect(CC.fields.char_id.kind).toBe("number");
    expect(CC.fields.char_pw.kind).toBe("optional");
  });

  it("attaches toArgs / fromArgs overrides when given", () => {
    const toArgs = () => ["x"];
    const fromArgs = () => ({});
    const FOO = packet("FOO", { x: num() }, { toArgs, fromArgs });
    expect(FOO.toArgs).toBe(toArgs);
    expect(FOO.fromArgs).toBe(fromArgs);
  });

  it("overrides are absent when not specified", () => {
    const BAR = packet("BAR", { x: num() });
    expect(BAR.toArgs).toBeUndefined();
    expect(BAR.fromArgs).toBeUndefined();
  });

  it("supports empty fields", () => {
    const DONE = packet("DONE", {});
    expect(DONE.$header).toBe("DONE");
    expect(Object.keys(DONE.fields)).toHaveLength(0);
  });
});
