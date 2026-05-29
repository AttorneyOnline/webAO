import { updateActionCommands } from "../dom/updateActionCommands";
import type * as aolib from "../aolib";

/** Apply a side / position change for the local character. */
export const applyCharacterSide = (packet: aolib.Out<typeof aolib.SP>) => {
  updateActionCommands(packet.side);
};
