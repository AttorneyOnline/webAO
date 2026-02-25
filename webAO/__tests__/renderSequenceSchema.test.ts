import Ajv from "ajv";
import schema from "../viewport/interfaces/RenderSequence.schema.json";
import { parseMSPacket } from "../packets/parseMSPacket";
import { buildRenderSequence } from "../viewport/buildRenderSequence";
import type { AomlRules } from "../viewport/buildRenderSequence";
import { defaultCharIni } from "../client/CharIni";
import type { PreloadManifest } from "../cache/types";

const AO_HOST = "https://example.com/";
const TICK_MS = 60;
const EMPTY_AOML: AomlRules = { byStart: new Map(), byEnd: new Map() };

function makeManifest(overrides: Partial<PreloadManifest> = {}): PreloadManifest {
  return {
    characters: [
      { idleUrl: "char/idle.webp", talkingUrl: "char/talk.webp", preanimUrl: null, preanimDuration: 0 },
    ],
    shoutImageUrl: null,
    shoutSoundUrl: null,
    sfxUrl: null,
    blipUrl: null,
    effectUrl: null,
    backgroundUrl: "bg/defenseempty.png",
    deskUrl: "bg/defensedesk.png",
    speedLinesUrl: "themes/default/defense_speedlines.gif",
    allResolved: true,
    failedAssets: [],
    ...overrides,
  };
}

function makeArgs(overrides: Partial<Record<number, string>> = {}): string[] {
  const defaults: Record<number, string> = {
    0: "MS",
    1: "1",       // deskmod: Shown
    2: "-",       // preanim
    3: "Phoenix", // charname
    4: "normal",  // emote
    5: "Hello world", // content
    6: "def",     // side
    7: "0",       // sfx
    8: "0",       // emotemod: IdleOnly
    9: "0",       // charid
    10: "0",      // sfxdelay
    11: "0",      // shoutmod: None
    12: "0",      // evidence
    13: "0",      // flip
    14: "0",      // realization
    15: "0",      // textcolor: White
  };
  const merged = { ...defaults, ...overrides };
  const maxIdx = Math.max(...Object.keys(merged).map(Number));
  const result: string[] = [];
  for (let i = 0; i <= maxIdx; i++) {
    result.push(merged[i] ?? "");
  }
  return result;
}

function makeArgsWithPair(overrides: Partial<Record<number, string>> = {}): string[] {
  return makeArgs({
    16: "",         // showname
    17: "1",        // otherCharId
    18: "Edgeworth",// otherName
    19: "normal",   // otherEmote
    20: "0<and>0",  // selfOffset
    21: "0<and>0",  // otherOffset
    22: "0",        // otherFlip
    23: "0",        // nonInterruptingPreanim
    ...overrides,
  });
}

function build(args: string[], manifest?: PreloadManifest) {
  const packet = parseMSPacket(args);
  const charIni = defaultCharIni("Phoenix");
  return buildRenderSequence(
    packet,
    charIni,
    manifest ?? makeManifest(),
    [],
    EMPTY_AOML,
    AO_HOST,
    TICK_MS,
    "",
  );
}

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);

function expectValid(seq: unknown, label: string) {
  const valid = validate(seq);
  if (!valid) {
    throw new Error(
      `Schema validation failed for "${label}":\n${JSON.stringify(validate.errors, null, 2)}`,
    );
  }
}

describe("RenderSequence JSON Schema", () => {
  it("validates a basic message", () => {
    const seq = build(makeArgs());
    expectValid(seq, "basic message");
  });

  it("validates a message with preanim", () => {
    const manifest = makeManifest({
      characters: [
        { idleUrl: "char/idle.webp", talkingUrl: "char/talk.webp", preanimUrl: "char/preanim.webp", preanimDuration: 500 },
      ],
    });
    const seq = build(makeArgs({ 2: "zoom", 8: "1" }), manifest);
    expectValid(seq, "with preanim");
  });

  it("validates a message with pair character", () => {
    const manifest = makeManifest({
      characters: [
        { idleUrl: "char/idle.webp", talkingUrl: "char/talk.webp", preanimUrl: null, preanimDuration: 0 },
        { idleUrl: "pair/idle.webp", talkingUrl: null, preanimUrl: null, preanimDuration: 0 },
      ],
    });
    const seq = build(makeArgsWithPair(), manifest);
    expectValid(seq, "with pair character");
  });

  it("validates a message with evidence", () => {
    const packet = parseMSPacket(makeArgs({ 12: "1" }));
    const charIni = defaultCharIni("Phoenix");
    const evidences = [{ icon: "evidence/badge.png" }];
    const seq = buildRenderSequence(
      packet, charIni, makeManifest(), evidences, EMPTY_AOML, AO_HOST, TICK_MS, "",
    );
    expectValid(seq, "with evidence");
  });

  it("validates a message with shout", () => {
    const seq = build(makeArgs({ 11: "2" }));
    expectValid(seq, "with shout");
  });

  it("validates a blank post", () => {
    const seq = build(makeArgs({ 5: "" }));
    expectValid(seq, "blank post");
  });

  it("validates centered text", () => {
    const seq = build(makeArgs({ 5: "~~Centered text" }));
    expectValid(seq, "centered text");
  });

  it("validates blue text (no talking sprite)", () => {
    const seq = build(makeArgs({ 15: "4" }));
    expectValid(seq, "blue text");
  });
});
