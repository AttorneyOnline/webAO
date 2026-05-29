import { describe, it, expect } from "bun:test";
import { toJsonSchema } from "../jsonSchema";
import { packet } from "../schema";
import { str, num, bool, opt, lit, nested, array, custom } from "../fields";

describe("toJsonSchema", () => {
  it("emits draft-07 envelope with title and $header const", () => {
    const MC = packet("MC", { name: str(), char_id: num() });
    const schema = toJsonSchema(MC);
    expect(schema.$schema).toBe("http://json-schema.org/draft-07/schema#");
    expect(schema.title).toBe("MC");
    expect(schema.type).toBe("object");
    const props = schema.properties as Record<string, unknown>;
    expect(props.$header).toEqual({ type: "string", const: "MC" });
  });

  it("includes additionalProperties: false on the envelope", () => {
    const X = packet("X", { a: str() });
    expect(toJsonSchema(X).additionalProperties).toBe(false);
  });

  it("required list includes $header and all non-optional non-literal fields", () => {
    const MC = packet("MC", {
      name: str(),
      char_id: num(),
      showname: opt(str(), ""),
      effects: opt(num(), 0),
    });
    const schema = toJsonSchema(MC);
    const required = schema.required as string[];
    expect(required).toContain("$header");
    expect(required).toContain("name");
    expect(required).toContain("char_id");
    expect(required).not.toContain("showname");
    expect(required).not.toContain("effects");
  });

  it("optional fields keep their default value", () => {
    const MC = packet("MC", {
      showname: opt(str(), "Phoenix"),
      effects: opt(num(), 7),
    });
    const props = toJsonSchema(MC).properties as Record<string, Record<string, unknown>>;
    expect(props.showname).toEqual({ type: "string", default: "Phoenix" });
    expect(props.effects).toEqual({ type: "number", default: 7 });
  });

  it("literal fields are omitted from properties and required", () => {
    const CC = packet("CC", {
      _0: lit(0),
      char_id: num(),
      _pw: lit(""),
    });
    const schema = toJsonSchema(CC);
    const props = schema.properties as Record<string, unknown>;
    expect(props._0).toBeUndefined();
    expect(props._pw).toBeUndefined();
    expect(props.char_id).toEqual({ type: "number" });
    expect(schema.required).toEqual(["$header", "char_id"]);
  });

  it("nested fields emit type: object with their own properties + required", () => {
    const FOO = packet("FOO", {
      offset: nested({ x: num(), y: opt(num(), 0) }),
    });
    const props = toJsonSchema(FOO).properties as Record<string, Record<string, unknown>>;
    expect(props.offset.type).toBe("object");
    expect(props.offset.additionalProperties).toBe(false);
    const offsetProps = props.offset.properties as Record<string, unknown>;
    expect(offsetProps.x).toEqual({ type: "number" });
    expect(offsetProps.y).toEqual({ type: "number", default: 0 });
    expect(props.offset.required).toEqual(["x"]);
  });

  it("array fields emit type: array with typed items", () => {
    const SM = packet("SM", { music_list: array(str()) });
    const props = toJsonSchema(SM).properties as Record<string, Record<string, unknown>>;
    expect(props.music_list).toEqual({
      type: "array",
      items: { type: "string" },
    });
  });

  it("arrays of nested objects emit recursive items schema", () => {
    const VS_PEERS = packet("VS_PEERS", {
      peers: array(nested({ uid: num(), name: str() })),
    });
    const props = toJsonSchema(VS_PEERS).properties as Record<string, Record<string, unknown>>;
    const peers = props.peers;
    expect(peers.type).toBe("array");
    const items = peers.items as Record<string, unknown>;
    expect(items.type).toBe("object");
    expect((items.properties as Record<string, unknown>).uid).toEqual({
      type: "number",
    });
    expect((items.properties as Record<string, unknown>).name).toEqual({
      type: "string",
    });
    expect(items.required).toEqual(["uid", "name"]);
  });

  it("custom fields use an attached jsonSchema property if provided", () => {
    const f = custom<string>({
      toFanta: (s) => s,
      fromFanta: (t) => t,
    }) as ReturnType<typeof custom<string>> & {
      jsonSchema?: Record<string, unknown>;
    };
    f.jsonSchema = { type: "string", format: "uri" };
    const P = packet("P", { url: f });
    const props = toJsonSchema(P).properties as Record<string, unknown>;
    expect(props.url).toEqual({ type: "string", format: "uri" });
  });

  it("custom fields default to {} when no jsonSchema is provided", () => {
    const P = packet("P", {
      raw: custom<unknown>({
        toFanta: (v) => String(v),
        fromFanta: (t) => t,
      }),
    });
    const props = toJsonSchema(P).properties as Record<string, unknown>;
    expect(props.raw).toEqual({});
  });

  it("primitives boolean/number/string each emit type", () => {
    const X = packet("X", { s: str(), n: num(), b: bool() });
    const props = toJsonSchema(X).properties as Record<string, Record<string, unknown>>;
    expect(props.s).toEqual({ type: "string" });
    expect(props.n).toEqual({ type: "number" });
    expect(props.b).toEqual({ type: "boolean" });
  });
});
