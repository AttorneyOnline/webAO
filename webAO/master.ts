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
    online: string,
    port?: number,
    ws_port?: number,
    wss_port?: number,
    assets?: string,
}

const clientVersion = process.env.npm_package_version;

// const MASTERSERVER_IP = 'master.aceattorneyonline.com:27014';
const serverlist_domain = 'servers.aceattorneyonline.com';
const protocol = window.location.protocol;

const serverlist_cache_key = 'masterlist';

const servers: AOServer[] = [];
servers[-2] = {
    name: 'Singleplayer',
    description: 'Build cases, try out new things',
    ip: '127.0.0.1',
    players: 0,
    online: 'Singleplayer',
    port: 50001,
} as AOServer;

servers[-1] = {
    name: 'Localhost',
    description: 'This is your computer on port 50001',
    ip: '127.0.0.1',
    players: 0,
    online: 'Localhost',
    port: 50001,
} as AOServer;


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

// Constructs the client URL robustly, independent of domain and path
function constructClientURL(protocol: string): string {
    const clientURL = new URL(window.location.href);

    // Use the given protocol
    clientURL.protocol = protocol;

    // Remove the last part of the pathname (e.g., "index.html")
    const pathname = clientURL.pathname;
    const parts = pathname.split('/');
    parts.pop();

    // Reconstruct the pathname
    clientURL.pathname = parts.join('/');

    // If clientURL.pathname does not end with a slash, add one
    if (clientURL.pathname[clientURL.pathname.length - 1] !== '/') {
        clientURL.pathname += '/'
    }

    clientURL.pathname += "client.html";

    return clientURL.href;
}

function processServerlist(serverlist: AOServer[]) {
    for (let i = 0; i < serverlist.length; i++) {
        const server = serverlist[i];
        let ws_port = 0;
        let ws_protocol = '';
        let http_protocol = '';

        if (server.ws_port) {
            ws_port = server.ws_port;
            ws_protocol = 'ws';
            http_protocol = 'http';
        }
        if (server.wss_port) {
            ws_port = server.wss_port;
            ws_protocol = 'wss';
            http_protocol = 'https';
        }

        if (ws_port === 0 || ws_protocol === '' || http_protocol === '') {
            console.warn(`Server ${server.name} has no websocket port, skipping`)
            continue;
        }

        const clientURL = constructClientURL(http_protocol);
        const connect = `${ws_protocol}://${server.ip}:${ws_port}`;
        const serverName = server.name;
        const fullClientWatchURL = `${clientURL}?mode=watch&connect=${connect}&serverName=${serverName}`;
        const fullClientJoinURL = `${clientURL}?mode=join&connect=${connect}&serverName=${serverName}`;

        server.online = `Players: ${server.players}`;
        servers.push(server);

        document.getElementById('masterlist').innerHTML
            += `<li id="server${i}" onmouseover="setServ(${i})"><p>${safeTags(server.name)} (${server.players})</p>`
            + `<a class="button" href="${fullClientWatchURL}" target="_blank">Watch</a>`
            + `<a class="button" href="${fullClientJoinURL}" target="_blank">Join</a></li>`;
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
