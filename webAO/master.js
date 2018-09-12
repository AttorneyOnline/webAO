MASTERSERVER_IP = "master.aceattorneyonline.com:27014"
//MASTERSERVER_IP = "192.168.1.28:27014"

masterserver = new WebSocket("ws://" + MASTERSERVER_IP);
masterserver.onopen = (evt) => onOpen(evt);
masterserver.onclose = (evt) => onClose(evt);
masterserver.onmessage = (evt) => onMessage(evt);
masterserver.onerror = (evt) => onError(evt);
var idnow;
var descs = [];
descs[99]="This is your computer on port 27016";
var onlinec = [];
var serverpics = [];

function UrlExists(url)
{
	var http = new XMLHttpRequest();
	http.open('HEAD', url, false);
	http.send();
	return http.status != 404;
}

function setServ(ID) {
	console.log(descs[ID]);
	if (descs[ID] != undefined) {
		document.getElementById("serverdescC").innerHTML = "<b>Online: "+onlinec[ID]+"</b><br>" +descs[ID];
	}
	else {
		document.getElementById("serverdescC").innerHTML = "";
	}
//	idnow = ID;
//	document.getElementById("serverthumbC").src = serverpics[ID];
//	if (UrlExists(serverpics[ID])) {
//		document.getElementById("serverthumbC").src = serverpics[ID];
//	}
//	else {
//		document.getElementById("serverthumbC").src = "/images/static.gif";
//	}
}

function onOpen(e) {
	console.log("Open");
	masterserver.send("ID#webAO#webAO#%");
	masterserver.send("ALL#%");
	masterserver.send("VC#%");
};

function checkOnline(serverID,coIP) {
	function onCOOpen(e) {
		console.log("Open");
		document.getElementById('server'+serverID).className = "available";
		oserv.send("HI#webAO#%");
		oserv.send("ID#webAO#webAO#%");
	};
	function onCOMessage(e) {
		comsg = e.data;
		console.log(comsg)
		coheader = comsg.split('#', 2)[0];
		coarguments = comsg.split('#').slice(1)
		if (coheader == 'PN') {
			onlinec[serverID]=coarguments[0]+"/"+coarguments[1];
			oserv.close();
		}
	};

	var oserv = new WebSocket("ws://" + coIP);

	oserv.onopen = function(evt) {
		onCOOpen(evt);
	};

	oserv.onmessage = function(evt) {
		onCOMessage(evt);
	};
	
}

function onMessage(e) {
	msg = e.data;
	console.log(msg)
	header = msg.split('#', 2)[0];
	if (header == 'ALL') {
		let servers = msg.split('#').slice(1)
		for (let i = 0; i < servers.length; i++) {
			let serverEntry = servers[i];
			let arguments = serverEntry.split('&');
			document.getElementById('masterlist').innerHTML += 
				`<li id="server${i}" class="unavailable" onmouseover="setServ(${i})"><p>${arguments[0]}</p>`
				+ `<a class="button" href="client.html?mode=watch&ip=${arguments[2]}:${arguments[3]}">Watch</a>`
				+ `<a class="button" href="client.html?mode=join&ip=${arguments[2]}:${arguments[3]}">Join</a></li><br/>`;
			descs[i] = arguments[1];
			setTimeout(checkOnline(i, arguments[2] + ':' + arguments[3]), 3);
		}
	}
	else if (header == 'servercheok') {
		let arguments = msg.split('#').slice(1)
		console.log(arguments);
		document.getElementById('clientinfo').innerHTML = "Client version: " + arguments[0];
	}
	else if (header == 'SV') {
		let arguments = msg.split('#').slice(1)
		console.log(arguments);
		document.getElementById('serverinfo').innerHTML = "Master server version: "+arguments[0];
	}
};

function onError(e) {
	//Stub
};

function onClose(e) {
	//Stub
};
