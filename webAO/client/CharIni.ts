import { parse } from "ini";

/** Section of a parsed char.ini file: key-value string pairs */
export type IniSection = Record<string, string>;

/**
 * Parse raw ini text into lowercase-normalized sections.
 * All section names and keys are lowercased. All values are lowercased
 * except "showname" which preserves case (display name).
 */
export function parseCharIni(data: string): Record<string, IniSection> {
  const raw = parse(data);
  const result: Record<string, IniSection> = {};

  for (const section of Object.keys(raw)) {
    const entries = raw[section];
    if (typeof entries !== "object" || entries === null) continue;

    const sectionLower = section.toLowerCase();
    result[sectionLower] = {};

    for (const key of Object.keys(entries)) {
      const keyLower = key.toLowerCase();
      const value = String(entries[key]);
      result[sectionLower][keyLower] =
        keyLower === "showname" ? value : value.toLowerCase();
    }
  }

  return result;
}

/**
 * Character data stored in client.chars[].
 * Initialized with defaults by setupCharacterBasic,
 * enriched from char.ini by ensureCharIni.
 *
 * The options/emotions/soundn/soundt fields are raw ini sections,
 * populated when ensureCharIni loads the char.ini file. Their
 * presence (options !== undefined) indicates the ini has been loaded.
 */
export interface CharIni {
  /** Character folder name */
  name: string;
  /** Display name (from char.ini [Options] showname) */
  showname: string;
  /** Character description */
  desc: string;
  /** Blip sound name */
  blips: string;
  /** Gender (from char.ini [Options] gender) */
  gender: string;
  /** Courtroom position (from char.ini [Options] side) */
  side: string;
  /** Chatbox asset name (from char.ini [Options] chat or category) */
  chat: string;
  /** Evidence capability string */
  evidence: string;
  /** Character icon URL */
  icon: string;
  /** Whether this character is muted by the user */
  muted: boolean;

  // ─── Raw ini sections (populated by ensureCharIni) ───
  /** char.ini [Options] section */
  options?: IniSection;
  /** char.ini [Emotions] section */
  emotions?: IniSection;
  /** char.ini [SoundN] section — sound effect names per emote */
  soundn?: IniSection;
  /** char.ini [SoundT] section — sound effect delays per emote */
  soundt?: IniSection;
}

/** Returns a CharIni with all default values. Pass name/desc to override the identity fields. */
export function defaultCharIni(name: string = "", desc: string = ""): CharIni {
  return {
    name,
    showname: name,
    desc,
    blips: "male",
    gender: "",
    side: "def",
    chat: "",
    evidence: "",
    icon: "",
    muted: false,
  };
}
