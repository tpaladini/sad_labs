var net = require('net');
var	Q = require("q");

var HOST = '127.0.0.1';
var PORT = 9000;

function getDataFromDMServer(message) {
	return new Promise(function(resolve, reject) {
		var dmserver = new net.Socket();

		dmserver.connect(PORT, HOST, function() {
			console.log('Opening socket: ' + HOST + ':' + PORT);		
		}).write(message);

		dmserver.on('data', function(data) {
			data = data.toString();
			// data = JSON.parse(data);
			resolve(data);
		});

		//dmserver.on('error', function() {
		//	reject();
		//})
	});
}

// Messages are objects with some specific fields
// the message itself, who sends, destination, whether is private message, timestamp 
function Message (msg, from, to, isPrivate, ts) {
    this.msg=msg; this.from=from; this.isPrivate=isPrivate; this.to=to; this.ts=ts;
}

function Post (msg, from, ts) {
	this.msg=msg; this.from=from; this.ts=ts;
}

// true on success
exports.addUser = function (u,p) {
	var lower = u.toLowerCase();
	var exists = false;
	for (var i in users) {
		if (i.toLowerCase() == lower) {exists = true; break;}
	}
	if (!exists) users.push({u:p});
	return !exists;
}

// Adds a new subject to subject list. Returns -1 if already exists, id on success
exports.addSubject = function (s) {
	var lower = s.toLowerCase();
	for (var i in subjects) {
		if (subjects[i].toLowerCase() == lower) {return -1;}
	}
	var len = Object.keys(subjects).length;
	var idlen = 'id' + len;
	subjects [idlen] = s;
	return idlen;
}

exports.getSubjectList = function () {
	return getDataFromDMServer("subjects");
}

exports.getUserList = function () {
	return getDataFromDMServer("users").then(
		(u) => JSON.parse(u)).then(
		(users) => {
			var userlist = [];
			for (var i in users) userlist.push(i);
			return JSON.stringify(userlist);
		}
	);
}

// Tests if credentials are valid, returns true on success
exports.login = function (u, p) {
	var lower = u.toLowerCase();
	for (var i in users) {
		if (i.toLowerCase() == lower) {return (users[u] == p);}
	}
	return false; // user not found
}

// TODO: PRIVATE MESSAGES
//exports.addPrivateMessage = function (msg){}
//exports.getPrivateMessageList = function (u1, u2) {}

function getSubject (sbj) {
	for (var i in subjects) {
		if (subjects[i] == sbj) return i;
	}
	return -1; // not found
}

// adds a public message to storage
exports.addPublicMessage = function (msg)
{
	var post = new Post (msg.msg, msg.from, msg.ts);
	var ml = publicMessages [msg.to];
	if (!ml) publicMessages [msg.to] = [];
	publicMessages [msg.to].push(msg);
}

exports.getPublicMessageList = function (sbj) {
	var idx=getSubject (sbj);
	var ml=[];
	if (idx != -1) {
		ml = publicMessages [idx];
	}
	return JSON.stringify (publicMessages[sbj]);
}