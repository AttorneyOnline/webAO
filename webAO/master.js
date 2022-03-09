import FingerprintJS from '@fingerprintjs/fingerprintjs';

import { unescapeChat, safeTags } from './encoding.js';

const version = process.env.npm_package_version;

const MASTERSERVER_IP = 'master.aceattorneyonline.com:27014';

let masterserver;

let hdid;
const options = { fonts: { extendedJsFonts: true, userDefinedFonts: ['Ace Attorney', '8bitoperator', 'DINEngschrift'] }, excludes: { userAgent: true, enumerateDevices: true } };

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

    masterserver = new WebSocket(`ws://${MASTERSERVER_IP}`);
    masterserver.onopen = (evt) => onOpen(evt);
    masterserver.onerror = (evt) => onError(evt);
    masterserver.onmessage = (evt) => onMessage(evt);

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

  if (document.getElementById(`server${ID}`).className === '') { checkOnline(ID, `${servers[ID].ip}:${servers[ID].port}`); }

  if (servers[ID].description !== undefined) {
    document.getElementById('serverdescription_content').innerHTML = `<b>${servers[ID].online}</b><br>${safeTags(servers[ID].description)}`;
  } else {
    document.getElementById('serverdescription_content').innerHTML = '';
  }
}
window.setServ = setServ;

function onOpen(_e) {
  console.log(`Your emulated HDID is ${hdid}`);
  masterserver.send('ID#webAO#webAO#%');

  masterserver.send('ALL#%');
  masterserver.send('VC#%');
}

/**
 * Triggered when an network error occurs.
 * @param {ErrorEvent} e
 */
function onError(evt) {
  document.getElementById('ms_error').style.display = 'block';
  document.getElementById('ms_error_code').innerText = `A network error occurred: ${evt.reason} (${evt.code})`;
}

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
    }
    if (coheader === 'BD') {
      servers[serverID].online = 'Banned';
      servers[serverID].description = coarguments[0];
      oserv.close();
      return;
    }
    if (serverID === selectedServer) { document.getElementById('serverdescription_content').innerHTML = `<b>${servers[serverID].online}</b><br>${safeTags(servers[serverID].description)}`; }
  }

  // assign the callbacks
  oserv.onopen = function (evt) {
    onCOOpen(evt);
  };

  oserv.onmessage = function (evt) {
    onCOMessage(evt);
  };

  oserv.onerror = function (_evt) {
    console.warn(`${coIP} threw an error.`);
    document.getElementById(`server${serverID}`).className = 'unavailable';
  };
}

function onMessage(e) {
  const msg = e.data;
  const header = msg.split('#', 2)[0];
  console.debug(msg);

  if (header === 'ALL') {
    const allservers = msg.split('#').slice(1);
    for (let i = 0; i < allservers.length - 1; i++) {
      const serverEntry = allservers[i];
      const args = serverEntry.split('&');

      const thisserver = {
        name: args[0], description: args[1], ip: args[2], port: Number(args[3]), assets: args[4], online: 'Online: ?/?',
      };
      servers[i] = thisserver;

      const ipport = `${args[2]}:${args[3]}`;
      const asset = args[4] ? `&asset=${args[4]}` : '';

      document.getElementById('masterlist').innerHTML
				+= `<li id="server${i}" onmouseover="setServ(${i})"><p>${safeTags(servers[i].name)}</p>`
				+ `<a class="button" href="client.html?mode=watch&ip=${ipport}${asset}">Watch</a>`
				+ `<a class="button" href="client.html?mode=join&ip=${ipport}${asset}">Join</a></li>`;
    }
    masterserver.close();
  } else if (header === 'servercheok') {
    const args = msg.split('#').slice(1);
    document.getElementById('clientinfo').innerHTML = `Client version: ${version} expected: ${args[0]}`;
  } else if (header === 'SV') {
    const args = msg.split('#').slice(1);
    document.getElementById('serverinfo').innerHTML = `Master server version: ${args[0]}`;
  } else if (header === 'CT') {
    const args = msg.split('#').slice(1);
    const msChat = document.getElementById('masterchat');
    msChat.innerHTML += `${unescapeChat(args[0])}: ${unescapeChat(args[1])}\r\n`;
    if (msChat.scrollTop > msChat.scrollHeight - 600) {
      msChat.scrollTop = msChat.scrollHeight;
    }
  }
}
