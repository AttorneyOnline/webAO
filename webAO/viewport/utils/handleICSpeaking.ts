import { ChatMsg } from "../interfaces/ChatMsg";
import { client } from "../../client";
import { appendICLog } from "../../client/appendICLog";
import { checkCallword } from "../../client/checkCallword";
import setEmote from "../../client/setEmote";
import { AO_HOST } from "../../client/aoHost";
import { SHOUTS } from "../constants/shouts";
import getAnimLength from "../../utils/getAnimLength";
import { setChatbox } from "../../dom/setChatbox";
import { resizeChatbox } from "../../dom/resizeChatbox";
import transparentPng from "../../constants/transparentPng";
import { COLORS } from "../constants/colors";
import mlConfig from "../../utils/aoml";

const attorneyMarkdown = mlConfig(AO_HOST);

export let startFirstTickCheck: boolean;
export const setStartFirstTickCheck = (val: boolean) => {startFirstTickCheck = val}
export let startSecondTickCheck: boolean;
export const setStartSecondTickCheck = (val: boolean) => {startSecondTickCheck = val}
export let startThirdTickCheck: boolean;
export const setStartThirdTickCheck = (val: boolean) => {startThirdTickCheck = val}
/**
 * Sets a new emote.
 * This sets up everything before the tick() loops starts
 * a lot of things can probably be moved here, like starting the shout animation if there is one
 * TODO: the preanim logic, on the other hand, should probably be moved to tick()
 * @param {object} chatmsg the new chat message
 */
export const handle_ic_speaking = async (playerChatMsg: ChatMsg) => {
    client.viewport.setChatmsg(playerChatMsg);
    client.viewport.setTextNow("");
    client.viewport.setSfxPlayed(0);
    client.viewport.setTickTimer(0);
    client.viewport.setAnimating(true);

    startFirstTickCheck = true;
    startSecondTickCheck = false;
    startThirdTickCheck = false;
    let charLayers = document.getElementById("client_char")!;
    let pairLayers = document.getElementById("client_pair_char")!;
    // stop updater
    clearTimeout(client.viewport.updater);

    // stop last sfx from looping any longer
    client.viewport.getSfxAudio().loop = false;

    const fg = <HTMLImageElement>document.getElementById("client_fg");
    const gamewindow = document.getElementById("client_gamewindow")!;
    const waitingBox = document.getElementById("client_chatwaiting")!;

    // Reset CSS animation
    gamewindow.style.animation = "";
    waitingBox.style.opacity = "0";

    const eviBox = document.getElementById("client_evi")!;

    if (client.viewport.getLastEvidence() !== client.viewport.getChatmsg().evidence) {
        eviBox.style.opacity = "0";
        eviBox.style.height = "0%";
    }
    client.viewport.setLastEvidence(client.viewport.getChatmsg().evidence);

    const validSides: string[] = ["def", "pro", "wit"]; // these are for the full view pan, the other positions use 'client_char'
    if (validSides.includes(client.viewport.getChatmsg().side)) {
        charLayers = document.getElementById(`client_${client.viewport.getChatmsg().side}_char`);
        pairLayers = document.getElementById(`client_${client.viewport.getChatmsg().side}_pair_char`);
    }

    const chatContainerBox = document.getElementById("client_chatcontainer")!;
    const nameBoxInner = document.getElementById("client_inner_name")!;
    const chatBoxInner = document.getElementById("client_inner_chat")!;

    const displayname =
        (<HTMLInputElement>document.getElementById("showname")).checked &&
        client.viewport.getChatmsg().showname !== ""
            ? client.viewport.getChatmsg().showname!
            : client.viewport.getChatmsg().nameplate!;

    // Clear out the last message
    chatBoxInner.innerText = client.viewport.getTextNow();
    nameBoxInner.innerText = displayname;

    if (client.viewport.getLastCharacter() !== client.viewport.getChatmsg().name) {
        charLayers.style.opacity = "0";
        pairLayers.style.opacity = "0";
    }

    client.viewport.setLastCharacter(client.viewport.getChatmsg().name);

    appendICLog(client.viewport.getChatmsg().content, client.viewport.getChatmsg().showname, client.viewport.getChatmsg().nameplate);

    checkCallword(client.viewport.getChatmsg().content, client.viewport.getSfxAudio());
    
    setEmote(
        AO_HOST,
        client,
        client.viewport.getChatmsg().name!.toLowerCase(),
        client.viewport.getChatmsg().sprite!,
        "(a)",
        false,
        client.viewport.getChatmsg().side
    );

    if (client.viewport.getChatmsg().other_name) {
        setEmote(
            AO_HOST,
            client,
            client.viewport.getChatmsg().other_name.toLowerCase(),
            client.viewport.getChatmsg().other_emote!,
            "(a)",
            false,
            client.viewport.getChatmsg().side
        );
    }

    // gets which shout shall played
    const shoutSprite = <HTMLImageElement>(
        document.getElementById("client_shout")
    );
    
    const shout = SHOUTS[client.viewport.getChatmsg().objection];
    if (shout) {
        // Hide message box
        chatContainerBox.style.opacity = "0";
        if (client.viewport.getChatmsg().objection === 4) {
            shoutSprite.src = `${AO_HOST}characters/${encodeURI(
                client.viewport.getChatmsg().name!.toLowerCase()
            )}/custom.gif`;
        } else {
            shoutSprite.src = client.resources[shout].src;
            shoutSprite.style.animation = "bubble 700ms steps(10, jump-both)";
        }
        shoutSprite.style.opacity = "1";

        client.viewport.shoutaudio.src = `${AO_HOST}characters/${encodeURI(
            client.viewport.getChatmsg().name.toLowerCase()
        )}/${shout}.opus`;
        client.viewport.shoutaudio.play();
        client.viewport.setShoutTimer(client.resources[shout].duration);
    } else {
        client.viewport.setShoutTimer(0);
    }

    client.viewport.getChatmsg().startpreanim = true;
    let gifLength = 0;

    if (client.viewport.getChatmsg().type === 1 && client.viewport.getChatmsg().preanim !== "-") {
        //we have a preanim
        chatContainerBox.style.opacity = "0";
        
        gifLength = await getAnimLength(
            `${AO_HOST}characters/${encodeURI(
                client.viewport.getChatmsg().name!.toLowerCase()
            )}/${encodeURI(client.viewport.getChatmsg().preanim)}`
        );
        client.viewport.getChatmsg().startspeaking = false;
    } else {
        client.viewport.getChatmsg().startspeaking = true;
        if (client.viewport.getChatmsg().content.trim() !== "") chatContainerBox.style.opacity = "1";
    }
    client.viewport.getChatmsg().preanimdelay = gifLength;
    const setAside = {
        position: client.viewport.getChatmsg().side,
        showSpeedLines: false,
        showDesk: false,
    };
    let skipoffset: boolean = false;
    if (client.viewport.getChatmsg().type === 5) {
        setAside.showSpeedLines = true;
        setAside.showDesk = false;
        client.viewport.set_side(setAside);
    } else {
        switch (Number(client.viewport.getChatmsg().deskmod)) {
            case 0: //desk is hidden
                setAside.showSpeedLines = false;
                setAside.showDesk = false;
                client.viewport.set_side(setAside);
                break;
            case 1: //desk is shown
                setAside.showSpeedLines = false;
                setAside.showDesk = true;
                client.viewport.set_side(setAside);
                break;
            case 2: //desk is hidden during preanim, but shown during idle/talk
                setAside.showSpeedLines = false;
                setAside.showDesk = false;
                client.viewport.set_side(setAside);
                break;
            case 3: //opposite of 2
                setAside.showSpeedLines = false;
                setAside.showDesk = false;
                client.viewport.set_side(setAside);
                break;
            case 4: //desk is hidden, character offset is ignored, pair character is hidden during preanim, normal behavior during idle/talk
                setAside.showSpeedLines = false;
                setAside.showDesk = false;
                client.viewport.set_side(setAside);
                skipoffset = true;
                break;
            case 5: //opposite of 4
                setAside.showSpeedLines = false;
                setAside.showDesk = true;
                client.viewport.set_side(setAside);
                break;
            default:
                setAside.showSpeedLines = false;
                setAside.showDesk = true;
                client.viewport.set_side(setAside);
                break;
        }
    }

    setChatbox(client.viewport.getChatmsg().chatbox);
    resizeChatbox();

    if (!skipoffset) {
        // Flip the character
        charLayers.style.transform =
        client.viewport.getChatmsg().flip === 1 ? "scaleX(-1)" : "scaleX(1)";
        pairLayers.style.transform =
        client.viewport.getChatmsg().other_flip === 1 ? "scaleX(-1)" : "scaleX(1)";

        // Shift by the horizontal offset
        switch (client.viewport.getChatmsg().side) {
            case "wit":
                pairLayers.style.left = `${200 + Number(client.viewport.getChatmsg().other_offset[0])}%`;
                charLayers.style.left = `${200 + Number(client.viewport.getChatmsg().self_offset[0])}%`;
                break;
            case "pro":
                pairLayers.style.left = `${400 + Number(client.viewport.getChatmsg().other_offset[0])}%`;
                charLayers.style.left = `${400 + Number(client.viewport.getChatmsg().self_offset[0])}%`;
                break;
            default:
                pairLayers.style.left = `${Number(client.viewport.getChatmsg().other_offset[0])}%`;
                charLayers.style.left = `${Number(client.viewport.getChatmsg().self_offset[0])}%`;
                break;
        }

        // New vertical offsets
        pairLayers.style.top = `${Number(client.viewport.getChatmsg().other_offset[1])}%`;
        charLayers.style.top = `${Number(client.viewport.getChatmsg().self_offset[1])}%`;
    }

    client.viewport.blipChannels.forEach(
        (channel: HTMLAudioElement) =>
        (channel.src = `${AO_HOST}sounds/blips/${encodeURI(
            client.viewport.getChatmsg().blips.toLowerCase()
        )}.opus`)
    );

    // process markup
    if (client.viewport.getChatmsg().content.startsWith("~~")) {
        chatBoxInner.style.textAlign = "center";
        client.viewport.getChatmsg().content = client.viewport.getChatmsg().content.substring(2, client.viewport.getChatmsg().content.length);
    } else {
        chatBoxInner.style.textAlign = "inherit";
    }

    // apply effects
    fg.style.animation = "";
    const effectName = client.viewport.getChatmsg().effects[0].toLowerCase();
    const badEffects = ["", "-", "none"];
    if (effectName.startsWith("rain")) {
        (<HTMLLinkElement>document.getElementById("effect_css")).href = "styles/effects/rain.css";
        let intensity = 200;
        if (effectName.endsWith("weak")) {
            intensity = 100;
        } else if (effectName.endsWith("strong")) {
            intensity = 400;
        }
        if (intensity < fg.childElementCount)
            fg.innerHTML = '';
        else
            intensity = intensity - fg.childElementCount;

        for (let i = 0; i < intensity; i++) {
            let drop = document.createElement("p");
            drop.style.left = (Math.random() * 100) + "%";
            drop.style.animationDelay = String(Math.random()) + "s";
            fg.appendChild(drop)
        }
    } else if (
        client.viewport.getChatmsg().effects[0] &&
        !badEffects.includes(effectName)
    ) {
        (<HTMLLinkElement>document.getElementById("effect_css")).href = "";
        fg.innerHTML = '';
        const baseEffectUrl = `${AO_HOST}themes/default/effects/`;
        fg.src = `${baseEffectUrl}${encodeURI(effectName)}.webp`;
    } else {
        fg.innerHTML = '';
        fg.src = transparentPng;
    }

    
    charLayers.style.opacity = "1";

    const soundChecks = ["0", "1", "", undefined];
    if (soundChecks.some((check) => client.viewport.getChatmsg().sound === check)) {
        client.viewport.getChatmsg().sound = client.viewport.getChatmsg().effects[2];
    }
    
    try {
        client.viewport.getChatmsg().parsed = await attorneyMarkdown.applyMarkdown(
            client.viewport.getChatmsg().content,
            
            COLORS[client.viewport.getChatmsg().color]
            
        );
    } catch (error) {
        console.warn("markdown failed");
    }
    
    client.viewport.chat_tick();
};