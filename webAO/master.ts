import { safeTags } from './encoding';

declare global {
    interface Window {
        setServ: (ID: number) => void;
    }
}

interface AOServer {
    name: string,
    description: string,
    ip: string,
    players: number,
    port?: number,
    ws_port?: number,
    wss_port?: number,
    assets?: string,
    online?: string,
}

const clientVersion = process.env.npm_package_version;

// const MASTERSERVER_IP = 'master.aceattorneyonline.com:27014';
const serverlist_domain = 'servers.aceattorneyonline.com';
const protocol = window.location.protocol;
const host = window.location.host;

const serverlist_cache_key = 'masterlist';

const servers: AOServer[] = [];
servers[-2] = {
    name: 'Singleplayer',
    description: 'Build cases, try out new things',
    ip: '127.0.0.1',
    port: 50001,
    assets: '',
    online: 'Online: 0/1',
    players: 0,
};
servers[-1] = {
    name: 'Localhost',
    description: 'This is your computer on port 50001',
    ip: '127.0.0.1',
    port: 50001,
    assets: '',
    online: 'Offline',
    players: 0,
};


function main() {
    getServerlist().then((serverlist) => {
        processServerlist(serverlist);
    });

    processClientVersion(clientVersion);

    getMasterVersion().then((masterVersion) => {
        processMasterVersion(masterVersion);
    });
}

main();

export function setServ(ID: number) {
    const server = servers[ID];
    const onlineStr = server.online;
    const serverDesc = safeTags(server.description);
    document.getElementById('serverdescription_content').innerHTML = `<b>${onlineStr}</b><br>${serverDesc}`;
}
window.setServ = setServ;


// Fetches the serverlist from the masterserver
// Returns a properly typed list of servers
async function getServerlist(): Promise<AOServer[]> {
    const url = `${protocol}//${serverlist_domain}/servers`;
    const response = await fetch(url);

    if (!response.ok) {
        console.error(`Bad status code from masterserver. status: ${response.status}, body: ${response.body}`);
        document.getElementById('ms_error').style.display = 'block';
        // If we get a bad status code, try to use the cached serverlist
        return getCachedServerlist();
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
            ip: item.ip,
            players: item.players || 0,
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
    for (let i = 0; i < serverlist.length; i++) {
        const server = serverlist[i];
        let port = 0;
        let ws_protocol = '';
        let http_protocol = '';

        if (server.ws_port) {
            port = server.ws_port;
            ws_protocol = 'ws';
            http_protocol = 'http';
        }
        if (server.wss_port) {
            port = server.wss_port;
            ws_protocol = 'wss';
            http_protocol = 'https';
        }
        if (port === 0 || protocol === '') {
            console.warn(`Server ${server.name} has no websocket port, skipping`)
            continue;
        }

        const clientURL: string = `${http_protocol}://${host}/client.html`;
        const connect = `${ws_protocol}://${server.ip}:${port}`;
        const serverName = server.name;
        server.online = `Players: ${server.players}`;
        servers.push(server);

        document.getElementById('masterlist').innerHTML
            += `<li id="server${i}" onmouseover="setServ(${i})"><p>${safeTags(server.name)} (${server.players})</p>`
            + `<a class="button" href="${clientURL}?mode=watch&connect=${connect}&serverName=${serverName}" target="_blank">Watch</a>`
            + `<a class="button" href="${clientURL}?mode=join&connect=${connect}&serverName=${serverName}" target="_blank">Join</a></li>`;
    }
}

async function getMasterVersion(): Promise<string> {
    const url = `${protocol}//${serverlist_domain}/version`;
    const response = await fetch(url);
    if (!response.ok) {
        console.error(`Bad status code from masterserver version check. status: ${response.status}, body: ${response.body}`);
        return 'Unknown';
    }

    return await response.text();
}

function processClientVersion(data: string) {
    document.getElementById('clientinfo').innerHTML = `Client version: ${data}`;
}

function processMasterVersion(data: string) {
    document.getElementById('serverinfo').innerHTML = `Master server version: ${data}`;
}
