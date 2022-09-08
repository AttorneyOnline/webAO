import { sendIC } from "./sendIC";
import { sendSelf } from './sendSelf'
import { sendServer } from './sendServer'
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
}
export const sender = {
    sendIC,
    sendSelf,
    sendServer

}