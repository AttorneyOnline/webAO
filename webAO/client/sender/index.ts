import { sendIC } from "./sendIC";
import { sendSelf } from './sendSelf'
import { sendServer } from './sendServer'
import { sendCheck } from './sendCheck'
import {sendHP} from './sendHP'
import {sendOOC} from './sendOOC'
import {sendCharacter} from './sendCharacter'
import {sendRT} from './sendRT'
import {sendMusicChange} from './sendMusicChange'
import {sendZZ} from './sendZZ'
import {sendEE} from './sendEE'
import {sendDE} from './sendDE'
import {sendPE} from './sendPE'
export interface ISender {
    sendIC: (deskmod: number,
        preanim: string,
        name: string,
        emote: string,
        message: string,
        side: string,
        sfx_name: string,
        emote_modifier: number,
        sfx_delay: number,
        objection_modifier: number,
        evidence: number,
        flip: boolean,
        realization: boolean,
        text_color: number,
        showname: string,
        other_charid: string,
        self_hoffset: number,
        self_yoffset: number,
        noninterrupting_preanim: boolean,
        looping_sfx: boolean,
        screenshake: boolean,
        frame_screenshake: string,
        frame_realization: string,
        frame_sfx: string,
        additive: boolean,
        effect: string) => void
    sendSelf: (message: string) => void
    sendServer: (message: string) => void
    sendCheck: () => void
    sendHP: (side: number, hp: number) => void
    sendOOC: (message: string) => void
    sendCharacter: (character: number) => void
    sendRT: (testimony: string) => void
    sendMusicChange: (track: string) => void
    sendZZ: (msg: string) => void
    sendEE: (id: number, name: string, desc: string, img: string) => void
    sendDE:  (id: number) => void
    sendPE: (name: string, desc: string, img: string) => void
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
    sendPE
}