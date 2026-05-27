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

export type Sender = typeof sender;
