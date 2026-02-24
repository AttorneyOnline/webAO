import { parseCharIni } from "../client/CharIni";

const charIniExample = `
[Options]
name = Phoenix
showname = Phoenix Wright
blips = male
gender = male
side = def
chat =
category =

[Emotions]
number = 3
1 = normal#-#normal#0#1
2 = happy#(a)happy#(a)happy#0#1
3 = thinking#-#thinking#5#4

[SoundN]
1 = 0
2 = sfx-shooop
3 = 0

[SoundT]
1 = 0
2 = 100
3 = 0
`;

describe("parseCharIni", () => {
  const sections = parseCharIni(charIniExample);

  it("parses [Options] section with lowercased keys and values", () => {
    expect(sections.options).toBeDefined();
    expect(sections.options.name).toBe("phoenix");
    expect(sections.options.blips).toBe("male");
    expect(sections.options.side).toBe("def");
  });

  it("preserves case for showname", () => {
    expect(sections.options.showname).toBe("Phoenix Wright");
  });

  it("preserves # delimiters in emotion values", () => {
    expect(sections.emotions).toBeDefined();
    expect(sections.emotions.number).toBe("3");
    expect(sections.emotions["1"]).toBe("normal#-#normal#0#1");
    expect(sections.emotions["2"]).toBe("happy#(a)happy#(a)happy#0#1");
    expect(sections.emotions["3"]).toBe("thinking#-#thinking#5#4");
  });

  it("can split emotion values into fields", () => {
    const fields = sections.emotions["1"].split("#");
    expect(fields).toEqual(["normal", "-", "normal", "0", "1"]);
  });

  it("parses [SoundN] and [SoundT] sections", () => {
    expect(sections.soundn).toBeDefined();
    expect(sections.soundn["2"]).toBe("sfx-shooop");
    expect(sections.soundt).toBeDefined();
    expect(sections.soundt["2"]).toBe("100");
  });

  it("handles empty values", () => {
    expect(sections.options.chat).toBe("");
    expect(sections.options.category).toBe("");
  });

  it("handles empty input", () => {
    const result = parseCharIni("");
    expect(result).toEqual({});
  });

  it("ignores comment lines", () => {
    const withComments = `; this is a comment
# this is also a comment
[Options]
name = test
`;
    const result = parseCharIni(withComments);
    expect(result.options.name).toBe("test");
  });
});
