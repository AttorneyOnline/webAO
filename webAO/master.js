import FingerprintJS from '@fingerprintjs/fingerprintjs';

import { unescapeChat, safeTags } from './encoding.js';
const myStorage = window.localStorage;

const version = process.env.npm_package_version;

const MASTERSERVER_IP = 'master.aceattorneyonline.com:27014';

let masterserver;

let hdid;

let selectedServer = -1;

const servers = [];
servers[-2] = {
  name: 'Singleplayer', description: 'Build cases, try out new things', ip: '127.0.0.1', port: 50001, assets: '', online: '',
};
servers[-1] = {
  name: 'Localhost', description: 'This is your computer on port 50001', ip: '127.0.0.1', port: 50001, assets: '', online: 'Online: ?/?',
};

const fpPromise = FingerprintJS.load();
fpPromise
  .then((fp) => fp.get())
  .then((result) => {
    hdid = result.visitorId;

			check_https();
			
			fetch("https://servers.aceattorneyonline.com/servers")
    			.then(cachedServerlist)
    			.then(response => loadServerlist(response))
    			.catch(cachedServerlist);

			fetch("https://servers.aceattorneyonline.com/version")
				.then(response => response.text())
				.then(response => processVersion(response));

			// i don't need the ms to play alone
			setTimeout(() => checkOnline(-1, '127.0.0.1:50001'), 0);
});

export function check_https() {
	if (document.location.protocol === 'https:') {
    document.getElementById('https_error').style.display = '';
	}
}

export function setServ(ID) {
	selectedServer = ID;

	if (document.getElementById(`server${ID}`).className === '') { checkOnline(ID, `${servers[ID].ip}:${servers[ID].ws_port}`); }

	if (servers[ID].description !== undefined) {
		document.getElementById('serverdescription_content').innerHTML = `<b>${servers[ID].online}</b><br>${safeTags(servers[ID].description)}`;
	} else {
		document.getElementById('serverdescription_content').innerHTML = '';
	}
}
window.setServ = setServ;

function checkOnline(serverID, coIP) {
	let oserv;
	if (serverID !== -2) {
		try {
			oserv = new WebSocket(`ws://${coIP}`);
		} catch (SecurityError) {
			document.getElementById(`server${serverID}`).className = 'unavailable';
			return;
		}		
	}

	// define what the callbacks do
	function onCOOpen(_e) {
		document.getElementById(`server${serverID}`).className = 'available';
		oserv.send(`HI#${hdid}#%`);
		oserv.send('ID#webAO#webAO#%');
	}

	function onCOMessage(e) {
		const comsg = e.data;
		const coheader = comsg.split('#', 2)[0];
		const coarguments = comsg.split('#').slice(1);
		if (coheader === 'PN') {
			servers[serverID].online = `Online: ${Number(coarguments[0])}/${Number(coarguments[1])}`;
			oserv.close();
			return;
		} else if (coheader === 'BD') {
			servers[serverID].online = 'Banned';
			servers[serverID].description = coarguments[0];
			oserv.close();
			return;
		}
		if (serverID === selectedServer) {
			document.getElementById('serverdescription_content').innerHTML = `<b>${servers[serverID].online}</b><br>${safeTags(servers[serverID].description)}`;
		}
	}

	// assign the callbacks
	oserv.onopen = function (evt) {
		onCOOpen(evt);
	};

	oserv.onmessage = function (evt) {
		onCOMessage(evt);
	};

	oserv.onerror = function (_evt) {
		document.getElementById(`server${serverID}`).className = 'unavailable';
	};
}

function loadServerlist(thelist) {
	localStorage.setItem('masterlist', JSON.stringify(thelist));
	processServerlist(thelist)
}

function cachedServerlist(response) {
	if (!response.ok) {
		document.getElementById('ms_error').style.display = 'block';
		processServerlist(JSON.parse(localStorage.getItem('masterlist')));
		return;
	}
	return response.json();
}

function processServerlist(thelist) {
	for (let i = 0; i < thelist.length - 1; i++) {
		const serverEntry = thelist[i];

		servers[i] = serverEntry;

		const ipport = serverEntry.ip + ":" + serverEntry.ws_port;

		if (serverEntry.ws_port) {
			document.getElementById("masterlist").innerHTML +=
				`<li id="server${i}" onmouseover="setServ(${i})"><p>${safeTags(serverEntry.name)}</p>`
				+ `<a class="button" href="client.html?mode=watch&ip=${ipport}">Watch</a>`
				+ `<a class="button" href="client.html?mode=join&ip=${ipport}">Join</a></li>`;
		}
	}
	return;
}

function processVersion(data) {
	console.debug(data);
	document.getElementById("clientinfo").innerHTML = `Client version: ${version}`;
	document.getElementById("serverinfo").innerHTML = `Master server version: ${data}`;
}
