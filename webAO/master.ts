import FingerprintJS from '@fingerprintjs/fingerprintjs';

import { unescapeChat, safeTags } from './encoding';

declare global {
    interface Window {
        setServ: (ID: any) => void;
    }
}

interface AOServer {
    name: string,
    description: string,
    ip: string,
    port?: number,
    ws_port?: number,
    wss_port?: number,
    assets?: string,
    onlineStatus?: string,
}

const myStorage = window.localStorage;

const version = process.env.npm_package_version;

const MASTERSERVER_IP = 'master.aceattorneyonline.com:27014';

const serverlist_cache_key = 'masterlist';

let hdid: string;

let selectedServer: number = -1;

const servers: { name: string, description: string, ip: string, port: number, ws_port: number, assets: string, online: string }[] = [];
servers[-2] = {
    name: 'Singleplayer', description: 'Build cases, try out new things', ip: '127.0.0.1', port: 50001, ws_port: 50001, assets: '', online: 'Online: 0/1',
};
servers[-1] = {
    name: 'Localhost', description: 'This is your computer on port 50001', ip: '127.0.0.1', port: 50001, ws_port: 50001, assets: '', online: 'Offline',
};

const fpPromise = FingerprintJS.load();
fpPromise
    .then((fp) => fp.get())
    .then(async (result) => {
        hdid = result.visitorId;

        check_https();

        const serverlist = await (async () => {
            try {
                return await getServerlist();
            } catch (err) {
                console.error(err);
                // Something went wrong, try to use the cached serverlist
                document.getElementById('ms_error').style.display = 'block';
                // This returns an empty list if there is no cached serverlist, which is the best we can do at this point
                return getCachedServerlist();
            }
        })();

        processServerlist(serverlist);

        fetch('http://servers.aceattorneyonline.com/version')
            .then((response) => response.text())
            .then((response) => processVersion(response));

        // i don't need the ms to play alone
        setTimeout(() => checkOnline(-1, '127.0.0.1:50001'), 0);
    });

export function check_https() {
    if (document.location.protocol === 'https:') {
        document.getElementById('https_error').style.display = '';
        setTimeout(() => window.location.replace("http://web.aceattorneyonline.com/"), 5000);
    }
}

export function setServ(ID: number) {
    selectedServer = ID;

    if (document.getElementById(`server${ID}`).className === '') { checkOnline(ID, `${servers[ID].ip}:${servers[ID].ws_port}`); }

    document.getElementById('serverdescription_content').innerHTML = `<b>${servers[ID].online}</b><br>${safeTags(servers[ID].description)}`;
}
window.setServ = setServ;

function checkOnline(serverID: number, coIP: string) {
    let serverConnection: WebSocket;
    if (serverID !== -2) {
        try {
            serverConnection = new WebSocket(`ws://${coIP}`);
        } catch (SecurityError) {
            document.getElementById(`server${serverID}`).className = 'unavailable';
            return;
        }
    }

    // define what the callbacks do
    function onCOOpen() {
        document.getElementById(`server${serverID}`).className = 'available';
        serverConnection.send(`HI#${hdid}#%`);
        serverConnection.send('ID#webAO#webAO#%');
    }

    function onCOMessage(e: MessageEvent) {
        const comsg = e.data;
        const coheader = comsg.split('#', 2)[0];
        const coarguments = comsg.split('#').slice(1);
        if (coheader === 'PN') {
            servers[serverID].online = `Online: ${Number(coarguments[0])}/${Number(coarguments[1])}`;
            serverConnection.close();
            return;
        } if (coheader === 'BD') {
            servers[serverID].online = 'Banned';
            servers[serverID].description = coarguments[0];
            serverConnection.close();
            return;
        }
        if (serverID === selectedServer) {
            document.getElementById('serverdescription_content').innerHTML = `<b>${servers[serverID].online}</b><br>${safeTags(servers[serverID].description)}`;
        }
    }

    // assign the callbacks
    serverConnection.onopen = function () {
        onCOOpen();
    };

    serverConnection.onmessage = function (evt: MessageEvent) {
        onCOMessage(evt);
    };

    serverConnection.onerror = function (_evt: Event) {
        document.getElementById(`server${serverID}`).className = 'unavailable';
    };
}

// Fetches the serverlist from the masterserver
// Returns a properly typed list of servers
async function getServerlist(): Promise<AOServer[]> {
    // get if we're on http or https
    const protocol = window.location.protocol;
    const response = await fetch(protocol + '//servers.aceattorneyonline.com/servers');

    if (!response.ok) {
        throw new Error(`Bad status code from masterserver. status: ${response.status}, body: ${response.body}`);
    }

    const data = await response.json();
    const serverlist: AOServer[] = [];

    for (const item of data) {
        if (!item.name) {
            console.warn(`Server ${item} has no name, skipping`);
            continue;
        }
        if (!item.ip) {
            console.warn(`Server ${item.name} has no ip, skipping`);
            continue;
        }
        if (!item.description) {
            console.warn(`Server ${item.name} has no description, skipping`);
            continue;
        }

        const newServer: AOServer = {
            name: item.name,
            description: item.description,
            ip: item.id,
        }

        if (item.ws_port) {
            newServer.ws_port = item.ws_port;
        }
        if (item.wss_port) {
            newServer.wss_port = item.wss_port;
        }

        // if none of ws_port or wss_port are defined, skip
        // Note that this is not an error condition, as many servers only has port (TCP) enabled
        // Which means they don't support webAO
        if (!newServer.ws_port && !newServer.wss_port) {
            continue;
        }

        serverlist.push(newServer);
    }

    // Always cache the result when we get it
    localStorage.setItem(serverlist_cache_key, JSON.stringify(serverlist));

    return serverlist;
}

function getCachedServerlist(): AOServer[] {
    // If it's not in the cache, return an empty list
    const cached = localStorage.getItem(serverlist_cache_key) || '[]';
    return JSON.parse(cached) as AOServer[];
}

function processServerlist(serverlist: AOServer[]) {
    const protocol = window.location.protocol;
    const domain = window.location.hostname;
    const clientURL: string = `${protocol}//${domain}/client.html`;
    for (let i = 0; i < serverlist.length - 1; i++) {
        const server = serverlist[i];
        let port = 0;

        if (server.ws_port) {
            port = server.ws_port;
        }
        if (server.wss_port) {
            port = server.wss_port;
        }
        if (port === 0) {
            continue;
        }

        const ipport = `${server.ip}:${port}`;
        const serverName = server.name;
        servers[i].onlineStatus = 'Offline';

        document.getElementById('masterlist').innerHTML
            += `<li id="server${i}" onmouseover="setServ(${i})"><p>${safeTags(server.name)}</p>`
            + `<a class="button" href="${clientURL}?mode=watch&ip=${ipport}&serverName=${serverName}">Watch</a>`
            + `<a class="button" href="${clientURL}?mode=join&ip=${ipport}&serverName=${serverName}">Join</a></li>`;
    }
}

function processVersion(data: string) {
    document.getElementById('clientinfo').innerHTML = `Client version: ${version}`;
    document.getElementById('serverinfo').innerHTML = `Master server version: ${data}`;
}
