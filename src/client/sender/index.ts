import type { MSPacketServer } from "../../packets/MS";
import { sendIC } from "./sendIC";
import { sendSelf } from "./sendSelf";
import { sendServer } from "./sendServer";
import { sendCheck } from "./sendCheck";
import { sendHP } from "./sendHP";
import { sendOOC } from "./sendOOC";
import { sendCharacter } from "./sendCharacter";
import { sendRT } from "./sendRT";
import { sendMusicChange } from "./sendMusicChange";
import { sendZZ } from "./sendZZ";
import { sendEE } from "./sendEE";
import { sendDE } from "./sendDE";
import { sendPE } from "./sendPE";
import { sendMA } from "./sendMA";
export interface ISender {
  sendIC: (packet: MSPacketServer) => void;
  sendSelf: (message: string) => void;
  sendServer: (message: string) => void;
  sendCheck: () => void;
  sendHP: (side: number, hp: number) => void;
  sendOOC: (message: string) => void;
  sendCharacter: (character: number) => void;
  sendRT: (testimony: string) => void;
  sendMusicChange: (track: string) => void;
  sendZZ: (msg: string, target?: number) => void;
  sendEE: (id: number, name: string, desc: string, img: string) => void;
  sendDE: (id: number) => void;
  sendPE: (name: string, desc: string, img: string) => void;
  sendMA: (id: number, length: number, reason: string) => void;
}
export const sender = {
  sendIC,
  sendSelf,
  sendServer,
  sendCheck,
  sendHP,
  sendOOC,
  sendCharacter,
  sendRT,
  sendMusicChange,
  sendZZ,
  sendEE,
  sendDE,
  sendPE,
  sendMA,
};
