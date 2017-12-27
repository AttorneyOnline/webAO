MASTERSERVER_IP = "master.aceattorneyonline.com:27016"

masterserver = new WebSocket("ws://" + MASTERSERVER_IP);
masterserver.onopen = function(evt) { onOpen(evt) };
masterserver.onclose = function(evt) { onClose(evt) };
masterserver.onmessage = function(evt) { onMessage(evt) };
masterserver.onerror = function(evt) { onError(evt) };
var idnow;
var descs = [];
descs[99]="This is your computer on port 27016";
var serverpics = [];
function UrlExists(url)
{
	var http = new XMLHttpRequest();
	http.open('HEAD', url, false);
	http.send();
	return http.status!=404;
}

function setServ(ID) {
	console.log(descs[ID]);
	if (descs[ID] != undefined) {
		document.getElementById("serverdescC").innerHTML = descs[ID];
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
	masterserver.send("askforservers#%")
	masterserver.send("VC#%")
};
			
function onMessage(e) {
	msg = e.data;
	console.log(msg)
	header = msg.split('#', 2)[0];
	arguments = msg.split('#').slice(1)
	if (header == 'SN') {
		console.log(arguments[2].substring(0, 7));
		if (arguments[2].substring(0, 7) == 'serverD') {
			unavv = 'class="available" ';
		}
		else if (arguments[2] == 'VANILLA'){
			unavv = 'class="unavailable" ';
		}else{
			unavv = '';
		}
		document.getElementById('masterlist').innerHTML += '<li ' + unavv + 'onmouseover="setServ(' + arguments[0] + ')"><p>' + arguments[4] + '</p> <a class=\"button\" href=\"client.html?mode=watch&ip=' + arguments[1] + ':' + arguments[3] + '\">Watch</a><a class=\"button\" href=\"client.html?mode=join&ip=' + arguments[1] + ':' + arguments[3] + '\">Join</a></li><br/>'
		serverpics[arguments[0]] = arguments[2];
		descs[arguments[0]] = arguments[5];
	}
	else if (header == 'servercheok')
	{
		console.log(arguments);
		document.getElementById('clientinfo').innerHTML = "Client version - "+arguments[0];
	}
	else if (header == 'SV')
	{
		console.log(arguments);
		document.getElementById('serverinfo').innerHTML = "Masterserver version - "+arguments[0];
	}
};

function onError(e) {
	//Stub
};

function onClose(e) {
	//Stub
};
