import Fingerprint from "./fingerprint.js";

const MASTERSERVER_IP = "master.aceattorneyonline.com:27014";

const fp = new Fingerprint({
	canvas: true,
	ie_activex: true,
	screen_resolution: true
});

/** An emulated, semi-unique HDID that is generally safe for HDID bans. */
const hdid = fp.get();
console.log(`Your emulated HDID is ${hdid}`);

let oldLoading = false;
export function onLoad(){
	if (/webOS|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|PlayStation|Opera Mini/i.test(navigator.userAgent)) {
		oldLoading = true;
	}
}
window.onLoad = onLoad;

const masterserver = new WebSocket("ws://" + MASTERSERVER_IP);
masterserver.onopen = (evt) => onOpen(evt);
masterserver.onmessage = (evt) => onMessage(evt);

const server_description = [];
server_description[-1] = "This is your computer on port 50001";
const online_counter = [];

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
	masterserver.send("ID#webAO#webAO#%");
	if (oldLoading === true) {
		masterserver.send("askforservers#%");
	}
	else {
		masterserver.send("ALL#%");
	}
	masterserver.send("VC#%");
}

async function checkOnline(serverID, coIP) {
	function onCOOpen(_e) {
		document.getElementById(`server${serverID}`).className = "available";
		oserv.send(`HI#${hdid}#%`);
		oserv.send("ID#webAO#webAO#%");
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

	var oserv = new WebSocket("ws://" + coIP);

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
