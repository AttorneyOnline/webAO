/*
 * Glorious webAO
 * made by sD, refactored by oldmud0
 * credits to aleks for original idea and source
*/

let queryDict = {};
location.search.substr(1).split("&").forEach(function(item) {
	queryDict[item.split("=")[0]] = item.split("=")[1]
});

/* Server magic */

const serverIP = queryDict.ip;
let mode = queryDict.mode;

const AO_HOST = queryDict.asset || "http://assets.aceattorneyonline.com/base/";
const MUSIC_HOST = AO_HOST + "sounds/music/";
const BAR_WIDTH = 90;
const BAR_HEIGHT = 20;
const CHAR_SELECT_WIDTH = 8;
const UPDATE_INTERVAL = 80;

let oldLoading = false;
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
	oldLoading = true;
}

let selectedShout = 0;

class Client {
	constructor(address) {
		this.serv = new WebSocket("ws://" + address);

		this.serv.onopen    = (evt) => this.onOpen(evt);
		this.serv.onclose   = (evt) => this.onClose(evt);
		this.serv.onmessage = (evt) => this.onMessage(evt);
		this.serv.onerror   = (evt) => this.onError(evt);

		this.playerID = 1;
		this.charID = -1;

		this.chars = [];
		this.emotes = [];

		this.selectedEmote = -1;

		this.checkUpdater = null;

		// Only used for RMC/`music` packets, not EM/SM/MC packets.
		this.musicList = Object();

		this.handlers = {
			"MS":         (args) => this.handleMS(args),
			"CT":         (args) => this.handleCT(args),
			"MC":         (args) => this.handleMC(args),
			"RMC":        (args) => this.handleRMC(args),
			"CI":         (args) => this.handleCI(args),
			"SC":         (args) => this.handleSC(args),
			"EI":         (args) => this.handleEI(args),
			"EM":         (args) => this.handleEM(args),
			"SM":         (args) => this.handleSM(args),
			"music":      (args) => this.handlemusic(args),
			"DONE":       (args) => this.handleDONE(args),
			"BN":         (args) => this.handleBN(args),
			"NBG":        (args) => this.handleNBG(args),
			"HP":         (args) => this.handleHP(args),
			"ID":         (args) => this.handleID(args),
			"PN":         (args) => this.handlePN(args),
			"SI":         (args) => this.handleSI(args),
			"CharsCheck": (args) => this.handleCharsCheck(args),
			"PV":         (args) => this.handlePV(args)
		}
	}

	/**
	 * Gets the current player's character.
	 */
	me() {
		return this.chars[this.charID];
	}

	/**
	 * Gets the player's currently selected emote.
	 */
	myEmote() {
		return this.emotes[this.selectedEmote];
	}

	/**
	 * Sends an out-of-character chat message.
	 * @param {string} message the message to send
	 */
	sendOOC(message) {
		this.serv.send(`CT#web${this.playerID}#${escapeChat(message)}#%`);
	}

	/**
	 * Sends an in-character chat message.
	 * @param {string} speaking who is speaking
	 * @param {string} name the name of the current character
	 * @param {string} silent whether or not it's silent
	 * @param {string} message the message to be sent
	 * @param {string} side the name of the side in the background
	 * @param {string} ssfxname the name of the sound effect
	 * @param {string} zoom whether or not to zoom
	 * @param {string} ssfxdelay the delay (in milliseconds) to play the sound effect
	 * @param {string} objection the number of the shout to play
	 */
	sendIC(speaking, name, silent, message, side, ssfxname, zoom, ssfxdelay, objection) {
		this.serv.send(
			`MS#chat#${speaking}#${name}#${silent}` +
			`#${escapeChat(message)}#${side}#${ssfxname}#${zoom}` +
			`#${this.charID}#${ssfxdelay}#${selectedShout}#0#0#0#0#%`
		);
	}

	/**
	 * Requests to change the music to the specified track.
	 * @param {string} track the track ID
	 */
	sendMusicChange(track) {
		this.serv.send(`MC#${track}#${this.charID}#%`);
	}

	/**
	 * Requests to leave the room and free the character slot.
	 * 
	 * Note: This packet is undocumented. It is not implemented by
	 * either the AO2 client or tsuserver.
	 */
	sendLeaveRoom() {
		this.serv.send("FC#%");
	}

	/**
	 * Begins the handshake process by sending an identifier
	 * to the server.
	 */
	joinServer() {
		this.serv.send(`HI#${navigator.userAgent}#%`);
		this.serv.send("ID#webAO#2.4.5#%");
		this.CHECKupdater = setInterval(() => this.sendCheck, 5000);
	}

	/**
	 * Requests to play as a specified character.
	 * @param {number} character the character ID
	 */
	sendCharacter(character) {
		this.serv.send(`CC#${this.playerID}#${character}#web#%`);
	}

	/**
	 * Requests to select a music track.
	 * @param {number?} song the song to be played
	 */
	sendMusic(song) {
		this.serv.send(`MC#${song}`);
	}

	/**
	 * Sends a keepalive packet.
	 */
	sendCheck() {
		this.serv.send(`CH#${this.charID}#%`);
	}

	/**
	 * Triggered when a connection is established to the server.
	 */
	onOpen(e) {
		// XXX: Why does watching mean just SITTING there and doing nothing?
		if (mode == "join") {
			client.joinServer();
		} else {
			document.getElementById("client_loading").style.display = "none";
		}
	}

	/**
	 * Triggered when the connection to the server closes.
	 * @param {CloseEvent} e
	 */
	onClose(e) {
		document.getElementById("client_error").style.display = "block";
		this.cleanup();
	}

	/**
	 * Triggered when a packet is received from the server.
	 * @param {MessageEvent} e
	 */
	onMessage(e) {
		let msg = e.data;
		console.debug(msg);
		let lines = msg.split('%');
		let args = lines[0].split('#');
		let header = args[0];
		let handler = this.handlers[header];
		if (typeof handler !== "undefined") {
			handler(args);
		} else {
			console.warn(`Invalid packet header ${header}`);
		}
	}

	/**
	 * Triggered when an network error occurs.
	 * @param {ErrorEvent} e 
	 */
	onError(e) {
		document.getElementById("client_error").style.display = "block";
		this.cleanup();
	}

	cleanup() {
		clearInterval(this.checkUpdater);
	}

	/**
	 * Handles an in-character chat message.
	 * @param {*} args packet arguments
	 */
	handleMS(args) {
		// TODO: this if-statement might be a bug.
		if (args[4] != viewport.chatmsg.content) {
			document.getElementById("client_inner_chat").innerHTML = "";
			let chatmsg = {
				pre: escape(args[2]),
				character: -1, // Will do a linear search
				preanim: escape(args[2]), // XXX: why again?
				nameplate: args[3], // TODO: parse INI to get this info
				name: args[3],
				speaking: "(b)" + escape(args[4]),
				silent: "(a)" + escape(args[4]),
				content: args[5],
				side: args[6],
				sound: escape(args[7]),
				type: args[8],
				// charid: args[9],
				snddelay: args[10],
				objection: args[11],
				evidence: args[12],
				// flip: args[13],
				flash: args[14],
				color: args[15],
				isnew: true,
			};

			// The dreaded linear search...
			for (let i = 0; i < this.chars.length; i++) {
				if (this.chars[i].name == args[3]) {
					chatmsg.character = i;
					break;
				}
			}

			viewport.say(chatmsg);
		}
	}

	/**
	 * Handles an out-of-character chat message.
	 * @param {Array} args packet arguments
	 */
	handleCT(args) {
		document.getElementById("client_ooclog").innerHTML = document.getElementById("client_ooclog").innerHTML + args[1] + ": " + args[2] + "\r\n";
	}

	/**
	 * Handles a music change to an arbitrary resource.
	 * @param {Array} args packet arguments
	 */
	handleMC(args) {
		const music = viewport.music;
		music.pause();
		music.src = MUSIC_HOST + args[1];
		music.play();
		if (args[2] >= 0) {
			let musicname = this.chars[args[2]].name;
			appendICLog(`${musicname} changed music to ${args[1]}`);
		} else {
			appendICLog(`The music was changed to ${args[1]}`);
		}
	}

	/**
	 * Handles a music change to an arbitrary resource, with an offset in seconds.
	 * @param {Array} args packet arguments
	 */
	handleRMC(args) {
		viewport.music.pause();
		viewport.music = new Audio(this.musicList[args[1]]);
		const music = viewport.music;
		// Music offset + drift from song loading
		music.totime = args[1];
		music.offset = new Date().getTime() / 1000;
		music.addEventListener('loadedmetadata', function() {
			music.currentTime += parseFloat(music.totime + (new Date().getTime() / 1000 - music.offset)).toFixed(3);
			music.play();
		}, false);
	}

	/**
	 * Handles incoming character information, bundling multiple characters
	 * per packet.
	 * @param {Array} args packet arguments
	 */
	handleCI(args) {
		document.getElementById("client_loadingtext").innerHTML = "Loading Character " + args[1];
		this.serv.send("AN#" + ((args[1] / 10) + 1) + "#%");
		for (let i = 2; i < args.length - 1; i++) {
			if (i % 2 == 0) {
				let chargs = args[i].split("&");
				this.chars[args[i - 1]] = {
					"name": chargs[0],
					"desc": chargs[1],
					"evidence": chargs[3],
					"icon": AO_HOST + "characters/" + escape(chargs[0]) + "/char_icon.png"
				};
			}
		}
	}

	/**
	 * Handles incoming character information, containing only one character
	 * per packet.
	 * @param {Array} args packet arguments
	 */
	handleSC(args) {
		document.getElementById("client_loadingtext").innerHTML = "Loading Characters";
		for (let i = 1; i < args.length - 1; i++) {
			let chargs = args[i].split("&");
			this.chars[i - 1] = {
				"name": chargs[0],
				"desc": chargs[1],
				"evidence": chargs[3],
				"icon": AO_HOST + "characters/" + escape(chargs[0]) + "/char_icon.png"
			}
		}
		this.serv.send("RM#%");
	}

	/**
	 * Handles incoming evidence information, containing only one evidence
	 * item per packet.
	 * 
	 * Mostly unimplemented in webAO.
	 * @param {Array} args packet arguments
	 */
	handleEI(args) {
		document.getElementById("client_loadingtext").innerHTML = "Loading Evidence " + args[1];
		//serv.send("AE#" + (args[1] + 1) + "#%");
		this.serv.send("RM#%");
	}

	/**
	 * Handles incoming music information, containing multiple entries
	 * per packet.
	 * @param {Array} args packet arguments
	 */
	handleEM(args) {
		document.getElementById("client_loadingtext").innerHTML = "Loading Music " + args[1];
		this.serv.send("AM#" + ((args[1] / 10) + 1) + "#%");
		let hmusiclist = document.getElementById("client_musiclist");
		for (let i = 2; i < args.length - 1; i++) {
			if (i % 2 == 0) {
				let newentry = document.createElement("OPTION");
				newentry.text = args[i];
				hmusiclist.options.add(newentry);
			}
		}
	}

	/**
	 * Handles incoming music information, containing only one entry
	 * per packet.
	 * @param {Array} args packet arguments
	 */
	handleSM(args) {
		document.getElementById("client_loadingtext").innerHTML = "Loading Music ";
		let hmusiclist = document.getElementById("client_musiclist");
		for (let i = 1; i < args.length - 1; i++) {
			let newentry = document.createElement("OPTION");
			newentry.text = args[i];
			hmusiclist.options.add(newentry);
		}
		this.serv.send("RD#%");
	}

	/**
	 * Handles incoming music information, containing all entries
	 * in the same packet.
	 * @param {Array} args packet arguments
	 */
	handlemusic(args) {
		for (let i = 0; i < args.length / 2; i++) {
			this.musicList[args[2 * i]] = args[2 * i + 1];
		}
	}

	/**
	 * Handles the handshake completion packet, meaning the player
	 * is ready to select a character.
	 * 
	 * @param {Array} args packet arguments
	 */
	handleDONE(args) {
		document.getElementById("client_loading").style.display = "none";
		document.getElementById("client_charselect").style.display = "block";
	}

	/**
	 * Handles a background change.
	 * @param {Array} args packet arguments
	 */
	handleBN(args) {
		viewport.bgname = escape(args[1]);
	}

	handleNBG(args) {
		// TODO (set by sD)
	}

	/**
	 * Handles a change in the health bars' states.
	 * @param {Array} args packet arguments
	 */
	handleHP(args) {
		// TODO (set by sD)
		// Also, this is broken.
		if (args[1] == 1) {
			document.getElementById("client_defense_hp").style.clip = "rect(0px," + BAR_WIDTH * args[2] / 10 + "px," + BAR_HEIGHT + "px,0px)";
		} else {
			document.getElementById("client_prosecutor_hp").style.clip = "rect(0px," + BAR_WIDTH * args[2] / 10 + "px," + BAR_HEIGHT + "px,0px)";
		}
	}
	
	/**
	 * Handles the issuance of a player ID by the server.
	 * @param {Array} args packet arguments
	 */
	handleID(args) {
		this.playerID = args[1];
	}

	handlePN(args) {
		this.serv.send("askchaa#%");
	}

	/**
	 * Received when the server announces its server info,
	 * but we use it as a cue to begin retrieving characters.
	 * @param {Array} args packet arguments
	 */
	handleSI(args) {
		if (oldLoading) {
			this.serv.send("askchar2#%");
		} else {
			this.serv.send("RC#%");
		}
	}

	/**
	 * Handles the list of all used and vacant characters.
	 * @param {Array} args packet arguments
	 */
	handleCharsCheck(args) {
		document.getElementById("client_chartable").innerHTML = "";
		for (let i = 0; i < this.chars.length; i++) {
			if (i % CHAR_SELECT_WIDTH == 0) {
				var tr = document.createElement('TR');
			}
			let td = document.createElement('TD');
			let icon_chosen;
			let thispick = this.chars[i].icon;
			if (args[i + 1] == "-1") {
				icon_chosen = " dark";
			} else {
				icon_chosen = "";
			}
			td.innerHTML = `<img class='demothing${icon_chosen}' id='demo_${i}' ` +
				`src='${thispick}' alt='${this.chars[i].desc}' onclick='pickchar(${i})' ` +
				`onerror='demoError(this);'>`;
			tr.appendChild(td);
			if (i % CHAR_SELECT_WIDTH == 0) {
				document.getElementById("client_chartable").appendChild(tr);
			}
		}
		changeBackground("def");
	}

	/**
	 * Handles the server's assignment of a character for the player to use.
	 * @param {Array} args packet arguments
	 */
	handlePV(args) {
		this.charID = args[3];
		document.getElementById("client_charselect").style.display = "none";
		let me = this.me();
		let emotes = this.emotes;
		let xhr = new XMLHttpRequest();
		xhr.open('GET', AO_HOST + 'characters/' + escape(this.me().name) + '/char.ini', true);
		xhr.responseType = 'text';
		xhr.onload = function (e) {
			if (this.status == 200) {
				let linifile = this.responseText;
				let pinifile = INI.parse(linifile);
				me.side = pinifile.Options.side;
				for (let i = 1; i < pinifile.Emotions.number; i++) {
					let emoteinfo = pinifile.Emotions[i].split('#');
					let esfx = "0";
					let esfxd = "0";
					if (typeof pinifile.SoundN !== 'undefined') {
						esfx = pinifile.SoundN[i];
					}
					if (typeof pinifile.SoundT !== 'undefined') {
						esfxd = pinifile.SoundT[i];
					}
					emotes[i] = {
						desc: emoteinfo[0],
						speaking: emoteinfo[1],
						silent: emoteinfo[2],
						zoom: emoteinfo[3],
						sfx: esfx,
						sfxdelay: esfxd,
						button_off: AO_HOST + 'characters/' + escape(me.name) + '/emotions/button' + i + '_off.png',
						button_on: AO_HOST + 'characters/' + escape(me.name) + '/emotions/button' + i + '_on.png'
					};
					document.getElementById("client_emo").innerHTML += "<img src='" + emotes[i].button_off + "' id='emo_" + i + "' alt='" + emotes[i].desc + "' class='client_button' onclick='pickemotion(" + i + ")'>";
				}
				pickemotion(1);
			}
		};
		xhr.send();
	}
}

class Viewport {
	constructor() {
		this.textnow = "";
		this.chatmsg = {
			"isnew": false,
			"content": "",
			"objection": "0",
			"sound": "",
			"startspeaking": false,
			"side": null,
			"color": "0",
			"snddelay": 0
		};
		this.blip = new Audio(AO_HOST + 'sounds/general/sfx-blipmale.wav');
		this.blip.volume = 0.5;

		// Wombo + combo: two audio channels allocated to make blips less jittery

		// TODO: read blip type ("gender") from ini
		this.womboblip = new Audio(AO_HOST + 'sounds/general/sfx-blipmale.wav');
		this.womboblip.volume = 0.5;

		this.comboblip = new Audio(AO_HOST + 'sounds/general/sfx-blipmale.wav');
		this.comboblip.volume = 0.5;

		this.combo = false;

		this.sfxaudio = new Audio(AO_HOST + 'sounds/general/sfx-blipmale.wav');
		this.sfxplayed = 0;

		this.music = new Audio();
		this.music.play();

		this.updater = null;

		this.bgname = "gs4";

		this.shoutTimer = 0;
		this.textTimer = 0;
	}

	/**
	 * Returns the path which the background is located in.
	 */
	bgFolder() {
		return `${AO_HOST}background/${this.bgname}/`;
	}

	/**
	 * Sets a new emote.
	 * @param {object} chatmsg the new chat message
	 */
	say(chatmsg) {
		this.chatmsg = chatmsg;
		appendICLog(`${chatmsg.nameplate}: ${chatmsg.content}`);
		changeBackground(chatmsg.side);
		this.textnow = '';
		this.sfxplayed = 0;
		this.textTimer = 0;
		this.updater = setInterval(() => this.updateText(), UPDATE_INTERVAL);
	}

	/**
	 * Updates the chatbox based on the given text.
	 * 
	 * XXX: This relies on a global variable `this.chatmsg`!
	 */
	updateText() {
		if (this.chatmsg.content.trim() == "") {
			document.getElementById("client_name").style.display = "none";
			document.getElementById("client_chat").style.display = "none";
		} else {
			document.getElementById("client_name").style.display = "block";
			document.getElementById("client_chat").style.display = "block";
		}

		if (this.chatmsg.isnew) {
			const shouts = {
				"1": "holdit",
				"2": "takethat",
				"3": "objection"
			};

			let shout = shouts[this.chatmsg.objection];
			if (typeof shout !== "undefined") {
				document.getElementById("client_char").src = AO_HOST + "misc/" + shout + ".gif";
				this.chatmsg.sound = "sfx-" + shout;
				this.shoutTimer = 800;
			} else {
				this.shoutTimer = 0;
			}

			this.chatmsg.isnew = false;
			this.chatmsg.startspeaking = true;
		}

		if (this.textTimer >= this.shoutTimer) {
			if (this.chatmsg.startspeaking) {
				changeBackground(this.chatmsg.side);
				document.getElementById("client_char").src = AO_HOST + "characters/" + escape(this.chatmsg.name) + "/" + this.chatmsg.speaking + ".gif";
				document.getElementById("client_name").style.fontSize = (document.getElementById("client_name").offsetHeight * 0.7) + "px";
				document.getElementById("client_chat").style.fontSize = (document.getElementById("client_chat").offsetHeight * 0.25) + "px";
				document.getElementById("client_name").innerHTML = "<p>" + escapeHtml(this.chatmsg.nameplate) + "</p>";

				const colors = {
					"0": "#ffffff",
					"1": "#00ff00",
					"2": "#ff0000",
					"3": "#ffaa00",
					"4": "#0000ff",
					"5": "#ffff00",
					"6": "#aa00aa"
				}
				let stylecolor = "color: " + (colors[this.chatmsg.color] || "#ffffff");
				document.getElementById("client_inner_chat").style = stylecolor;
				this.chatmsg.startspeaking = false;
			} else {
				if (this.textnow != this.chatmsg.content) {
					if (this.chatmsg.content.charAt(this.textnow.length) != " ") {
						this.combo = (this.combo + 1) % 2;
						switch (this.combo) {
						case 0:
							this.blip.play()
							break;
						case 1:
							//this.womboblip.play()
							break;
						}
					}
					this.textnow = this.chatmsg.content.substring(0, this.textnow.length + 1);
					document.getElementById("client_inner_chat").innerHTML = this.textnow;
					if (this.textnow == this.chatmsg.content) {
						this.textTimer = 0;
						clearInterval(this.updater);
						document.getElementById("client_char").src = AO_HOST + "characters/" + escape(this.chatmsg.name) + "/" + this.chatmsg.silent + ".gif";
					}
				}
			}
		}
		if (!this.sfxplayed && this.chatmsg.snddelay + this.shoutTimer >= this.textTimer) {
			this.sfxaudio.pause();
			this.sfxplayed = 1;
			if (this.chatmsg.sound != "0" && this.chatmsg.sound != "1") {
				this.sfxaudio.src = AO_HOST + "sounds/general/" + escape(this.chatmsg.sound) + ".wav";
				this.sfxaudio.play();
			}
		}
		this.textTimer = this.textTimer + UPDATE_INTERVAL;
	}
}

class INI {
	static parse(data) {
		let regex = {
			section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
			param: /^\s*([\w\.\-\_]+)\s*=\s*(.*?)\s*$/,
			comment: /^\s*;.*$/
		};
		let value = {};
		let lines = data.split(/\r\n|\r|\n/);
		let section = null;
		lines.forEach(function(line) {
			if (regex.comment.test(line)) {
				return;
			} else if (line.length == 0) {
				return;
			} else if (regex.param.test(line)) {
				let match = line.match(regex.param);
				if (section) {
					value[section][match[1]] = match[2];
				} else {
					value[match[1]] = match[2];
				}
			} else if (regex.section.test(line)) {
				let match = line.match(regex.section);
				value[match[1]] = {};
				section = match[1];
			};
		});
		return value;
	}
}

/**
 * Triggered when the Return key is pressed on the out-of-character chat input box.
 * @param {KeyboardEvent} event
 */
export function onOOCEnter(event) {
	if (event.keyCode == 13) {
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
	if (event.keyCode == 13) {
		let mychar = client.me();
		let myemo = client.myEmote();
		let ssfxname = "0";
		let ssfxdelay = "0";
		if (document.getElementById("sendsfx").checked) {
			ssfxname = myemo.sfx;
			ssfxdelay = myemo.sfxdelay;
		}
		// TODO URGENT: Do NOT send if we know that our message is going to get thrown away!
		client.sendIC(myemo.speaking, mychar.name, myemo.silent, document.getElementById("client_inputbox").value, mychar.side, ssfxname, myemo.zoom, ssfxdelay, selectedShout);
		document.getElementById("client_inputbox").value = "";
		if (selectedShout) {
			document.getElementById("button_" + selectedShout).className = "client_button";
			selectedShout = 0;
		}
	}
}
window.onEnter = onEnter;

/**
 * Triggered when an item on the music list is clicked.
 * @param {MouseEvent} event
 */
export function musiclist_click(event) {
	let playtrack = document.getElementById("client_musiclist").value;
	client.sendMusicChange(playtrack);
}
window.musiclist_click = musiclist_click;

/**
 * Triggered by the music volume slider.
 */
export function changeMusicVolume() {
	viewport.music.volume = document.getElementById("client_mvolume").value / 100;
}
window.changeMusicVolume = changeMusicVolume;

/**
 * Triggered by the sound effect volume slider.
 */
export function changeSFXVolume() {
	viewport.sfxaudio.volume = document.getElementById("client_svolume").value / 100;
}
window.changeSFXVolume = changeSFXVolume;

/**
 * Triggered by the blip volume slider.
 */
export function changeBlipVolume() {
	viewport.blip.volume = document.getElementById("client_bvolume").value / 100;
	viewport.womboblip.volume = document.getElementById("client_bvolume").value / 100;
	viewport.comboblip.volume = document.getElementById("client_bvolume").value / 100;
}
window.changeBlipVolume = changeBlipVolume;

/**
 * Triggered when a character icon is clicked in the character selection menu.
 * @param {MouseEvent} event
 */
export function changeCharacter(event) {
	client.sendLeaveRoom();
	document.getElementById("client_charselect").style.display = "block";
	document.getElementById("client_emo").innerHTML = "";
}
window.changeCharacter = changeCharacter;

/**
 * Triggered when there was an error loading a character sprite.
 * @param {HTMLImageElement} image the element containing the missing image
 */
export function imgError(image) {
	image.onerror = "";
	image.src = "/misc/placeholder.gif";
	return true;
}
window.imgError = imgError;

/**
 * Triggered when there was an error loading a character icon.
 * @param {HTMLImageElement} image the element containing the missing image
 */
export function demoError(image) {
	image.onerror = "";
	image.src = "/misc/placeholder.png";
	return true;
}
window.demoError = demoError;

/**
 * Checks if an image exists at the specified URI.
 * @param {string} url the URI to be checked
 */
function ImageExist(url) {
	var img = new Image();
	img.src = url;
	return img.height != 0;
}

/**
 * Changes the viewport background based on a given position.
 * 
 * Valid positions: `def, pro, hld, hlp, wit, jud`
 * @param {string} position the position to change into
 */
function changeBackground(position) {
	var standname;
	let bgfolder = viewport.bgFolder();
	document.getElementById("client_fg").style.display = "none";
	document.getElementById("client_bench").style.display = "none";
	switch (position) {
		case "def":
			document.getElementById("client_court").src = bgfolder + "defenseempty.png"
			document.getElementById("client_bench").style.display = "block";
			document.getElementById("client_bench").src = bgfolder + "defensedesk.png"
			standname = "defense";
			break;
		case "pro":
			document.getElementById("client_court").src = bgfolder + "prosecutorempty.png"
			document.getElementById("client_bench").style.display = "block"
			document.getElementById("client_bench").src = bgfolder + "prosecutiondesk.png"
			standname = "prosecution";
			break;
		case "hld":
			document.getElementById("client_court").src = bgfolder + "helperstand.png"
			standname = "defense";
			break;
		case "hlp":
			document.getElementById("client_court").src = bgfolder + "prohelperstand.png"
			standname = "prosecution";
			break;
		case "wit":
			document.getElementById("client_court").src = bgfolder + "witnessempty.png"
			document.getElementById("client_bench").style.display = "block"
			document.getElementById("client_bench").src = bgfolder + "estrado.png"
			standname = "prosecution";
			break;
		case "jud":
			document.getElementById("client_court").src = bgfolder + "judgestand.png"
			standname = "prosecution";
			break;
	}
	if (viewport.chatmsg.type == 5) {
		document.getElementById("client_bench").style.display = "none";
		document.getElementById("client_court").src = AO_HOST + "themes/default/" + standname + "_speedlines.gif";
	}
}

/**
 * Triggered when the reconnect button is pushed.
 */
export function ReconnectButton() {
	client = new Client(serverIP);
	if (client) {
		mode = "join"; // HACK: see client.onOpen
		document.getElementById("client_error").style.display = "none";
	}
}
window.ReconnectButton = ReconnectButton;

/**
 * Triggered when the retry button is pushed (during the loading process).
 */
export function RetryButton() {
	client.joinServer();
}
window.RetryButton = RetryButton;

/**
 * Appends a message to the in-character chat log.
 * @param {string} toadd the string to be added
 */
function appendICLog(toadd) {
	document.getElementById("client_log").appendChild(document.createTextNode(toadd));
}

/**
 * Requests to play as a character.
 * @param {number} ccharacter the character ID; if this is a large number, then spectator is chosen instead.
 */
export function pickchar(ccharacter) {
	if (ccharacter < 1000) {
		client.sendCharacter(ccharacter);
	} else {
		// Spectator
		document.getElementById("client_charselect").style.display = "none";
		document.getElementById("client_inputbox").style.display = "none";
		document.getElementById("client_emo").style.display = "none";
	}
}
window.pickchar = pickchar;

/**
 * Highlights and selects an emotion for in-character chat.
 * @param {string} emo the new emotion to be selected
 */
export function pickemotion(emo) {
	if (client.selectedEmote != -1) {
		document.getElementById("emo_" + client.selectedEmote).src = client.myEmote().button_off;
	}
	client.selectedEmote = emo
	document.getElementById("emo_" + emo).src = client.myEmote().button_on;
}
window.pickemotion = pickemotion;

/**
 * Highlights and selects a shout for in-character chat.
 * If the same shout button is selected, then the shout is canceled.
 * @param {string} shout the new shout to be selected
 */
export function toggleshout(shout) {
	if (shout == selectedShout) {
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
window.toggleshout = toggleshout;

/**
 * Escapes a string to be HTML-safe.
 * 
 * XXX: This is unnecessary if we use `createTextNode` instead!
 * @param {string} unsafe an unsanitized string
 */
function escapeHtml(unsafe) {
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

/**
 * Escapes a string to AO1 escape codes.
 * @param {string} estring the string to be escaped
 */
function escapeChat(estring) {
	return estring
		.replace(/#/g, "<pound>")
		.replace(/&/g, "<and>")
		.replace(/%/g, "<percent>")
		.replace(/\$/g, "<dollar>");
}

// TODO: Possibly safe to remove, since we are using a transpiler.
if (typeof(String.prototype.trim) === "undefined")
{
    String.prototype.trim = function() 
    {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}


//
// Client code
//

let client = new Client(serverIP);
let viewport = new Viewport();
