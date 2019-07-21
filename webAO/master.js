const MASTERSERVER_IP = "master.aceattorneyonline.com:27014";

const masterserver = new WebSocket("ws://" + MASTERSERVER_IP);
masterserver.onopen = (evt) => onOpen(evt);
masterserver.onmessage = (evt) => onMessage(evt);

const descs = [];
descs[99] = "This is your computer on port 27016";
const onlinec = [];

export function setServ(ID) {
	console.log(descs[ID]);
	if (descs[ID] !== undefined) {
		document.getElementById("serverdescC").innerHTML = "<b>Online: " + onlinec[ID] + "</b><br>" + descs[ID];
	}
	else {
		document.getElementById("serverdescC").innerHTML = "";
	}
}

function onOpen(_e) {
	masterserver.send("ID#webAO#webAO#%");
	masterserver.send("ALL#%");
	masterserver.send("VC#%");
}

function checkOnline(serverID, coIP) {
	function onCOOpen(_e) {
		document.getElementById(`server${serverID}`).className = "available";
		oserv.send("HI#webAO#%");
		oserv.send("ID#webAO#webAO#%");
	}

	function onCOMessage(e) {
		const comsg = e.data;
		const coheader = comsg.split("#", 2)[0];
		const coarguments = comsg.split("#").slice(1);
		if (coheader === "PN") {
			onlinec[serverID] = `${coarguments[0]}/${coarguments[1]}`;
			oserv.close();
		}
	}

	var oserv = new WebSocket("ws://" + coIP);

	oserv.onopen = function (evt) {
		onCOOpen(evt);
	};

	oserv.onmessage = function (evt) {
		onCOMessage(evt);
	};

}

function onMessage(e) {
	const msg = e.data;
	console.log(msg);
	const header = msg.split("#", 2)[0];

	if (header === "ALL") {
		const servers = msg.split("#").slice(1);
		for (let i = 0; i < servers.length; i++) {
			const serverEntry = servers[i];
			const args = serverEntry.split("&");
			const asset = args[4] ? `&asset=${args[4]}` : "";

			document.getElementById("masterlist").innerHTML +=
				`<li id="server${i}" class="unavailable" onmouseover="setServ(${i})"><p>${args[0]}</p>`
				+ `<a class="button" href="client.html?mode=watch&ip=${args[2]}:${args[3]}${asset}">Watch</a>`
				+ `<a class="button" href="client.html?mode=join&ip=${args[2]}:${args[3]}${asset}">Join</a></li><br/>`;
			descs[i] = args[1];
			setTimeout(checkOnline(i, args[2] + ":" + args[3]), 3000);
		}
	} else if (header === "servercheok") {
		const args = msg.split("#").slice(1);
		console.log(args);
		document.getElementById("clientinfo").innerHTML = `Client version: ${args[0]}`;
	} else if (header === "SV") {
		const args = msg.split("#").slice(1);
		console.log(args);
		document.getElementById("serverinfo").innerHTML = `Master server version: ${args[0]}`;
	}
}
