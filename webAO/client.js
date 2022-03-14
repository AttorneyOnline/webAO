/* eslint no-restricted-syntax: 'off', class-methods-use-this: 'off',
max-len: 'warn', max-classes-per-file: 'warn', no-unused-expressions: 'warn',
prefer-destructuring: 'warn', no-param-reassign: 'warn',
no-return-assign: 'warn', no-promise-executor-return: 'warn',
no-inner-declarations: 'warn' */

/* TODO: All of these eslint parameters exist and need to be
		Either removed or moved to eslint config file. There are
		so many problems in this file, with a future refactor,
		these errors should be more spread out and easily
		maintainable.
*/

/*
 * Glorious webAO
 * made by sD, refactored by oldmud0 and Qubrick
 * credits to aleks for original idea and source
*/

import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { EventEmitter } from 'events';
import {
	escapeChat, encodeChat, prepChat, safeTags,
} from './encoding';

// Load some defaults for the background and evidence dropdowns
import vanillaCharacters from './constants/characters';
import vanillaMusic from './constants/music';
import vanillaBackgrounds from './constants/backgrounds';
import vanillaEvidence from './constants/evidence';

import chatboxes from './styles/chatbox/chatboxes';
import iniParse from './iniParse';
import getCookie from './utils/getCookie';
import setCookie from './utils/setCookie';
import { request } from './services/request';
import { changeShoutVolume, changeSFXVolume } from './dom/changeVolume';
import setEmote from './client/setEmote';
import fileExists from './utils/fileExists';
import queryParser from './utils/queryParser';
import getAnimLength from './utils/getAnimLength';
import getResources from './utils/getResources';
import transparentPNG from './constants/transparentPNG';

const version = process.env.npm_package_version;

let client;
let viewport;
// Get the arguments from the URL bar
const { ip: serverIP, asset, theme } = queryParser();
let { mode } = queryParser();

// Unless there is an asset URL specified, use the wasabi one
const DEFAULT_HOST = 'http://attorneyoffline.de/base/';
let AO_HOST = asset || DEFAULT_HOST;
const THEME = theme || 'default';

const UPDATE_INTERVAL = 60;
/**
 * Toggles AO1-style loading using paginated music packets for mobile platforms.
 * The old loading uses more smaller packets instead of a single big one,
 * which caused problems on low-memory devices in the past.
 */
let oldLoading = false;

// presettings
let selectedMenu = 1;
let selectedShout = 0;

let extrafeatures = [];

let hdid;

function isLowMemory() {
	if (/webOS|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|PlayStation|Nintendo|Opera Mini/i.test(navigator.userAgent)) {
		oldLoading = true;
	}
}

let lastICMessageTime = new Date(0);
/**
 * Triggered when the user click replay GOOOOO
 * @param {KeyboardEvent} event
 */
export function onReplayGo() {
	client.handleReplay();
}
window.onReplayGo = onReplayGo;
/**
 * Update background preview.
 */
export function updateBackgroundPreview() {
	const backgroundSelect = document.getElementById('bg_select');
	const backgroundFilename = document.getElementById('bg_filename');
	const backgroundPreview = document.getElementById('bg_preview');

	if (backgroundSelect.selectedIndex === 0) {
		backgroundFilename.style.display = 'initial';
		backgroundPreview.src = `${AO_HOST}background/${encodeURI(backgroundFilename.value.toLowerCase())}/defenseempty.png`;
	} else {
		backgroundFilename.style.display = 'none';
		backgroundPreview.src = `${AO_HOST}background/${encodeURI(backgroundSelect.value.toLowerCase())}/defenseempty.png`;
	}
}
window.updateBackgroundPreview = updateBackgroundPreview;
/**
 * Triggered when there was an error loading a sound
 * @param {HTMLImageElement} image the element containing the missing sound
 */
export function opusCheck(channel) {
	let oldsrc = '';
	oldsrc = channel.src;
	if (!oldsrc.endsWith('.opus')) {
		let newsrc = oldsrc.replace('.mp3', '.opus');
		newsrc = newsrc.replace('.wav', '.opus');
		channel.src = newsrc; // unload so the old sprite doesn't persist
	}
}
window.opusCheck = opusCheck;
/**
 * check if the message contains an entry on our callword list
 * @param {String} message
 */
export function checkCallword(message) {
	function testCallword(item) {
		if (item !== '' && message.toLowerCase().includes(item.toLowerCase())) {
			viewport.sfxaudio.pause();
			viewport.sfxaudio.src = `${AO_HOST}sounds/general/sfx-gallery.opus`;
			viewport.sfxaudio.play();
		}
	}
	client.callwords.forEach(testCallword);
}
/**
 * Find index of anything in select box.
 * @param {string} selectBox the select element name
 * @param {string} value the value that need to be compared
 */
export function getIndexFromSelect(selectBox, value) {
	// Find if icon alraedy existed in select box
	const selectElement = document.getElementById(selectBox);
	for (let i = 1; i < selectElement.length; ++i) {
		if (selectElement.options[i].value === value) {
			return i;
		}
	}
	return 0;
}
window.getIndexFromSelect = getIndexFromSelect;
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
 * Triggered when an item on the area list is clicked.
 * @param {MouseEvent} event
 */
export function areaClick(el) {
	const area = client.areas[el.id.substr(4)].name;
	client.sendMusicChange(area);

	const areaHr = document.createElement('div');
	areaHr.className = 'hrtext';
	areaHr.textContent = `switched to ${el.textContent}`;
	document.getElementById('client_log').appendChild(areaHr);
}
window.area_click = areaClick;
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

/**
 * Update evidence icon.
 */
export function updateEvidenceIcon() {
	const evidenceSelect = document.getElementById('evi_select');
	const evidenceFilename = document.getElementById('evi_filename');
	const evidenceIconbox = document.getElementById('evi_preview');

	if (evidenceSelect.selectedIndex === 0) {
		evidenceFilename.style.display = 'initial';
		evidenceIconbox.src = `${AO_HOST}evidence/${encodeURI(evidenceFilename.value.toLowerCase())}`;
	} else {
		evidenceFilename.style.display = 'none';
		evidenceIconbox.src = `${AO_HOST}evidence/${encodeURI(evidenceSelect.value.toLowerCase())}`;
	}
}
window.updateEvidenceIcon = updateEvidenceIcon;
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
 * Triggered by the theme selector.
 */
export function reloadTheme() {
	viewport.theme = document.getElementById('client_themeselect').value;
	setCookie('theme', viewport.theme);
	document.getElementById('client_theme').href = `styles/${viewport.theme}.css`;
}
window.reloadTheme = reloadTheme;
/**
 * Set the style of the chatbox
 */
export function setChatbox(style) {
	const chatboxTheme = document.getElementById('chatbox_theme');
	const selectedTheme = document.getElementById('client_chatboxselect').value;
	setCookie('chatbox', selectedTheme);
	if (selectedTheme === 'dynamic') {
		if (chatboxes.includes(style)) {
			chatboxTheme.href = `styles/chatbox/${style}.css`;
		} else {
			chatboxTheme.href = 'styles/chatbox/aa.css';
		}
	} else {
		chatboxTheme.href = `styles/chatbox/${selectedTheme}.css`;
	}
}
window.setChatbox = setChatbox;

/**
 * Triggered by the music volume slider.
 */
export function changeMusicVolume() {
	viewport.musicVolume = document.getElementById('client_mvolume').value;
	setCookie('musicVolume', document.getElementById('client_mvolume').value);
}
window.changeMusicVolume = changeMusicVolume;

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
 * Triggered by a changed callword list
 */
export function changeCallwords() {
	client.callwords = document.getElementById('client_callwords').value.split('\n');
	setCookie('callwords', client.callwords);
}
window.changeCallwords = changeCallwords;

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

	document.getElementById('sendpreanim').checked = (client.emote.zoom === 1);
}
window.pickEmotion = pickEmotion;

/**
 * Triggered when the showname checkboc is clicked
 * @param {MouseEvent} event
 */
export function shownameClick() {
	setCookie('showname', document.getElementById('showname').checked);
	setCookie('ic_chat_name', document.getElementById('ic_chat_name').value);

	const cssSelector = document.getElementById('nameplate_setting');

	if (document.getElementById('showname').checked) { cssSelector.href = 'styles/shownames.css'; } else { cssSelector.href = 'styles/nameplates.css'; }
}
window.shownameClick = shownameClick;
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
	for (let i = 0, roleSelect = document.getElementById('role_select').options; i < roleSelect.length; i++) {
		if (side === roleSelect[i].value) {
			roleSelect.selectedIndex = i;
			return;
		}
	}
}
window.updateActionCommands = updateActionCommands;
class Client extends EventEmitter {
	constructor(address) {
		super();
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
		this.charListLength = 0;
		this.evidenceListLength = 0;
		this.musicListLength = 0;
		this.testimonyID = 0;

		this.chars = [];
		this.emotes = [];
		this.evidences = [];
		this.areas = [];
		this.musics = [];

		this.musicsTime = false;

		this.callwords = [];

		this.banned = false;

		this.resources = getResources(AO_HOST, THEME);

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
		mode === 'replay' ? this.sendSelf(message) : this.serv.send(message);
	}

	/**
	 * Hook for sending messages to the client
	 * @param {string} message the message to send
	 */
	handleSelf(message) {
		const messageEvent = new MessageEvent('websocket', { data: message });
		setTimeout(() => this.onMessage(messageEvent), 1);
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
		const oocName = `${escapeChat(encodeChat(document.getElementById('OOC_name').value))}`;
		const oocMessage = `${escapeChat(encodeChat(message))}`;
		this.sendServer(`CT#${oocName}#${oocMessage}#%`);
	}

	/**
	 * Sends an in-character chat message.
	 * @param {string} deskmod currently unused
	 * @param {string} speaking who is speaking
	 * @param {string} name the name of the current character
	 * @param {string} silent whether or not it's silent
	 * @param {string} message the message to be sent
	 * @param {string} side the name of the side in the background
	 * @param {string} sfxName the name of the sound effect
	 * @param {string} emoteModifier whether or not to zoom
	 * @param {number} sfxDelay the delay (in milliseconds) to play the sound effect
	 * @param {string} objectionModifier the number of the shout to play
	 * @param {string} evidence the filename of evidence to show
	 * @param {number} flip change to 1 to reverse sprite for position changes
	 * @param {number} realization screen flash effect
	 * @param {number} textColor text color
	 * @param {string} showname custom name to be displayed (optional)
	 * @param {number} otherCharId paired character (optional)
	 * @param {number} self_offset offset to paired character (optional)
	 * @param {number} nonInterruptingPreanim play the full preanim (optional)
	 */
	sendIC(
		deskmod,
		preanim,
		name,
		emote,
		message,
		side,
		sfxName,
		emoteModifier,
		sfxDelay,
		objectionModifier,
		evidence,
		flip,
		realization,
		textColor,
		showname,
		otherCharId,
		selfHOffset,
		selfYOffset,
		nonInterruptingPreanim,
		loopingSfx,
		screenshake,
		frameScreenshake,
		frameRealization,
		frameSfx,
		additive,
		effect,
	) {
		let extraCCCC = '';
		let otherEmote = '';
		let otherOffset = '';
		let extra27 = '';
		let extra28 = '';

		if (extrafeatures.includes('cccc_ic_support')) {
			const selfOffset = extrafeatures.includes('y_offset') ? `${selfHOffset}<and>${selfYOffset}` : selfHOffset;	// HACK: this should be an & but client fucked it up and all the servers adopted it
			if (mode === 'replay') {
				otherEmote = '##';
				otherOffset = '#0#0';
			}
			extraCCCC = `${showname}#${otherCharId}${otherEmote}#${selfOffset}${otherOffset}#${nonInterruptingPreanim}#`;

			if (extrafeatures.includes('looping_sfx')) {
				extra27 = `${loopingSfx}#${screenshake}#${frameScreenshake}#${frameRealization}#${frameSfx}#`;
				if (extrafeatures.includes('effects')) {
					extra28 = `${additive}#${effect}#`;
				}
			}
		}

		const serverMessage = `MS#${deskmod}#${preanim}#${name}#${emote}`
			+ `#${escapeChat(encodeChat(message))}#${side}#${sfxName}#${emoteModifier}`
			+ `#${this.charID}#${sfxDelay}#${objectionModifier}#${evidence}#${flip}#${realization}#${textColor}#${extraCCCC}${extra27}${extra28}%`;

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
		const backgroundSelect = document.getElementById('bg_select');
		backgroundSelect.add(new Option('Custom', 0));
		vanillaBackgrounds.forEach((background) => {
			backgroundSelect.add(new Option(background));
		});

		// Load evidence array to select
		const evidenceSelect = document.getElementById('evi_select');
		evidenceSelect.add(new Option('Custom', 0));
		vanillaEvidence.forEach((evidence) => {
			evidenceSelect.add(new Option(evidence));
		});

		// Read cookies and set the UI to its values
		document.getElementById('OOC_name').value = getCookie('OOC_name') || `web${parseInt(Math.random() * 100 + 10, 10)}`;

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
		shownameClick();

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
	onOpen() {
		client.joinServer();
	}

	/**
	 * Triggered when the connection to the server closes.
	 * @param {CloseEvent} e
	 */
	onClose(e) {
		if (extrafeatures.length === 0 && this.banned === false) {
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
		const { data } = e;

		const lines = data.split('%');

		for (const msg of lines) {
			if (msg === '') { break; }

			const args = msg.split('#');
			const header = args[0];

			if (!this.emit(header, args)) {
				// console.warn(`Invalid packet header ${header}`);
			}
		}
	}

	/**
	 * Triggered when an network error occurs.
	 * @param {ErrorEvent} e
	 */
	onError(e) {
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

			const charId = Number(args[9]);
			const charName = safeTags(args[3]);

			let msgNameplate = args[3];
			let msgBlips = 'male';
			let charChatbox = 'default';
			let charMuted = false;

			try {
				msgNameplate = this.chars[charId].showname;
				msgBlips = this.chars[charId].blips;
				charChatbox = this.chars[charId].chat;
				charMuted = this.chars[charId].muted;

				if (this.chars[charId].name !== charName) {
					const chargs = (`${charName}&iniediter`).split('&');
					this.handleCharacterInfo(chargs, charId);
				}
			} catch (e) {
				msgNameplate = args[3];
				msgBlips = 'male';
				charChatbox = 'default';
				charMuted = false;
			}

			if (charMuted === false) {
				let chatmsg = {
					deskmod: safeTags(args[1]).toLowerCase(),
					preanim: safeTags(args[2]).toLowerCase(), // get preanim
					nameplate: msgNameplate,
					chatbox: charChatbox,
					name: charName,
					sprite: safeTags(args[4]).toLowerCase(),
					content: prepChat(args[5]), // Escape HTML tags
					side: args[6].toLowerCase(),
					sound: safeTags(args[7]).toLowerCase(),
					blips: safeTags(msgBlips),
					type: Number(args[8]),
					charid: charId,
					snddelay: Number(args[10]),
					objection: Number(args[11]),
					evidence: safeTags(args[12]),
					flip: Number(args[13]),
					flash: Number(args[14]),
					color: Number(args[15]),
				};

				if (extrafeatures.includes('cccc_ic_support')) {
					const extraCCCC = {
						showname: safeTags(args[16]),
						otherCharId: Number(args[17]),
						otherName: safeTags(args[18]),
						otherEmote: safeTags(args[19]),
						selfOffset: args[20].split('<and>'), // HACK: here as well, client is fucked and uses this instead of &
						otherOffset: args[21].split('<and>'),
						otherFlip: Number(args[22]),
						nonInterruptingPreanim: Number(args[23]),
					};
					chatmsg = Object.assign(extraCCCC, chatmsg);

					if (extrafeatures.includes('looping_sfx')) {
						const extra27 = {
							loopingSfx: Number(args[24]),
							screenshake: Number(args[25]),
							frameScreenshake: safeTags(args[26]),
							frameRealization: safeTags(args[27]),
							frameSfx: safeTags(args[28]),
						};
						chatmsg = Object.assign(extra27, chatmsg);

						if (extrafeatures.includes('effects')) {
							const extra28 = {
								additive: Number(args[29]),
								effects: args[30].split('|'),
							};
							chatmsg = Object.assign(extra28, chatmsg);
						} else {
							const extra28 = {
								additive: 0,
								effects: ['', '', ''],
							};
							chatmsg = Object.assign(extra28, chatmsg);
						}
					} else {
						const extra27 = {
							loopingSfx: 0,
							screenshake: 0,
							frameScreenshake: '',
							frameRealization: '',
							frameSfx: '',
						};
						chatmsg = Object.assign(extra27, chatmsg);
						const extra28 = {
							additive: 0,
							effects: ['', '', ''],
						};
						chatmsg = Object.assign(extra28, chatmsg);
					}
				} else {
					const extraCCCC = {
						showname: '',
						otherCharId: 0,
						otherName: '',
						otherEmote: '',
						selfOffset: [0, 0],
						otherOffset: [0, 0],
						otherFlip: 0,
						nonInterruptingPreanim: 0,
					};
					chatmsg = Object.assign(extraCCCC, chatmsg);
					const extra27 = {
						loopingSfx: 0,
						screenshake: 0,
						frameScreenshake: '',
						frameRealization: '',
						frameSfx: '',
					};
					chatmsg = Object.assign(extra27, chatmsg);
					const extra28 = {
						additive: 0,
						effects: ['', '', ''],
					};
					chatmsg = Object.assign(extra28, chatmsg);
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
		// const showname = args[3] || '';
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
			const img = document.getElementById(`demo_${charid}`);
			const getCharIcon = async () => {
				const extensions = [
					'.png',
					'.webp',
				];
				img.alt = chargs[0];
				const charIconBaseUrl = `${AO_HOST}characters/${encodeURI(chargs[0].toLowerCase())}/char_icon`;
				for (let i = 0; i < extensions.length; i++) {
					const fileUrl = charIconBaseUrl + extensions[i];
					const exists = await fileExists(fileUrl);
					if (exists) {
						img.alt = chargs[0];
						img.src = fileUrl;
						return;
					}
				}
			};
			await getCharIcon();

			// If the ini doesn't exist on the server this will throw an error
			try {
				const cinidata = await request(`${AO_HOST}characters/${encodeURI(chargs[0].toLowerCase())}/char.ini`);
				cini = iniParse(cinidata);
			} catch (err) {
				cini = {};
				img.classList.add('noini');
				// If it does, give the user a visual indication that the character is unusable
			}

			const muteSelect = document.getElementById('mute_select');
			muteSelect.add(new Option(safeTags(chargs[0]), charid));
			const pairSelect = document.getElementById('pair_select');
			pairSelect.add(new Option(safeTags(chargs[0]), charid));

			// sometimes ini files lack important settings
			const defaultOptions = {
				name: chargs[0],
				showname: chargs[0],
				side: 'def',
				blips: 'male',
				chat: '',
				category: '',
			};
			cini.options = Object.assign(defaultOptions, cini.options);

			// sometimes ini files lack important settings
			const defaultEmotions = {
				number: 0,
			};
			cini.emotions = Object.assign(defaultEmotions, cini.emotions);

			this.chars[charid] = {
				name: safeTags(chargs[0]),
				showname: safeTags(cini.options.showname),
				desc: safeTags(chargs[1]),
				blips: safeTags(cini.options.blips).toLowerCase(),
				gender: safeTags(cini.options.gender).toLowerCase(),
				side: safeTags(cini.options.side).toLowerCase(),
				chat: (cini.options.chat === '') ? safeTags(cini.options.chat).toLowerCase() : safeTags(cini.options.category).toLowerCase(),
				evidence: chargs[3],
				icon: img.src,
				inifile: cini,
				muted: false,
			};

			if (this.chars[charid].blips === '') { this.chars[charid].blips = this.chars[charid].gender; }

			const iniEditSelect = document.getElementById('client_ininame');
			iniEditSelect.add(new Option(safeTags(chargs[0])));
		} else {
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
				document.getElementById('client_loadingtext').innerHTML = `Loading Character ${args[1]}/${this.charListLength}`;
				const chargs = args[i].split('&');
				const charid = args[i - 1];
				setTimeout(() => this.handleCharacterInfo(chargs, charid), 500);
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
	async handleSC(args) {
		const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

		// Add this so people can see characters loading on the screen.
		document.getElementById('client_loading').style.display = 'none';
		document.getElementById('client_charselect').style.display = 'block';

		document.getElementById('client_loadingtext').innerHTML = 'Loading Characters';
		for (let i = 1; i < args.length; i++) {
			document.getElementById('client_loadingtext').innerHTML = `Loading Character ${i}/${this.charListLength}`;
			const chargs = args[i].split('&');
			const charid = i - 1;
			await sleep(0.1); // TODO: Too many network calls without this. net::ERR_INSUFFICIENT_RESOURCES
			this.handleCharacterInfo(chargs, charid);
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
		document.getElementById('client_loadingtext').innerHTML = `Loading Evidence ${args[1]}/${this.evidenceListLength}`;
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
				filename: safeTags(arg[2]),
				icon: `${AO_HOST}evidence/${encodeURI(arg[2].toLowerCase())}`,
			};
		}

		const evidenceBox = document.getElementById('evidences');
		evidenceBox.innerHTML = '';
		for (let i = 1; i <= this.evidences.length; i++) {
			evidenceBox.innerHTML += `<img src="${this.evidences[i - 1].icon}" 
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
			const backgrounds = JSON.parse(bgdata);
			// the try catch will fail before here when there is no file

			const backgroundSelect = document.getElementById('bg_select');
			backgroundSelect.innerHTML = '';

			backgroundSelect.add(new Option('Custom', 0));
			backgrounds.forEach((background) => {
				backgroundSelect.add(new Option(background));
			});
		} catch (err) {
			// console.warn('there was no backgrounds.json file');
		}
	}

	async fetchCharacterList() {
		try {
			const chardata = await request(`${AO_HOST}characters.json`);
			const characters = JSON.parse(chardata);
			// the try catch will fail before here when there is no file

			const characterSelect = document.getElementById('client_ininame');
			characterSelect.innerHTML = '';

			characters.forEach((character) => {
				characterSelect.add(new Option(character));
			});
		} catch (err) {
			// console.warn('there was no characters.json file');
		}
	}

	async fetchEvidenceList() {
		try {
			const evidata = await request(`${AO_HOST}evidence.json`);
			const evidenceArray = JSON.parse(evidata);
			// the try catch will fail before here when there is no file

			const evidenceSelect = document.getElementById('evi_select');
			evidenceSelect.innerHTML = '';

			evidenceArray.forEach((evi) => {
				evidenceSelect.add(new Option(evi));
			});
			evidenceSelect.add(new Option('Custom', 0));
		} catch (err) {
			// console.warn('there was no evidence.json file');
		}
	}

	isAudio(trackname) {
		const audioEndings = ['.wav', '.mp3', '.ogg', '.opus'];
		return audioEndings.filter((ending) => trackname.endsWith(ending)).length === 1;
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
		newarea.onclick = () => {
			areaClick(this);
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
			this.musicsTime = false;
		}

		for (let i = 2; i < args.length - 1; i++) {
			if (i % 2 === 0) {
				document.getElementById('client_loadingtext').innerHTML = `Loading Music ${args[1]}/${this.musicListLength}`;
				const trackname = safeTags(args[i]);
				const trackindex = args[i - 1];
				if (this.musicsTime) {
					this.addTrack(trackname);
				} else if (this.isAudio(trackname)) {
					this.musicsTime = true;
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

		this.musicsTime = false;

		for (let i = 1; i < args.length - 1; i++) {
			// Check when found the song for the first time
			const trackname = safeTags(args[i]);
			const trackindex = i - 1;
			document.getElementById('client_loadingtext').innerHTML = `Loading Music ${i}/${this.musicListLength}`;
			if (this.musicsTime) {
				this.addTrack(trackname);
			} else if (this.isAudio(trackname)) {
				this.musicsTime = true;
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
			this.addTrack(safeTags(args[i]));
		}
	}

	/**
	 * Handles updated area list
	 * @param {Array} args packet arguments
	 */
	handleFA(args) {
		this.resetAreaList();

		for (let i = 1; i < args.length - 1; i++) {
			this.createArea(i - 1, safeTags(args[i]));
		}
	}

	/**
	 * Handles the "MusicMode" packet
	 * @param {Array} args packet arguments
	 */
	handleMM() {
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
		this.handleBans('Kicked', safeTags(args[1]));
	}

	/**
	 * Handles the banned packet
	 * this one is sent when you are kicked off the server
	 * @param {Array} args ban reason
	 */
	handleKB(args) {
		this.handleBans('Banned', safeTags(args[1]));
		this.banned = true;
	}

	/**
	 * Handles the warning packet
	 * on client this spawns a message box you can't close for 2 seconds
	 * @param {Array} args ban reason
	 */
	handleBB(args) {
		alert(safeTags(args[1]));
	}

	/**
	 * Handles the banned packet
	 * this one is sent when you try to reconnect but you're banned
	 * @param {Array} args ban reason
	 */
	handleBD(args) {
		this.handleBans('Banned', safeTags(args[1]));
		this.banned = true;
	}

	/**
	 * Handles the handshake completion packet, meaning the player
	 * is ready to select a character.
	 *
	 * @param {Array} args packet arguments
	 */
	handleDONE() {
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
		viewport.bgname = safeTags(args[1]);
		const bgfolder = viewport.bgFolder;
		const backgroundIndex = getIndexFromSelect('bg_select', viewport.bgname);
		document.getElementById('bg_select').selectedIndex = backgroundIndex;
		updateBackgroundPreview();
		if (backgroundIndex === 0) {
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
		const hpPercent = Number(args[2]) * 10;
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
		healthbox.getElementsByClassName('health-bar')[0].style.width = `${hpPercent}%`;
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
			break;
			// console.warn('Invalid testimony');
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
		const timerValue = Number(args[3]);
		switch (type) {
		case 1:
			document.getElementById(`client_timer${timerid}`).innerText = timerValue;
			break;
		case 2:
			document.getElementById(`client_timer${timerid}`).style.display = '';
			break;
		case 3:
			document.getElementById(`client_timer${timerid}`).style.display = 'none';
			break;
		default:
			break;
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
	handleHI() {
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
	handlePN() {
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
	handleaskchaa() {
		this.sendSelf(`SI#${vanillaCharacters.length}#0#0#%`);
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
					this.areas[i].status = safeTags(args[i + 1]);
					break;
				case 2:
					this.areas[i].cm = safeTags(args[i + 1]);
					break;
				case 3:
					this.areas[i].locked = safeTags(args[i + 1]);
					break;
				default:
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
		this.charListLength = Number(args[1]);
		this.charListLength += 1; // some servers count starting from 0 some from 1...
		this.evidenceListLength = Number(args[2]);
		this.musicListLength = Number(args[3]);

		// create the charselect grid, to be filled by the character loader
		document.getElementById('client_chartable').innerHTML = '';

		for (let i = 0; i < this.charListLength; i++) {
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
		for (let i = 0; i < this.charListLength; i++) {
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

		const me = this.chars[this.charID];
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
					// console.error(`missing emote ${i}`);
				}
			}
			pickEmotion(1);
		}

		if (await fileExists(`${AO_HOST}characters/${encodeURI(me.name.toLowerCase())}/custom.gif`)) { document.getElementById('button_4').style.display = ''; } else { document.getElementById('button_4').style.display = 'none'; }

		const iniEditSelect = document.getElementById('client_ininame');

		// Load iniswaps if there are any
		try {
			const cswapdata = await request(`${AO_HOST}characters/${encodeURI(me.name.toLowerCase())}/iniswaps.ini`);
			const cswap = cswapdata.split('\n');

			// most iniswaps don't list their original char
			if (cswap.length > 0) {
				iniEditSelect.innerHTML = '';

				function addIniswap(value) {
					iniEditSelect.add(new Option(safeTags(value)));
				}

				addIniswap(me.name);
				cswap.forEach(addIniswap);
			}
		} catch (err) {
			// console.info("character doesn't have iniswaps");
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
	handleRC() {
		this.sendSelf(`SC#${vanillaCharacters.join('#')}#%`);
	}

	/**
	 * we are asking ourselves what characters there are
	 * @param {Array} args packet arguments
	 */
	handleRM() {
		this.sendSelf(`SM#${vanillaMusic.join('#')}#%`);
	}

	/**
	 * we are asking ourselves what characters there are
	 * @param {Array} args packet arguments
	 */
	handleRD() {
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

		this.blipChannels = [
			new Audio(`${AO_HOST}sounds/general/sfx-blipmale.opus`),
			new Audio(`${AO_HOST}sounds/general/sfx-blipmale.opus`),
			new Audio(`${AO_HOST}sounds/general/sfx-blipmale.opus`),
			new Audio(`${AO_HOST}sounds/general/sfx-blipmale.opus`),
			new Audio(`${AO_HOST}sounds/general/sfx-blipmale.opus`),
			new Audio(`${AO_HOST}sounds/general/sfx-blipmale.opus`),
		];
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

		this.music = [
			new Audio(`${AO_HOST}sounds/music/trial (aa).opus`),
			new Audio(`${AO_HOST}sounds/music/trial (aa).opus`),
			new Audio(`${AO_HOST}sounds/music/trial (aa).opus`),
			new Audio(`${AO_HOST}sounds/music/trial (aa).opus`),
		];
		this.music.forEach((channel) => { channel.volume = 0.5; });
		this.music.forEach((channel) => { channel.onerror = opusCheck(channel); });

		this.updater = null;
		this.testimonyUpdater = null;

		this.bgname = 'gs4';

		this.lastChar = '';
		this.lastEvi = 0;

		this.testimonyTimer = 0;
		this.shoutTimer = 0;
		this.textTimer = 0;

		this.animating = false;
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

		let bench;
		if ('def,pro,wit'.includes(position)) {
			bench = document.getElementById(`client_${position}_bench`);
		} else {
			bench = document.getElementById('client_bench_classic');
		}

		let court;
		if ('def,pro,wit'.includes(position)) {
			court = document.getElementById(`client_court_${position}`);
		} else {
			court = document.getElementById('client_court_classic');
		}
		const positions = {
			def: {
				bg: 'defenseempty.png',
				desk: { ao2: 'defensedesk.png', ao1: 'bancodefensa.png' },
				speedLines: 'defense_speedlines.gif',
			},
			pro: {
				bg: 'prosecutorempty.png',
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
			default:
				break;
			}
		} else {
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
			// console.warn(`Invalid testimony ID ${client.testimonyID}`);
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
		this.animating = true;
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

		const validSides = ['def', 'pro', 'wit'];
		if (validSides.includes(this.chatmsg.side)) {
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

		setEmote(AO_HOST, this, this.chatmsg.name.toLowerCase(), this.chatmsg.sprite, '(a)', false, this.chatmsg.side);

		if (this.chatmsg.other_name) {
			setEmote(AO_HOST, this, this.chatmsg.other_name.toLowerCase(), this.chatmsg.other_emote, '(a)', false, this.chatmsg.side);
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

		if (this.chatmsg.type === 1 && this.chatmsg.preanim !== '-') {
			chatContainerBox.style.opacity = 0;
			gifLength = await getAnimLength(`${AO_HOST}characters/${encodeURI(this.chatmsg.name.toLowerCase())}/${encodeURI(this.chatmsg.preanim)}`);
			this.chatmsg.startspeaking = false;
		} else {
			this.chatmsg.startspeaking = true;
		}
		this.chatmsg.preanimdelay = parseInt(gifLength, 10);

		this.changeBackground(chatmsg.side);

		setChatbox(chatmsg.chatbox);
		resizeChatbox();

		// Flip the character
		charLayers.style.transform = this.chatmsg.flip === 1 ? 'scaleX(-1)' : 'scaleX(1)';

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
		pairLayers.style.transform = this.chatmsg.other_flip === 1 ? 'scaleX(-1)' : 'scaleX(1)';

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
		const badEffects = ['', '-', 'none'];
		if (this.chatmsg.effects[0] && !badEffects.includes(this.chatmsg.effects[0].toLowerCase())) {
			const baseEffectUrl = `${AO_HOST}themes/default/effects/`;
			fg.src = `${baseEffectUrl}${encodeURI(this.chatmsg.effects[0].toLowerCase())}.webp`;
		} else {
			fg.src = transparentPNG;
		}

		const soundChecks = ['0', '1', '', undefined];
		if (soundChecks.some((check) => this.chatmsg.sound === check)) {
			this.chatmsg.sound = this.chatmsg.effects[2];
		}

		this.tick();
	}

	/**
	 * Updates the chatbox based on the given text.
	 *
	 * OK, here's the documentation on how this works:
	 *
	 * 1 animating
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
		if (this.animating) {
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
				setEmote(AO_HOST, this, charName, preanim, '', false, this.chatmsg.side);
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
				// Evidence Bullshit
				if (this.chatmsg.evidence > 0) {
					// Prepare evidence
					eviBox.src = safeTags(client.evidences[this.chatmsg.evidence - 1].icon);

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
					setEmote(AO_HOST, this, pairName, pairEmote, '(a)', true, this.chatmsg.side);
					pairLayers.style.opacity = 1;
				} else {
					pairLayers.style.opacity = 0;
				}

				setEmote(AO_HOST, this, charName, charEmote, '(b)', false, this.chatmsg.side);
				charLayers.style.opacity = 1;

				if (this.textnow === this.chatmsg.content) {
					setEmote(AO_HOST, this, charName, charEmote, '(a)', false, this.chatmsg.side);
					charLayers.style.opacity = 1;
					waitingBox.style.opacity = 1;
					this.animating = false;
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
					this.animating = false;
					setEmote(AO_HOST, this, charName, charEmote, '(a)', false, this.chatmsg.side);
					charLayers.style.opacity = 1;
					waitingBox.style.opacity = 1;
					clearTimeout(this.updater);
				}
			}
		}

		if (!this.sfxplayed && this.chatmsg.snddelay + this.shoutTimer >= this.textTimer) {
			this.sfxplayed = 1;
			if (this.chatmsg.sound !== '0' && this.chatmsg.sound !== '1' && this.chatmsg.sound !== '' && this.chatmsg.sound !== undefined && (this.chatmsg.type === 1 || this.chatmsg.type === 2 || this.chatmsg.type === 6)) {
				this.playSFX(`${AO_HOST}sounds/general/${encodeURI(this.chatmsg.sound.toLowerCase())}.opus`, this.chatmsg.looping_sfx);
			}
		}
		this.textTimer += UPDATE_INTERVAL;
	}
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
		const nonInterruptingPreanim = ((document.getElementById('check_nonint').checked) ? 1 : 0);
		const loopingSfx = ((document.getElementById('check_loopsfx').checked) ? 1 : 0);
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
		let emoteMod = myemo.zoom;
		if (document.getElementById('sendsfx').checked) {
			sfxname = myemo.sfx;
			sfxdelay = myemo.sfxdelay;
		}

		// not to overwrite a 5 from the ini or anything else
		if (document.getElementById('sendpreanim').checked) {
			if (emoteMod === 0) { emoteMod = 1; }
		} else if (emoteMod === 1) { emoteMod = 0; }

		client.sendIC(
			'chat',
			myemo.preanim,
			mychar.name,
			myemo.emote,
			text,
			myrole,
			sfxname,
			emoteMod,
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
			nonInterruptingPreanim,
			loopingSfx,
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

export function resetOffset() {
	document.getElementById('pair_offset').value = 0;
	document.getElementById('pair_y_offset').value = 0;
}
window.resetOffset = resetOffset;

/**
 * Triggered when the music search bar is changed
 * @param {MouseEvent} event
 */
export function musiclistFilter() {
	const musicListElement = document.getElementById('client_musiclist');
	const searchname = document.getElementById('client_musicsearch').value;

	musicListElement.innerHTML = '';

	for (const trackname of client.musics) {
		if (trackname.toLowerCase().indexOf(searchname.toLowerCase()) !== -1) {
			const newentry = document.createElement('OPTION');
			newentry.text = trackname;
			musicListElement.options.add(newentry);
		}
	}
}
window.musiclist_filter = musiclistFilter;

/**
 * Triggered when an item on the music list is clicked.
 * @param {MouseEvent} event
 */
export function musicListClick() {
	const playtrack = document.getElementById('client_musiclist').value;
	client.sendMusicChange(playtrack);

	// This is here so you can't actually select multiple tracks,
	// even though the select tag has the multiple option to render differently
	const musicListElements = document.getElementById('client_musiclist').selectedOptions;
	for (let i = 0; i < musicListElements.length; i++) {
		musicListElements[i].selected = false;
	}
}
window.musiclist_click = musicListClick;

/**
 * Triggered when a character in the mute list is clicked
 * @param {MouseEvent} event
 */
export function muteListClick() {
	const mutelist = document.getElementById('mute_select');
	const selectedCharacter = mutelist.options[mutelist.selectedIndex];

	if (client.chars[selectedCharacter.value].muted === false) {
		client.chars[selectedCharacter.value].muted = true;
		selectedCharacter.text = `${client.chars[selectedCharacter.value].name} (muted)`;
	} else {
		client.chars[selectedCharacter.value].muted = false;
		selectedCharacter.text = client.chars[selectedCharacter.value].name;
	}
}
window.mutelist_click = muteListClick;

/**
 * Triggered by the modcall sfx dropdown
 */
export function modCallTest() {
	client.handleZZ('test#test'.split('#'));
}
window.modcall_test = modCallTest;

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
		document.getElementById('client_court').style.display = '';
	} else if (addcheck === 2) {
		document.getElementById('client_pantilt').checked = false;
		document.getElementById('client_court').style.display = 'none';
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
export function changeCharacter() {
	document.getElementById('client_charselect').style.display = 'block';
	document.getElementById('client_emo').innerHTML = '';
}
window.changeCharacter = changeCharacter;

/**
 * Triggered when there was an error loading a character sprite.
 * @param {HTMLImageElement} image the element containing the missing image
 */
export function charError(image) {
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
 * Triggered when the music search bar is changed
 * @param {MouseEvent} event
 */
export function charTableFilter() {
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
window.chartable_filter = charTableFilter;

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
 * Edit selected evidence.
 */
export function editEvidence() {
	const evidenceSelect = document.getElementById('evi_select');
	const id = parseInt(client.selectedEvidence, 10) - 1;
	client.sendEE(
		id,
		document.getElementById('evi_name').value,
		document.getElementById('evi_desc').value,
		evidenceSelect.selectedIndex === 0
			? document.getElementById('evi_filename').value
			: evidenceSelect.options[evidenceSelect.selectedIndex].text,
	);
	cancelEvidence();
}
window.editEvidence = editEvidence;

/**
 * Delete selected evidence.
 */
export function deleteEvidence() {
	const id = parseInt(client.selectedEvidence, 10) - 1;
	client.sendDE(id);
	cancelEvidence();
}
window.deleteEvidence = deleteEvidence;

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
	const newRole = document.getElementById('role_select').value;

	client.sendOOC(`/pos ${newRole}`);
	client.sendServer(`SP#${newRole}#%`);
	updateActionCommands(newRole);
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
	if (modcall === null || modcall === '') {
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
	client.sendHP(1, String(parseInt(client.hp[0], 10) + 1));
}
window.addHPD = addHPD;

/**
 * Decrement defense health point.
 */
export function redHPD() {
	client.sendHP(1, String(parseInt(client.hp[0], 10) - 1));
}
window.redHPD = redHPD;

/**
 * Increment prosecution health point.
 */
export function addHPP() {
	client.sendHP(2, String(parseInt(client.hp[1], 10) + 1));
}
window.addHPP = addHPP;

/**
 * Decrement prosecution health point.
 */
export function redHPP() {
	client.sendHP(2, String(parseInt(client.hp[1], 10) - 1));
}
window.redHPP = redHPP;

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

const fpPromise = FingerprintJS.load();
fpPromise
	.then((fp) => fp.get())
	.then((result) => {
		hdid = result.visitorId;
		client = new Client(serverIP);
		viewport = new Viewport();

		isLowMemory();
		client.loadResources();
	});

/**
 * Add evidence.
 */
export function addEvidence() {
	const evidenceSelect = document.getElementById('evi_select');
	client.sendPE(
		document.getElementById('evi_name').value,
		document.getElementById('evi_desc').value,
		evidenceSelect.selectedIndex === 0
			? document.getElementById('evi_filename').value
			: evidenceSelect.options[evidenceSelect.selectedIndex].text,
	);
	cancelEvidence();
}
window.addEvidence = addEvidence;

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
		const iconId = getIndexFromSelect('evi_select', client.evidences[evidence - 1].filename);
		document.getElementById('evi_select').selectedIndex = iconId;
		if (iconId === 0) {
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
