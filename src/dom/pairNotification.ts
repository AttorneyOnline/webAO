const PAIR_KEYWORD_RE = /\b(pair|paired|pairing|unpair|unpaired)\b/i;
const PLAYER_ID_RE = /(?:\[|\(|#|id\s*[:=]?\s*)(\d{1,5})\b/gi;
const FLASH_DURATION_MS = 2200;
const HEADER_BADGE_ID = "playerlist_pair_indicator";

/**
 * Inspect an incoming OOC message body for pair-related activity and
 * surface a brief client-side cue (row flash plus header indicator) so
 * the user notices even if they aren't reading the OOC log.
 */
export function flashPairActivity(message: string) {
  if (!message || !PAIR_KEYWORD_RE.test(message)) return;

  let flashedRow = false;
  const seen = new Set<string>();
  PLAYER_ID_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = PLAYER_ID_RE.exec(message)) !== null) {
    const id = match[1];
    if (seen.has(id)) continue;
    seen.add(id);
    const row = document.getElementById(`client_playerlist_entry${id}`);
    if (row) {
      row.classList.remove("pair-flash");
      void (row as HTMLElement).offsetWidth;
      row.classList.add("pair-flash");
      window.setTimeout(() => row.classList.remove("pair-flash"), FLASH_DURATION_MS);
      flashedRow = true;
    }
  }

  showHeaderIndicator(flashedRow);
}

function showHeaderIndicator(rowMatched: boolean) {
  const list = document.getElementById("client_playerlist");
  if (!list) return;

  let badge = document.getElementById(HEADER_BADGE_ID) as HTMLDivElement | null;
  if (!badge) {
    badge = document.createElement("div");
    badge.id = HEADER_BADGE_ID;
    badge.className = "pair-indicator";
    badge.textContent = rowMatched ? "Pair update" : "Pair activity";
    list.parentElement?.insertBefore(badge, list);
  } else {
    badge.textContent = rowMatched ? "Pair update" : "Pair activity";
  }

  badge.classList.remove("pair-indicator-visible");
  void badge.offsetWidth;
  badge.classList.add("pair-indicator-visible");

  window.clearTimeout((badge as any)._pairTimer);
  (badge as any)._pairTimer = window.setTimeout(
    () => badge!.classList.remove("pair-indicator-visible"),
    FLASH_DURATION_MS,
  );
}
