/*
 * Glorious webAO
 * made by sD, refactored by oldmud0 and Qubrick
 * credits to aleks for original idea and source
*/

import Fingerprint2 from 'fingerprintjs2';

import { EventEmitter } from 'events';
import {
  escapeChat, encodeChat, prepChat, safe_tags,
} from './encoding.js';

// Load some defaults for the background and evidence dropdowns
import vanilla_character_arr from './characters.js';
import vanilla_music_arr from './music.js';
import vanilla_background_arr from './backgrounds.js';
import vanilla_evidence_arr from './evidence.js';

import chatbox_arr from './styles/chatbox/chatboxes.js';
import iniParse from './iniParse';

const version = process.env.npm_package_version;

let client;
let viewport;

// Get the arguments from the URL bar
const queryDict = {};
location.search.substr(1).split('&').forEach((item) => {
  queryDict[item.split('=')[0]] = item.split('=')[1];
});

const serverIP = queryDict.ip;
let { mode } = queryDict;

// Unless there is an asset URL specified, use the wasabi one
const DEFAULT_HOST = 'http://attorneyoffline.de/base/';
let AO_HOST = queryDict.asset || DEFAULT_HOST;
const THEME = queryDict.theme || 'default';

const UPDATE_INTERVAL = 60;

const transparentPNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
/**
 * Toggles AO1-style loading using paginated music packets for mobile platforms.
 * The old loading uses more smaller packets instead of a single big one,
 * which caused problems on low-memory devices in the past.
 */
let oldLoading = false;

// presettings
const selectedEffect = 0;
let selectedMenu = 1;
let selectedShout = 0;

let extrafeatures = [];

let hdid;
const options = { fonts: { extendedJsFonts: true, userDefinedFonts: ['Ace Attorney', '8bitoperator', 'DINEngschrift'] }, excludes: { userAgent: true, enumerateDevices: true } };

function isLowMemory() {
  if (/webOS|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|PlayStation|Nintendo|Opera Mini/i.test(navigator.userAgent)) {
    oldLoading = true;
  }
}

if (window.requestIdleCallback) {
  requestIdleCallback(() => {
    Fingerprint2.get(options, (components) => {
      hdid = Fingerprint2.x64hash128(components.reduce((a, b) => `${a.value || a}, ${b.value}`), 31);
      client = new Client(serverIP);
      viewport = new Viewport();

      isLowMemory();
      client.loadResources();
    });
  });
} else {
  setTimeout(() => {
    Fingerprint2.get(options, (components) => {
      hdid = Fingerprint2.x64hash128(components.reduce((a, b) => `${a.value || a}, ${b.value}`), 31);
      client = new Client(serverIP);
      viewport = new Viewport();

      isLowMemory();
      client.loadResources();
    });
  }, 500);
}

let lastICMessageTime = new Date(0);

class Client extends EventEmitter {
  constructor(address) {
    super();
    console.log(`mode: ${mode}`);
    if (mode !== 'replay') {
      this.serv = new WebSocket(`ws://${address}`);
      // Assign the websocket events
      this.serv.addEventListener('open', this.emit.bind(this, 'open'));
      this.serv.addEventListener('close', this.emit.bind(this, 'close'));
      this.serv.addEventListener('message', this.emit.bind(this, 'message'));
      this.serv.addEventListener('error', this.emit.bind(this, 'error'));
    } else {
      this.joinServer();
    }

    this.on('open', this.onOpen.bind(this));
    this.on('close', this.onClose.bind(this));
    this.on('message', this.onMessage.bind(this));
    this.on('error', this.onError.bind(this));

    // Preset some of the variables

    this.hp = [0, 0];

    this.playerID = 1;
    this.charID = -1;
    this.char_list_length = 0;
    this.evidence_list_length = 0;
    this.music_list_length = 0;
    this.testimonyID = 0;

    this.chars = [];
    this.emotes = [];
    this.evidences = [];
    this.areas = [];
    this.musics = [];

    this.musics_time = false;

    this.callwords = [];

    this.banned = false;

    this.resources = {
      holdit: {
        src: `${AO_HOST}misc/default/holdit_bubble.png`,
        duration: 720,
      },
      objection: {
        src: `${AO_HOST}misc/default/objection_bubble.png`,
        duration: 720,
      },
      takethat: {
        src: `${AO_HOST}misc/default/takethat_bubble.png`,
        duration: 840,
      },
      custom: {
        src: '',
        duration: 840,
      },
      witnesstestimony: {
        src: `${AO_HOST}themes/${THEME}/witnesstestimony.gif`,
        duration: 1560,
        sfx: `${AO_HOST}sounds/general/sfx-testimony.opus`,
      },
      crossexamination: {
        src: `${AO_HOST}themes/${THEME}/crossexamination.gif`,
        duration: 1600,
        sfx: `${AO_HOST}sounds/general/sfx-testimony2.opus`,
      },
      guilty: {
        src: `${AO_HOST}themes/${THEME}/guilty.gif`,
        duration: 2870,
        sfx: `${AO_HOST}sounds/general/sfx-guilty.opus`,
      },
      notguilty: {
        src: `${AO_HOST}themes/${THEME}/notguilty.gif`,
        duration: 2440,
        sfx: `${AO_HOST}sounds/general/sfx-notguilty.opus`,
      },
    };

    this.selectedEmote = -1;
    this.selectedEvidence = 0;

    this.checkUpdater = null;

    /**
		 * Assign handlers for all commands
		 * If you implement a new command, you need to add it here
		 */
    this.on('MS', this.handleMS.bind(this));
    this.on('CT', this.handleCT.bind(this));
    this.on('MC', this.handleMC.bind(this));
    this.on('RMC', this.handleRMC.bind(this));
    this.on('CI', this.handleCI.bind(this));
    this.on('SC', this.handleSC.bind(this));
    this.on('EI', this.handleEI.bind(this));
    this.on('FL', this.handleFL.bind(this));
    this.on('LE', this.handleLE.bind(this));
    this.on('EM', this.handleEM.bind(this));
    this.on('FM', this.handleFM.bind(this));
    this.on('FA', this.handleFA.bind(this));
    this.on('SM', this.handleSM.bind(this));
    this.on('MM', this.handleMM.bind(this));
    this.on('BD', this.handleBD.bind(this));
    this.on('BB', this.handleBB.bind(this));
    this.on('KB', this.handleKB.bind(this));
    this.on('KK', this.handleKK.bind(this));
    this.on('DONE', this.handleDONE.bind(this));
    this.on('BN', this.handleBN.bind(this));
    this.on('HP', this.handleHP.bind(this));
    this.on('RT', this.handleRT.bind(this));
    this.on('TI', this.handleTI.bind(this));
    this.on('ZZ', this.handleZZ.bind(this));
    this.on('HI', this.handleHI.bind(this));
    this.on('ID', this.handleID.bind(this));
    this.on('PN', this.handlePN.bind(this));
    this.on('SI', this.handleSI.bind(this));
    this.on('ARUP', this.handleARUP.bind(this));
    this.on('askchaa', this.handleaskchaa.bind(this));
    this.on('CC', this.handleCC.bind(this));
    this.on('RC', this.handleRC.bind(this));
    this.on('RM', this.handleRM.bind(this));
    this.on('RD', this.handleRD.bind(this));
    this.on('CharsCheck', this.handleCharsCheck.bind(this));
    this.on('PV', this.handlePV.bind(this));
    this.on('ASS', this.handleASS.bind(this));
    this.on('CHECK', () => { });
    this.on('CH', () => { });

    this._lastTimeICReceived = new Date(0);
  }

  /**
	 * Gets the current player's character.
	 */
  get character() {
    return this.chars[this.charID];
  }

  /**
	 * Gets the player's currently selected emote.
	 */
  get emote() {
    return this.emotes[this.selectedEmote];
  }

  /**
	 * Gets the current evidence ID unless the player doesn't want to present any evidence
	 */
  get evidence() {
    return (document.getElementById('button_present').classList.contains('dark')) ? this.selectedEvidence : 0;
  }

  /**
	 * Hook for sending messages to the server
	 * @param {string} message the message to send
	 */
  sendServer(message) {
    console.debug(`C: ${message}`);
    if (mode === 'replay') {
      this.sendSelf(message);
    } else {
      this.serv.send(message);
    }
  }

  /**
	 * Hook for sending messages to the client
	 * @param {string} message the message to send
	 */
  handleSelf(message) {
    const message_event = new MessageEvent('websocket', { data: message });
    setTimeout(() => this.onMessage(message_event), 1);
  }

  /**
	 * Hook for sending messages to the client
	 * @param {string} message the message to send
	 */
  sendSelf(message) {
    document.getElementById('client_ooclog').value += `${message}\r\n`;
    this.handleSelf(message);
  }

  /**
	 * Sends an out-of-character chat message.
	 * @param {string} message the message to send
	 */
  sendOOC(message) {
    setCookie('OOC_name', document.getElementById('OOC_name').value);
    this.sendServer(`CT#${escapeChat(encodeChat(document.getElementById('OOC_name').value))}#${escapeChat(encodeChat(message))}#%`);
  }

  /**
	 * Sends an in-character chat message.
	 * @param {string} deskmod currently unused
	 * @param {string} speaking who is speaking
	 * @param {string} name the name of the current character
	 * @param {string} silent whether or not it's silent
	 * @param {string} message the message to be sent
	 * @param {string} side the name of the side in the background
	 * @param {string} sfx_name the name of the sound effect
	 * @param {string} emote_modifier whether or not to zoom
	 * @param {number} sfx_delay the delay (in milliseconds) to play the sound effect
	 * @param {string} objection_modifier the number of the shout to play
	 * @param {string} evidence the filename of evidence to show
	 * @param {number} flip change to 1 to reverse sprite for position changes
	 * @param {number} realization screen flash effect
	 * @param {number} text_color text color
	 * @param {string} showname custom name to be displayed (optional)
	 * @param {number} other_charid paired character (optional)
	 * @param {number} self_offset offset to paired character (optional)
	 * @param {number} noninterrupting_preanim play the full preanim (optional)
	 */
  sendIC(
    deskmod,
    preanim,
    name,
    emote,
    message,
    side,
    sfx_name,
    emote_modifier,
    sfx_delay,
    objection_modifier,
    evidence,
    flip,
    realization,
    text_color,
    showname,
    other_charid,
    self_hoffset,
    self_yoffset,
    noninterrupting_preanim,
    looping_sfx,
    screenshake,
    frame_screenshake,
    frame_realization,
    frame_sfx,
    additive,
    effect,
  ) {
    let extra_cccc = '';
    let other_emote = '';
    let other_offset = '';
    let extra_27 = '';
    let extra_28 = '';

    if (extrafeatures.includes('cccc_ic_support')) {
      const self_offset = extrafeatures.includes('y_offset') ? `${self_hoffset}<and>${self_yoffset}` : self_hoffset;	// HACK: this should be an & but client fucked it up and all the servers adopted it
      if (mode === 'replay') {
        other_emote = '##';
		    	other_offset = '#0#0';
      }
      extra_cccc = `${showname}#${other_charid}${other_emote}#${self_offset}${other_offset}#${noninterrupting_preanim}#`;

      if (extrafeatures.includes('looping_sfx')) {
        extra_27 = `${looping_sfx}#${screenshake}#${frame_screenshake}#${frame_realization}#${frame_sfx}#`;
        if (extrafeatures.includes('effects')) {
          extra_28 = `${additive}#${effect}#`;
        }
      }
    }

    const serverMessage = `MS#${deskmod}#${preanim}#${name}#${emote}`
			+ `#${escapeChat(encodeChat(message))}#${side}#${sfx_name}#${emote_modifier}`
			+ `#${this.charID}#${sfx_delay}#${objection_modifier}#${evidence}#${flip}#${realization}#${text_color}#${extra_cccc}${extra_27}${extra_28}%`;

    this.sendServer(serverMessage);
    if (mode === 'replay') {
      document.getElementById('client_ooclog').value += `wait#${document.getElementById('client_replaytimer').value}#%\r\n`;
    }
  }

  /**
	 * Sends add evidence command.
	 * @param {string} evidence name
	 * @param {string} evidence description
	 * @param {string} evidence image filename
	 */
  sendPE(name, desc, img) {
    this.sendServer(`PE#${escapeChat(encodeChat(name))}#${escapeChat(encodeChat(desc))}#${img}#%`);
  }

  /**
	 * Sends edit evidence command.
	 * @param {number} evidence id
	 * @param {string} evidence name
	 * @param {string} evidence description
	 * @param {string} evidence image filename
	 */
  sendEE(id, name, desc, img) {
    this.sendServer(`EE#${id}#${escapeChat(encodeChat(name))}#${escapeChat(encodeChat(desc))}#${img}#%`);
  }

  /**
	 * Sends delete evidence command.
	 * @param {number} evidence id
	 */
  sendDE(id) {
    this.sendServer(`DE#${id}#%`);
  }

  /**
	 * Sends health point command.
	 * @param {number} side the position
	 * @param {number} hp the health point
	 */
  sendHP(side, hp) {
    this.sendServer(`HP#${side}#${hp}#%`);
  }

  /**
	 * Sends call mod command.
	 * @param {string} message to mod
	 */
  sendZZ(msg) {
    if (extrafeatures.includes('modcall_reason')) {
      this.sendServer(`ZZ#${msg}#%`);
    } else {
      this.sendServer('ZZ#%');
    }
  }

  /**
	 * Sends testimony command.
	 * @param {string} testimony type
	 */
  sendRT(testimony) {
    if (this.chars[this.charID].side === 'jud') {
      this.sendServer(`RT#${testimony}#%`);
    }
  }

  /**
	 * Requests to change the music to the specified track.
	 * @param {string} track the track ID
	 */
  sendMusicChange(track) {
    this.sendServer(`MC#${track}#${this.charID}#%`);
  }

  /**
	 * Begins the handshake process by sending an identifier
	 * to the server.
	 */
  joinServer() {
    console.log(`Your emulated HDID is ${hdid}`);

    this.sendServer(`HI#${hdid}#%`);
    this.sendServer('ID#webAO#webAO#%');
    if (mode !== 'replay') { this.checkUpdater = setInterval(() => this.sendCheck(), 5000); }
  }

  /**
	 * Load game resources and stored settings.
	 */
  loadResources() {
    document.getElementById('client_version').innerText = `version ${version}`;

    // Load background array to select
    const background_select = document.getElementById('bg_select');
    background_select.add(new Option('Custom', 0));
    vanilla_background_arr.forEach((background) => {
      background_select.add(new Option(background));
    });

    // Load evidence array to select
    const evidence_select = document.getElementById('evi_select');
    evidence_select.add(new Option('Custom', 0));
    vanilla_evidence_arr.forEach((evidence) => {
      evidence_select.add(new Option(evidence));
    });

    // Read cookies and set the UI to its values
    document.getElementById('OOC_name').value = getCookie('OOC_name') || `web${parseInt(Math.random() * 100 + 10)}`;

    // Read cookies and set the UI to its values
    const cookietheme = getCookie('theme') || 'default';

    document.querySelector(`#client_themeselect [value="${cookietheme}"]`).selected = true;
    reloadTheme();

    const cookiechatbox = getCookie('chatbox') || 'dynamic';

    document.querySelector(`#client_chatboxselect [value="${cookiechatbox}"]`).selected = true;
    setChatbox(cookiechatbox);

    document.getElementById('client_mvolume').value = getCookie('musicVolume') || 1;
    changeMusicVolume();
    document.getElementById('client_sfxaudio').volume = getCookie('sfxVolume') || 1;
    changeSFXVolume();
    document.getElementById('client_shoutaudio').volume = getCookie('shoutVolume') || 1;
    changeShoutVolume();
    document.getElementById('client_testimonyaudio').volume = getCookie('testimonyVolume') || 1;
    changeTestimonyVolume();
    document.getElementById('client_bvolume').value = getCookie('blipVolume') || 1;
    changeBlipVolume();

    document.getElementById('ic_chat_name').value = getCookie('ic_chat_name');
    document.getElementById('showname').checked = getCookie('showname');
    showname_click();

    document.getElementById('client_callwords').value = getCookie('callwords');
  }

  /**
	 * Requests to play as a specified character.
	 * @param {number} character the character ID
	 */
  sendCharacter(character) {
    if (this.chars[character].name) { this.sendServer(`CC#${this.playerID}#${character}#web#%`); }
  }

  /**
	 * Requests to select a music track.
	 * @param {number?} song the song to be played
	 */
  sendMusic(song) {
    this.sendServer(`MC#${song}#${this.charID}#%`);
  }

  /**
	 * Sends a keepalive packet.
	 */
  sendCheck() {
    this.sendServer(`CH#${this.charID}#%`);
  }

  /**
	 * Triggered when a connection is established to the server.
	 */
  onOpen(_e) {
    client.joinServer();
  }

  /**
	 * Triggered when the connection to the server closes.
	 * @param {CloseEvent} e
	 */
  onClose(e) {
    console.error(`The connection was closed: ${e.reason} (${e.code})`);
    if (extrafeatures.length == 0 && this.banned === false) {
      document.getElementById('client_errortext').textContent = 'Could not connect to the server';
    }
    document.getElementById('client_error').style.display = 'flex';
    document.getElementById('client_loading').style.display = 'none';
    document.getElementById('error_id').textContent = e.code;
    this.cleanup();
  }

  /**
	 * Triggered when a packet is received from the server.
	 * @param {MessageEvent} e
	 */
  onMessage(e) {
    const msg = e.data;
    console.debug(`S: ${msg}`);

    const lines = msg.split('%');

    for (const msg of lines) {
      if (msg === '') { break; }

      const args = msg.split('#');
      const header = args[0];

      if (!this.emit(header, args)) {
        console.warn(`Invalid packet header ${header}`);
      }
    }
  }

  /**
	 * Triggered when an network error occurs.
	 * @param {ErrorEvent} e
	 */
  onError(e) {
    console.error(`A network error occurred: ${e.reason} (${e.code})`);
    document.getElementById('client_error').style.display = 'flex';
    document.getElementById('error_id').textContent = e.code;
    this.cleanup();
  }

  /**
	 * Stop sending keepalives to the server.
	 */
  cleanup() {
    clearInterval(this.checkUpdater);

    // the connection got rekt, get rid of the old musiclist
    this.resetMusicList();
    document.getElementById('client_chartable').innerHTML = '';
  }

  /**
	 * Parse the lines in the OOC and play them
	 * @param {*} args packet arguments
	 */
  handleReplay() {
    const ooclog = document.getElementById('client_ooclog');
    const rawLog = false;
    let rtime = document.getElementById('client_replaytimer').value;

    const clines = ooclog.value.split(/\r?\n/);
    if (clines[0]) {
      const currentLine = String(clines[0]);
      this.handleSelf(currentLine);
      ooclog.value = clines.slice(1).join('\r\n');
      if (currentLine.substr(0, 4) === 'wait' && rawLog === false) {
        rtime = currentLine.split('#')[1];
      } else if (currentLine.substr(0, 2) !== 'MS') {
        rtime = 0;
      }

      setTimeout(() => onReplayGo(''), rtime);
    }
  }

  /**
	 * Handles an in-character chat message.
	 * @param {*} args packet arguments
	 */
  handleMS(args) {
    // TODO: this if-statement might be a bug.
    if (args[4] !== viewport.chatmsg.content) {
      document.getElementById('client_inner_chat').innerHTML = '';

      const char_id = Number(args[9]);
      const char_name = safe_tags(args[3]);

      let msg_nameplate = args[3];
      let msg_blips = 'male';
      let char_chatbox = 'default';
      let char_muted = false;

      try {
        msg_nameplate = this.chars[char_id].showname;
        msg_blips = this.chars[char_id].blips;
        char_chatbox = this.chars[char_id].chat;
        char_muted = this.chars[char_id].muted;

        if (this.chars[char_id].name !== char_name) {
          console.info(`${this.chars[char_id].name} is iniediting to ${char_name}`);
          const chargs = (`${char_name}&` + 'iniediter').split('&');
          this.handleCharacterInfo(chargs, char_id);
        }
      } catch (e) {
        msg_nameplate = args[3];
        msg_blips = 'male';
        char_chatbox = 'default';
        char_muted = false;
        console.error("we're still missing some character data");
      }

      if (char_muted === false) {
        let chatmsg = {
          deskmod: safe_tags(args[1]).toLowerCase(),
          preanim: safe_tags(args[2]).toLowerCase(), // get preanim
          nameplate: msg_nameplate,
          chatbox: char_chatbox,
          name: char_name,
          sprite: safe_tags(args[4]).toLowerCase(),
          content: prepChat(args[5]), // Escape HTML tags
          side: args[6].toLowerCase(),
          sound: safe_tags(args[7]).toLowerCase(),
          blips: safe_tags(msg_blips),
          type: Number(args[8]),
          charid: char_id,
          snddelay: Number(args[10]),
          objection: Number(args[11]),
          evidence: safe_tags(args[12]),
          flip: Number(args[13]),
          flash: Number(args[14]),
          color: Number(args[15]),
        };

        if (extrafeatures.includes('cccc_ic_support')) {
          const extra_cccc = {
            showname: safe_tags(args[16]),
            other_charid: Number(args[17]),
            other_name: safe_tags(args[18]),
            other_emote: safe_tags(args[19]),
            self_offset: args[20].split('<and>'), // HACK: here as well, client is fucked and uses this instead of &
            other_offset: args[21].split('<and>'),
            other_flip: Number(args[22]),
            noninterrupting_preanim: Number(args[23]),
          };
          chatmsg = Object.assign(extra_cccc, chatmsg);

          if (extrafeatures.includes('looping_sfx')) {
            const extra_27 = {
              looping_sfx: Number(args[24]),
              screenshake: Number(args[25]),
              frame_screenshake: safe_tags(args[26]),
              frame_realization: safe_tags(args[27]),
              frame_sfx: safe_tags(args[28]),
            };
            chatmsg = Object.assign(extra_27, chatmsg);

            if (extrafeatures.includes('effects')) {
              const extra_28 = {
                additive: Number(args[29]),
                effects: args[30].split('|'),
              };
              chatmsg = Object.assign(extra_28, chatmsg);
            } else {
              const extra_28 = {
                additive: 0,
                effects: ['', '', ''],
              };
              chatmsg = Object.assign(extra_28, chatmsg);
            }
          } else {
            const extra_27 = {
              looping_sfx: 0,
              screenshake: 0,
              frame_screenshake: '',
              frame_realization: '',
              frame_sfx: '',
            };
            chatmsg = Object.assign(extra_27, chatmsg);
            const extra_28 = {
              additive: 0,
              effects: ['', '', ''],
            };
            chatmsg = Object.assign(extra_28, chatmsg);
          }
        } else {
          const extra_cccc = {
            showname: '',
            other_charid: 0,
            other_name: '',
            other_emote: '',
            self_offset: [0, 0],
            other_offset: [0, 0],
            other_flip: 0,
            noninterrupting_preanim: 0,
          };
          chatmsg = Object.assign(extra_cccc, chatmsg);
          const extra_27 = {
            looping_sfx: 0,
            screenshake: 0,
            frame_screenshake: '',
            frame_realization: '',
            frame_sfx: '',
          };
          chatmsg = Object.assign(extra_27, chatmsg);
          const extra_28 = {
            additive: 0,
            effects: ['', '', ''],
          };
          chatmsg = Object.assign(extra_28, chatmsg);
        }

        // our own message appeared, reset the buttons
        if (chatmsg.charid === this.charID) {
          resetICParams();
        }

        viewport.say(chatmsg); // no await
      }
    }
  }

  /**
	 * Handles an out-of-character chat message.
	 * @param {Array} args packet arguments
	 */
  handleCT(args) {
    if (mode !== 'replay') {
      const oocLog = document.getElementById('client_ooclog');
      oocLog.innerHTML += `${prepChat(args[1])}: ${prepChat(args[2])}\r\n`;
      if (oocLog.scrollTop > oocLog.scrollHeight - 600) {
        oocLog.scrollTop = oocLog.scrollHeight;
      }
    }
  }

  /**
	 * Handles a music change to an arbitrary resource.
	 * @param {Array} args packet arguments
	 */
  handleMC(args) {
    const track = prepChat(args[1]);
    let charID = Number(args[2]);
    const showname = args[3] || '';
    const looping = Boolean(args[4]);
    const channel = Number(args[5]) || 0;
    // const fading = Number(args[6]) || 0; // unused in web

    const music = viewport.music[channel];
    let musicname;
    music.pause();
    if (track.startsWith('http')) {
      music.src = track;
    } else {
      music.src = `${AO_HOST}sounds/music/${encodeURI(track.toLowerCase())}`;
    }
    music.loop = looping;
    music.play();

    try {
      musicname = this.chars[charID].name;
    } catch (e) {
      charID = -1;
    }

    if (charID >= 0) {
      musicname = this.chars[charID].name;
      appendICLog(`${musicname} changed music to ${track}`);
    } else {
      appendICLog(`The music was changed to ${track}`);
    }

    document.getElementById('client_trackstatustext').innerText = track;
  }

  /**
	 * Handles a music change to an arbitrary resource, with an offset in seconds.
	 * @param {Array} args packet arguments
	 */
  handleRMC(args) {
    viewport.music.pause();
    const { music } = viewport;
    // Music offset + drift from song loading
    music.totime = args[1];
    music.offset = new Date().getTime() / 1000;
    music.addEventListener('loadedmetadata', () => {
      music.currentTime += parseFloat(music.totime + (new Date().getTime() / 1000 - music.offset)).toFixed(3);
      music.play();
    }, false);
  }

  /**
	 * Handles the incoming character information, and downloads the sprite + ini for it
	 * @param {Array} chargs packet arguments
	 * @param {Number} charid character ID
	 */
  async handleCharacterInfo(chargs, charid) {
    if (chargs[0]) {
      let cini = {};
      const cswap = {};
      const icon = `${AO_HOST}characters/${encodeURI(chargs[0].toLowerCase())}/char_icon.png`;
      const img = document.getElementById(`demo_${charid}`);
      img.alt = chargs[0];
      img.src = icon;	// seems like a good time to load the icon

      // If the ini doesn't exist on the server this will throw an error
      try {
        const cinidata = await request(`${AO_HOST}characters/${encodeURI(chargs[0].toLowerCase())}/char.ini`);
        cini = iniParse(cinidata);
      } catch (err) {
        cini = {};
        img.classList.add('noini');
        console.warn(`character ${chargs[0]} is missing from webAO`);
        // If it does, give the user a visual indication that the character is unusable
      }

      const mute_select = document.getElementById('mute_select');
      mute_select.add(new Option(safe_tags(chargs[0]), charid));
      const pair_select = document.getElementById('pair_select');
      pair_select.add(new Option(safe_tags(chargs[0]), charid));

      // sometimes ini files lack important settings
      const default_options = {
        name: chargs[0],
        showname: chargs[0],
        side: 'def',
        blips: 'male',
        chat: '',
        category: '',
      };
      cini.options = Object.assign(default_options, cini.options);

      // sometimes ini files lack important settings
      const default_emotions = {
        number: 0,
      };
      cini.emotions = Object.assign(default_emotions, cini.emotions);

      this.chars[charid] = {
        name: safe_tags(chargs[0]),
        showname: safe_tags(cini.options.showname),
        desc: safe_tags(chargs[1]),
        blips: safe_tags(cini.options.blips).toLowerCase(),
        gender: safe_tags(cini.options.gender).toLowerCase(),
        side: safe_tags(cini.options.side).toLowerCase(),
        chat: (cini.options.chat === '') ? safe_tags(cini.options.chat).toLowerCase() : safe_tags(cini.options.category).toLowerCase(),
        evidence: chargs[3],
        icon,
        inifile: cini,
        muted: false,
      };

      if (this.chars[charid].blips === '') { this.chars[charid].blips = this.chars[charid].gender; }

      const iniedit_select = document.getElementById('client_ininame');
      iniedit_select.add(new Option(safe_tags(chargs[0])));
    } else {
      console.warn(`missing charid ${charid}`);
      const img = document.getElementById(`demo_${charid}`);
      img.style.display = 'none';
    }
  }

  /**
	 * Handles incoming character information, bundling multiple characters
	 * per packet.
	 * CI#0#Phoenix&description&&&&&#1#Miles ...
	 * @param {Array} args packet arguments
	 */
  handleCI(args) {
    // Loop through the 10 characters that were sent
    for (let i = 2; i <= args.length - 2; i++) {
      if (i % 2 === 0) {
        document.getElementById('client_loadingtext').innerHTML = `Loading Character ${args[1]}/${this.char_list_length}`;
        const chargs = args[i].split('&');
        const charid = args[i - 1];
        setTimeout(() => this.handleCharacterInfo(chargs, charid), charid * 10);
      }
    }
    // Request the next pack
    this.sendServer(`AN#${(args[1] / 10) + 1}#%`);
  }

  /**
	 * Handles incoming character information, containing all characters
	 * in one packet.
	 * @param {Array} args packet arguments
	 */
  handleSC(args) {
    document.getElementById('client_loadingtext').innerHTML = 'Loading Characters';
    for (let i = 1; i < args.length; i++) {
      document.getElementById('client_loadingtext').innerHTML = `Loading Character ${i}/${this.char_list_length}`;
      const chargs = args[i].split('&');
      const charid = i - 1;
      setTimeout(() => this.handleCharacterInfo(chargs, charid), charid * 10);
    }
    // We're done with the characters, request the music
    this.sendServer('RM#%');
  }

  /**
	 * Handles incoming evidence information, containing only one evidence
	 * item per packet.
	 *
	 * Mostly unimplemented in webAO.
	 * @param {Array} args packet arguments
	 */
  handleEI(args) {
    document.getElementById('client_loadingtext').innerHTML = `Loading Evidence ${args[1]}/${this.evidence_list_length}`;
    this.sendServer('RM#%');
  }

  /**
	 * Handles incoming evidence list, all evidences at once
	 * item per packet.
	 *
	 * @param {Array} args packet arguments
	 */
  handleLE(args) {
    this.evidences = [];
    for (let i = 1; i < args.length - 1; i++) {
      const arg = args[i].split('&');
      this.evidences[i - 1] = {
        name: prepChat(arg[0]),
        desc: prepChat(arg[1]),
        filename: safe_tags(arg[2]),
        icon: `${AO_HOST}evidence/${encodeURI(arg[2].toLowerCase())}`,
      };
    }

    const evidence_box = document.getElementById('evidences');
    evidence_box.innerHTML = '';
    for (let i = 1; i <= this.evidences.length; i++) {
      evidence_box.innerHTML += `<img src="${this.evidences[i - 1].icon}" 
				id="evi_${i}" 
				alt="${this.evidences[i - 1].name}"
				class="evi_icon"
				onclick="pickEvidence(${i})">`;
    }
  }

  resetMusicList() {
    this.musics = [];
    document.getElementById('client_musiclist').innerHTML = '';
  }

  resetAreaList() {
    this.areas = [];
    document.getElementById('areas').innerHTML = '';

    this.fetchBackgroundList();
    this.fetchEvidenceList();
  }

  async fetchBackgroundList() {
    try {
      const bgdata = await request(`${AO_HOST}backgrounds.json`);
      const bg_array = JSON.parse(bgdata);
      // the try catch will fail before here when there is no file

      const bg_select = document.getElementById('bg_select');
      bg_select.innerHTML = '';

      bg_select.add(new Option('Custom', 0));
      bg_array.forEach((background) => {
        bg_select.add(new Option(background));
      });
    } catch (err) {
      console.warn('there was no backgrounds.json file');
    }
  }

  async fetchCharacterList() {
    try {
      const chardata = await request(`${AO_HOST}characters.json`);
      const char_array = JSON.parse(chardata);
      // the try catch will fail before here when there is no file

      const char_select = document.getElementById('client_ininame');
      char_select.innerHTML = '';

      char_array.forEach((character) => {
        char_select.add(new Option(character));
      });
    } catch (err) {
      console.warn('there was no characters.json file');
    }
  }

  async fetchEvidenceList() {
    try {
      const evidata = await request(`${AO_HOST}evidence.json`);
      const evi_array = JSON.parse(evidata);
      // the try catch will fail before here when there is no file

      const evi_select = document.getElementById('evi_select');
      evi_select.innerHTML = '';

      evi_array.forEach((evi) => {
        evi_select.add(new Option(evi));
      });
      evidence_select.add(new Option('Custom', 0));
    } catch (err) {
      console.warn('there was no evidence.json file');
    }
  }

  isAudio(trackname) {
    if (trackname.endsWith('.wav')
            || trackname.endsWith('.mp3')
            || trackname.endsWith('.mp4')
            || trackname.endsWith('.ogg')
            || trackname.endsWith('.opus')) // NOT category markers
    {
      return true;
    }
    return false;
  }

  addTrack(trackname) {
    const newentry = document.createElement('OPTION');
    newentry.text = trackname;
    document.getElementById('client_musiclist').options.add(newentry);
    this.musics.push(trackname);
  }

  createArea(id, name) {
    const thisarea = {
      name,
      players: 0,
      status: 'IDLE',
      cm: '',
      locked: 'FREE',
    };

    this.areas.push(thisarea);

    // Create area button
    const newarea = document.createElement('SPAN');
    newarea.classList = 'area-button area-default';
    newarea.id = `area${id}`;
    newarea.innerText = thisarea.name;
    newarea.title = `Players: ${thisarea.players}\n`
						+ `Status: ${thisarea.status}\n`
						+ `CM: ${thisarea.cm}\n`
						+ `Area lock: ${thisarea.locked}`;
    newarea.onclick = function () {
      area_click(this);
    };

    document.getElementById('areas').appendChild(newarea);
  }

  /**
	 * Area list fuckery
	 */
  fix_last_area() {
    if (this.areas.length > 0) {
      const malplaced = this.areas.pop().name;
      const areas = document.getElementById('areas');
      areas.removeChild(areas.lastChild);
      this.addTrack(malplaced);
    }
  }

  /**
	 * Handles incoming music information, containing multiple entries
	 * per packet.
	 * @param {Array} args packet arguments
	 */
  handleEM(args) {
    document.getElementById('client_loadingtext').innerHTML = 'Loading Music';
    if (args[1] === '0') {
      this.resetMusicList();
      this.resetAreaList();
      this.musics_time = false;
    }

    for (let i = 2; i < args.length - 1; i++) {
      if (i % 2 === 0) {
        document.getElementById('client_loadingtext').innerHTML = `Loading Music ${args[1]}/${this.music_list_length}`;
        const trackname = safe_tags(args[i]);
        const trackindex = args[i - 1];
        if (this.musics_time) {
                	this.addTrack(trackname);
            	} else if (this.isAudio(trackname)) {
                	this.musics_time = true;
                	this.fix_last_area();
                	this.addTrack(trackname);
            	} else {
                	this.createArea(trackindex, trackname);
            	}
      }
    }

    // get the next batch of tracks
    this.sendServer(`AM#${(args[1] / 10) + 1}#%`);
  }

  /**
	 * Handles incoming music information, containing all music in one packet.
	 * @param {Array} args packet arguments
	 */
  handleSM(args) {
    document.getElementById('client_loadingtext').innerHTML = 'Loading Music ';
    this.resetMusicList();
    this.resetAreaList();

    this.musics_time = false;

    for (let i = 1; i < args.length - 1; i++) {
      // Check when found the song for the first time
      const trackname = safe_tags(args[i]);
      const trackindex = i - 1;
      document.getElementById('client_loadingtext').innerHTML = `Loading Music ${i}/${this.music_list_length}`;
      if (this.musics_time) {
        this.addTrack(trackname);
      } else if (this.isAudio(trackname)) {
        this.musics_time = true;
        this.fix_last_area();
        this.addTrack(trackname);
      } else {
        this.createArea(trackindex, trackname);
      }
    }

    // Music done, carry on
    this.sendServer('RD#%');
  }

  /**
	 * Handles updated music list
	 * @param {Array} args packet arguments
	 */
  handleFM(args) {
    this.resetMusicList();

    for (let i = 1; i < args.length - 1; i++) {
      // Check when found the song for the first time
      this.addTrack(safe_tags(args[i]));
    }
  }

  /**
	 * Handles updated area list
	 * @param {Array} args packet arguments
	 */
  handleFA(args) {
    this.resetAreaList();

    for (let i = 1; i < args.length - 1; i++) {
      this.createArea(i - 1, safe_tags(args[i]));
    }
  }

  /**
	 * Handles the "MusicMode" packet
	 * @param {Array} args packet arguments
	 */
  handleMM(_args) {
    // It's unused nowadays, as preventing people from changing the music is now serverside
  }

  /**
	 * Handles the kicked packet
	 * @param {String} type is it a kick or a ban
	 * @param {String} reason why
	 */
  handleBans(type, reason) {
    document.getElementById('client_error').style.display = 'flex';
    document.getElementById('client_errortext').innerHTML = `${type}:<br>${reason.replace(/\n/g, '<br />')}`;
    document.getElementsByClassName('client_reconnect')[0].style.display = 'none';
    document.getElementsByClassName('client_reconnect')[1].style.display = 'none';
  }

  /**
	 * Handles the kicked packet
	 * @param {Array} args kick reason
	 */
  handleKK(args) {
    this.handleBans('Kicked', safe_tags(args[1]));
  }

  /**
	 * Handles the banned packet
	 * this one is sent when you are kicked off the server
	 * @param {Array} args ban reason
	 */
  handleKB(args) {
    this.handleBans('Banned', safe_tags(args[1]));
    this.banned = true;
  }

  /**
	 * Handles the warning packet
	 * on client this spawns a message box you can't close for 2 seconds
	 * @param {Array} args ban reason
	 */
		 handleBB(args) {
    alert(safe_tags(args[1]));
  }

  /**
	 * Handles the banned packet
	 * this one is sent when you try to reconnect but you're banned
	 * @param {Array} args ban reason
	 */
  handleBD(args) {
    this.handleBans('Banned', safe_tags(args[1]));
    this.banned = true;
  }

  /**
	 * Handles the handshake completion packet, meaning the player
	 * is ready to select a character.
	 *
	 * @param {Array} args packet arguments
	 */
  handleDONE(_args) {
    document.getElementById('client_loading').style.display = 'none';
    if (mode === 'watch') {		// Spectators don't need to pick a character
      document.getElementById('client_charselect').style.display = 'none';
    } else {
      document.getElementById('client_charselect').style.display = 'block';
    }
  }

  /**
	 * Handles a background change.
	 * @param {Array} args packet arguments
	 */
  handleBN(args) {
    viewport.bgname = safe_tags(args[1]);
    const bgfolder = viewport.bgFolder;
    const bg_index = getIndexFromSelect('bg_select', viewport.bgname);
    document.getElementById('bg_select').selectedIndex = bg_index;
    updateBackgroundPreview();
    if (bg_index === 0) {
      document.getElementById('bg_filename').value = viewport.bgname;
    }
    document.getElementById('bg_preview').src = `${AO_HOST}background/${encodeURI(args[1].toLowerCase())}/defenseempty.png`;

    document.getElementById('client_def_bench').src = `${bgfolder}defensedesk.png`;
    document.getElementById('client_wit_bench').src = `${bgfolder}stand.png`;
    document.getElementById('client_pro_bench').src = `${bgfolder}prosecutiondesk.png`;

    document.getElementById('client_court').src = `${bgfolder}full.png`;

    document.getElementById('client_court_def').src = `${bgfolder}defenseempty.png`;
    document.getElementById('client_court_deft').src = `${bgfolder}transition_def.png`;
    document.getElementById('client_court_wit').src = `${bgfolder}witnessempty.png`;
    document.getElementById('client_court_prot').src = `${bgfolder}transition_pro.png`;
    document.getElementById('client_court_pro').src = `${bgfolder}prosecutorempty.png`;

    if (this.charID === -1) {
      viewport.changeBackground('jud');
    } else {
      viewport.changeBackground(this.chars[this.charID].side);
    }
  }

  /**
	 * Handles a change in the health bars' states.
	 * @param {Array} args packet arguments
	 */
  handleHP(args) {
    const percent_hp = Number(args[2]) * 10;
    let healthbox;
    if (args[1] === '1') {
      // Def hp
      this.hp[0] = args[2];
      healthbox = document.getElementById('client_defense_hp');
    } else {
      // Pro hp
      this.hp[1] = args[2];
      healthbox = document.getElementById('client_prosecutor_hp');
    }
    healthbox.getElementsByClassName('health-bar')[0].style.width = `${percent_hp}%`;
  }

  /**
	 * Handles a testimony states.
	 * @param {Array} args packet arguments
	 */
  handleRT(args) {
    const judgeid = Number(args[2]);
    switch (args[1]) {
      case 'testimony1':
        this.testimonyID = 1;
        break;
      case 'testimony2':
        // Cross Examination
        this.testimonyID = 2;
        break;
      case 'judgeruling':
        this.testimonyID = 3 + judgeid;
        break;
      default:
        console.warn('Invalid testimony');
    }
    viewport.initTestimonyUpdater();
  }

  /**
	 * Handles a timer update
	 * @param {Array} args packet arguments
	 */
  handleTI(args) {
    const timerid = Number(args[1]);
    const type = Number(args[2]);
    const timer_value = Number(args[3]);
    switch (type) {
      case 0:
        //
      case 1:
        document.getElementById(`client_timer${timerid}`).innerText = timer_value;
      case 2:
        document.getElementById(`client_timer${timerid}`).style.display = '';
      case 3:
        document.getElementById(`client_timer${timerid}`).style.display = 'none';
    }
  }

  /**
	 * Handles a modcall
	 * @param {Array} args packet arguments
	 */
  handleZZ(args) {
    const oocLog = document.getElementById('client_ooclog');
    oocLog.innerHTML += `$Alert: ${prepChat(args[1])}\r\n`;
    if (oocLog.scrollTop > oocLog.scrollHeight - 60) {
      oocLog.scrollTop = oocLog.scrollHeight;
    }
    viewport.sfxaudio.pause();
    const oldvolume = viewport.sfxaudio.volume;
    viewport.sfxaudio.volume = 1;
    viewport.sfxaudio.src = `${AO_HOST}sounds/general/sfx-gallery.opus`;
    viewport.sfxaudio.play();
    viewport.sfxaudio.volume = oldvolume;
  }

  /**
	 * Handle the player
	 * @param {Array} args packet arguments
	 */
  handleHI(args) {
    this.sendSelf(`ID#1#webAO#${version}#%`);
    this.sendSelf('FL#fastloading#yellowtext#cccc_ic_support#flipping#looping_sfx#effects#%');
  }

  /**
	 * Identifies the server and issues a playerID
	 * @param {Array} args packet arguments
	 */
  handleID(args) {
    this.playerID = Number(args[1]);
    this.serverSoftware = args[2].split('&')[0];
    if (this.serverSoftware === 'serverD') { this.serverVersion = args[2].split('&')[1]; } else if (this.serverSoftware === 'webAO') {
      oldLoading = false;
      this.sendSelf('PN#0#1#%');
    } else { this.serverVersion = args[3]; }

    if (this.serverSoftware === 'serverD' && this.serverVersion === '1377.152') { oldLoading = true; } // bugged version
  }

  /**
	 * Indicates how many users are on this server
	 * @param {Array} args packet arguments
	 */
  handlePN(_args) {
    this.sendServer('askchaa#%');
  }

  /**
	 * What? you want a character??
	 * @param {Array} args packet arguments
	 */
  handleCC(args) {
    this.sendSelf(`PV#1#CID#${args[2]}#%`);
  }

  /**
	 * What? you want a character list from me??
	 * @param {Array} args packet arguments
	 */
  handleaskchaa(_args) {
    this.sendSelf(`SI#${vanilla_character_arr.length}#0#0#%`);
  }

  /**
	 * Handle the change of players in an area.
	 * @param {Array} args packet arguments
	 */
  handleARUP(args) {
    args = args.slice(1);
    for (let i = 0; i < args.length - 2; i++) {
      if (this.areas[i]) { // the server sends us ARUP before we even get the area list
        const thisarea = document.getElementById(`area${i}`);
        switch (Number(args[0])) {
          case 0: // playercount
            this.areas[i].players = Number(args[i + 1]);
            break;
          case 1: // status
            this.areas[i].status = safe_tags(args[i + 1]);
            break;
          case 2:
            this.areas[i].cm = safe_tags(args[i + 1]);
            break;
          case 3:
            this.areas[i].locked = safe_tags(args[i + 1]);
            break;
        }

        thisarea.classList = `area-button area-${this.areas[i].status.toLowerCase()}`;

        thisarea.innerText = `${this.areas[i].name} (${this.areas[i].players}) [${this.areas[i].status}]`;

        thisarea.title = `Players: ${this.areas[i].players}\n`
					+ `Status: ${this.areas[i].status}\n`
					+ `CM: ${this.areas[i].cm}\n`
					+ `Area lock: ${this.areas[i].locked}`;
      }
    }
  }

  /**
	 * With this the server tells us which features it supports
	 * @param {Array} args list of features
	 */
  handleFL(args) {
    console.info('Server-supported features:');
    console.info(args);
    extrafeatures = args;

    if (args.includes('yellowtext')) {
      const colorselect = document.getElementById('textcolor');

      colorselect.options[colorselect.options.length] = new Option('Yellow', 5);
      colorselect.options[colorselect.options.length] = new Option('Grey', 6);
      colorselect.options[colorselect.options.length] = new Option('Pink', 7);
      colorselect.options[colorselect.options.length] = new Option('Cyan', 8);
    }

    if (args.includes('cccc_ic_support')) {
      document.getElementById('cccc').style.display = '';
      document.getElementById('pairing').style.display = '';
    }

    if (args.includes('flipping')) {
      document.getElementById('button_flip').style.display = '';
    }

    if (args.includes('looping_sfx')) {
      document.getElementById('button_shake').style.display = '';
      document.getElementById('2.7').style.display = '';
    }

    if (args.includes('effects')) {
      document.getElementById('2.8').style.display = '';
    }

    if (args.includes('y_offset')) {
      document.getElementById('y_offset').style.display = '';
    }
  }

  /**
	 * Received when the server announces its server info,
	 * but we use it as a cue to begin retrieving characters.
	 * @param {Array} args packet arguments
	 */
  handleSI(args) {
    this.char_list_length = Number(args[1]);
    this.char_list_length += 1; // some servers count starting from 0 some from 1...
    this.evidence_list_length = Number(args[2]);
    this.music_list_length = Number(args[3]);

    // create the charselect grid, to be filled by the character loader
    document.getElementById('client_chartable').innerHTML = '';

    for (let i = 0; i < this.char_list_length; i++) {
      const demothing = document.createElement('img');

      demothing.className = 'demothing';
      demothing.id = `demo_${i}`;
      const demoonclick = document.createAttribute('onclick');
      demoonclick.value = `pickChar(${i})`;
      demothing.setAttributeNode(demoonclick);

      document.getElementById('client_chartable').appendChild(demothing);
    }

    // this is determined at the top of this file
    if (!oldLoading && extrafeatures.includes('fastloading')) {
      this.sendServer('RC#%');
    } else {
      this.sendServer('askchar2#%');
    }
  }

  /**
	 * Handles the list of all used and vacant characters.
	 * @param {Array} args list of all characters represented as a 0 for free or a -1 for taken
	 */
  handleCharsCheck(args) {
    for (let i = 0; i < this.char_list_length; i++) {
      const img = document.getElementById(`demo_${i}`);

      if (args[i + 1] === '-1') { img.style.opacity = 0.25; } else if (args[i + 1] === '0') { img.style.opacity = 1; }
    }
  }

  /**
	 * Handles the server's assignment of a character for the player to use.
	 * PV # playerID (unused) # CID # character ID
	 * @param {Array} args packet arguments
	 */
  async handlePV(args) {
    this.charID = Number(args[3]);
    document.getElementById('client_charselect').style.display = 'none';

    const me = this.character;
    this.selectedEmote = -1;
    const { emotes } = this;
    const emotesList = document.getElementById('client_emo');
    emotesList.style.display = '';
    emotesList.innerHTML = ''; // Clear emote box
    const ini = me.inifile;
    me.side = ini.options.side;
    updateActionCommands(me.side);
    if (ini.emotions.number === 0) {
      emotesList.innerHTML =					`<span
					id="emo_0"
					alt="unavailable"
					class="emote_button">No emotes available</span>`;
    } else {
      for (let i = 1; i <= ini.emotions.number; i++) {
        try {
          const emoteinfo = ini.emotions[i].split('#');
          let esfx;
          let esfxd;
          try {
            esfx = ini.soundn[i] || '0';
            esfxd = Number(ini.soundt[i]) || 0;
          } catch (e) {
            console.warn('ini sound is completly missing');
            esfx = '0';
            esfxd = 0;
          }
          // Make sure the asset server is case insensitive, or that everything on it is lowercase
          emotes[i] = {
            desc: emoteinfo[0].toLowerCase(),
            preanim: emoteinfo[1].toLowerCase(),
            emote: emoteinfo[2].toLowerCase(),
            zoom: Number(emoteinfo[3]) || 0,
            sfx: esfx.toLowerCase(),
            sfxdelay: esfxd,
            frame_screenshake: '',
            frame_realization: '',
            frame_sfx: '',
            button: `${AO_HOST}characters/${encodeURI(me.name.toLowerCase())}/emotions/button${i}_off.png`,
          };
          emotesList.innerHTML
					+= `<img src=${emotes[i].button}
					id="emo_${i}"
					alt="${emotes[i].desc}"
					class="emote_button"
					onclick="pickEmotion(${i})">`;
        } catch (e) {
          console.error(`missing emote ${i}`);
        }
      }
      pickEmotion(1);
    }

    if (await fileExists(`${AO_HOST}characters/${encodeURI(me.name.toLowerCase())}/custom.gif`)) { document.getElementById('button_4').style.display = ''; } else { document.getElementById('button_4').style.display = 'none'; }

    const iniedit_select = document.getElementById('client_ininame');

    // Load iniswaps if there are any
    try {
      const cswapdata = await request(`${AO_HOST}characters/${encodeURI(me.name.toLowerCase())}/iniswaps.ini`);
      const cswap = cswapdata.split('\n');

      // most iniswaps don't list their original char
      if (cswap.length > 0) {
        iniedit_select.innerHTML = '';

        function addIniswap(value) {
          iniedit_select.add(new Option(safe_tags(value)));
        }

        addIniswap(me.name);
        cswap.forEach(addIniswap);
      }
    } catch (err) {
      console.info("character doesn't have iniswaps");
      this.fetchCharacterList();
    }
  }

  /**
	 * new asset url!!
	 * @param {Array} args packet arguments
	 */
	 handleASS(args) {
    AO_HOST = args[1];
  }

  /**
	 * we are asking ourselves what characters there are
	 * @param {Array} args packet arguments
	 */
  handleRC(_args) {
    this.sendSelf(`SC#${vanilla_character_arr.join('#')}#%`);
  }

  /**
	 * we are asking ourselves what characters there are
	 * @param {Array} args packet arguments
	 */
  handleRM(_args) {
    this.sendSelf(`SM#${vanilla_music_arr.join('#')}#%`);
  }

  /**
	 * we are asking ourselves what characters there are
	 * @param {Array} args packet arguments
	 */
  handleRD(_args) {
    this.sendSelf('BN#gs4#%');
    this.sendSelf('DONE#%');
    const ooclog = document.getElementById('client_ooclog');
    ooclog.value = '';
    ooclog.readOnly = false;

    document.getElementById('client_oocinput').style.display = 'none';
    document.getElementById('client_replaycontrols').style.display = 'inline-block';
  }
}

class Viewport {
  constructor() {
    this.textnow = '';
    this.chatmsg = {
      content: '',
      objection: 0,
      sound: '',
      startpreanim: true,
      startspeaking: false,
      side: null,
      color: 0,
      snddelay: 0,
      preanimdelay: 0,
    };

    this.shouts = [
      undefined,
      'holdit',
      'objection',
      'takethat',
      'custom',
    ];

    this.colors = [
      'white',
      'green',
      'red',
      'orange',
      'blue',
      'yellow',
      'pink',
      'cyan',
      'grey',
    ];

    // Allocate multiple blip audio channels to make blips less jittery

    this.blipChannels = new Array(
      new Audio(`${AO_HOST}sounds/general/sfx-blipmale.opus`),
      new Audio(`${AO_HOST}sounds/general/sfx-blipmale.opus`),
      new Audio(`${AO_HOST}sounds/general/sfx-blipmale.opus`),
      new Audio(`${AO_HOST}sounds/general/sfx-blipmale.opus`),
      new Audio(`${AO_HOST}sounds/general/sfx-blipmale.opus`),
      new Audio(`${AO_HOST}sounds/general/sfx-blipmale.opus`),
    );
    this.blipChannels.forEach((channel) => channel.volume = 0.5);
    this.blipChannels.forEach((channel) => channel.onerror = opusCheck(channel));
    this.currentBlipChannel = 0;

    this.sfxaudio = document.getElementById('client_sfxaudio');
    this.sfxaudio.src = `${AO_HOST}sounds/general/sfx-realization.opus`;

    this.sfxplayed = 0;

    this.shoutaudio = document.getElementById('client_shoutaudio');
    this.shoutaudio.src = `${AO_HOST}misc/default/objection.opus`;

    this.testimonyAudio = document.getElementById('client_testimonyaudio');
    this.testimonyAudio.src = `${AO_HOST}sounds/general/sfx-guilty.opus`;

    this.music = new Array(
      new Audio(`${AO_HOST}sounds/music/trial (aa).opus`),
      new Audio(`${AO_HOST}sounds/music/trial (aa).opus`),
      new Audio(`${AO_HOST}sounds/music/trial (aa).opus`),
      new Audio(`${AO_HOST}sounds/music/trial (aa).opus`),
    );
    this.music.forEach((channel) => channel.volume = 0.5);
    this.music.forEach((channel) => channel.onerror = opusCheck(channel));

    this.updater = null;
    this.testimonyUpdater = null;

    this.bgname = 'gs4';

    this.lastChar = '';
    this.lastEvi = 0;

    this.testimonyTimer = 0;
    this.shoutTimer = 0;
    this.textTimer = 0;

    this._animating = false;
  }

  /**
	 * Returns whether or not the viewport is busy
	 * performing a task (animating).
	 */
  get isAnimating() {
    return this._animating;
  }

  /**
	 * Sets the volume of the blip sounds.
	 * @param {number} volume
	 */
  set blipVolume(volume) {
    this.blipChannels.forEach((channel) => channel.volume = volume);
  }

  /**
	 * Sets the volume of the music.
	 * @param {number} volume
	 */
  set musicVolume(volume) {
    this.music.forEach((channel) => channel.volume = volume);
  }

  /**
	 * Returns the path which the background is located in.
	 */
  get bgFolder() {
    return `${AO_HOST}background/${encodeURI(this.bgname.toLowerCase())}/`;
  }

  /**
	 * Play any SFX
	 *
	 * @param {string} sfxname
	 */
  async playSFX(sfxname, looping) {
    this.sfxaudio.pause();
    this.sfxaudio.loop = looping;
    this.sfxaudio.src = sfxname;
    this.sfxaudio.play();
  }

  /**
 * Changes the viewport background based on a given position.
 *
 * Valid positions: `def, pro, hld, hlp, wit, jud, jur, sea`
 * @param {string} position the position to change into
 */
  async changeBackground(position) {
    const bgfolder = viewport.bgFolder;

    const view = document.getElementById('client_fullview');
    const bench = document.getElementById('client_bench_classic');
    const court = document.getElementById('client_court_classic');

    const positions = {
      def: {
        bg: 'defenseempty.png',
        desk: { ao2: 'defensedesk.png', ao1: 'bancodefensa.png' },
        speedLines: 'defense_speedlines.gif',
      },
      pro: {
        bg: 'prosecutionempty.png',
        desk: { ao2: 'prosecutiondesk.png', ao1: 'bancoacusacion.png' },
        speedLines: 'prosecution_speedlines.gif',
      },
      hld: {
        bg: 'helperstand.png',
        desk: null,
        speedLines: 'defense_speedlines.gif',
      },
      hlp: {
        bg: 'prohelperstand.png',
        desk: null,
        speedLines: 'prosecution_speedlines.gif',
      },
      wit: {
        bg: 'witnessempty.png',
        desk: { ao2: 'stand.png', ao1: 'estrado.png' },
        speedLines: 'prosecution_speedlines.gif',
      },
      jud: {
        bg: 'judgestand.png',
        desk: { ao2: 'judgedesk.png', ao1: 'judgedesk.gif' },
        speedLines: 'prosecution_speedlines.gif',
      },
      jur: {
        bg: 'jurystand.png',
        desk: { ao2: 'jurydesk.png', ao1: 'estrado.png' },
        speedLines: 'defense_speedlines.gif',
      },
      sea: {
        bg: 'seancestand.png',
        desk: { ao2: 'seancedesk.png', ao1: 'estrado.png' },
        speedLines: 'prosecution_speedlines.gif',
      },
    };

    let bg;
    let desk;
    let speedLines;

    if ('def,pro,hld,hlp,wit,jud,jur,sea'.includes(position)) {
      bg = positions[position].bg;
      desk = positions[position].desk;
      speedLines = positions[position].speedLines;
    } else {
      bg = `${position}.png`;
      desk = { ao2: `${position}_overlay.png`, ao1: '_overlay.png' };
      speedLines = 'defense_speedlines.gif';
    }

    if (viewport.chatmsg.type === 5) {
      court.src = `${AO_HOST}themes/default/${encodeURI(speedLines)}`;
      bench.style.opacity = 0;
    } else {
      court.src = bgfolder + bg;
      if (desk) {
        const deskFilename = await fileExists(bgfolder + desk.ao2) ? desk.ao2 : desk.ao1;
        bench.src = bgfolder + deskFilename;
        bench.style.opacity = 1;
      } else {
        bench.style.opacity = 0;
      }
    }

    if ('def,pro,wit'.includes(position)) {
      bench.style.display = 'none';
      view.style.display = '';
      document.getElementById('client_classicview').style.display = 'none';
      switch (position) {
        case 'def':
          view.style.left = '0';
          break;
        case 'wit':
          view.style.left = '-200%';
          break;
        case 'pro':
          view.style.left = '-400%';
          break;
      }
    } else {
      bench.style.display = '';
      view.style.display = 'none';
      document.getElementById('client_classicview').style.display = '';
    }
  }

  /**
	 * Intialize testimony updater
	 */
  initTestimonyUpdater() {
    const testimonyFilenames = {
      1: 'witnesstestimony',
      2: 'crossexamination',
      3: 'notguilty',
      4: 'guilty',
    };

    const testimony = testimonyFilenames[client.testimonyID];
    if (!testimony) {
      console.warn(`Invalid testimony ID ${client.testimonyID}`);
      return;
    }

    this.testimonyAudio.src = client.resources[testimony].sfx;
    this.testimonyAudio.play();

    const testimonyOverlay = document.getElementById('client_testimony');
    testimonyOverlay.src = client.resources[testimony].src;
    testimonyOverlay.style.opacity = 1;

    this.testimonyTimer = 0;
    this.testimonyUpdater = setTimeout(() => this.updateTestimony(), UPDATE_INTERVAL);
  }

  /**
	 * Gets animation length. If the animation cannot be found, it will
	 * silently fail and return 0 instead.
	 * @param {string} filename the animation file name
	 */
  async getAnimLength(filename) {
    try {
      const file = await requestBuffer(filename);
      return this.calculateGifLength(file);
    } catch (err) {
      return 0;
    }
  }

  oneSuccess(promises) {
    return Promise.all(promises.map((p) =>
    // If a request fails, count that as a resolution so it will keep
    // waiting for other possible successes. If a request succeeds,
    // treat it as a rejection so Promise.all immediately bails out.
		 p.then(
        (val) => Promise.reject(val),
        (err) => Promise.resolve(err),
      ))).then(
      // If '.all' resolved, we've just got an array of errors.
      (errors) => Promise.reject(errors),
      // If '.all' rejected, we've got the result we wanted.
      (val) => Promise.resolve(val),
    );
  }

  rejectOnError(f) {
    return new Promise((resolve, reject) => f.then((res) => {
      if (res.ok) resolve(f);
      else reject(f);
    }));
  }

  /**
	 * Adds up the frame delays to find out how long a GIF is
	 * I totally didn't steal this
	 * @param {data} gifFile the GIF data
	 */
  calculateGifLength(gifFile) {
    const d = new Uint8Array(gifFile);
    // Thanks to http://justinsomnia.org/2006/10/gif-animation-duration-calculation/
    // And http://www.w3.org/Graphics/GIF/spec-gif89a.txt
    let duration = 0;
    for (let i = 0; i < d.length; i++) {
      // Find a Graphic Control Extension hex(21F904__ ____ __00)
      if (d[i] === 0x21
				&& d[i + 1] === 0xF9
				&& d[i + 2] === 0x04
				&& d[i + 7] === 0x00) {
        // Swap 5th and 6th bytes to get the delay per frame
        const delay = (d[i + 5] << 8) | (d[i + 4] & 0xFF);

        // Should be aware browsers have a minimum frame delay
        // e.g. 6ms for IE, 2ms modern browsers (50fps)
        duration += delay < 2 ? 10 : delay;
      }
    }
    return duration * 10;
  }

  /**
	 * Updates the testimony overaly
	 */
  updateTestimony() {
    const testimonyFilenames = {
      1: 'witnesstestimony',
      2: 'crossexamination',
      3: 'notguilty',
      4: 'guilty',
    };

    // Update timer
    this.testimonyTimer += UPDATE_INTERVAL;

    const testimony = testimonyFilenames[client.testimonyID];
    const resource = client.resources[testimony];
    if (!resource) {
      this.disposeTestimony();
      return;
    }

    if (this.testimonyTimer >= resource.duration) {
      this.disposeTestimony();
    } else {
      this.testimonyUpdater = setTimeout(() => this.updateTestimony(), UPDATE_INTERVAL);
    }
  }

  /**
	 * Dispose the testimony overlay
	 */
  disposeTestimony() {
    client.testimonyID = 0;
    this.testimonyTimer = 0;
    document.getElementById('client_testimony').style.opacity = 0;
    clearTimeout(this.testimonyUpdater);
  }

  /**
	 * Sets all the img tags to the right sources
	 * @param {*} chatmsg
	 */
  setEmote(charactername, emotename, prefix, pair, side) {
    const pairID = pair ? 'pair' : 'char';
    const characterFolder = `${AO_HOST}characters/`;
    const position = 'def,pro,wit'.includes(side) ? `${side}_` : '';

    const gif_s = document.getElementById(`client_${position}${pairID}_gif`);
    const png_s = document.getElementById(`client_${position}${pairID}_png`);
    const apng_s = document.getElementById(`client_${position}${pairID}_apng`);
    const webp_s = document.getElementById(`client_${position}${pairID}_webp`);

    if (this.lastChar !== this.chatmsg.name) {
      // hide the last sprite
      gif_s.src = transparentPNG;
      png_s.src = transparentPNG;
      apng_s.src = transparentPNG;
      webp_s.src = transparentPNG;
    }

    gif_s.src = `${characterFolder}${encodeURI(charactername)}/${encodeURI(prefix)}${encodeURI(emotename)}.gif`;
    png_s.src = `${characterFolder}${encodeURI(charactername)}/${encodeURI(emotename)}.png`;
    apng_s.src = `${characterFolder}${encodeURI(charactername)}/${encodeURI(prefix)}${encodeURI(emotename)}.apng`;
    webp_s.src = `${characterFolder}${encodeURI(charactername)}/${encodeURI(prefix)}${encodeURI(emotename)}.webp`;
  }

  /**
	 * Sets a new emote.
	 * This sets up everything before the tick() loops starts
	 * a lot of things can probably be moved here, like starting the shout animation if there is one
	 * TODO: the preanim logic, on the other hand, should probably be moved to tick()
	 * @param {object} chatmsg the new chat message
	 */
  async say(chatmsg) {
    this.chatmsg = chatmsg;
    this.textnow = '';
    this.sfxplayed = 0;
    this.textTimer = 0;
    this._animating = true;
    let charLayers = document.getElementById('client_char');
    let pairLayers = document.getElementById('client_pair_char');

    // stop updater
    clearTimeout(this.updater);

    // stop last sfx from looping any longer
    this.sfxaudio.loop = false;

    const fg = document.getElementById('client_fg');
    const gamewindow = document.getElementById('client_gamewindow');
    const waitingBox = document.getElementById('client_chatwaiting');

    // Reset CSS animation
    gamewindow.style.animation = '';
    waitingBox.style.opacity = 0;

    const eviBox = document.getElementById('client_evi');

    if (this.lastEvi !== this.chatmsg.evidence) {
      eviBox.style.opacity = '0';
      eviBox.style.height = '0%';
    }
    this.lastEvi = this.chatmsg.evidence;

    if ('def,pro,wit'.includes(this.chatmsg.side)) {
      charLayers = document.getElementById(`client_${this.chatmsg.side}_char`);
      pairLayers = document.getElementById(`client_${this.chatmsg.side}_pair_char`);
    }

    const chatContainerBox = document.getElementById('client_chatcontainer');
    const nameBoxInner = document.getElementById('client_inner_name');
    const chatBoxInner = document.getElementById('client_inner_chat');

    const displayname = (document.getElementById('showname').checked && this.chatmsg.showname !== '') ? this.chatmsg.showname : this.chatmsg.nameplate;

    // Clear out the last message
    chatBoxInner.innerText = this.textnow;
    nameBoxInner.innerText = displayname;

    if (this.lastChar !== this.chatmsg.name) {
      charLayers.style.opacity = 0;
      pairLayers.style.opacity = 0;
    }
    this.lastChar = this.chatmsg.name;

    appendICLog(this.chatmsg.content, this.chatmsg.showname, this.chatmsg.nameplate);

    checkCallword(this.chatmsg.content);

    this.setEmote(this.chatmsg.name.toLowerCase(), this.chatmsg.sprite, '(a)', false, this.chatmsg.side);

    if (this.chatmsg.other_name) {
      this.setEmote(this.chatmsg.other_name.toLowerCase(), this.chatmsg.other_emote, '(a)', false, this.chatmsg.side);
    }

    // gets which shout shall played
    const shoutSprite = document.getElementById('client_shout');
    const shout = this.shouts[this.chatmsg.objection];
    if (shout) {
      // Hide message box
      chatContainerBox.style.opacity = 0;
      if (this.chatmsg.objection === 4) {
        shoutSprite.src = `${AO_HOST}characters/${encodeURI(this.chatmsg.name.toLowerCase())}/custom.gif`;
      } else {
        shoutSprite.src = client.resources[shout].src;
        shoutSprite.style.animation = 'bubble 700ms steps(10, jump-both)';
      }
      shoutSprite.style.opacity = 1;

      this.shoutaudio.src = `${AO_HOST}characters/${encodeURI(this.chatmsg.name.toLowerCase())}/${shout}.opus`;
      this.shoutaudio.play();
      this.shoutTimer = client.resources[shout].duration;
    } else {
      this.shoutTimer = 0;
    }

    this.chatmsg.startpreanim = true;
    let gifLength = 0;
    switch (this.chatmsg.type) {
      // case 0:
      // normal emote, no preanim
      case 1:
        // play preanim
        // Hide message box
        chatContainerBox.style.opacity = 0;
        // If preanim existed then determine the length
        gifLength = await this.getAnimLength(`${AO_HOST}characters/${encodeURI(this.chatmsg.name.toLowerCase())}/${encodeURI(this.chatmsg.preanim)}.gif`);
        this.chatmsg.startspeaking = false;
        break;
        // case 5:
        // zoom
      default:
        this.chatmsg.startspeaking = true;
        break;
    }
    this.chatmsg.preanimdelay = parseInt(gifLength);

    this.changeBackground(chatmsg.side);

    setChatbox(chatmsg.chatbox);
    resizeChatbox();

    // Flip the character
    if (this.chatmsg.flip === 1) {
      charLayers.style.transform = 'scaleX(-1)';
    } else {
      charLayers.style.transform = 'scaleX(1)';
    }

    // Shift by the horizontal offset
    switch (this.chatmsg.side) {
      case 'wit':
        pairLayers.style.left = `${200 + Number(this.chatmsg.other_offset[0])}%`;
        charLayers.style.left = `${200 + Number(this.chatmsg.self_offset[0])}%`;
        break;
      case 'pro':
        pairLayers.style.left = `${400 + Number(this.chatmsg.other_offset[0])}%`;
        charLayers.style.left = `${400 + Number(this.chatmsg.self_offset[0])}%`;
        break;
      default:
        pairLayers.style.left = `${Number(this.chatmsg.other_offset[0])}%`;
        charLayers.style.left = `${Number(this.chatmsg.self_offset[0])}%`;
        break;
    }

    // New vertical offsets
    pairLayers.style.top = `${Number(this.chatmsg.other_offset[1])}%`;
    charLayers.style.top = `${Number(this.chatmsg.self_offset[1])}%`;

    // flip the paired character
    if (this.chatmsg.other_flip === 1) {
      pairLayers.style.transform = 'scaleX(-1)';
    } else {
      pairLayers.style.transform = 'scaleX(1)';
    }

    this.blipChannels.forEach((channel) => channel.src = `${AO_HOST}sounds/general/sfx-blip${encodeURI(this.chatmsg.blips.toLowerCase())}.opus`);

    // process markup
    if (this.chatmsg.content.startsWith('~~')) {
      chatBoxInner.style.textAlign = 'center';
      this.chatmsg.content = this.chatmsg.content.substring(2, this.chatmsg.content.length);
    } else {
      chatBoxInner.style.textAlign = 'inherit';
    }

    // apply effects
    fg.style.animation = '';

    if (this.chatmsg.effects[0] && this.chatmsg.effects[0] !== '-') { fg.src = `${AO_HOST}themes/default/effects/${encodeURI(this.chatmsg.effects[0].toLowerCase())}.webp`; } else { fg.src = transparentPNG; }

    if (this.chatmsg.sound === '0' || this.chatmsg.sound === '1' || this.chatmsg.sound === '' || this.chatmsg.sound === undefined) { this.chatmsg.sound = this.chatmsg.effects[2]; }

    this.tick();
  }

  /**
	 * Updates the chatbox based on the given text.
	 *
	 * OK, here's the documentation on how this works:
	 *
	 * 1 _animating
	 * If we're not done with this characters animation, i.e. his text isn't fully there, set a timeout for the next tick/step to happen
	 *
	 * 2 startpreanim
	 * If the shout timer is over it starts with the preanim
	 * The first thing it checks for is the shake effect (TODO on client this is handled by the @ symbol and not a flag )
	 * Then is the flash/realization effect
	 * After that, the shout image set to be transparent
	 * and the main characters preanim gif is loaded
	 * If pairing is supported the paired character will just stand around with his idle sprite
	 *
	 * 3 preanimdelay over
	 * this animates the evidence popup and finally shows the character name and message box
	 * it sets the text color and the character speaking sprite
	 *
	 * 4 textnow != content
	 * this adds a character to the textbox and stops the animations if the entire message is present in the textbox
	 *
	 * 5 sfx
	 * independent of the stuff above, this will play any sound effects specified by the emote the character sent.
	 * happens after the shout delay + an sfx delay that comes with the message packet
	 *
	 * XXX: This relies on a global variable `this.chatmsg`!
	 */
  tick() {
    if (this._animating) {
      this.updater = setTimeout(() => this.tick(), UPDATE_INTERVAL);
    }

    const gamewindow = document.getElementById('client_gamewindow');
    const waitingBox = document.getElementById('client_chatwaiting');
    const eviBox = document.getElementById('client_evi');
    const shoutSprite = document.getElementById('client_shout');
    const chatBoxInner = document.getElementById('client_inner_chat');
    const chatBox = document.getElementById('client_chat');
    const effectlayer = document.getElementById('client_fg');
    let charLayers = document.getElementById('client_char');
    let pairLayers = document.getElementById('client_pair_char');

    if ('def,pro,wit'.includes(this.chatmsg.side)) {
      charLayers = document.getElementById(`client_${this.chatmsg.side}_char`);
      pairLayers = document.getElementById(`client_${this.chatmsg.side}_pair_char`);
    }

    const charName = this.chatmsg.name.toLowerCase();
    const charEmote = this.chatmsg.sprite.toLowerCase();

    const pairName = this.chatmsg.other_name.toLowerCase();
    const pairEmote = this.chatmsg.other_emote.toLowerCase();

    // TODO: preanims sometimes play when they're not supposed to
    if (this.textTimer >= this.shoutTimer && this.chatmsg.startpreanim) {
      // Effect stuff
      if (this.chatmsg.screenshake === 1) {
        // Shake screen
        this.playSFX(`${AO_HOST}sounds/general/sfx-stab.opus`, false);
        gamewindow.style.animation = 'shake 0.2s 1';
      }
      if (this.chatmsg.flash === 1) {
        // Flash screen
        this.playSFX(`${AO_HOST}sounds/general/sfx-realization.opus`, false);
        effectlayer.style.animation = 'flash 0.4s 1';
      }

      // Pre-animation stuff
      if (this.chatmsg.preanimdelay > 0) {
        shoutSprite.style.opacity = 0;
        shoutSprite.style.animation = '';
        const preanim = this.chatmsg.preanim.toLowerCase();
        this.setEmote(charName, preanim, '', false, this.chatmsg.side);
        charLayers.style.opacity = 1;
      }

      if (this.chatmsg.other_name) {
        pairLayers.style.opacity = 1;
      } else {
        pairLayers.style.opacity = 0;
      }

      this.chatmsg.startpreanim = false;
      this.chatmsg.startspeaking = true;
    } else if (this.textTimer >= this.shoutTimer + this.chatmsg.preanimdelay && !this.chatmsg.startpreanim) {
      if (this.chatmsg.startspeaking) {
        if (this.chatmsg.evidence > 0) {
          // Prepare evidence
          eviBox.src = safe_tags(client.evidences[this.chatmsg.evidence - 1].icon);

          eviBox.style.width = 'auto';
          eviBox.style.height = '36.5%';
          eviBox.style.opacity = 1;

          this.testimonyAudio.src = `${AO_HOST}sounds/general/sfx-evidenceshoop.opus`;
          this.testimonyAudio.play();

          if (this.chatmsg.side === 'def') {
            // Only def show evidence on right
            eviBox.style.right = '1em';
            eviBox.style.left = 'initial';
          } else {
            eviBox.style.right = 'initial';
            eviBox.style.left = '1em';
          }
        }

        resizeChatbox();

        const chatContainerBox = document.getElementById('client_chatcontainer');
        chatContainerBox.style.opacity = 1;

        chatBoxInner.className = `text_${this.colors[this.chatmsg.color]}`;

        this.chatmsg.startspeaking = false;

        if (this.chatmsg.preanimdelay === 0) {
          shoutSprite.style.opacity = 0;
          shoutSprite.style.animation = '';
        }

        if (this.chatmsg.other_name) {
          this.setEmote(pairName, pairEmote, '(a)', true, this.chatmsg.side);
          pairLayers.style.opacity = 1;
        } else {
          pairLayers.style.opacity = 0;
        }

        this.setEmote(charName, charEmote, '(b)', false, this.chatmsg.side);
        charLayers.style.opacity = 1;

        if (this.textnow === this.chatmsg.content) {
          this.setEmote(charName, charEmote, '(a)', false, this.chatmsg.side);
          charLayers.style.opacity = 1;
          waitingBox.style.opacity = 1;
          this._animating = false;
          clearTimeout(this.updater);
        }
      } else if (this.textnow !== this.chatmsg.content) {
        if (this.chatmsg.content.charAt(this.textnow.length) !== ' ') {
          this.blipChannels[this.currentBlipChannel].play();
          this.currentBlipChannel++;
          this.currentBlipChannel %= this.blipChannels.length;
        }
        this.textnow = this.chatmsg.content.substring(0, this.textnow.length + 1);

        chatBoxInner.innerText = this.textnow;

        // scroll to bottom
        chatBox.scrollTop = chatBox.scrollHeight;

        if (this.textnow === this.chatmsg.content) {
          this._animating = false;
          this.setEmote(charName, charEmote, '(a)', false, this.chatmsg.side);
          charLayers.style.opacity = 1;
          waitingBox.style.opacity = 1;
          clearTimeout(this.updater);
        }
      }
    }

    if (!this.sfxplayed && this.chatmsg.snddelay + this.shoutTimer >= this.textTimer) {
      this.sfxplayed = 1;
      if (this.chatmsg.sound !== '0' && this.chatmsg.sound !== '1' && this.chatmsg.sound !== '' && this.chatmsg.sound !== undefined && (this.chatmsg.type == 1 || this.chatmsg.type == 2 || this.chatmsg.type == 6)) {
        this.playSFX(`${AO_HOST}sounds/general/${encodeURI(this.chatmsg.sound.toLowerCase())}.opus`, this.chatmsg.looping_sfx);
      }
    }
    this.textTimer += UPDATE_INTERVAL;
  }
}

/**
 * read a cookie from storage
 * got this from w3schools
 * https://www.w3schools.com/js/js_cookies.asp
 * @param {String} cname The name of the cookie to return
 */
function getCookie(cname) {
  try {
    const name = `${cname}=`;
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
  } catch (error) {
    return '';
  }
}

/**
 * set a cookie
 * the version from w3schools expects these to expire
 * @param {String} cname The name of the cookie to return
 * @param {String} value The value of that cookie option
 */
function setCookie(cname, value) {
  document.cookie = `${cname}=${value}`;
}

/**
 * Triggered when the Return key is pressed on the out-of-character chat input box.
 * @param {KeyboardEvent} event
 */
export function onOOCEnter(event) {
  if (event.keyCode === 13) {
    client.sendOOC(document.getElementById('client_oocinputbox').value);
    document.getElementById('client_oocinputbox').value = '';
  }
}
window.onOOCEnter = onOOCEnter;

/**
 * Triggered when the user click replay GOOOOO
 * @param {KeyboardEvent} event
 */
export function onReplayGo(_event) {
  client.handleReplay();
}
window.onReplayGo = onReplayGo;

/**
 * Triggered when the Return key is pressed on the in-character chat input box.
 * @param {KeyboardEvent} event
 */
export function onEnter(event) {
  if (event.keyCode === 13) {
    const mychar = client.character;
    const myemo = client.emote;
    const evi = client.evidence;
    const flip = ((document.getElementById('button_flip').classList.contains('dark')) ? 1 : 0);
    const flash = ((document.getElementById('button_flash').classList.contains('dark')) ? 1 : 0);
    const screenshake = ((document.getElementById('button_shake').classList.contains('dark')) ? 1 : 0);
    const noninterrupting_preanim = ((document.getElementById('check_nonint').checked) ? 1 : 0);
    const looping_sfx = ((document.getElementById('check_loopsfx').checked) ? 1 : 0);
    const color = document.getElementById('textcolor').value;
    const showname = document.getElementById('ic_chat_name').value;
    const text = document.getElementById('client_inputbox').value;
    const pairchar = document.getElementById('pair_select').value;
    const pairoffset = document.getElementById('pair_offset').value;
    const pairyoffset = document.getElementById('pair_y_offset').value;
    const myrole = document.getElementById('role_select').value ? document.getElementById('role_select').value : mychar.side;
    const additive = ((document.getElementById('check_additive').checked) ? 1 : 0);
    const effect = document.getElementById('effect_select').value;

    let sfxname = '0';
    let sfxdelay = 0;
    let emote_mod = myemo.zoom;
    if (document.getElementById('sendsfx').checked) {
      sfxname = myemo.sfx;
      sfxdelay = myemo.sfxdelay;
    }

    // not to overwrite a 5 from the ini or anything else
    if (document.getElementById('sendpreanim').checked) {
      if (emote_mod === 0) { emote_mod = 1; }
    } else if (emote_mod === 1) { emote_mod = 0; }

    client.sendIC(
      'chat',
      myemo.preanim,
      mychar.name,
      myemo.emote,
      text,
      myrole,
      sfxname,
      emote_mod,
      sfxdelay,
      selectedShout,
      evi,
      flip,
      flash,
      color,
      showname,
      pairchar,
      pairoffset,
      pairyoffset,
      noninterrupting_preanim,
      looping_sfx,
      screenshake,
      '-',
      '-',
      '-',
      additive,
      effect,
    );
  }
}
window.onEnter = onEnter;

/**
 * Resets the IC parameters for the player to enter a new chat message.
 * This should only be called when the player's previous chat message
 * was successfully sent/presented.
 */
function resetICParams() {
  document.getElementById('client_inputbox').value = '';
  document.getElementById('button_flash').className = 'client_button';
  document.getElementById('button_shake').className = 'client_button';

  document.getElementById('sendpreanim').checked = false;

  if (selectedShout) {
    document.getElementById(`button_${selectedShout}`).className = 'client_button';
    selectedShout = 0;
  }
}

export function resetOffset(_event) {
  document.getElementById('pair_offset').value = 0;
  document.getElementById('pair_y_offset').value = 0;
}
window.resetOffset = resetOffset;

/**
 * Triggered when the music search bar is changed
 * @param {MouseEvent} event
 */
export function musiclist_filter(_event) {
  const musiclist_element = document.getElementById('client_musiclist');
  const searchname = document.getElementById('client_musicsearch').value;

  musiclist_element.innerHTML = '';

  for (const trackname of client.musics) {
    if (trackname.toLowerCase().indexOf(searchname.toLowerCase()) !== -1) {
      const newentry = document.createElement('OPTION');
      newentry.text = trackname;
      musiclist_element.options.add(newentry);
    }
  }
}
window.musiclist_filter = musiclist_filter;

/**
 * Triggered when an item on the music list is clicked.
 * @param {MouseEvent} event
 */
export function musiclist_click(_event) {
  const playtrack = document.getElementById('client_musiclist').value;
  client.sendMusicChange(playtrack);

  // This is here so you can't actually select multiple tracks,
  // even though the select tag has the multiple option to render differently
  const musiclist_elements = document.getElementById('client_musiclist').selectedOptions;
  for (let i = 0; i < musiclist_elements.length; i++) {
    musiclist_elements[i].selected = false;
  }
}
window.musiclist_click = musiclist_click;

/**
 * Triggered when a character in the mute list is clicked
 * @param {MouseEvent} event
 */
export function mutelist_click(_event) {
  const mutelist = document.getElementById('mute_select');
  const selected_character = mutelist.options[mutelist.selectedIndex];

  if (client.chars[selected_character.value].muted === false) {
    client.chars[selected_character.value].muted = true;
    selected_character.text = `${client.chars[selected_character.value].name} (muted)`;
    console.info(`muted ${client.chars[selected_character.value].name}`);
  } else {
    client.chars[selected_character.value].muted = false;
    selected_character.text = client.chars[selected_character.value].name;
  }
}
window.mutelist_click = mutelist_click;

/**
 * Triggered when the showname checkboc is clicked
 * @param {MouseEvent} event
 */
export function showname_click(_event) {
  setCookie('showname', document.getElementById('showname').checked);
  setCookie('ic_chat_name', document.getElementById('ic_chat_name').value);

  const css_s = document.getElementById('nameplate_setting');

  if (document.getElementById('showname').checked) { css_s.href = 'styles/shownames.css'; } else { css_s.href = 'styles/nameplates.css'; }
}
window.showname_click = showname_click;

/**
 * Triggered when an item on the area list is clicked.
 * @param {MouseEvent} event
 */
export function area_click(el) {
  const area = client.areas[el.id.substr(4)].name;
  client.sendMusicChange(area);

  const areaHr = document.createElement('div');
  areaHr.className = 'hrtext';
  areaHr.textContent = `switched to ${el.textContent}`;
  document.getElementById('client_log').appendChild(areaHr);
}
window.area_click = area_click;

/**
 * Triggered by the music volume slider.
 */
export function changeMusicVolume() {
  viewport.musicVolume = document.getElementById('client_mvolume').value;
  setCookie('musicVolume', document.getElementById('client_mvolume').value);
}
window.changeMusicVolume = changeMusicVolume;

/**
 * Triggered by the sound effect volume slider.
 */
export function changeSFXVolume() {
  setCookie('sfxVolume', document.getElementById('client_sfxaudio').volume);
}
window.changeSFXVolume = changeSFXVolume;

/**
 * Triggered by the shout volume slider.
 */
export function changeShoutVolume() {
  setCookie('shoutVolume', document.getElementById('client_shoutaudio').volume);
}
window.changeShoutVolume = changeShoutVolume;

/**
 * Triggered by the testimony volume slider.
 */
export function changeTestimonyVolume() {
  setCookie('testimonyVolume', document.getElementById('client_testimonyaudio').volume);
}
window.changeTestimonyVolume = changeTestimonyVolume;

/**
 * Triggered by the blip volume slider.
 */
export function changeBlipVolume() {
  viewport.blipVolume = document.getElementById('client_bvolume').value;
  setCookie('blipVolume', document.getElementById('client_bvolume').value);
}
window.changeBlipVolume = changeBlipVolume;

/**
 * Triggered by the theme selector.
 */
export function reloadTheme() {
  viewport.theme = document.getElementById('client_themeselect').value;
  setCookie('theme', viewport.theme);
  document.getElementById('client_theme').href = `styles/${viewport.theme}.css`;
}
window.reloadTheme = reloadTheme;

/**
 * Triggered by a changed callword list
 */
export function changeCallwords() {
  client.callwords = document.getElementById('client_callwords').value.split('\n');
  setCookie('callwords', client.callwords);
}
window.changeCallwords = changeCallwords;

/**
 * Triggered by the modcall sfx dropdown
 */
export function modcall_test() {
  client.handleZZ('test#test'.split('#'));
}
window.modcall_test = modcall_test;

/**
 * Triggered by the ini button.
 */
export async function iniedit() {
  const ininame = document.getElementById('client_ininame').value;
  const inicharID = client.charID;
  await client.handleCharacterInfo(ininame.split('&'), inicharID);
  client.handlePV((`PV#0#CID#${inicharID}`).split('#'));
}
window.iniedit = iniedit;

/**
 * Triggered by the pantilt checkbox
 */
export async function switchPanTilt(addcheck) {
  const background = document.getElementById('client_fullview');
  if (addcheck === 1) {
    document.getElementById('client_pantilt').checked = true;
  } else if (addcheck === 2) {
    document.getElementById('client_pantilt').checked = false;
  }
  if (document.getElementById('client_pantilt').checked) {
    background.style.transition = '0.5s ease-in-out';
  } else {
    background.style.transition = 'none';
  }
}
window.switchPanTilt = switchPanTilt;

/**
 * Triggered by the change aspect ratio checkbox
 */
export async function switchAspectRatio() {
  const background = document.getElementById('client_background');
  const offsetCheck = document.getElementById('client_hdviewport_offset');
  if (document.getElementById('client_hdviewport').checked) {
    background.style.paddingBottom = '56.25%';
    offsetCheck.disabled = false;
  } else {
    background.style.paddingBottom = '75%';
    offsetCheck.disabled = true;
  }
}
window.switchAspectRatio = switchAspectRatio;

/**
 * Triggered by the change aspect ratio checkbox
 */
export async function switchChatOffset() {
  const container = document.getElementById('client_chatcontainer');
  if (document.getElementById('client_hdviewport_offset').checked) {
    container.style.width = '80%';
    container.style.left = '10%';
  } else {
    container.style.width = '100%';
    container.style.left = 0;
  }
}
window.switchChatOffset = switchChatOffset;

/**
 * Triggered when a character icon is clicked in the character selection menu.
 * @param {MouseEvent} event
 */
export function changeCharacter(_event) {
  document.getElementById('client_charselect').style.display = 'block';
  document.getElementById('client_emo').innerHTML = '';
}
window.changeCharacter = changeCharacter;

/**
 * Triggered when there was an error loading a character sprite.
 * @param {HTMLImageElement} image the element containing the missing image
 */
export function charError(image) {
  console.warn(`${image.src} is missing from webAO`);
  image.src = transparentPNG;
  return true;
}
window.charError = charError;

/**
 * Triggered when there was an error loading a generic sprite.
 * @param {HTMLImageElement} image the element containing the missing image
 */
export function imgError(image) {
  image.onerror = '';
  image.src = ''; // unload so the old sprite doesn't persist
  return true;
}
window.imgError = imgError;

/**
 * Triggered when there was an error loading a sound
 * @param {HTMLImageElement} image the element containing the missing sound
 */
export function opusCheck(channel) {
  console.info(channel);
  console.info(`failed to load sound ${channel.src}`);
  let oldsrc = '';
  oldsrc = channel.src;
  if (!oldsrc.endsWith('.opus')) {
    newsrc = oldsrc.replace('.mp3', '.opus');
    newsrc = newsrc.replace('.wav', '.opus');
    channel.src = newsrc; // unload so the old sprite doesn't persist
  }
}
window.opusCheck = opusCheck;

/**
 * Make a GET request for a specific URI.
 * @param {string} url the URI to be requested
 * @returns response data
 * @throws {Error} if status code is not 2xx, or a network error occurs
 */
async function requestBuffer(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'arraybuffer';
    xhr.addEventListener('error', () => {
      const err = new Error(`Request for ${url} failed: ${xhr.statusText}`);
      err.code = xhr.status;
      reject(err);
    });
    xhr.addEventListener('abort', () => {
      const err = new Error(`Request for ${url} was aborted!`);
      err.code = xhr.status;
      reject(err);
    });
    xhr.addEventListener('load', () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        const err = new Error(`Request for ${url} failed with status code ${xhr.status}`);
        err.code = xhr.status;
        reject(err);
      } else {
        resolve(xhr.response);
      }
    });
    xhr.open('GET', url, true);
    xhr.send();
  });
}

/**
 * Make a GET request for a specific URI.
 * @param {string} url the URI to be requested
 * @returns response data
 * @throws {Error} if status code is not 2xx, or a network error occurs
 */
async function request(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'text';
    xhr.addEventListener('error', () => {
      const err = new Error(`Request for ${url} failed: ${xhr.statusText}`);
      err.code = xhr.status;
      reject(err);
    });
    xhr.addEventListener('abort', () => {
      const err = new Error(`Request for ${url} was aborted!`);
      err.code = xhr.status;
      reject(err);
    });
    xhr.addEventListener('load', () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        const err = new Error(`Request for ${url} failed with status code ${xhr.status}`);
        err.code = xhr.status;
        reject(err);
      } else {
        resolve(xhr.response);
      }
    });
    xhr.open('GET', url, true);
    xhr.send();
  });
}

/**
 * Checks if a file exists at the specified URI.
 * @param {string} url the URI to be checked
 */
async function fileExists(url) {
  try {
    await request(url);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Triggered when the reconnect button is pushed.
 */
export function ReconnectButton() {
  client.cleanup();
  client = new Client(serverIP);
  if (client) {
    mode = 'join'; // HACK: see client.onOpen

    document.getElementById('client_error').style.display = 'none';
  }
}
window.ReconnectButton = ReconnectButton;

/**
 * Appends a message to the in-character chat log.
 * @param {string} msg the string to be added
 * @param {string} name the name of the sender
 */
function appendICLog(msg, showname = '', nameplate = '', time = new Date()) {
  const entry = document.createElement('p');
  const shownameField = document.createElement('span');
  const nameplateField = document.createElement('span');
  const textField = document.createElement('span');
  nameplateField.classList = 'iclog_name iclog_nameplate';
  nameplateField.appendChild(document.createTextNode(nameplate));

  shownameField.classList = 'iclog_name iclog_showname';
  if (showname === '' || !showname) { shownameField.appendChild(document.createTextNode(nameplate)); } else { shownameField.appendChild(document.createTextNode(showname)); }

  textField.className = 'iclog_text';
  textField.appendChild(document.createTextNode(msg));

  entry.appendChild(shownameField);
  entry.appendChild(nameplateField);
  entry.appendChild(textField);

  // Only put a timestamp if the minute has changed.
  if (lastICMessageTime.getMinutes() !== time.getMinutes()) {
    const timeStamp = document.createElement('span');
    timeStamp.className = 'iclog_time';
    timeStamp.innerText = time.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });
    entry.appendChild(timeStamp);
  }

  const clientLog = document.getElementById('client_log');
  clientLog.appendChild(entry);

  /* This is a little buggy - some troubleshooting might be desirable */
  if (clientLog.scrollTop > clientLog.scrollHeight - 800) {
    clientLog.scrollTop = clientLog.scrollHeight;
  }

  lastICMessageTime = new Date();
}

/**
 * check if the message contains an entry on our callword list
 * @param {String} message
 */
export function checkCallword(message) {
  client.callwords.forEach(testCallword);

  function testCallword(item) {
    if (item !== '' && message.toLowerCase().includes(item.toLowerCase())) {
      viewport.sfxaudio.pause();
      viewport.sfxaudio.src = `${AO_HOST}sounds/general/sfx-gallery.opus`;
      viewport.sfxaudio.play();
    }
  }
}

/**
 * Triggered when the music search bar is changed
 * @param {MouseEvent} event
 */
export function chartable_filter(_event) {
  const searchname = document.getElementById('client_charactersearch').value;

  client.chars.forEach((character, charid) => {
    const demothing = document.getElementById(`demo_${charid}`);
    if (character.name.toLowerCase().indexOf(searchname.toLowerCase()) === -1) {
      demothing.style.display = 'none';
    } else {
      demothing.style.display = 'inline-block';
    }
  });
}
window.chartable_filter = chartable_filter;

/**
 * Requests to play as a character.
 * @param {number} ccharacter the character ID; if this is a large number,
 * then spectator is chosen instead.
 */
export function pickChar(ccharacter) {
  if (ccharacter === -1) {
    // Spectator
    document.getElementById('client_charselect').style.display = 'none';
  } else {
    client.sendCharacter(ccharacter);
  }
}
window.pickChar = pickChar;

/**
 * Highlights and selects an emotion for in-character chat.
 * @param {string} emo the new emotion to be selected
 */
export function pickEmotion(emo) {
  try {
    if (client.selectedEmote !== -1) {
      document.getElementById(`emo_${client.selectedEmote}`).classList = 'emote_button';
    }
  } catch (err) {
    // do nothing
  }
  client.selectedEmote = emo;
  document.getElementById(`emo_${emo}`).classList = 'emote_button dark';

  document.getElementById('sendsfx').checked = (client.emote.sfx.length > 1);

  document.getElementById('sendpreanim').checked = (client.emote.zoom == 1);
}
window.pickEmotion = pickEmotion;

/**
 * Highlights and selects an evidence for in-character chat.
 * @param {string} evidence the evidence to be presented
 */
export function pickEvidence(evidenceID) {
  const evidence = Number(evidenceID);
  if (client.selectedEvidence !== evidence) {
    // Update selected evidence
    if (client.selectedEvidence > 0) {
      document.getElementById(`evi_${client.selectedEvidence}`).className = 'evi_icon';
    }
    document.getElementById(`evi_${evidence}`).className = 'evi_icon dark';
    client.selectedEvidence = evidence;

    // Show evidence on information window
    document.getElementById('evi_name').value = client.evidences[evidence - 1].name;
    document.getElementById('evi_desc').value = client.evidences[evidence - 1].desc;

    // Update icon
    const icon_id = getIndexFromSelect('evi_select', client.evidences[evidence - 1].filename);
    document.getElementById('evi_select').selectedIndex = icon_id;
    if (icon_id === 0) {
      document.getElementById('evi_filename').value = client.evidences[evidence - 1].filename;
    }
    updateEvidenceIcon();

    // Update button
    document.getElementById('evi_add').className = 'client_button hover_button inactive';
    document.getElementById('evi_edit').className = 'client_button hover_button';
    document.getElementById('evi_cancel').className = 'client_button hover_button';
    document.getElementById('evi_del').className = 'client_button hover_button';
  } else {
    cancelEvidence();
  }
}
window.pickEvidence = pickEvidence;

/**
 * Add evidence.
 */
export function addEvidence() {
  const evidence_select = document.getElementById('evi_select');
  client.sendPE(
    document.getElementById('evi_name').value,
    document.getElementById('evi_desc').value,
    evidence_select.selectedIndex === 0
      ? document.getElementById('evi_filename').value
      : evidence_select.options[evidence_select.selectedIndex].text,
  );
  cancelEvidence();
}
window.addEvidence = addEvidence;

/**
 * Edit selected evidence.
 */
export function editEvidence() {
  const evidence_select = document.getElementById('evi_select');
  const id = parseInt(client.selectedEvidence) - 1;
  client.sendEE(
    id,
    document.getElementById('evi_name').value,
    document.getElementById('evi_desc').value,
    evidence_select.selectedIndex === 0
      ? document.getElementById('evi_filename').value
      : evidence_select.options[evidence_select.selectedIndex].text,
  );
  cancelEvidence();
}
window.editEvidence = editEvidence;

/**
 * Delete selected evidence.
 */
export function deleteEvidence() {
  const id = parseInt(client.selectedEvidence) - 1;
  client.sendDE(id);
  cancelEvidence();
}
window.deleteEvidence = deleteEvidence;

/**
 * Cancel evidence selection.
 */
export function cancelEvidence() {
  // Clear evidence data
  if (client.selectedEvidence > 0) {
    document.getElementById(`evi_${client.selectedEvidence}`).className = 'evi_icon';
  }
  client.selectedEvidence = 0;

  // Clear evidence on information window
  document.getElementById('evi_select').selectedIndex = 0;
  updateEvidenceIcon(); // Update icon widget
  document.getElementById('evi_filename').value = '';
  document.getElementById('evi_name').value = '';
  document.getElementById('evi_desc').value = '';
  document.getElementById('evi_preview').src = `${AO_HOST}misc/empty.png`; // Clear icon

  // Update button
  document.getElementById('evi_add').className = 'client_button hover_button';
  document.getElementById('evi_edit').className = 'client_button hover_button inactive';
  document.getElementById('evi_cancel').className = 'client_button hover_button inactive';
  document.getElementById('evi_del').className = 'client_button hover_button inactive';
}
window.cancelEvidence = cancelEvidence;

/**
 * Find index of anything in select box.
 * @param {string} select_box the select element name
 * @param {string} value the value that need to be compared
 */
export function getIndexFromSelect(select_box, value) {
  // Find if icon alraedy existed in select box
  const select_element = document.getElementById(select_box);
  for (let i = 1; i < select_element.length; ++i) {
    if (select_element.options[i].value === value) {
      return i;
    }
  }
  return 0;
}
window.getIndexFromSelect = getIndexFromSelect;

/**
 * Set the style of the chatbox
 */
export function setChatbox(style) {
  const chatbox_theme = document.getElementById('chatbox_theme');
  const selected_theme = document.getElementById('client_chatboxselect').value;
  setCookie('chatbox', selected_theme);
  if (selected_theme === 'dynamic') {
    if (chatbox_arr.includes(style)) {
      chatbox_theme.href = `styles/chatbox/${style}.css`;
    } else {
      chatbox_theme.href = 'styles/chatbox/aa.css';
    }
  } else {
    chatbox_theme.href = `styles/chatbox/${selected_theme}.css`;
  }
}
window.setChatbox = setChatbox;

/**
 * Set the font size for the chatbox
 */
export function resizeChatbox() {
  const chatContainerBox = document.getElementById('client_chatcontainer');
  const gameHeight = document.getElementById('client_background').offsetHeight;

  chatContainerBox.style.fontSize = `${(gameHeight * 0.0521).toFixed(1)}px`;
}
window.resizeChatbox = resizeChatbox;

/**
 * Update evidence icon.
 */
export function updateEvidenceIcon() {
  const evidence_select = document.getElementById('evi_select');
  const evidence_filename = document.getElementById('evi_filename');
  const evidence_iconbox = document.getElementById('evi_preview');

  if (evidence_select.selectedIndex === 0) {
    evidence_filename.style.display = 'initial';
    evidence_iconbox.src = `${AO_HOST}evidence/${encodeURI(evidence_filename.value.toLowerCase())}`;
  } else {
    evidence_filename.style.display = 'none';
    evidence_iconbox.src = `${AO_HOST}evidence/${encodeURI(evidence_select.value.toLowerCase())}`;
  }
}
window.updateEvidenceIcon = updateEvidenceIcon;

/**
 * Update evidence icon.
 */
export function updateActionCommands(side) {
  if (side === 'jud') {
    document.getElementById('judge_action').style.display = 'inline-table';
    document.getElementById('no_action').style.display = 'none';
  } else {
    document.getElementById('judge_action').style.display = 'none';
    document.getElementById('no_action').style.display = 'inline-table';
  }

  // Update role selector
  for (let i = 0, role_select = document.getElementById('role_select').options; i < role_select.length; i++) {
    if (side === role_select[i].value) {
      role_select.selectedIndex = i;
      return;
    }
  }
}
window.updateActionCommands = updateActionCommands;

/**
 * Change background via OOC.
 */
export function changeBackgroundOOC() {
  const selectedBG = document.getElementById('bg_select');
  const changeBGCommand = document.getElementById('bg_command').value;
  const bgFilename = document.getElementById('bg_filename');

  let filename = '';
  if (selectedBG.selectedIndex === 0) {
    filename = bgFilename.value;
  } else {
    filename = selectedBG.value;
  }

  if (mode === 'join') { client.sendOOC(`/${changeBGCommand.replace('$1', filename)}`); } else if (mode === 'replay') { client.sendSelf(`BN#${filename}#%`); }
}
window.changeBackgroundOOC = changeBackgroundOOC;

/**
 * Change role via OOC.
 */
export function changeRoleOOC() {
  const new_role = document.getElementById('role_select').value;

  client.sendOOC(`/pos ${new_role}`);
  client.sendServer(`SP#${new_role}#%`);
  updateActionCommands(new_role);
}
window.changeRoleOOC = changeRoleOOC;

/**
 * Random character via OOC.
 */
export function randomCharacterOOC() {
  client.sendOOC(`/${document.getElementById('randomchar_command').value}`);
}
window.randomCharacterOOC = randomCharacterOOC;

/**
 * Call mod.
 */
export function callMod() {
  let modcall;
  if (extrafeatures.includes('modcall_reason')) {
    modcall = prompt('Please enter the reason for the modcall', '');
  }
  if (modcall == null || modcall === '') {
    // cancel
  } else {
    client.sendZZ(modcall);
  }
}
window.callMod = callMod;

/**
 * Declare witness testimony.
 */
export function initWT() {
  client.sendRT('testimony1');
}
window.initWT = initWT;

/**
 * Declare cross examination.
 */
export function initCE() {
  client.sendRT('testimony2');
}
window.initCE = initCE;

/**
 * Declare the defendant not guilty
 */
export function notguilty() {
  client.sendRT('judgeruling#0');
}
window.notguilty = notguilty;

/**
 * Declare the defendant not guilty
 */
export function guilty() {
  client.sendRT('judgeruling#1');
}
window.guilty = guilty;

/**
 * Increment defense health point.
 */
export function addHPD() {
  client.sendHP(1, String(parseInt(client.hp[0]) + 1));
}
window.addHPD = addHPD;

/**
 * Decrement defense health point.
 */
export function redHPD() {
  client.sendHP(1, String(parseInt(client.hp[0]) - 1));
}
window.redHPD = redHPD;

/**
 * Increment prosecution health point.
 */
export function addHPP() {
  client.sendHP(2, String(parseInt(client.hp[1]) + 1));
}
window.addHPP = addHPP;

/**
 * Decrement prosecution health point.
 */
export function redHPP() {
  client.sendHP(2, String(parseInt(client.hp[1]) - 1));
}
window.redHPP = redHPP;

/**
 * Update background preview.
 */
export function updateBackgroundPreview() {
  const background_select = document.getElementById('bg_select');
  const background_filename = document.getElementById('bg_filename');
  const background_preview = document.getElementById('bg_preview');

  if (background_select.selectedIndex === 0) {
    background_filename.style.display = 'initial';
    background_preview.src = `${AO_HOST}background/${encodeURI(background_filename.value.toLowerCase())}/defenseempty.png`;
  } else {
    background_filename.style.display = 'none';
    background_preview.src = `${AO_HOST}background/${encodeURI(background_select.value.toLowerCase())}/defenseempty.png`;
  }
}
window.updateBackgroundPreview = updateBackgroundPreview;

/**
 * Highlights and selects an effect for in-character chat.
 * If the same effect button is selected, then the effect is canceled.
 * @param {string} effect the new effect to be selected
 */
export function toggleEffect(button) {
  if (button.classList.contains('dark')) {
    button.className = 'client_button';
  } else {
    button.className = 'client_button dark';
  }
}
window.toggleEffect = toggleEffect;

/**
 * Highlights and selects a menu.
 * @param {string} menu the menu to be selected
 */
export function toggleMenu(menu) {
  if (menu !== selectedMenu) {
    document.getElementById(`menu_${menu}`).className = 'menu_button active';
    document.getElementById(`content_${menu}`).className = 'menu_content active';
    document.getElementById(`menu_${selectedMenu}`).className = 'menu_button';
    document.getElementById(`content_${selectedMenu}`).className = 'menu_content';
    selectedMenu = menu;
  }
}
window.toggleMenu = toggleMenu;

/**
 * Highlights and selects a shout for in-character chat.
 * If the same shout button is selected, then the shout is canceled.
 * @param {string} shout the new shout to be selected
 */
export function toggleShout(shout) {
  if (shout === selectedShout) {
    document.getElementById(`button_${shout}`).className = 'client_button';
    selectedShout = 0;
  } else {
    document.getElementById(`button_${shout}`).className = 'client_button dark';
    if (selectedShout) {
      document.getElementById(`button_${selectedShout}`).className = 'client_button';
    }
    selectedShout = shout;
  }
}
window.toggleShout = toggleShout;
