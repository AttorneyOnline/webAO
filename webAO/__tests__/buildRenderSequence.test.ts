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

// Minimal MS args: fields 0-15 (no pairing info)
// [0]=header, [1]=deskmod, [2]=preanim, [3]=charname, [4]=emote,
// [5]=content, [6]=side, [7]=sfx, [8]=emotemod, [9]=charid,
// [10]=sfxdelay, [11]=shoutmod, [12]=evidence, [13]=flip,
// [14]=realization, [15]=textcolor
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

// Extended args with pairing fields (16-23)
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

describe("buildRenderSequence", () => {
  describe("characters", () => {
    it("has 1 character timeline when no pair", () => {
      const seq = build(makeArgs());
      expect(seq.characters).toHaveLength(1);
    });

    it("has 2 character timelines when paired", () => {
      const manifest = makeManifest({
        characters: [
          { idleUrl: "char/idle.webp", talkingUrl: "char/talk.webp", preanimUrl: null, preanimDuration: 0 },
          { idleUrl: "pair/idle.webp", talkingUrl: null, preanimUrl: null, preanimDuration: 0 },
        ],
      });
      const seq = build(makeArgsWithPair(), manifest);
      expect(seq.characters).toHaveLength(2);
    });

    it("uses idle sprite for final step", () => {
      const seq = build(makeArgs());
      const finalStep = seq.characters[0].steps[seq.characters[0].steps.length - 1];
      expect(finalStep.sprite).toBe("char/idle.webp");
      expect(finalStep.durationMs).toBeNull();
    });

    it("includes talking sprite in final step", () => {
      const seq = build(makeArgs());
      const finalStep = seq.characters[0].steps[seq.characters[0].steps.length - 1];
      expect(finalStep.talking).toBe("char/talk.webp");
    });

    it("disables talking sprite for blue text", () => {
      const seq = build(makeArgs({ 15: "4" })); // TextColor.Blue
      const finalStep = seq.characters[0].steps[seq.characters[0].steps.length - 1];
      expect(finalStep.talking).toBeNull();
    });

    it("has preanim step when emoteModifier is PreanimWithSfx", () => {
      const manifest = makeManifest({
        characters: [
          { idleUrl: "char/idle.webp", talkingUrl: "char/talk.webp", preanimUrl: "char/preanim.webp", preanimDuration: 500 },
        ],
      });
      const seq = build(makeArgs({ 2: "zoom", 8: "1" }), manifest); // preanim + PreanimWithSfx
      expect(seq.characters[0].steps).toHaveLength(2);
      expect(seq.characters[0].steps[0].sprite).toBe("char/preanim.webp");
      expect(seq.characters[0].steps[0].durationMs).toBe(500);
    });
  });

  describe("layout", () => {
    it("sets useFullView for panoramic positions", () => {
      for (const side of ["def", "pro", "wit"]) {
        const seq = build(makeArgs({ 6: side }));
        expect(seq.layout.useFullView).toBe(true);
      }
    });

    it("sets useFullView false for classic positions", () => {
      for (const side of ["jud", "hld", "hlp"]) {
        const seq = build(makeArgs({ 6: side }));
        expect(seq.layout.useFullView).toBe(false);
      }
    });

    it("shows speedlines for zoom emotes", () => {
      const seq = build(makeArgs({ 8: "5" })); // EmoteModifier.Zoom
      expect(seq.layout.showSpeedlines).toBe(true);
    });

    it("hides desk during speedlines", () => {
      const seq = build(makeArgs({ 8: "5" })); // Zoom
      expect(seq.layout.deskDuringPreanim).toBe(false);
      expect(seq.layout.deskDuringSpeaking).toBe(false);
    });

    it("includes pre-resolved background URL", () => {
      const seq = build(makeArgs());
      expect(seq.layout.backgroundUrl).toBe("bg/defenseempty.png");
    });

    it("includes pre-resolved desk URL", () => {
      const seq = build(makeArgs());
      expect(seq.layout.deskUrl).toBe("bg/defensedesk.png");
    });

    it("includes pre-resolved speed-lines URL", () => {
      const seq = build(makeArgs());
      expect(seq.layout.speedLinesUrl).toBe("themes/default/defense_speedlines.gif");
    });

    it("propagates null URLs from manifest", () => {
      const manifest = makeManifest({ backgroundUrl: null, deskUrl: null, speedLinesUrl: null });
      const seq = build(makeArgs(), manifest);
      expect(seq.layout.backgroundUrl).toBeNull();
      expect(seq.layout.deskUrl).toBeNull();
      expect(seq.layout.speedLinesUrl).toBeNull();
    });
  });

  describe("desk modifiers", () => {
    it("deskmod 0 hides desk in both phases", () => {
      const seq = build(makeArgs({ 1: "0" }));
      expect(seq.layout.deskDuringPreanim).toBe(false);
      expect(seq.layout.deskDuringSpeaking).toBe(false);
    });

    it("deskmod 1 shows desk in both phases", () => {
      const seq = build(makeArgs({ 1: "1" }));
      expect(seq.layout.deskDuringPreanim).toBe(true);
      expect(seq.layout.deskDuringSpeaking).toBe(true);
    });

    it("deskmod 2 hides desk during preanim only", () => {
      const seq = build(makeArgs({ 1: "2" }));
      expect(seq.layout.deskDuringPreanim).toBe(false);
      expect(seq.layout.deskDuringSpeaking).toBe(true);
    });

    it("deskmod 3 shows desk during preanim only", () => {
      const seq = build(makeArgs({ 1: "3" }));
      expect(seq.layout.deskDuringPreanim).toBe(true);
      expect(seq.layout.deskDuringSpeaking).toBe(false);
    });
  });

  describe("text", () => {
    it("parses text content into segments", () => {
      const seq = build(makeArgs({ 5: "Hello" }));
      expect(seq.text.segments.length).toBeGreaterThan(0);
      expect(seq.text.segments[0]).toMatchObject({ kind: "text", content: "Hello" });
    });

    it("detects centered text prefix", () => {
      const seq = build(makeArgs({ 5: "~~Centered text" }));
      expect(seq.text.centered).toBe(true);
    });

    it("sets additive from packet", () => {
      const args = makeArgs({
        16: "", 17: "0", 18: "", 19: "", 20: "0<and>0", 21: "0<and>0",
        22: "0", 23: "0", 24: "0", 25: "0", 26: "", 27: "", 28: "", 29: "1",
        30: "||",
      });
      const seq = build(args);
      expect(seq.text.additive).toBe(true);
    });
  });

  describe("shout", () => {
    it("is null when shoutModifier is None", () => {
      const seq = build(makeArgs({ 11: "0" }));
      expect(seq.shout).toBeNull();
    });

    it("is present for Objection modifier", () => {
      const seq = build(makeArgs({ 11: "2" }));
      expect(seq.shout).not.toBeNull();
      expect(seq.shout!.isCustom).toBe(false);
    });
  });

  describe("slide", () => {
    it("is null when slide flag is 0", () => {
      const seq = build(makeArgs());
      expect(seq.slide).toBeNull();
    });
  });

  describe("evidence", () => {
    it("is null when evidence index is 0", () => {
      const seq = build(makeArgs({ 12: "0" }));
      expect(seq.evidence).toBeNull();
    });

    it("includes evidence when index is valid", () => {
      const packet = parseMSPacket(makeArgs({ 12: "1" }));
      const charIni = defaultCharIni("Phoenix");
      const evidences = [{ icon: "evidence/badge.png" }];
      const seq = buildRenderSequence(
        packet, charIni, makeManifest(), evidences, EMPTY_AOML, AO_HOST, TICK_MS, "",
      );
      expect(seq.evidence).not.toBeNull();
      expect(seq.evidence!.iconPath).toBe("evidence/badge.png");
    });
  });

  describe("initial effects", () => {
    it("has no effects by default", () => {
      const seq = build(makeArgs());
      expect(seq.initialEffects.screenshake).toBe(false);
      expect(seq.initialEffects.realization).toBe(false);
    });

    it("sets realization from packet", () => {
      const seq = build(makeArgs({ 14: "1" }));
      expect(seq.initialEffects.realization).toBe(true);
    });
  });
});
