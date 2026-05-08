export interface PreloadedAssets {
  /** Resolved URL for idle (a) sprite */
  idleUrl: string;
  /** Resolved URL for talking (b) sprite */
  talkingUrl: string;
  /** Resolved URL for pre-animation sprite (no prefix) */
  preanimUrl: string;
  /** Duration of preanim in ms (0 if no preanim) */
  preanimDuration: number;
  /** Resolved URL for paired character idle (a) sprite */
  pairIdleUrl: string;
  /** Resolved per-character shout SFX URL, or null to use default */
  shoutSfxUrl: string | null;
  /** Resolved shout bubble image URL (per-character override or default), or null if no shout */
  shoutBubbleUrl: string | null;
  /** Resolved emote SFX URL, or null if no sound */
  emoteSfxUrl: string | null;
  /** Resolved realization (flash) SFX URL */
  realizationSfxUrl: string | null;
  /** Resolved stab (screenshake) SFX URL */
  stabSfxUrl: string | null;
}
