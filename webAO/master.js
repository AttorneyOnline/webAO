const MASTERSERVER_IP = "master.aceattorneyonline.com:27014";
const version = 2.4;

import Fingerprint2 from 'fingerprintjs2';

let masterserver;

let hdid;
const options = {fonts: {extendedJsFonts: true, userDefinedFonts: ["Ace Attorney", "8bitoperator", "DINEngschrift"]}, excludes: {userAgent: true}};

let oldLoading = false;

if (window.requestIdleCallback) {
    requestIdleCallback(function () {
        Fingerprint2.get(options, function (components) {
			hdid = Fingerprint2.x64hash128(components.join(''), 31);

			masterserver = new WebSocket("ws://" + MASTERSERVER_IP);
			masterserver.onopen = (evt) => onOpen(evt);
			masterserver.onmessage = (evt) => onMessage(evt);

			if (/webOS|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|PlayStation|Opera Mini/i.test(navigator.userAgent)) {
				oldLoading = true;
			}
        });
    });
} else {
    setTimeout(function () {
        Fingerprint2.get(options, function (components) {
			hdid = Fingerprint2.x64hash128(components.join(''), 31);

			masterserver = new WebSocket("ws://" + MASTERSERVER_IP);
			masterserver.onopen = (evt) => onOpen(evt);
			masterserver.onmessage = (evt) => onMessage(evt);

			if (/webOS|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|PlayStation|Opera Mini/i.test(navigator.userAgent)) {
				oldLoading = true;
			}
        });
    }, 500);
}

const server_description = [];
server_description[-1] = "This is your computer on port 50001";
const online_counter = [];

/**
 * read a cookie from storage
 * got this from w3schools
 * https://www.w3schools.com/js/js_cookies.asp
 * @param {String} cname The name of the cookie to return
 */
function getCookie(cname) {
	var name = cname + "=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
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
}

/**
 * set a cookie
 * the version from w3schools expects these to expire
 * @param {String} cname The name of the cookie to return
 * @param {String} value The value of that cookie option
 */
function setCookie(cname,value) {
	document.cookie = cname + "=" + value;
}

export function setServ(ID) {
	console.log(server_description[ID]);
	if (server_description[ID] !== undefined) {
		document.getElementById("serverdescription_content").innerHTML = "<b>" + online_counter[ID] + "</b><br>" + server_description[ID];
	}
	else {
		document.getElementById("serverdescription_content").innerHTML = "";
	}
}
window.setServ = setServ;

function onOpen(_e) {
	console.log(`Your emulated HDID is ${hdid}`);
	masterserver.send(`ID#webAO#webAO#%`);

	if (oldLoading === true) {
		masterserver.send("askforservers#%");
	}
	else {
		masterserver.send("ALL#%");
	}
	masterserver.send("VC#%");
}

function checkOnline(serverID, coIP) {

	var oserv = new WebSocket("ws://" + coIP);

	// define what the callbacks do
	function onCOOpen(_e) {
		document.getElementById(`server${serverID}`).className = "available";
		oserv.send(`HI#${hdid}#%`);
		oserv.send(`ID#webAO#webAO#%`);
	}

	function onCOMessage(e) {
		const comsg = e.data;
		const coheader = comsg.split("#", 2)[0];
		const coarguments = comsg.split("#").slice(1);
		if (coheader === "PN") {
			online_counter[serverID] = `Online: ${coarguments[0]}/${coarguments[1]}`;
			oserv.close();
		}
		else if (coheader === "BD") {
			online_counter[serverID] = "Banned";
			server_description[serverID] = coarguments[0];
			oserv.close();
		}
	}

	function onCOError(_e) {
		console.warn(coIP + " threw an error.");
	}

	// assign the callbacks
	oserv.onopen = function (evt) {
		onCOOpen(evt);
	};

	oserv.onmessage = function (evt) {
		onCOMessage(evt);
	};

	oserv.onerror = function(evt) {
		onCOError(evt)
	  };

}

function onMessage(e) {
	const msg = e.data;	
	const header = msg.split("#", 2)[0];
	console.log(header);
	
	if (header === "ALL") {
		const servers = msg.split("#").slice(1);
		for (let i = 0; i < servers.length-1; i++) {
			const serverEntry = servers[i];
			const args = serverEntry.split("&");
			const asset = args[4] ? `&asset=${args[4]}` : "";

			document.getElementById("masterlist").innerHTML +=
				`<li id="server${i}" class="unavailable" onmouseover="setServ(${i})"><p>${args[0]}</p>`
				+ `<a class="button" href="client.html?mode=watch&ip=${args[2]}:${args[3]}${asset}">Watch</a>`
				+ `<a class="button" href="client.html?mode=join&ip=${args[2]}:${args[3]}${asset}">Join</a></li>`;
			server_description[i] = args[1];
			checkOnline(i, `${args[2]}:${args[3]}`);
		}
		checkOnline(-1, "127.0.0.1:50001");
	}
	else if (header === "SN") {
		const args = msg.split("#");
		const i = args[1];
		document.getElementById("masterlist").innerHTML +=
			`<li id="server${i}" class="unavailable" onmouseover="setServ(${i})"><p>${args[5]}</p>`
			+ `<a class="button" href="client.html?mode=watch&ip=${args[2]}:${args[4]}">Watch</a>`
			+ `<a class="button" href="client.html?mode=join&ip=${args[2]}:${args[4]}">Join</a></li>`;
		server_description[i] = args[6];
		masterserver.send("SR#" + i + "#%");
		checkOnline(i, `${args[2]}:${args[3]}`);
	}
	else if (header === "servercheok") {
		const args = msg.split("#").slice(1);
		document.getElementById("clientinfo").innerHTML = `Client version: ${args[0]}`;
	}
	else if (header === "SV") {
		const args = msg.split("#").slice(1);
		document.getElementById("serverinfo").innerHTML = `Master server version: ${args[0]}`;
	}
}
