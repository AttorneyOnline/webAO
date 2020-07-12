/*
 * Glorious webAO
 * made by sD, refactored by oldmud0 and Qubrick
 * credits to aleks for original idea and source
*/

import Fingerprint2 from 'fingerprintjs2';

import { escapeChat, encodeChat, prepChat, safe_tags } from './encoding.js';

// Load some defaults for the background and evidence dropdowns
import character_arr from "./characters.js";
import background_arr from "./backgrounds.js";
import evidence_arr from "./evidence.js";
import sfx_arr from "./sounds.js";

import chatbox_arr from "./styles/chatbox/chatboxes.js";

import { EventEmitter } from "events";

import { version } from '../package.json';

let client;
let viewport;

// Get the arguments from the URL bar
const queryDict = {};
location.search.substr(1).split("&").forEach(function (item) {
	queryDict[item.split("=")[0]] = item.split("=")[1];
});

const serverIP = queryDict.ip;
let mode = queryDict.mode;

// Unless there is an asset URL specified, use the wasabi one
const DEFAULT_HOST = location.hostname ? "https://webao-full.animatedchatroom.net/base/" : "base/";
const AO_HOST = queryDict.asset || DEFAULT_HOST;
const THEME = queryDict.theme || "default";
const MUSIC_HOST = AO_HOST + "sounds/music/";

const UPDATE_INTERVAL = 60;

const transparentPNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
/**
 * Toggles AO1-style loading using paginated music packets for mobile platforms.
 * The old loading uses more smaller packets instead of a single big one,
 * which caused problems on low-memory devices in the past.
 */
let oldLoading = false;

// presettings
let selectedEffect = 0;
let selectedMenu = 1;
let selectedShout = 0;

let extrafeatures = [];

let hdid;
const options = { fonts: { extendedJsFonts: true, userDefinedFonts: ["Ace Attorney", "8bitoperator", "DINEngschrift"] }, excludes: { userAgent: true, enumerateDevices: true } };

if (window.requestIdleCallback) {
	requestIdleCallback(function () {
		Fingerprint2.get(options, function (components) {
			hdid = Fingerprint2.x64hash128(components.reduce((a, b) => `${a.value || a}, ${b.value}`), 31);
			client = new Client(serverIP);
			viewport = new Viewport();

			if (/webOS|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|PlayStation|Opera Mini/i.test(navigator.userAgent)) {
				oldLoading = true;
			}
			client.loadResources();
		});
	});
} else {
	setTimeout(function () {
		Fingerprint2.get(options, function (components) {
			hdid = Fingerprint2.x64hash128(components.reduce((a, b) => `${a.value || a}, ${b.value}`), 31);
			client = new Client(serverIP);
			viewport = new Viewport();

			if (/webOS|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|PlayStation|Opera Mini/i.test(navigator.userAgent)) {
				oldLoading = true;
			}
			client.loadResources();
		});
	}, 500);
}


let lastICMessageTime = new Date(0);

class Client extends EventEmitter {
	constructor(address) {
		super();
		this.serv = new WebSocket("ws://" + address);
		// Assign the websocket events
		this.serv.addEventListener("open", this.emit.bind(this, "open"));
		this.serv.addEventListener("close", this.emit.bind(this, "close"));
		this.serv.addEventListener("message", this.emit.bind(this, "message"));
		this.serv.addEventListener("error", this.emit.bind(this, "error"));

		this.on("open", this.onOpen.bind(this));
		this.on("close", this.onClose.bind(this));
		this.on("message", this.onMessage.bind(this));
		this.on("error", this.onError.bind(this));

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

		this.resources = {
			"holdit": {
				"src": AO_HOST + "misc/default/holdit_bubble.png",
				"duration": 720
			},
			"objection": {
				"src": AO_HOST + "misc/default/objection_bubble.png",
				"duration": 720
			},
			"takethat": {
				"src": AO_HOST + "misc/default/takethat_bubble.png",
				"duration": 840
			},
			"witnesstestimony": {
				"src": AO_HOST + "themes/" + THEME + "/witnesstestimony.gif",
				"duration": 1560,
				"sfx": AO_HOST + "sounds/general/sfx-testimony.wav"
			},
			"crossexamination": {
				"src": AO_HOST + "themes/" + THEME + "/crossexamination.gif",
				"duration": 1600,
				"sfx": AO_HOST + "sounds/general/sfx-testimony2.wav"
			},
			"guilty": {
				"src": AO_HOST + "themes/" + THEME + "/guilty.gif",
				"duration": 2870,
				"sfx": AO_HOST + "sounds/general/sfx-guilty.wav"
			},
			"notguilty": {
				"src": AO_HOST + "themes/" + THEME + "/notguilty.gif",
				"duration": 2440,
				"sfx": AO_HOST + "sounds/general/sfx-notguilty.wav"
			},
		};

		this.selectedEmote = -1;
		this.selectedEvidence = 0;

		this.checkUpdater = null;

		/**
		 * Assign handlers for all commands
		 * If you implement a new command, you need to add it here
		 */
		this.on("MS", this.handleMS.bind(this));
		this.on("CT", this.handleCT.bind(this));
		this.on("MC", this.handleMC.bind(this));
		this.on("RMC", this.handleRMC.bind(this));
		this.on("CI", this.handleCI.bind(this));
		this.on("SC", this.handleSC.bind(this));
		this.on("EI", this.handleEI.bind(this));
		this.on("FL", this.handleFL.bind(this));
		this.on("LE", this.handleLE.bind(this));
		this.on("EM", this.handleEM.bind(this));
		this.on("SM", this.handleSM.bind(this));
		this.on("MM", this.handleMM.bind(this));
		this.on("BD", this.handleBD.bind(this));
		this.on("KB", this.handleKB.bind(this));
		this.on("KK", this.handleKK.bind(this));
		this.on("DONE", this.handleDONE.bind(this));
		this.on("BN", this.handleBN.bind(this));
		this.on("HP", this.handleHP.bind(this));
		this.on("RT", this.handleRT.bind(this));
		this.on("ZZ", this.handleZZ.bind(this));
		this.on("ID", this.handleID.bind(this));
		this.on("PN", this.handlePN.bind(this));
		this.on("SI", this.handleSI.bind(this));
		this.on("ARUP", this.handleARUP.bind(this));
		this.on("CharsCheck", this.handleCharsCheck.bind(this));
		this.on("decryptor", this.handleDecryptor.bind(this));
		this.on("PV", this.handlePV.bind(this));
		this.on("CHECK", () => { });

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
		return (document.getElementById("button_present").classList.contains("dark")) ? this.selectedEvidence : 0;
	}

	/**
	 * Hook for sending messages to the server
	 * @param {string} message the message to send
	 */
	sendServer(message) {
		// console.log(message);
		this.serv.send(message);
	}

	/**
	 * Sends an out-of-character chat message.
	 * @param {string} message the message to send
	 */
	sendOOC(message) {
		setCookie("OOC_name", document.getElementById("OOC_name").value);
		this.sendServer(`CT#${escapeChat(encodeChat(document.getElementById("OOC_name").value))}#${escapeChat(encodeChat(message))}#%`);
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
	sendIC(deskmod, preanim, name, emote, message, side, sfx_name, emote_modifier, sfx_delay, objection_modifier, evidence, flip, realization, text_color, showname, other_charid, self_offset, noninterrupting_preanim, looping_sfx, screenshake) {
		let extra_cccc = ``;
		let extra_27 = ``;

		if (extrafeatures.includes("cccc_ic_support")) {
			extra_cccc = `${showname}#${other_charid}#${self_offset}#${noninterrupting_preanim}#`;

			if (extrafeatures.includes("looping_sfx")) {
				const frame_screenshake = "";
				const frame_realization = "";
				const frame_sfx = "";
	
				extra_27 = `${looping_sfx}#${screenshake}#${frame_screenshake}#${frame_realization}#${frame_sfx}#`;
			}
		}
		
		const serverMessage = `MS#${deskmod}#${preanim}#${name}#${emote}` +
			`#${escapeChat(encodeChat(message))}#${side}#${sfx_name}#${emote_modifier}` +
			`#${this.charID}#${sfx_delay}#${objection_modifier}#${evidence}#${flip}#${realization}#${text_color}#${extra_cccc}${extra_27}%`;
		
		console.log(serverMessage);
		
		this.sendServer(serverMessage);
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
		if (extrafeatures.includes("modcall_reason")) {
			this.sendServer(`ZZ#${msg}#%`);
		} else {
			this.sendServer(`ZZ#%`);
		}
	}

	/**
	 * Sends testimony command.
	 * @param {string} testimony type
	 */
	sendRT(testimony) {
		if (this.chars[this.charID].side === "jud") {
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
	 * Requests to leave the room and free the character slot.
	 * 
	 * Note: This packet is undocumented. It is not implemented by
	 * either the AO2 client or tsuserver.
	 */
	sendLeaveRoom() {
		this.sendServer("FC#%");
	}

	/**
	 * Begins the handshake process by sending an identifier
	 * to the server.
	 */
	joinServer() {
		console.log(`Your emulated HDID is ${hdid}`);

		this.sendServer(`HI#${hdid}#%`);
		this.sendServer(`ID#webAO#webAO#%`);
		this.checkUpdater = setInterval(() => this.sendCheck(), 5000);
	}

	/**
	 * Load game resources and stored settings.
	 */
	loadResources() {
		document.getElementById("client_version").innerText = "version " + version;

		// Load iniedit character array to select
		const iniedit_select = document.getElementById("client_ininame");
		character_arr.forEach(inicharacter => {
			iniedit_select.add(new Option(inicharacter));
		});

		// Load background array to select
		const background_select = document.getElementById("bg_select");
		background_select.add(new Option("Custom", 0));
		background_arr.forEach(background => {
			background_select.add(new Option(background));
		});

		// Load evidence array to select
		const evidence_select = document.getElementById("evi_select");
		evidence_select.add(new Option("Custom", 0));
		evidence_arr.forEach(evidence => {
			evidence_select.add(new Option(evidence));
		});

		// Read cookies and set the UI to its values
		document.getElementById("OOC_name").value = getCookie("OOC_name") || "web"+parseInt(Math.random()*100+10);

		// Read cookies and set the UI to its values
		var cookietheme = getCookie("theme") || "default";

		document.querySelector('#client_themeselect [value="' + cookietheme + '"]').selected = true;
		reloadTheme();

		var cookiechatbox = getCookie("chatbox") || "dynamic";

		document.querySelector('#client_chatboxselect [value="' + cookiechatbox + '"]').selected = true;
		setChatbox(cookiechatbox);

		document.getElementById("client_musicaudio").volume = getCookie("musicVolume") || 1;
		changeMusicVolume();
		document.getElementById("client_sfxaudio").volume = getCookie("sfxVolume") || 1;
		changeSFXVolume();
		document.getElementById("client_shoutaudio").volume = getCookie("shoutVolume") || 1;
		changeShoutVolume();
		document.getElementById("client_bvolume").value = getCookie("blipVolume") || 1;
		changeBlipVolume();

		document.getElementById("ic_chat_name").value = getCookie("ic_chat_name");
		document.getElementById("showname").checked = getCookie("showname");
	}

	/**
	 * Requests to play as a specified character.
	 * @param {number} character the character ID
	 */
	sendCharacter(character) {
		if (this.chars[character].name)
			this.sendServer(`CC#${this.playerID}#${character}#web#%`);
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
		if (e.code !== 1001) {
			document.getElementById("client_error").style.display = "flex";
			document.getElementById("client_loading").style.display = "none";
			document.getElementById("error_id").textContent = e.code;
			this.cleanup();
		}
	}

	/**
	 * Triggered when a packet is received from the server.
	 * @param {MessageEvent} e
	 */
	onMessage(e) {
		const msg = e.data;
		console.debug(msg);

		const lines = msg.split("%");
		const args = lines[0].split("#");
		const header = args[0];

		if (!this.emit(header, args)) {
			console.warn(`Invalid packet header ${header}`);
		}
	}

	/**
	 * Triggered when an network error occurs.
	 * @param {ErrorEvent} e 
	 */
	onError(e) {
		console.error(`A network error occurred: ${e.reason} (${e.code})`);
		document.getElementById("client_error").style.display = "flex";
		document.getElementById("error_id").textContent = e.code;
		this.cleanup();
	}

	/**
	 * Stop sending keepalives to the server.
	 */
	cleanup() {
		clearInterval(this.checkUpdater);

		// the connection got rekt, get rid of the old musiclist
		this.resetMusiclist();
		document.getElementById("client_chartable").innerHTML = "";
	}

	/**
	 * Handles an in-character chat message.
	 * @param {*} args packet arguments
	 */
	handleMS(args) {
		// TODO: this if-statement might be a bug.
		if (args[4] !== viewport.chatmsg.content) {
			document.getElementById("client_inner_chat").innerHTML = "";

			const char_id = Number(args[9]);
			const char_name = safe_tags(args[3]);

			let msg_nameplate = args[3];
			let msg_blips = "male";
			let char_chatbox = "default";
			let char_muted = false;

			try {
				msg_nameplate = this.chars[char_id].showname;
				msg_blips = this.chars[char_id].gender;
				char_chatbox = this.chars[char_id].chat;
				char_muted = this.chars[char_id].muted;				

				if(this.chars[char_id].name !== char_name) {
					console.info(this.chars[char_id].name + " is iniediting to " + char_name);
					const chargs = (char_name + "&" + "iniediter").split("&");
					this.handleCharacterInfo(chargs,char_id);
				}
			} catch (e) {
				msg_nameplate = args[3];
				msg_blips = "male";
				char_chatbox = "default";
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
				color: Number(args[15])
			};

			if (extrafeatures.includes("cccc_ic_support")) {
				const extra_cccc = {
					showname: safe_tags(args[16]),
					other_charid: Number(args[17]),
					other_name: safe_tags(args[18]),
					other_emote: safe_tags(args[19]),
					self_offset: Number(args[20]),
					other_offset: Number(args[21]),
					other_flip: Number(args[22]),
					noninterrupting_preanim: Number(args[23])
				};
				chatmsg = Object.assign(extra_cccc, chatmsg);

				if (extrafeatures.includes("looping_sfx")) {
					const extra_27 = {
						looping_sfx: Number(args[24]),
						screenshake: Number(args[25]),
						frame_screenshake: safe_tags(args[26]),
						frame_realization: safe_tags(args[27]),
						frame_sfx: safe_tags(args[28])
					};
					chatmsg = Object.assign(extra_27, chatmsg);
				} else {
					const extra_27 = {
						looping_sfx: 0,
						screenshake: 0,
						frame_screenshake: "",
						frame_realization: "",
						frame_sfx: ""
					};
					chatmsg = Object.assign(extra_27, chatmsg);
				}			
			} else {
				const extra_cccc = {
					showname: "",
					other_charid: 0,
					other_name: "",
					other_emote: "",
					self_offset: 0,
					other_offset: 0,
					other_flip: 0,
					noninterrupting_preanim: 0
				};
				chatmsg = Object.assign(extra_cccc, chatmsg);
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
		const oocLog = document.getElementById("client_ooclog");
		oocLog.innerHTML += `${prepChat(args[1])}: ${prepChat(args[2])}\r\n`;
		if (oocLog.scrollTop > oocLog.scrollHeight - 600) {
			oocLog.scrollTop = oocLog.scrollHeight;
		}
	}

	/**
	 * Handles a music change to an arbitrary resource.
	 * @param {Array} args packet arguments
	 */
	handleMC(args) {
		const track = prepChat(args[1]);
		let charID = Number(args[2]);
   
		const music = viewport.music;
		let musicname;
		music.pause();
		if(track.startsWith("http")) {
			music.src = track;
		} else {
			music.src = MUSIC_HOST + encodeURI(track.toLowerCase());
		}
		music.play();

		try {
			musicname = this.chars[charID].name;
		} catch(e) {
			charID = -1;
		}

		if (charID >= 0) {
			musicname = this.chars[charID].name;
			appendICLog(`${musicname} changed music to ${track}`);
		} else {
			appendICLog(`The music was changed to ${track}`);
		}

		document.getElementById("client_trackstatustext").innerText = track;
	}

	/**
	 * Handles a music change to an arbitrary resource, with an offset in seconds.
	 * @param {Array} args packet arguments
	 */
	handleRMC(args) {
		viewport.music.pause();
		const music = viewport.music;
		// Music offset + drift from song loading
		music.totime = args[1];
		music.offset = new Date().getTime() / 1000;
		music.addEventListener("loadedmetadata", function () {
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
			let icon = AO_HOST + "characters/" + encodeURI(chargs[0].toLowerCase()) + "/char_icon.png";
			let img = document.getElementById(`demo_${charid}`);
			img.alt = chargs[0];
			img.src = icon;	// seems like a good time to load the icon

			// If the ini doesn't exist on the server this will throw an error
			try {
				const cinidata = await request(AO_HOST + "characters/" + encodeURI(chargs[0].toLowerCase()) + "/char.ini");
				cini = INI.parse(cinidata);
			} catch (err) {
				cini = {};
				img.classList.add("noini");
				console.warn("character " + chargs[0] + " is missing from webAO");
				// If it does, give the user a visual indication that the character is unusable
			}

			const mute_select = document.getElementById("mute_select");
			mute_select.add(new Option(safe_tags(chargs[0]), charid));
			const pair_select = document.getElementById("pair_select");
			pair_select.add(new Option(safe_tags(chargs[0]), charid));

			// sometimes ini files lack important settings
			const default_options = {
				name: chargs[0],
				showname: chargs[0],
				side: "def",
				gender: "male",
				chat: "aa"
			};
			cini.options = Object.assign(default_options, cini.options);

			// sometimes ini files lack important settings
			const default_emotions = {
				number: 0
			};
			cini.emotions = Object.assign(default_emotions, cini.emotions);

			this.chars[charid] = {
				name: safe_tags(chargs[0]),
				showname: safe_tags(cini.options.showname),
				desc: safe_tags(chargs[1]),
				gender: safe_tags(cini.options.gender).toLowerCase(),
				side: safe_tags(cini.options.side).toLowerCase(),
				chat: safe_tags(cini.options.chat).toLowerCase(),
				evidence: chargs[3],
				icon: icon,
				inifile: cini,
				muted: false
			};
		} else {
			console.warn("missing charid " + charid);
			let img = document.getElementById(`demo_${charid}`);
			img.style.display = "none";
		}


	}

	/**
	 * Handles incoming character information, bundling multiple characters
	 * per packet.
	 * CI#0#Phoenix&description&&&&&#1#Miles ...
	 * @param {Array} args packet arguments
	 */
	handleCI(args) {
		document.getElementById("client_loadingtext").innerHTML = "Loading Character " + args[1];
		// Loop through the 10 characters that were sent
		for (let i = 2; i <= args.length - 2; i++) {
			if (i % 2 === 0) {
				document.getElementById("client_loadingtext").innerHTML = `Loading Character ${i}/${this.char_list_length}`;
				const chargs = args[i].split("&");
				const charid = args[i - 1];
				setTimeout(() => this.handleCharacterInfo(chargs, charid), charid*10);
			}
		}
		// Request the next pack
		this.sendServer("AN#" + ((args[1] / 10) + 1) + "#%");
	}

	/**
	 * Handles incoming character information, containing all characters
	 * in one packet.
	 * @param {Array} args packet arguments
	 */
	handleSC(args) {
		document.getElementById("client_loadingtext").innerHTML = "Loading Characters";
		for (let i = 1; i < args.length; i++) {
			document.getElementById("client_loadingtext").innerHTML = `Loading Character ${i}/${this.char_list_length}`;
			const chargs = args[i].split("&");
			const charid = i - 1;
			setTimeout(() => this.handleCharacterInfo(chargs, charid), charid*10);
		}
		// We're done with the characters, request the music
		this.sendServer("RM#%");
	}

	/**
	 * Handles incoming evidence information, containing only one evidence
	 * item per packet.
	 * 
	 * Mostly unimplemented in webAO.
	 * @param {Array} args packet arguments
	 */
	handleEI(args) {
		document.getElementById("client_loadingtext").innerHTML = `Loading Evidence ${args[1]}/${this.evidence_list_length}`;
		this.sendServer("RM#%");
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
			const arg = args[i].split("&");
			this.evidences[i - 1] = {
				name: prepChat(arg[0]),
				desc: prepChat(arg[1]),
				filename: safe_tags(arg[2]),
				icon: AO_HOST + "evidence/" + encodeURI(arg[2].toLowerCase())
			};
		}

		const evidence_box = document.getElementById("evidences");
		evidence_box.innerHTML = "";
		for (let i = 1; i <= this.evidences.length; i++) {
			evidence_box.innerHTML += `<img src="${this.evidences[i - 1].icon}" 
				id="evi_${i}" 
				alt="${this.evidences[i - 1].name}"
				class="evi_icon"
				onclick="pickEvidence(${i})">`;
		}
	}

	resetMusiclist() {
		this.musics = [];
		this.areas = [];
		document.getElementById("client_musiclist").innerHTML = "";
		document.getElementById("areas").innerHTML = "";		
	}

	isAudio(trackname) {
		if (/\.(?:wav|mp3|mp4|ogg|opus)$/i.test(trackname) || // regex for file extenstions
			trackname.startsWith("=") ||
			trackname.startsWith("-"))   // category markers
		{
			return true;
		} else {
			return false;
		}
	}

	handleMusicInfo(trackindex,trackname) {
		if (this.isAudio(trackname)) {
			// After reached the audio put everything in the music list
			const newentry = document.createElement("OPTION");
			newentry.text = trackname;
			document.getElementById("client_musiclist").options.add(newentry);
			this.musics.push(trackname);
		} else {
			const thisarea = {
				name: trackname,
				players: 0,
				status: "IDLE",
				cm: "",
				locked: "FREE"
			};

			this.areas.push(thisarea);

			// Create area button
			let newarea = document.createElement("SPAN");
			newarea.classList = "area-button area-default";
			newarea.id = "area" + trackindex;
			newarea.innerText = thisarea.name;
			newarea.title = "Players: <br>" +
				"Status: <br>" +
				"CM: ";
			newarea.onclick = function () {
				area_click(this);
			};

			document.getElementById("areas").appendChild(newarea);
		}
	}

	/**
	 * Handles incoming music information, containing multiple entries
	 * per packet.
	 * @param {Array} args packet arguments
	 */
	handleEM(args) {
		document.getElementById("client_loadingtext").innerHTML = "Loading Music";
		if(args[1] === "0") {
			this.resetMusiclist();
		}

		for (let i = 2; i < args.length - 1; i++) {
			if (i % 2 === 0) {
				document.getElementById("client_loadingtext").innerHTML = `Loading Music ${i}/${this.music_list_length}`;
				this.handleMusicInfo(args[i-1],safe_tags(args[i]));
			}
		}

		// get the next batch of tracks
		this.sendServer("AM#" + ((args[1] / 10) + 1) + "#%");
	}

	/**
	 * Handles incoming music information, containing all music in one packet.
	 * @param {Array} args packet arguments
	 */
	handleSM(args) {
		document.getElementById("client_loadingtext").innerHTML = "Loading Music ";
		this.resetMusiclist();

		for (let i = 1; i < args.length - 1; i++) {
			// Check when found the song for the first time
			document.getElementById("client_loadingtext").innerHTML = `Loading Music ${i}/${this.music_list_length}`;
			this.handleMusicInfo(i-1,safe_tags(args[i]));
		}

		// Music done, carry on
		this.sendServer("RD#%");
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
		document.getElementById("client_error").style.display = "flex";
		document.getElementById("client_errortext").innerHTML = type + ":<br>" + reason.replace(/\n/g, "<br />");
		document.getElementsByClassName("client_reconnect")[0].style.display = "none";
		document.getElementsByClassName("client_reconnect")[1].style.display = "none";
	}

	/**
	 * Handles the kicked packet
	 * @param {Array} args kick reason
	 */
	handleKK(args) {
		this.handleBans("Kicked", safe_tags(args[1]));
	}

	/**
	 * Handles the banned packet
	 * this one is sent when you are kicked off the server
	 * @param {Array} args ban reason
	 */
	handleKB(args) {
		this.handleBans("Banned", safe_tags(args[1]));
	}

	/**
	 * Handles the banned packet
	 * this one is sent when you try to reconnect but you're banned
	 * @param {Array} args ban reason
	 */
	handleBD(args) {
		this.handleBans("Banned", safe_tags(args[1]));
	}

	/**
	 * Handles the handshake completion packet, meaning the player
	 * is ready to select a character.
	 * 
	 * @param {Array} args packet arguments
	 */
	handleDONE(_args) {
		document.getElementById("client_loading").style.display = "none";
		if (mode === "watch") {		// Spectators don't need to pick a character
			document.getElementById("client_charselect").style.display = "none";
		} else {
			document.getElementById("client_charselect").style.display = "block";
		}
	}

	/**
	 * Handles a background change.
	 * @param {Array} args packet arguments
	 */
	handleBN(args) {
		viewport.bgname = safe_tags(args[1]);
		const bg_index = getIndexFromSelect("bg_select", viewport.bgname);
		document.getElementById("bg_select").selectedIndex = bg_index;
		updateBackgroundPreview();
		if (bg_index === 0) {
			document.getElementById("bg_filename").value = viewport.bgname;
		}
		document.getElementById("bg_preview").src = AO_HOST + "background/" + encodeURI(args[1].toLowerCase()) + "/defenseempty.png";
		if (this.charID === -1) {
			viewport.changeBackground("jud");
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
		if (args[1] === "1") {
			// Def hp
			this.hp[0] = args[2];
			healthbox = document.getElementById("client_defense_hp");
		} else {
			// Pro hp
			this.hp[1] = args[2];
			healthbox = document.getElementById("client_prosecutor_hp");
		}
		healthbox.getElementsByClassName("health-bar")[0].style.width = percent_hp + "%";
	}

	/**
	 * Handles a testimony states.
	 * @param {Array} args packet arguments
	 */
	handleRT(args) {
		const judgeid = Number(args[2]);
		switch (args[1]) {
			case "testimony1":
				this.testimonyID = 1;
				break;
			case "testimony2":
				//Cross Examination
				this.testimonyID = 2;
				break;
			case "judgeruling":
				this.testimonyID = 3 + judgeid;
				break;
			default:
				console.warn("Invalid testimony");
		}
		viewport.initTestimonyUpdater();
	}

	/**
	 * Handles a modcall
	 * @param {Array} args packet arguments
	 */
	handleZZ(args) {
		const oocLog = document.getElementById("client_ooclog");
		oocLog.innerHTML += `$Alert: ${prepChat(args[1])}\r\n`;
		if (oocLog.scrollTop > oocLog.scrollHeight - 60) {
			oocLog.scrollTop = oocLog.scrollHeight;
		}
		viewport.sfxaudio.pause();
		const oldvolume = viewport.sfxaudio.volume;
		viewport.sfxaudio.volume = 1;
		viewport.sfxaudio.src = AO_HOST + "sounds/general/sfx-gallery.wav";
		viewport.sfxaudio.play();
		viewport.sfxaudio.volume = oldvolume;
	}

	/**
	 * Identifies the server and issues a playerID
	 * @param {Array} args packet arguments
	 */
	handleID(args) {
		this.playerID = Number(args[1]);
		this.serverSoftware = args[2].split("&")[0];
		if (this.serverSoftware === "serverD")
			this.serverVersion = args[2].split("&")[1];
		else
			this.serverVersion = args[3];

		if (this.serverSoftware === "serverD" && this.serverVersion === "1377.152")
			oldLoading = true; // bugged version
	}

	/**
	 * Indicates how many users are on this server
	 * @param {Array} args packet arguments
	 */
	handlePN(_args) {
		this.sendServer("askchaa#%");
	}

	/**
	 * Handle the change of players in an area.
	 * @param {Array} args packet arguments
	 */
	handleARUP(args) {
		args = args.slice(1);
		for (let i = 0; i < args.length - 2; i++) {
			if (this.areas[i]) { // the server sends us ARUP before we even get the area list
				const thisarea = document.getElementById("area" + i);
				switch (Number(args[0])) {
					case 0: // playercount				
						this.areas[i].players = Number(args[i+1]);
						thisarea.innerText = `${this.areas[i].name} (${this.areas[i].players})`;
						break;
					case 1: // status
						this.areas[i].status = safe_tags(args[i+1]);
						thisarea.classList = "area-button area-" + this.areas[i].status.toLowerCase();
						break;
					case 2:
						this.areas[i].cm = safe_tags(args[i+1]);
						break;
					case 3:
						this.areas[i].locked = safe_tags(args[i+1]);
						break;
				}

				thisarea.title = `Players: ${this.areas[i].players}\n` +
					`Status: ${this.areas[i].status}\n` +
					`CM: ${this.areas[i].cm}\n` +
					`Area lock: ${this.areas[i].locked}`;
			}
		}
	}

	/**
	 * With this the server tells us which features it supports
	 * @param {Array} args list of features
	 */
	handleFL(args) {
		console.info("Server-supported features:");
		console.info(args);
		extrafeatures = args;

		if (args.includes("yellowtext")) {
			let colorselect = document.getElementById("textcolor");

			colorselect.options[colorselect.options.length] = new Option("Yellow", 5);
			colorselect.options[colorselect.options.length] = new Option("Rainbow", 6);
			colorselect.options[colorselect.options.length] = new Option("Pink", 7);
			colorselect.options[colorselect.options.length] = new Option("Cyan", 8);
		}

		if (args.includes("cccc_ic_support")) {
			document.getElementById("cccc").style.display = "";
			document.getElementById("pairing").style.display = "";
		}

		if (args.includes("flipping")) {
			document.getElementById("button_flip").style.display = "";
		}

		if (args.includes("looping_sfx")) {
			document.getElementById("button_shake").style.display = "";
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
		document.getElementById("client_chartable").innerHTML = "";

		for (let i = 0; i < this.char_list_length; i++) {
			const demothing = document.createElement("img");

			demothing.className = "demothing";
			demothing.id = `demo_${i}`;
			const demoonclick = document.createAttribute("onclick");
			demoonclick.value = `pickChar(${i})`;
			demothing.setAttributeNode(demoonclick);

			document.getElementById("client_chartable").appendChild(demothing);
		}

		// this is determined at the top of this file
		if (!oldLoading && extrafeatures.includes("fastloading")) {
			this.sendServer("RC#%");
		} else {
			this.sendServer("askchar2#%");
		}
	}

	/**
	 * Handles the list of all used and vacant characters.
	 * @param {Array} args list of all characters represented as a 0 for free or a -1 for taken
	 */
	handleCharsCheck(args) {
		for (let i = 0; i < this.char_list_length; i++) {
			let img = document.getElementById(`demo_${i}`);

			if (args[i + 1] === "-1")
				img.style.opacity = 0.25;
			else if (args[i + 1] === "0")
				img.style.opacity = 1;			
		}
	}

	/**
	 * Decryptor for the command headers
	 * @param {Array} args packet arguments
	 */
	handleDecryptor(_args) {
		// unused since AO2
	}

	/**
	 * Handles the server's assignment of a character for the player to use.
	 * PV # playerID (unused) # CID # character ID
	 * @param {Array} args packet arguments
	 */
	async handlePV(args) {
		this.charID = Number(args[3]);
		document.getElementById("client_charselect").style.display = "none";

		const me = this.character;
		this.selectedEmote = -1;
		const emotes = this.emotes;
		const emotesList = document.getElementById("client_emo");
		emotesList.style.display = "";
		emotesList.innerHTML = ""; // Clear emote box
		const ini = me.inifile;
		me.side = ini.options.side;
		updateActionCommands(me.side);
		if(ini.emotions.number === 0) {
			emotesList.innerHTML =
					`<span
					id="emo_0"
					alt="unavailable"
					class="emote_button">No emotes available</span>`;
		}else{
		for (let i = 1; i <= ini.emotions.number; i++) {
			try {
				const emoteinfo = ini.emotions[i].split("#");
				let esfx;
				let esfxd;
				try {
					esfx = ini.soundn[i] || "0";
					esfxd = Number(ini.soundt[i]) || 0;
				} catch (e) {
					console.warn("ini sound is completly missing");
					esfx = "0";
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
					frame_screenshake: "",
					frame_realization: "",
					frame_sfx: "",
					button: AO_HOST + `characters/${encodeURI(me.name.toLowerCase())}/emotions/button${i}_off.png`
				};
				emotesList.innerHTML +=
					`<img src=${emotes[i].button}
					id="emo_${i}"
					alt="${emotes[i].desc}"
					class="emote_button"
					onclick="pickEmotion(${i})">`;
			} catch (e) {
				console.error("missing emote " + i);
			}
		}
		pickEmotion(1);
		}
	}
}

class Viewport {
	constructor() {
		this.textnow = "";
		this.chatmsg = {
			"content": "",
			"objection": 0,
			"sound": "",
			"startpreanim": true,
			"startspeaking": false,
			"side": null,
			"color": 0,
			"snddelay": 0,
			"preanimdelay": 0
		};

		this.shouts = [
			undefined,
			"holdit",
			"objection",
			"takethat"
		];

		this.colors = [
			"white",
			"green",
			"red",
			"orange",
			"blue",
			"yellow",
			"rainbow",
			"pink",
			"cyan"
		];

		// Allocate multiple blip audio channels to make blips less jittery

		this.blipChannels = new Array(6);
		this.blipChannels.fill(new Audio(AO_HOST + "sounds/general/sfx-blipmale.wav"))
			.forEach(channel => channel.volume = 0.5);
		this.currentBlipChannel = 0;

		this.sfxaudio = document.getElementById("client_sfxaudio");
		this.sfxaudio.src = `${AO_HOST}sounds/general/sfx-realization.wav`;

		this.sfxplayed = 0;

		this.shoutaudio = document.getElementById("client_shoutaudio");
		this.shoutaudio.src = `${AO_HOST}misc/default/objection.wav`;

		this.music = document.getElementById("client_musicaudio");
		this.music.src = `${AO_HOST}sounds/music/trial (aa).mp3`;

		this.updater = null;
		this.testimonyUpdater = null;

		this.bgname = "gs4";

		this.lastChar = "";
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
	 * Sets the volume of the blip sound.
	 * @param {number} volume
	 */
	set blipVolume(volume) {
		this.blipChannels.forEach(channel => channel.volume = volume);
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
	async playSFX(sfxname) {
		this.sfxaudio.pause();
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

	const bench = document.getElementById("client_bench");
	const court = document.getElementById("client_court");

	const positions = {
		def: {
			bg: "defenseempty.png",
			desk: { ao2: "defensedesk.png", ao1: "bancodefensa.png" },
			speedLines: "defense_speedlines.gif"
		},
		pro: {
			bg: "prosecutorempty.png",
			desk: { ao2: "prosecutiondesk.png", ao1: "bancoacusacion.png" },
			speedLines: "prosecution_speedlines.gif"
		},
		hld: {
			bg: "helperstand.png",
			desk: null,
			speedLines: "defense_speedlines.gif"
		},
		hlp: {
			bg: "prohelperstand.png",
			desk: null,
			speedLines: "prosecution_speedlines.gif"
		},
		wit: {
			bg: "witnessempty.png",
			desk: { ao2: "stand.png", ao1: "estrado.png" },
			speedLines: "prosecution_speedlines.gif"
		},
		jud: {
			bg: "judgestand.png",
			desk: { ao2: "judgedesk.png", ao1: "judgedesk.gif" },
			speedLines: "prosecution_speedlines.gif"
		},
		jur: {
			bg: "jurystand.png",
			desk: { ao2: "jurydesk.png", ao1: "estrado.png" },
			speedLines: "defense_speedlines.gif"
		},
		sea: {
			bg: "seancestand.png",
			desk: { ao2: "seancedesk.png", ao1: "estrado.png" },
			speedLines: "prosecution_speedlines.gif"
		}
	};

	const { bg, desk, speedLines } = positions[position];

	bench.className = position + "_bench";
	court.className = position + "_court";

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
	}

	/**
	 * Intialize testimony updater 
	 */
	initTestimonyUpdater() {
		const testimonyFilenames = {
			1: "witnesstestimony",
			2: "crossexamination",
			3: "notguilty",
			4: "guilty"
		};

		const testimony = testimonyFilenames[client.testimonyID];
		if (!testimony) {
			console.warn(`Invalid testimony ID ${client.testimonyID}`);
			return;
		}

		(new Audio(client.resources[testimony].sfx)).play();

		const testimonyOverlay = document.getElementById("client_testimony");
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

	oneSuccess(promises){
		return Promise.all(promises.map(p => {
		// If a request fails, count that as a resolution so it will keep
		// waiting for other possible successes. If a request succeeds,
		// treat it as a rejection so Promise.all immediately bails out.
		return p.then(
			val => Promise.reject(val),
			err => Promise.resolve(err)
		);
		})).then(
		// If '.all' resolved, we've just got an array of errors.
		errors => Promise.reject(errors),
		// If '.all' rejected, we've got the result we wanted.
		val => Promise.resolve(val)
		);
	}

	rejectOnError(f) {
		return new Promise((resolve, reject) =>
			f.then((res) => {
				if (res.ok) resolve(f);
				else reject(f);
			})
		);
	}

	/**
	 * Adds up the frame delays to find out how long a GIF is
	 * I totally didn't steal this
	 * @param {data} gifFile the GIF data
	 */
	calculateGifLength(gifFile) {
		let d = new Uint8Array(gifFile);
		// Thanks to http://justinsomnia.org/2006/10/gif-animation-duration-calculation/
		// And http://www.w3.org/Graphics/GIF/spec-gif89a.txt
		let duration = 0;
		for (var i = 0; i < d.length; i++) {
			// Find a Graphic Control Extension hex(21F904__ ____ __00)
			if (d[i] === 0x21
				&& d[i + 1] === 0xF9
				&& d[i + 2] === 0x04
				&& d[i + 7] === 0x00) {
				// Swap 5th and 6th bytes to get the delay per frame
				let delay = (d[i + 5] << 8) | (d[i + 4] & 0xFF);

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
			1: "witnesstestimony",
			2: "crossexamination",
			3: "notguilty",
			4: "guilty"
		};

		// Update timer
		this.testimonyTimer = this.testimonyTimer + UPDATE_INTERVAL;

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
		document.getElementById("client_testimony").style.opacity = 0;
		clearTimeout(this.testimonyUpdater);
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
		this.textnow = "";
		this.sfxplayed = 0;
		this.textTimer = 0;
		this._animating = true;

		// stop updater
		clearTimeout(this.updater);

		const fg = document.getElementById("client_fg");
		const gamewindow = document.getElementById("client_gamewindow");
		const waitingBox = document.getElementById("client_chatwaiting");

		// Reset CSS animation
		fg.style.animation = "";
		gamewindow.style.animation = "";
		waitingBox.style.opacity = 0;
		
		const eviBox = document.getElementById("client_evi");		

		if (this.lastEvi !== this.chatmsg.evidence) {
			eviBox.style.opacity = "0";
			eviBox.style.height = "0%";	
		}
		this.lastEvi = this.chatmsg.evidence;

		const charSprite = document.getElementById("client_char");
		const pairSprite = document.getElementById("client_pair_char");

		const chatContainerBox = document.getElementById("client_chatcontainer");	
		const nameBoxInner = document.getElementById("client_inner_name");
		const chatBoxInner = document.getElementById("client_inner_chat");

		const displayname = (document.getElementById("showname").checked && this.chatmsg.showname !== "") ? this.chatmsg.showname : this.chatmsg.nameplate;

		//Clear out the last message
		chatBoxInner.innerText = this.textnow;
		nameBoxInner.innerText = displayname;
		
		if (this.lastChar !== this.chatmsg.name) {
			charSprite.style.opacity = 0;
			charSprite.src = transparentPNG;
			pairSprite.style.opacity = 0;
			pairSprite.src = transparentPNG;
		}
		this.lastChar = this.chatmsg.name;

		appendICLog(this.chatmsg.content, displayname);

		// start checking the files
		try {
			const { url: speakUrl } = await this.oneSuccess([
				this.rejectOnError(fetch(AO_HOST + "characters/" + encodeURI(this.chatmsg.name.toLowerCase()) + "/" + this.chatmsg.sprite + ".png")),
				this.rejectOnError(fetch(AO_HOST + "characters/" + encodeURI(this.chatmsg.name.toLowerCase()) + "/(b)" + this.chatmsg.sprite + ".gif"))
			]);
			this.speakingSprite = speakUrl ? speakUrl : transparentPNG;
		} catch (error) {
			this.speakingSprite = AO_HOST + "characters/" + encodeURI(this.chatmsg.name.toLowerCase()) + "/(b)" + this.chatmsg.sprite + ".gif";
		}

		try {
			const { url: silentUrl } = await this.oneSuccess([
				this.rejectOnError(fetch(AO_HOST + "characters/" + encodeURI(this.chatmsg.name.toLowerCase()) + "/" + this.chatmsg.sprite + ".png")),
				this.rejectOnError(fetch(AO_HOST + "characters/" + encodeURI(this.chatmsg.name.toLowerCase()) + "/(a)" + this.chatmsg.sprite + ".gif"))
			]);
			this.silentSprite = silentUrl ? silentUrl : transparentPNG;
		} catch (error) {
			this.silentSprite = AO_HOST + "characters/" + encodeURI(this.chatmsg.name.toLowerCase()) + "/(a)" + this.chatmsg.sprite + ".gif";
		}

		if (this.chatmsg.other_name) {
			try {
				const { url: pairUrl } = await this.oneSuccess([
					this.rejectOnError(fetch(AO_HOST + "characters/" + encodeURI(this.chatmsg.other_name.toLowerCase()) + "/" + this.chatmsg.sprite + ".png")),
					this.rejectOnError(fetch(AO_HOST + "characters/" + encodeURI(this.chatmsg.other_name.toLowerCase()) + "/(a)" + this.chatmsg.sprite + ".gif"))
				]);
				this.pairSilent = pairUrl ? pairUrl : transparentPNG;
			} catch (error) {
				this.pairSilent = AO_HOST + "characters/" + encodeURI(this.chatmsg.other_name.toLowerCase()) + "/(a)" + this.chatmsg.other_emote + ".gif";
			}
		}

		// gets which shout shall played
		const shoutSprite = document.getElementById("client_shout");
		const shout = this.shouts[this.chatmsg.objection];
		if (shout) {
			// Hide message box
			chatContainerBox.style.opacity = 0;
			shoutSprite.src = client.resources[shout]["src"];
			shoutSprite.style.opacity = 1;
			shoutSprite.style.animation = "bubble 700ms steps(10, jump-both)";

			let shoutUrl;

			try {
			const { url: soundUrl } = await this.oneSuccess([
				this.rejectOnError(fetch(`${AO_HOST}characters/${encodeURI(this.chatmsg.name.toLowerCase())}/${shout}.wav`)),
				this.rejectOnError(fetch(`${AO_HOST}misc/default/objection.wav`))
			]);
			shoutUrl = soundUrl;
			} catch (error) {
				shoutUrl = AO_HOST + `${AO_HOST}characters/${encodeURI(this.chatmsg.name.toLowerCase())}/${shout}.wav`;
			}

			this.shoutaudio.src = shoutUrl;
			this.shoutaudio.play();
			this.shoutTimer = client.resources[shout]["duration"];
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
				// due to a retarded client bug, we need to strip the sfx from the MS, if the preanim isn't playing
				this.chatmsg.sound = "";
				this.chatmsg.startspeaking = true;
				break;
		}
		this.chatmsg.preanimdelay = parseInt(gifLength);

		this.changeBackground(chatmsg.side);

		setChatbox(chatmsg.chatbox);
		resizeChatbox();

		// Flip the character
		if (this.chatmsg.flip === 1) {
			charSprite.style.transform = "scaleX(-1)";
		} else {
			charSprite.style.transform = "scaleX(1)";
		}

		// flip the paired character
		if (this.chatmsg.other_flip === 1) {
			pairSprite.style.transform = "scaleX(-1)";
		} else {
			pairSprite.style.transform = "scaleX(1)";
		}

		this.blipChannels.forEach(channel => channel.src = `${AO_HOST}sounds/general/sfx-blip${encodeURI(this.chatmsg.blips.toLowerCase())}.wav`);

		// process markup
		if(this.chatmsg.content.startsWith("~~")) {
			chatBoxInner.style.textAlign = "center";
			this.chatmsg.content = this.chatmsg.content.substring(2, this.chatmsg.content.length);
		} else {
			chatBoxInner.style.textAlign = "inherit";
		}

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

		const gamewindow = document.getElementById("client_gamewindow");
		const waitingBox = document.getElementById("client_chatwaiting");
		const charSprite = document.getElementById("client_char");
		const pairSprite = document.getElementById("client_pair_char");
		const eviBox = document.getElementById("client_evi");
		const shoutSprite = document.getElementById("client_shout");
		const chatBoxInner = document.getElementById("client_inner_chat");
		const chatBox = document.getElementById("client_chat");

		// TODO: preanims sometimes play when they're not supposed to
		if (this.textTimer >= this.shoutTimer && this.chatmsg.startpreanim) {
			// Effect stuff
			if (this.chatmsg.screenshake === 1) {
				// Shake screen
				this.playSFX(AO_HOST + "sounds/general/sfx-stab.wav");
				gamewindow.style.animation = "shake 0.2s 1";
			}
			if (this.chatmsg.flash === 1) {
				// Flash screen
				this.playSFX(AO_HOST + "sounds/general/sfx-realization.wav");
				document.getElementById("client_fg").style.animation = "flash 0.4s 1";
			}

			// Pre-animation stuff
			if (this.chatmsg.preanimdelay > 0) {
				shoutSprite.style.opacity = 0;
				shoutSprite.style.animation = "";
				const charName = this.chatmsg.name.toLowerCase();
				const preanim = this.chatmsg.preanim.toLowerCase();
				charSprite.src = `${AO_HOST}characters/${encodeURI(charName)}/${encodeURI(preanim)}.gif`;
				charSprite.style.opacity = 1;
			}

			if (this.chatmsg.other_name) {
				const pairName = this.chatmsg.other_name.toLowerCase();
				const pairEmote = this.chatmsg.other_emote.toLowerCase();
				pairSprite.style.left = this.chatmsg.other_offset + "%";
				charSprite.style.left = this.chatmsg.self_offset + "%";
				pairSprite.src = this.pairSilent;
				pairSprite.style.opacity = 1;
			} else {
				pairSprite.style.opacity = 0;
				charSprite.style.left = 0;
			}

			this.chatmsg.startpreanim = false;
			this.chatmsg.startspeaking = true;
		} else if (this.textTimer >= this.shoutTimer + this.chatmsg.preanimdelay && !this.chatmsg.startpreanim) {
			if (this.chatmsg.startspeaking) {
				if (this.chatmsg.evidence > 0) {
					// Prepare evidence
					eviBox.src = safe_tags(client.evidences[this.chatmsg.evidence - 1].icon);

					eviBox.style.width = "auto";
					eviBox.style.height = "36.5%";
					eviBox.style.opacity = 1;

					if (this.chatmsg.side === "def") {
						// Only def show evidence on right
						eviBox.style.right = "1em";
						eviBox.style.left = "initial";
					} else {
						eviBox.style.right = "initial";
						eviBox.style.left = "1em";
					}
				}

				resizeChatbox();

				const chatContainerBox = document.getElementById("client_chatcontainer");
				chatContainerBox.style.opacity = 1;

				chatBoxInner.className = "text_" + this.colors[this.chatmsg.color];

				this.chatmsg.startspeaking = false;

				if (this.chatmsg.preanimdelay === 0) {
					shoutSprite.style.opacity = 0;
					shoutSprite.style.animation = "";
				}

				if (extrafeatures.includes("cccc_ic_support")) {
					if (this.chatmsg.other_name) {
						const pairName = this.chatmsg.other_name.toLowerCase();
						const pairEmote = this.chatmsg.other_emote.toLowerCase();
						pairSprite.style.left = this.chatmsg.other_offset + "%";
						charSprite.style.left = this.chatmsg.self_offset + "%";
						pairSprite.src = this.pairSilent;
						pairSprite.style.opacity = 1;
					} else {
						pairSprite.style.opacity = 0;
						charSprite.style.left = 0;
					}
				}

				charSprite.src = this.speakingSprite;
				charSprite.style.opacity = 1;

				if (this.textnow === this.chatmsg.content) {
					charSprite.src = this.silentSprite;
					charSprite.style.opacity = 1;
					waitingBox.style.opacity = 1;
					this._animating = false;
					clearTimeout(this.updater);
				}
			} else {
				if (this.textnow !== this.chatmsg.content) {
					if (this.chatmsg.content.charAt(this.textnow.length) !== " ") {
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
						charSprite.src = this.silentSprite;
						charSprite.style.opacity = 1;
						waitingBox.style.opacity = 1;
						clearTimeout(this.updater);
					}
				}
			}
		}

		if (!this.sfxplayed && this.chatmsg.snddelay + this.shoutTimer >= this.textTimer) {
			this.sfxplayed = 1;
			if (this.chatmsg.sound !== "0" && this.chatmsg.sound !== "1" && this.chatmsg.sound !== "" && this.chatmsg.sound !== undefined) {
				this.playSFX(AO_HOST + "sounds/general/" + encodeURI(this.chatmsg.sound.toLowerCase()) + ".wav");
			}
		}
		this.textTimer = this.textTimer + UPDATE_INTERVAL;
	}
}

class INI {
	static parse(data) {
		const regex = {
			section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
			param: /^\s*([\w.\-_]+)\s*=\s*(.*?)\s*$/,
			comment: /^\s*;.*$/
		};
		const value = {};
		const lines = data.split(/\r\n|\r|\n/);
		let section;
		lines.forEach(function (line) {
			if (regex.comment.test(line)) {
				return;
			} else if (line.length === 0) {
				return;
			} else if (regex.param.test(line)) {
				const match = line.match(regex.param);
				if (section) {
					if (match[1].toLowerCase() === "showname") {	//don't lowercase the showname
						value[section]["showname"] = match[2];
					} else {
						value[section][match[1].toLowerCase()] = match[2].toLowerCase();
					}
					//} else { // we don't care about attributes without a section
					//	value[match[1]] = match[2];
				}
			} else if (regex.section.test(line)) {
				const match = line.match(regex.section);
				value[match[1].toLowerCase()] = {};				//lowercase everything else
				section = match[1].toLowerCase();
			}
		});
		return value;
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
		const name = cname + "=";
		const decodedCookie = decodeURIComponent(document.cookie);
		const ca = decodedCookie.split(';');
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) === ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) === 0) {
				return c.substring(name.length, c.length);
			}
		}
		return "";
	} catch (error) {
		return "";
	}
}

/**
 * set a cookie
 * the version from w3schools expects these to expire
 * @param {String} cname The name of the cookie to return
 * @param {String} value The value of that cookie option
 */
function setCookie(cname, value) {
	document.cookie = cname + "=" + value;
}

/**
 * Triggered when the Return key is pressed on the out-of-character chat input box.
 * @param {KeyboardEvent} event
 */
export function onOOCEnter(event) {
	if (event.keyCode === 13) {
		client.sendOOC(document.getElementById("client_oocinputbox").value);
		document.getElementById("client_oocinputbox").value = "";
	}
}
window.onOOCEnter = onOOCEnter;

/**
 * Triggered when the Return key is pressed on the in-character chat input box.
 * @param {KeyboardEvent} event
 */
export function onEnter(event) {
	if (event.keyCode === 13) {
		const mychar = client.character;
		const myemo = client.emote;
		const evi = client.evidence;
		const flip = ((document.getElementById("button_flip").classList.contains("dark")) ? 1 : 0);
		const flash = ((document.getElementById("button_flash").classList.contains("dark")) ? 1 : 0);
		const screenshake = ((document.getElementById("button_shake").classList.contains("dark")) ? 1 : 0);
		const noninterrupting_preanim = ((document.getElementById("check_nonint").checked) ? 1 : 0);
		const looping_sfx = ((document.getElementById("check_loopsfx").checked) ? 1 : 0);
		const color = document.getElementById("textcolor").value;
		const showname = document.getElementById("ic_chat_name").value;
		const text = document.getElementById("client_inputbox").value;
		const pairchar = document.getElementById("pair_select").value;
		const pairoffset = document.getElementById("pair_offset").value;
		let sfxname = "0";
		let sfxdelay = 0;
		let preanim = "-";
		if (document.getElementById("sendsfx").checked) {
			sfxname = myemo.sfx;
			sfxdelay = myemo.sfxdelay;
		}

		if (document.getElementById("sendpreanim").checked) {
			preanim = myemo.preanim;
		}

		client.sendIC("chat", preanim, mychar.name, myemo.emote,
			text, mychar.side,
			sfxname, myemo.zoom, sfxdelay, selectedShout, evi, flip,
			flash, color, showname, pairchar, pairoffset, noninterrupting_preanim, looping_sfx, screenshake);
	}
}
window.onEnter = onEnter;

/**
 * Resets the IC parameters for the player to enter a new chat message.
 * This should only be called when the player's previous chat message
 * was successfully sent/presented.
 */
function resetICParams() {
	document.getElementById("client_inputbox").value = "";
	document.getElementById("button_flash").className = "client_button";
	document.getElementById("button_shake").className = "client_button";

	document.getElementById("sendpreanim").checked = false;

	if (selectedShout) {
		document.getElementById("button_" + selectedShout).className = "client_button";
		selectedShout = 0;
	}	
}

/**
 * Triggered when the music search bar is changed
 * @param {MouseEvent} event
 */
export function musiclist_filter(_event) {
	const musiclist_element = document.getElementById("client_musiclist");
	const searchname = document.getElementById("client_musicsearch").value;

	musiclist_element.innerHTML = "";

	for (const trackname of client.musics){
		if (trackname.toLowerCase().indexOf(searchname.toLowerCase()) !== -1) { 
			const newentry = document.createElement("OPTION");
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
	const playtrack = document.getElementById("client_musiclist").value;
	client.sendMusicChange(playtrack);

	// This is here so you can't actually select multiple tracks,
	// even though the select tag has the multiple option to render differently
	let musiclist_elements = document.getElementById("client_musiclist").selectedOptions;
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
	const mutelist = document.getElementById("mute_select");
	const selected_character = mutelist.options[mutelist.selectedIndex];

	if (client.chars[selected_character.value].muted === false) {
		client.chars[selected_character.value].muted = true;
		selected_character.text = client.chars[selected_character.value].name + " (muted)";
		console.info("muted " + client.chars[selected_character.value].name);
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
	setCookie("showname", document.getElementById("showname").checked);
	setCookie("ic_chat_name", document.getElementById("ic_chat_name").value);
}
window.showname_click = showname_click;

/**
 * Triggered when an item on the area list is clicked.
 * @param {MouseEvent} event
 */
export function area_click(el) {
	const area = client.areas[el.id.substr(4)].name;
	client.sendMusicChange(area);

	const areaHr = document.createElement("div");
	areaHr.className = "hrtext";
	areaHr.textContent = `switched to ${el.textContent}`;
	document.getElementById("client_log").appendChild(areaHr);
}
window.area_click = area_click;

/**
 * Triggered by the music volume slider.
 */
export function changeMusicVolume() {
	setCookie("musicVolume", document.getElementById("client_musicaudio").volume);
}
window.changeMusicVolume = changeMusicVolume;

/**
 * Triggered by the sound effect volume slider.
 */
export function changeSFXVolume() {
	setCookie("sfxVolume", document.getElementById("client_sfxaudio").volume);
}
window.changeSFXVolume = changeSFXVolume;

/**
 * Triggered by the shout volume slider.
 */
export function changeShoutVolume() {
	setCookie("shoutVolume", document.getElementById("client_shoutaudio").volume);
}
window.changeShoutVolume = changeShoutVolume;

/**
 * Triggered by the blip volume slider.
 */
export function changeBlipVolume() {
	viewport.blipVolume = document.getElementById("client_bvolume").value;
	setCookie("blipVolume", document.getElementById("client_bvolume").value);
}
window.changeBlipVolume = changeBlipVolume;

/**
 * Triggered by the theme selector.
 */
export function reloadTheme() {
	viewport.theme = document.getElementById("client_themeselect").value;
	setCookie("theme", viewport.theme);
	document.getElementById("client_theme").href = "styles/" + viewport.theme + ".css";
}
window.reloadTheme = reloadTheme;

/**
 * Triggered by the modcall sfx dropdown
 */
export function modcall_test() {
	client.handleZZ("test#test".split("#"));
}
window.modcall_test = modcall_test;

/**
 * Triggered by the ini button.
 */
export async function iniedit() {
	const ininame = document.getElementById("client_ininame").value;
	const inicharID = client.charID;
	await client.handleCharacterInfo(ininame.split("&"), inicharID);
	client.handlePV(("PV#0#CID#" + inicharID).split("#"));
}
window.iniedit = iniedit;

/**
 * Triggered by the change aspect ratio checkbox
 */
export async function switchAspectRatio() {
	const background = document.getElementById("client_background");
	const offsetCheck = document.getElementById("client_hdviewport_offset");
	if(document.getElementById("client_hdviewport").checked) {
		background.style.paddingBottom = "56.25%";
		offsetCheck.disabled = false;
	} else {
		background.style.paddingBottom = "75%";
		offsetCheck.disabled = true;
	}
}
window.switchAspectRatio = switchAspectRatio;

/**
 * Triggered by the change aspect ratio checkbox
 */
export async function switchChatOffset() {
	const container = document.getElementById("client_chatcontainer");
	if(document.getElementById("client_hdviewport_offset").checked) {
		container.style.width = "80%";
		container.style.left = "10%";
	} else {
		container.style.width = "100%";
		container.style.left = 0;
	}
}
window.switchChatOffset = switchChatOffset;

/**
 * Triggered when a character icon is clicked in the character selection menu.
 * @param {MouseEvent} event
 */
export function changeCharacter(_event) {
	client.sendLeaveRoom();
	document.getElementById("client_charselect").style.display = "block";
	document.getElementById("client_emo").innerHTML = "";
}
window.changeCharacter = changeCharacter;

/**
 * Triggered when there was an error loading a character sprite.
 * @param {HTMLImageElement} image the element containing the missing image
 */
export function charError(image) {
	console.warn(image.src + " is missing from webAO");
	//image.src = transparentPNG;
	return true;
}
window.charError = charError;

/**
 * Triggered when there was an error loading a generic sprite.
 * @param {HTMLImageElement} image the element containing the missing image
 */
export function imgError(image) {
	image.onerror = "";
	image.src = ""; //unload so the old sprite doesn't persist
	return true;
}
window.imgError = imgError;

/**
 * Make a GET request for a specific URI.
 * @param {string} url the URI to be requested
 * @returns response data
 * @throws {Error} if status code is not 2xx, or a network error occurs
 */
async function requestBuffer(url) {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.responseType = "arraybuffer";
		xhr.addEventListener("error", () => {
			const err = new Error(`Request for ${url} failed: ${xhr.statusText}`);
			err.code = xhr.status;
			reject(err);
		});
		xhr.addEventListener("abort", () => {
			const err = new Error(`Request for ${url} was aborted!`);
			err.code = xhr.status;
			reject(err);
		});
		xhr.addEventListener("load", () => {
			if (xhr.status < 200 || xhr.status >= 300) {
				const err = new Error(`Request for ${url} failed with status code ${xhr.status}`);
				err.code = xhr.status;
				reject(err);
			} else {
				resolve(xhr.response);
			}
		});
		xhr.open("GET", url, true);
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
		xhr.responseType = "text";
		xhr.addEventListener("error", () => {
			const err = new Error(`Request for ${url} failed: ${xhr.statusText}`);
			err.code = xhr.status;
			reject(err);
		});
		xhr.addEventListener("abort", () => {
			const err = new Error(`Request for ${url} was aborted!`);
			err.code = xhr.status;
			reject(err);
		});
		xhr.addEventListener("load", () => {
			if (xhr.status < 200 || xhr.status >= 300) {
				const err = new Error(`Request for ${url} failed with status code ${xhr.status}`);
				err.code = xhr.status;
				reject(err);
			} else {
				resolve(xhr.response);
			}
		});
		xhr.open("GET", url, true);
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
		if (err.code >= 400) return false;
		else throw err;
	}
}

/**
 * Triggered when the reconnect button is pushed.
 */
export function ReconnectButton() {
	client.cleanup();
	client = new Client(serverIP);
	if (client) {
		mode = "join"; // HACK: see client.onOpen

		document.getElementById("client_error").style.display = "none";

	}
}
window.ReconnectButton = ReconnectButton;

/**
 * Appends a message to the in-character chat log.
 * @param {string} msg the string to be added
 * @param {string} name the name of the sender
 */
function appendICLog(msg, name = "", time = new Date()) {
	const entry = document.createElement("p");
	const nameField = document.createElement("span");
	const textField = document.createElement("span");
	nameField.className = "iclog_name";
	nameField.appendChild(document.createTextNode(name));

	textField.className = "iclog_text";
	textField.appendChild(document.createTextNode(msg));

	entry.appendChild(nameField);
	entry.appendChild(textField);

	// Only put a timestamp if the minute has changed.
	if (lastICMessageTime.getMinutes() !== time.getMinutes()) {
		const timeStamp = document.createElement("span");
		timeStamp.className = "iclog_time";
		timeStamp.innerText = time.toLocaleTimeString(undefined, {
			hour: "numeric",
			minute: "2-digit"
		});
		entry.appendChild(timeStamp);
	}

	const clientLog = document.getElementById("client_log");
	clientLog.appendChild(entry);

	/* This is a little buggy - some troubleshooting might be desirable */
	if (clientLog.scrollTop > clientLog.scrollHeight - 800) {
		clientLog.scrollTop = clientLog.scrollHeight;
	}

	lastICMessageTime = new Date();
}

/**
 * Triggered when the music search bar is changed
 * @param {MouseEvent} event
 */
export function chartable_filter(_event) {
	const searchname = document.getElementById("client_charactersearch").value;

	client.chars.forEach(function (character, charid) {
		const demothing = document.getElementById(`demo_${charid}`);
		if (character.name.toLowerCase().indexOf(searchname.toLowerCase()) === -1) { 
			demothing.style.display = "none";
		} else {
			demothing.style.display = "inline-block";
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
	if (ccharacter===-1) {
		// Spectator
		document.getElementById("client_charselect").style.display = "none";		
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
			document.getElementById("emo_" + client.selectedEmote).classList="emote_button";
		}
	} catch (err) {
		// do nothing
	}
	client.selectedEmote = emo;
	document.getElementById("emo_" + emo).classList="emote_button dark";
}
window.pickEmotion = pickEmotion;

/**
 * Highlights and selects an evidence for in-character chat.
 * @param {string} evidence the evidence to be presented
 */
export function pickEvidence(evidenceID) {
	const evidence = Number(evidenceID);
	if (client.selectedEvidence !== evidence) {
		//Update selected evidence		
		if (client.selectedEvidence > 0) {
			document.getElementById("evi_" + client.selectedEvidence).className = "evi_icon";
		}
		document.getElementById("evi_" + evidence).className = "evi_icon dark";
		client.selectedEvidence = evidence;

		// Show evidence on information window
		document.getElementById("evi_name").value = client.evidences[evidence - 1].name;
		document.getElementById("evi_desc").value = client.evidences[evidence - 1].desc;

		// Update icon
		const icon_id = getIndexFromSelect("evi_select", client.evidences[evidence - 1].filename);
		document.getElementById("evi_select").selectedIndex = icon_id;
		if (icon_id === 0) {
			document.getElementById("evi_filename").value = client.evidences[evidence - 1].filename;
		}
		updateEvidenceIcon();

		// Update button
		document.getElementById("evi_add").className = "client_button hover_button inactive";
		document.getElementById("evi_edit").className = "client_button hover_button";
		document.getElementById("evi_cancel").className = "client_button hover_button";
		document.getElementById("evi_del").className = "client_button hover_button";
	} else {
		cancelEvidence();
	}
}
window.pickEvidence = pickEvidence;

/**
 * Add evidence.
 */
export function addEvidence() {
	const evidence_select = document.getElementById("evi_select");
	client.sendPE(document.getElementById("evi_name").value,
		document.getElementById("evi_desc").value,
		evidence_select.selectedIndex === 0 ?
			document.getElementById("evi_filename").value :
			evidence_select.options[evidence_select.selectedIndex].text
	);
	cancelEvidence();
}
window.addEvidence = addEvidence;

/**
 * Edit selected evidence.
 */
export function editEvidence() {
	const evidence_select = document.getElementById("evi_select");
	const id = parseInt(client.selectedEvidence) - 1;
	client.sendEE(id,
		document.getElementById("evi_name").value,
		document.getElementById("evi_desc").value,
		evidence_select.selectedIndex === 0 ?
			document.getElementById("evi_filename").value :
			evidence_select.options[evidence_select.selectedIndex].text
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
	//Clear evidence data
	if (client.selectedEvidence > 0) {
		document.getElementById("evi_" + client.selectedEvidence).className = "evi_icon";
	}
	client.selectedEvidence = 0;

	// Clear evidence on information window
	document.getElementById("evi_select").selectedIndex = 0;
	updateEvidenceIcon(); // Update icon widget
	document.getElementById("evi_filename").value = "";
	document.getElementById("evi_name").value = "";
	document.getElementById("evi_desc").value = "";
	document.getElementById("evi_preview").src = AO_HOST + "misc/empty.png"; //Clear icon

	// Update button
	document.getElementById("evi_add").className = "client_button hover_button";
	document.getElementById("evi_edit").className = "client_button hover_button inactive";
	document.getElementById("evi_cancel").className = "client_button hover_button inactive";
	document.getElementById("evi_del").className = "client_button hover_button inactive";
}
window.cancelEvidence = cancelEvidence;

/**
 * Find index of anything in select box.
 * @param {string} select_box the select element name
 * @param {string} value the value that need to be compared
 */
export function getIndexFromSelect(select_box, value) {
	//Find if icon alraedy existed in select box
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
	const chatbox_theme = document.getElementById("chatbox_theme");
	const selected_theme = document.getElementById("client_chatboxselect").value;
	setCookie("chatbox", selected_theme);
	if(selected_theme === "dynamic") {
		if (chatbox_arr.includes(style)) {
			chatbox_theme.href = "styles/chatbox/" + style + ".css";
		} else {
			chatbox_theme.href = "styles/chatbox/aa.css";
		}
	} else {
		chatbox_theme.href = "styles/chatbox/" + selected_theme + ".css";
	}
}
window.setChatbox = setChatbox;

/**
 * Set the font size for the chatbox
 */
export function resizeChatbox() {
	const chatContainerBox = document.getElementById("client_chatcontainer");
	const gameHeight = document.getElementById("client_background").offsetHeight;
                
	chatContainerBox.style.fontSize = (gameHeight * 0.0521).toFixed(1) + "px";
}
window.resizeChatbox = resizeChatbox;

/**
 * Update evidence icon.
 */
export function updateEvidenceIcon() {
	const evidence_select = document.getElementById("evi_select");
	const evidence_filename = document.getElementById("evi_filename");
	const evidence_iconbox = document.getElementById("evi_preview");

	if (evidence_select.selectedIndex === 0) {
		evidence_filename.style.display = "initial";
		evidence_iconbox.src = AO_HOST + "evidence/" + encodeURI(evidence_filename.value.toLowerCase());
	} else {
		evidence_filename.style.display = "none";
		evidence_iconbox.src = AO_HOST + "evidence/" + encodeURI(evidence_select.value.toLowerCase());
	}
}
window.updateEvidenceIcon = updateEvidenceIcon;

/**
 * Update evidence icon.
 */
export function updateActionCommands(side) {
	if (side === "jud") {
		document.getElementById("judge_action").style.display = "inline-table";
		document.getElementById("no_action").style.display = "none";
	} else {
		document.getElementById("judge_action").style.display = "none";
		document.getElementById("no_action").style.display = "inline-table";
	}

	// Update role selector
	for (let i = 0, role_select = document.getElementById("role_select").options; i < role_select.length; i++) {
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
	const selectedBG = document.getElementById("bg_select");
	const changeBGCommand = document.getElementById("bg_command").value;
	const bgFilename = document.getElementById("bg_filename");

	let filename = "";
	if (selectedBG.selectedIndex === 0) {
		filename = bgFilename.value;
	} else {
		filename = selectedBG.value;
	}
	client.sendOOC("/" + changeBGCommand.replace("$1", filename));
}
window.changeBackgroundOOC = changeBackgroundOOC;

/**
 * Change role via OOC.
 */
export function changeRoleOOC() {
	const role_select = document.getElementById("role_select");
	const role_command = document.getElementById("role_command").value;

	client.sendOOC("/" + role_command.replace("$1", role_select.value));
	updateActionCommands(role_select.value);
}
window.changeRoleOOC = changeRoleOOC;

/**
 * Random character via OOC.
 */
export function randomCharacterOOC() {
	client.sendOOC("/" + document.getElementById("randomchar_command").value);
}
window.randomCharacterOOC = randomCharacterOOC;

/**
 * Call mod.
 */
export function callMod() {
	let modcall;
	if (extrafeatures.includes("modcall_reason")) {
	modcall = prompt("Please enter the reason for the modcall", "");
	}
	if (modcall == null || modcall === "") {
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
	client.sendRT("testimony1");
}
window.initWT = initWT;

/**
 * Declare cross examination.
 */
export function initCE() {
	client.sendRT("testimony2");
}
window.initCE = initCE;

/**
 * Declare the defendant not guilty
 */
export function notguilty() {
	client.sendRT("judgeruling#0");
}
window.notguilty = notguilty;

/**
 * Declare the defendant not guilty
 */
export function guilty() {
	client.sendRT("judgeruling#1");
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
	const background_select = document.getElementById("bg_select");
	const background_filename = document.getElementById("bg_filename");
	const background_preview = document.getElementById("bg_preview");

	if (background_select.selectedIndex === 0) {
		background_filename.style.display = "initial";
		background_preview.src = AO_HOST + "background/" + encodeURI(background_filename.value.toLowerCase()) + "/defenseempty.png";
	} else {
		background_filename.style.display = "none";
		background_preview.src = AO_HOST + "background/" + encodeURI(background_select.value.toLowerCase()) + "/defenseempty.png";
	}
}
window.updateBackgroundPreview = updateBackgroundPreview;

/**
 * Highlights and selects an effect for in-character chat.
 * If the same effect button is selected, then the effect is canceled.
 * @param {string} effect the new effect to be selected
 */
export function toggleEffect(button) {
	if (button.classList.contains("dark")) {
		button.className = "client_button";
	} else {
		button.className = "client_button dark";
	}
}
window.toggleEffect = toggleEffect;

/**
 * Highlights and selects a menu.
 * @param {string} menu the menu to be selected
 */
export function toggleMenu(menu) {
	if (menu !== selectedMenu) {
		document.getElementById("menu_" + menu).className = "menu_button active";
		document.getElementById("content_" + menu).className = "menu_content active";
		document.getElementById("menu_" + selectedMenu).className = "menu_button";
		document.getElementById("content_" + selectedMenu).className = "menu_content";
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
		document.getElementById("button_" + shout).className = "client_button";
		selectedShout = 0;
	} else {
		document.getElementById("button_" + shout).className = "client_button dark";
		if (selectedShout) {
			document.getElementById("button_" + selectedShout).className = "client_button";
		}
		selectedShout = shout;
	}
}
window.toggleShout = toggleShout;