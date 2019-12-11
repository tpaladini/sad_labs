var dm = require ('./dm_remote.js');

let endpoint = process.argv[2];
endpoint = endpoint.split(":")
let host = endpoint[0];
let port = endpoint[1];
let command = process.argv[3];
let commandArgs = process.argv.slice(4);

let callback = function (data) {
	console.log(data);
	dm.Close();
}

let allowedCommands = {
	'get private message list': dm.getPrivateMessageList,
	'get public message list': dm.getPublicMessageList,
	'get subject list': dm.getSubjectList,
	'add private message': dm.addPrivateMessage,
	'add public message': dm.addPublicMessage,
	'new user': dm.addUser,
	'new subject': dm.addSubject,
	'get user list': dm.getUserList,
	'login': dm.login
};

dm.Start(host, port, function () {
	allowedCommands[command](...commandArgs, callback);
});