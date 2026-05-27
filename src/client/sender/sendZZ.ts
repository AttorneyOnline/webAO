import { client } from "../../client";
import { ZZ } from "../../packets/types/ZZ";

/**
 * Sends call mod command.
 * @param msg reason for the modcall (empty string sends a reason-less modcall)
 * @param target player id to direct the modcall at, or -1 for any mod.
 *               Pass `undefined` to omit (matches AO2-Client's `ZZ#%` form).
 */
export const sendZZ = (msg: string, target?: number) => {
  client.sender.sendServer(ZZ.encode({ reason: msg, target }));
};
