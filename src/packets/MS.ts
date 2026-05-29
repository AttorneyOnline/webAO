import { client } from "../client";
import { handleCharacterInfo, ensureCharIni } from "../client/handleCharacterInfo";
import { resetICParams } from "../client/resetICParams";
import { safeHtmlTags } from "../escaping";
import { handle_ic_speaking } from "../viewport/utils/handleICSpeaking";
import type * as aolib from "../aolib";

/**
 * Handle an in-character chat message broadcast.
 *
 * Gatekeeps (duplicate / iniedit / muted) and then delegates rendering
 * to `handle_ic_speaking`, which owns the viewport state construction
 * from the packet.
 */
export const handleChatMessage = (packet: aolib.Out<typeof aolib.MSBroadcast>) => {
  // duplicate message
  if (packet.message === client.viewport.getChatmsg().content) return;

  const char_id = packet.char_id;
  const char_name = safeHtmlTags(packet.character);

  if (char_id >= 0 && char_id < client.char_list_length) {
    if (client.chars[char_id].name !== char_name) {
      console.info(
        `${client.chars[char_id].name} is iniediting to ${char_name}`,
      );
      handleCharacterInfo([char_name, "iniediter"], char_id);
    } else if (!client.chars[char_id].inifile) {
      // Lazily load char.ini in background so future messages have proper data
      ensureCharIni(char_id);
    }
  }

  if (client.chars[char_id]?.muted) return;

  // our own message appeared, reset the buttons
  if (char_id === client.charID) {
    resetICParams();
  }

  handle_ic_speaking(packet);
};
