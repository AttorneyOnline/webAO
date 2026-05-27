import { sendCC } from "../../packets/CC";
import { sendCH } from "../../packets/CH";
import { sendCT } from "../../packets/CT";
import { sendDE } from "../../packets/DE";
import { sendEE } from "../../packets/EE";
import { sendHP } from "../../packets/HP";
import { sendMA } from "../../packets/MA";
import { sendMC } from "../../packets/MC";
import { sendPE } from "../../packets/PE";
import { sendRT } from "../../packets/RT";
import { sendZZ } from "../../packets/ZZ";
import { sendIC } from "./sendIC";
import { sendSelf } from "./sendSelf";
import { sendServer } from "./sendServer";

export const sender = {
  sendCC,
  sendCH,
  sendCT,
  sendDE,
  sendEE,
  sendHP,
  sendIC,
  sendMA,
  sendMC,
  sendPE,
  sendRT,
  sendSelf,
  sendServer,
  sendZZ,
};

