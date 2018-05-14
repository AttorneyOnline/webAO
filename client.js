/*
glorious webao
made by sD
credits to aleks for original idea and source
*/
var queryDict = {};
location.search.substr(1).split("&").forEach(function(item) {
	queryDict[item.split("=")[0]] = item.split("=")[1]
})

//document.getElementById("client_wrapper").style = "width: 800px;";
/* Server magic */
//serv = new WebSocket("ws://51.255.160.217:50000");
//serv = new WebSocket("ws://85.25.196.172:5000");
var serverIP = queryDict.ip;
serv = new WebSocket("ws://" + serverIP);
var mode = queryDict.mode;
//var AO_HOST = "http://weedlan.de/";
if (queryDict.asset === undefined) {
	var AO_HOST = "http://assets.aceattorneyonline.com/base/";
} else {
	var AO_HOST = queryDict.asset;
}
var MUSIC_HOST = AO_HOST + "sounds/music/";
var BAR_WIDTH = 90;
var BAR_HEIGHT = 20;
var textnow = "";
var chatmsg = {
	"isnew": false
};
var blip = new Audio(AO_HOST + 'sounds/general/sfx-blipmale.wav');
var womboblip = new Audio(AO_HOST + 'sounds/general/sfx-blipmale.wav');
var comboblip = new Audio(AO_HOST + 'sounds/general/sfx-blipmale.wav');
var sfxaudio = new Audio(AO_HOST + 'sounds/general/sfx-blipmale.wav');
var sfxplayed = 0;
var music = new Audio();
music.play();
blip.volume = 0.5;
womboblip.volume = 0.5;
comboblip.volume = 0.5;
combo = false;
var charselectWidth = 8;
var musiclist = Object();
var ex = false;
var tempchars = [];
var chars = [];
var emotes = [];
var charcheck;
var pid = 1;
var bgname = 'gs4';
var bgfolder = AO_HOST + "background/" + bgname + "/";
// 0 = objection shout, 1 = pre-anim, 2 = speaking, 3 = silent
var chatstate = 3
var position;
var me = -1;
var myemotion = -1;
var myschar = -1;
var objection_state = 0;
var updateInterval = 80;
var shouttimer = 0;
var texttimer = 0;
var updater;
var CHECKupdater;
var serv;
var oldloading=false;
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
	oldloading=true;
}
var carea = 0;
var linifile;
var pinifile;
var hdid;

hashCode = function(str) {
	var hash = 0, i, chr, len;
	if (str.length === 0) return hash;
	for (i = 0, len = str.length; i < len; i++) {
	  chr   = str.charCodeAt(i);
	  hash  = ((hash << 5) - hash) + chr;
	  hash |= 0; // Convert to 32bit integer
	}
	return hash;
  };

hdid = hashCode(navigator.userAgent);

serv.onopen = function(evt) {
	onOpen(evt)
};
serv.onclose = function(evt) {
	onClose(evt)
};
serv.onmessage = function(evt) {
	onMessage(evt)
};
serv.onerror = function(evt) {
	onError(evt)
};

function parseINI(data) {
	var regex = {
		section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
		param: /^\s*([\w\.\-\_]+)\s*=\s*(.*?)\s*$/,
		comment: /^\s*;.*$/
	};
	var value = {};
	var lines = data.split(/\r\n|\r|\n/);
	var section = null;
	lines.forEach(function(line) {
		if (regex.comment.test(line)) {
			return;
		} else if (line.length == 0) {
			return;
		} else if (regex.param.test(line)) {
			var match = line.match(regex.param);
			if (section) {
				value[section][match[1]] = match[2];
			} else {
				value[match[1]] = match[2];
			}
		} else if (regex.section.test(line)) {
			var match = line.match(regex.section);
			value[match[1]] = {};
			section = match[1];
		};
	});
	return value;
}

function escapeChat(estring) {
	estring.replace("#", "<pound>");
	estring.replace("&", "<and>");
	estring.replace("%", "<percent>");
	estring.replace("$", "<dollar>");
	return estring;
}

function onOOCEnter(event) {
	if (event.keyCode == 13) {
		serv.send("CT#web" + pid + "#" + escapeChat(document.getElementById("client_oocinputbox").value) + "#%");
		document.getElementById("client_oocinputbox").value = "";
	}
}

function onEnter(event) {
	if (event.keyCode == 13) {
		mychar = chars[me]
		myemo = emotes[myemotion]
		if(document.getElementById("sendsfx").checked){
			ssfxname=myemo.sfx;
			ssfxdelay=myemo.sfxdelay;
		}else{
			ssfxname="0";
			ssfxdelay="0";
		}
		ICmessage = "MS#chat#" + myemo.speaking + "#" + mychar.name + "#" + myemo.silent + "#" + escapeChat(document.getElementById("client_inputbox").value) + "#" + mychar.side + "#" + ssfxname +"#" + myemo.zoom + "#" + me + "#" + ssfxdelay + "#" + objection_state + "#0#0#0#0#%";
		serv.send(ICmessage);
		document.getElementById("client_inputbox").value = '';
		if (objection_state) {
			document.getElementById("button_" + objection_state).className = "client_button";
			objection_state = 0;
		}
	}
}

function musiclist_click(event) {
	var playtrack = document.getElementById("client_musiclist").value;
	serv.send("MC#" + playtrack + "#" + me + "#%");
}

function changeMusicVolume() {
	music.volume = document.getElementById("client_mvolume").value / 100;
}

function changeSFXVolume() {
	sfxaudio.volume = document.getElementById("client_svolume").value / 100;
}

function changeBlipVolume() {
	blip.volume = document.getElementById("client_bvolume").value / 100;
	womboblip.volume = document.getElementById("client_bvolume").value / 100;
	comboblip.volume = document.getElementById("client_bvolume").value / 100;
}

function changeCharacter(event) {
	serv.send("FC#%");
	document.getElementById("client_charselect").style.display = "block";
	document.getElementById("client_emo").innerHTML = "";
}

function imgError(image) {
	image.onerror = "";
	image.src = "/misc/placeholder.gif";
	return true;
}

function demoError(image) {
	image.onerror = "";
	image.src = "/misc/placeholder.png";
	return true;
}

function ImageExist(url) {
	var img = new Image();
	img.src = url;
	return img.height != 0;
}

function changebg(position) {
	var standname
	bgfolder = AO_HOST + "background/" + escape(bgname) + "/";
	document.getElementById("client_fg").style.display = "none";
	document.getElementById("client_bench").style.display = "none";
	switch (position) {
		case "def":
			document.getElementById("client_court").src = bgfolder + "defenseempty.png"
			document.getElementById("client_bench").style.display = "block";
			document.getElementById("client_bench").src = bgfolder + "defensedesk.png"
			standname="defense";
			break;
		case "pro":
			document.getElementById("client_court").src = bgfolder + "prosecutorempty.png"
			document.getElementById("client_bench").style.display = "block"
			document.getElementById("client_bench").src = bgfolder + "prosecutiondesk.png"
			standname="prosecution";
			break;
		case "hld":
			document.getElementById("client_court").src = bgfolder + "helperstand.png"
			standname="defense";
			break;
		case "hlp":
			document.getElementById("client_court").src = bgfolder + "prohelperstand.png"
			standname="prosecution";
			break;
		case "wit":
			document.getElementById("client_court").src = bgfolder + "witnessempty.png"
			document.getElementById("client_bench").style.display = "block"
			document.getElementById("client_bench").src = bgfolder + "estrado.png"
			standname="prosecution";
			break;
		case "jud":
			document.getElementById("client_court").src = bgfolder + "judgestand.png"
			standname="prosecution";
			break;
	}
	if(chatmsg.type==5){
		document.getElementById("client_bench").style.display = "none";
		document.getElementById("client_court").src = AO_HOST + "themes/default/"+standname+"_speedlines.gif";
	}
}

function updateText() {
	if (chatmsg.content.trim() == "") {
		document.getElementById("client_name").style.display = "none";
		document.getElementById("client_chat").style.display = "none";
	} else {
		document.getElementById("client_name").style.display = "block";
		document.getElementById("client_chat").style.display = "block";
	}
	if (chatmsg.isnew){
	switch (chatmsg.objection) {
		case "0":
			shouttimer = 0;
			break;
		case "1":
			document.getElementById("client_char").src = AO_HOST + "misc/holdit.gif";
			shouttimer = 800;
			chatmsg.sound = "sfx-objection"
			break;
		case "2":
			document.getElementById("client_char").src = AO_HOST + "misc/takethat.gif";
			shouttimer = 800;
			chatmsg.sound = "sfx-objection"
			break;
		case "3":
			document.getElementById("client_char").src = AO_HOST + "misc/objection.gif";
			shouttimer = 800;
			chatmsg.sound = "sfx-objection"
			break;
	}
	chatmsg.isnew=false;
	chatmsg.startspeaking=true;
}
	if (texttimer >= shouttimer) {
		if (chatmsg.startspeaking) {
			changebg(chatmsg.side);
			document.getElementById("client_char").src = AO_HOST + "characters/" + escape(chatmsg.name) + "/" + chatmsg.speaking + ".gif";
			document.getElementById("client_name").style.fontSize = (document.getElementById("client_name").offsetHeight * 0.7) + "px";
			document.getElementById("client_chat").style.fontSize = (document.getElementById("client_chat").offsetHeight * 0.25) + "px";
			document.getElementById("client_name").innerHTML = "<p>" + escapeHtml(chatmsg.nameplate) + "</p>";
			switch(chatmsg.color){
				case "0":
				stylecolor="color: #ffffff;";
				break;
				case "1":
				stylecolor="color: #00ff00;";
				break;
				case "2":
				stylecolor="color: #ff0000;";
				break;
				case "3":
				stylecolor="color: #ffaa00;";
				break;
				case "4":
				stylecolor="color: #0000ff;";
				break;
				case "5":
				stylecolor="color: #ffff00;";
				break;
				case "6":
				stylecolor="color: #aa00aa;";
				break;
			}
			document.getElementById("client_inner_chat").style = stylecolor;
			chatmsg.startspeaking = false;
		} else {
			if (textnow != chatmsg.content) {
				if(chatmsg.content.substring(textnow.length, textnow.length + 1)!=" "){
				combo = (combo + 1) % 2;
				switch (combo) {
					case 0:
						blip.play()
						break;
					case 1:
						//womboblip.play()
						break;
				}
			}
				textnow = chatmsg.content.substring(0, textnow.length + 1);
				document.getElementById("client_inner_chat").innerHTML = escapeHtml(textnow);
				if (textnow == chatmsg.content) {
					chatstate = 3;
					texttimer=0;
					clearInterval(updater);
					document.getElementById("client_char").src = AO_HOST + "characters/" + escape(chatmsg.name) + "/" + chatmsg.silent + ".gif";
				}
			}
		}
	}
	if (!sfxplayed && chatmsg.snddelay + shouttimer >= texttimer) {
		sfxaudio.pause();
		sfxplayed = 1
		if (chatmsg.sound != "0" && chatmsg.sound != "1") {
			sfxaudio.src = AO_HOST + "sounds/general/" + escape(chatmsg.sound) + ".wav";
			sfxaudio.play();
		}
	}
	texttimer = texttimer + updateInterval;
}

function onOpen(e) {
	if (mode == "join") {
		serv.send("HI#" + hdid + "#%");
		serv.send("ID#webAO#2.4.5#%");
	} else {
		document.getElementById("client_loading").style.display = "none";
	}
	CHECKupdater = setInterval(sendCheck, 5000);
};

function onClose(e) {
	document.getElementById("client_error").style.display = "block";
};

function ReconnectButton() {
	serv = new WebSocket("ws://" + serverIP);
	if (serv) {
		serv.send("HI#" + hdid + "#%");
		document.getElementById("client_error").style.display = "none";
	}
}

function RetryButton() {
serv.send("HI#" + hdid + "#%");
}

function onError(e) {
	document.getElementById("client_error").style.display = "block";
};

function onMessage(e) {
	msg = e.data;
	console.log(msg)
	lines = msg.split('%');
	arguments = lines[0].split('#');
	header = arguments[0];
	switch (header) {
		case "MS":
			if (arguments[4] != chatmsg.content) {
				document.getElementById("client_inner_chat").innerHTML = '';
				chatmsg.pre = escape(arguments[2]);
				chatmsg.character = -1;
				for (var i = 0; i < chars.length; i++) {
					if (chars[i].name == arguments[3]) {
						chatmsg.character = i;
						break;
					}
				}
				chatmsg.preanim = escape(arguments[2]);
				chatmsg.nameplate = arguments[3];
				chatmsg.name = arguments[3];
				chatmsg.speaking = "(b)" + escape(arguments[4]);
				chatmsg.silent = "(a)" + escape(arguments[4]);
				chatmsg.content = escapeHtml(arguments[5]);
				chatmsg.side = arguments[6];
				chatmsg.sound = escape(arguments[7]);
				chatmsg.type = arguments[8];
				//chatmsg.charid = arguments[9];
				chatmsg.snddelay = arguments[10];
				chatmsg.objection = arguments[11];
				chatmsg.evidence = arguments[12];
				//chatmsg.flip = arguments[13];
				chatmsg.flash = arguments[14];
				chatmsg.color = arguments[15];
				chatmsg.isnew = true;
				addlog(chatmsg.nameplate + ": " + escapeHtml(arguments[5]))
				changebg(chatmsg.side);
				textnow = '';
				sfxplayed = 0
				texttimer = 0
				updater = setInterval(updateText, updateInterval);
			}
			break;
		case "CT":
			document.getElementById("client_ooclog").innerHTML = document.getElementById("client_ooclog").innerHTML + arguments[1] + ": " + arguments[2] + "\r\n"
			break;
		case "MC":
			music.pause();
			music.src = MUSIC_HOST + arguments[1];
			music.play();
			if (arguments[2] >= 0) {
				musicname = chars[arguments[2]].name;
			} else {
				musicname = "$SERVER"
			}
			addlog(musicname + " changed music to " + arguments[1]);
			break;
		case "RMC":
			music.pause();
			music = new Audio(musiclist[arguments[0]]);
			music.totime = arguments[1]
			music.offset = new Date().getTime() / 1000
			music.addEventListener('loadedmetadata', function() {
				music.currentTime += parseFloat(music.totime + (new Date().getTime() / 1000 - music.offset)).toFixed(3);
				music.play();
			}, false)
			break;
		case "CI":
			document.getElementById("client_loadingtext").innerHTML = "Loading Character " + arguments[1];
			serv.send("AN#" + ((arguments[1] / 10) + 1) + "#%");
			for (var i = 2; i < arguments.length - 1; i++) {
				if (i % 2 == 0) {
					charguments = arguments[i].split("&");
					chars[arguments[i - 1]] = {
						"name": charguments[0],
						"desc": charguments[1],
						"evidence": charguments[3],
						"icon": AO_HOST + "characters/" + escape(charguments[0]) + "/char_icon.png"
					};
				}
			}
			break;
		case "SC":
			document.getElementById("client_loadingtext").innerHTML = "Loading Characters";
			for (var i = 1; i < arguments.length - 1; i++) {
				charguments = arguments[i].split("&");
				chars[i - 1] = {
					"name": charguments[0],
					"desc": charguments[1],
					"evidence": charguments[3],
					"icon": AO_HOST + "characters/" + escape(charguments[0]) + "/char_icon.png"
				}
			}
			serv.send("RM#%");
			break;
		case "EI":
			document.getElementById("client_loadingtext").innerHTML = "Loading Evidence " + arguments[1];
			//serv.send("AE#" + (arguments[1] + 1) + "#%");
			serv.send("RM#%");
			break;
		case "EM":
			document.getElementById("client_loadingtext").innerHTML = "Loading Music " + arguments[1];
			serv.send("AM#" + ((arguments[1] / 10) + 1) + "#%");
			var hmusiclist = document.getElementById("client_musiclist");
			for (var i = 2; i < arguments.length - 1; i++) {
				if (i % 2 == 0) {
					var newentry = document.createElement("OPTION");
					newentry.text = arguments[i];
					hmusiclist.options.add(newentry);
				}
			}
			break;
		case "SM":
			document.getElementById("client_loadingtext").innerHTML = "Loading Music ";
			var hmusiclist = document.getElementById("client_musiclist");
			for (var i = 1; i < arguments.length - 1; i++) {
				var newentry = document.createElement("OPTION");
				newentry.text = arguments[i];
				hmusiclist.options.add(newentry);
			}
			serv.send("RD#%");
			break;
		case "music":
			for (var i = 0; i < arguments.length / 2; i++) {
				musiclist[arguments[2 * i]] = arguments[2 * i + 1];
			}
			break;
		case "DONE":
			document.getElementById("client_loading").style.display = "none";
			document.getElementById("client_chatlog").style.display = "block";
			document.getElementById("client_wrapper").style.display = "block";
			document.getElementById("client_charselect").style.display = "block";
			break;
		case "BN":
			bgname = arguments[1];
			break;
		case "NBG":
			/* TODO */
			break;
		case "HP":
			/* TODO */
			if (arguments[1] == 1) {
				document.getElementById("client_defense_hp").style.clip = "rect(0px," + BAR_WIDTH * arguments[2] / 10 + "px," + BAR_HEIGHT + "px,0px)";
			} else {
				document.getElementById("client_prosecutor_hp").style.clip = "rect(0px," + BAR_WIDTH * arguments[2] / 10 + "px," + BAR_HEIGHT + "px,0px)";
			}
			break;
		case "ID":
			pid = arguments[1];
		case "PN":
			serv.send("askchaa#%");
			break;
		case "SI":
		if(oldloading){
			serv.send("askchar2#%");
		}else{
			serv.send("RC#%");
		}
			break;
		case "CharsCheck":
			document.getElementById("client_chartable").innerHTML = "";
			for (var i = 0; i < chars.length; i++) {
				if (i % charselectWidth == 0) {
					var tr = document.createElement('TR');
				}
				var td = document.createElement('TD');
				var icon_chosen;
				var thispick = chars[i].icon;
				if (arguments[1 + i] == "-1") {
					icon_chosen = " dark";
				} else {
					icon_chosen = "";
				}
				td.innerHTML = "<img class='demothing" + icon_chosen + "' id='demo_" + i + "' src='" + thispick + "' alt='" + chars[i].desc + "' onclick='pickchar(" + i + ")' onerror='demoError(this);'>";
				tr.appendChild(td);
				if (i % charselectWidth == 0) {
					document.getElementById("client_chartable").appendChild(tr);
				}
			}
			changebg("def");
			break;
		case "PV":
			me = arguments[3]
			document.getElementById("client_charselect").style.display = "none";
			var xhr = new XMLHttpRequest();
			xhr.open('GET', AO_HOST + 'characters/' + escape(chars[me].name) + '/char.ini', true);
			xhr.responseType = 'text';
			xhr.onload = function(e) {
				if (this.status == 200) {
					linifile = this.responseText;
					pinifile = parseINI(linifile);
					chars[me].side = pinifile.Options.side;
					for (var i = 1; i < pinifile.Emotions.number; i++) {
						var emoteinfo = pinifile.Emotions[i].split('#');
						esfx="0";
						esfxd="0";
						if (typeof pinifile.SoundN !== 'undefined') {
							esfx=pinifile.SoundN[i];
						}
						if (typeof pinifile.SoundT !== 'undefined') {
							esfxd=pinifile.SoundT[i];
						}
						emotes[i] = {
							desc: emoteinfo[0],
							speaking: emoteinfo[1],
							silent: emoteinfo[2],
							zoom: emoteinfo[3],
							sfx: esfx,
							sfxdelay: esfxd,
							button_off: AO_HOST + 'characters/' + escape(chars[me].name) + '/emotions/button' + i + '_off.png',
							button_on: AO_HOST + 'characters/' + escape(chars[me].name) + '/emotions/button' + i + '_on.png'
						};
						document.getElementById("client_emo").innerHTML += "<img src='" + emotes[i].button_off + "' id='emo_" + i + "' alt='" + emotes[i].desc + "' class='client_button' onclick='pickemotion(" + i + ")'>";
					}
					pickemotion(1);
				}
			};
			xhr.send();
			break;
	}
};

function addlog(toadd) {
	document.getElementById("client_log").innerHTML = toadd + "<br/>" + document.getElementById("client_log").innerHTML
}

function pickchar(ccharacter) {
	if (ccharacter < 1000) {
		serv.send("CC#" + pid + "#" + ccharacter + "#web#%");
	} else {
		//spectator
		document.getElementById("client_charselect").style.display = "none";
		document.getElementById("client_inputbox").style.display = "none";
		document.getElementById("client_emo").style.display = "none";
	}
}

function pickemotion(emo) {
	if (myemotion != -1) {
		document.getElementById("emo_" + myemotion).src = emotes[myemotion].button_off;
	}
	document.getElementById("emo_" + emo).src = emotes[emo].button_on;
	myemotion = emo
}

function toggleshout(shout) {
	if (shout == objection_state) {
		document.getElementById("button_" + shout).className = "client_button";
		objection_state = 0;
	} else {
		document.getElementById("button_" + shout).className = "client_button dark";
		if (objection_state) {
			document.getElementById("button_" + objection_state).className = "client_button";
		}
		objection_state = shout;
	}
}

function sendMusic(song) {
	serv.send("MC#" + song);
}

function sendCheck() {
	serv.send("CH#" + me + "#%");
}

function escapeHtml(unsafe) {
	var transfer = unsafe;
	transfer.replace(/&/g, "&amp;");
	transfer.replace(/</g, "&lt;");
	transfer.replace(/>/g, "&gt;");
	transfer.replace(/"/g, "&quot;");
	transfer.replace(/'/g, "&#039;");
	return transfer;
}

if(typeof(String.prototype.trim) === "undefined")
{
    String.prototype.trim = function() 
    {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}