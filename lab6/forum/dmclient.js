var dm = require ('./dm_remote.js');

let endpoint = process.argv[2];
endpoint = endpoint.split(":")
let host = endpoint[0];
let port = endpoint[1];
let command = process.argv[3];
let commandArgs = process.argv.slice(4);

let allowedCommands = {
	'get private message list': dm.getPrivateMessageList,
	'get public message list': dm.getPublicMessageList,
	'get subject list': dm.getSubjectList,
	'add private message': dm.addPrivateMessage,
	'add public message': sendMessage,
	'new user': dm.addUser,
	'new subject': dm.addSubject,
	'get user list': dm.getUserList,
	'login': dm.login
};

function Message (msg, from, to, isPrivate, ts) {
	this.msg=msg; this.from=from; this.isPrivate=isPrivate; this.to=to; this.ts=ts; this.propagate = true;
}

function sendMessage(message, from, to, callback) {
	let msg = new Message(message, from, to, false, new Date());
	console.log("Sending msg:", msg);
	dm.addPublicMessage(msg, callback);
}

dm.Start(host, port, function () {
	allowedCommands[command](...commandArgs, function (data) { 
		if(data) console.log(data);
		else console.log("OK");
		dm.Close(); // close socket
	});
});