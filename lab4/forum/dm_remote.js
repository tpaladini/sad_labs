const zmq = require('zeromq')
let zmqsocket = zmq.socket("req");

exports.Start = function (host, port, cb) {
	zmqsocket.connect("tcp://"+host+":"+port);
	console.log("connected to zmq socket at " + host + ":" + port);
	if (cb) cb();
}

exports.Close = function () {
	zmqsocket.close();
}


var callbacks = {} // hash of callbacks. Key is invoId
var invoCounter = 0; // current invocation number is key to access "callbacks".

//
// When data comes from server. It is a reply from our previous request
// extract the reply, find the callback, and call it.
// Its useful to study "exports" functions before studying this one.
//
zmqsocket.on ('message', function (data) {
	console.log ('data comes in: ' + data);
	var reply = JSON.parse (data.toString());
	
	let allowedCommands = [
		'get private message list',
		'get public message list',
		'get subject list',
		'add private message',
		'add public message',
		'new user',
		'new subject',
		'get user list',
		'login'
	];

	if (allowedCommands.includes(reply.what)) {
		console.log ('We received a reply for: ' + reply.what + ':' + reply.invoId);
		callbacks [reply.invoId] (reply.obj); // call the stored callback, one argument
		delete callbacks [reply.invoId]; // remove from hash
	} else {
		console.log ("Panic: we got this: " + reply.what);
	}
});


//
// on each invocation we store the command to execute (what) and the invocation Id (invoId)
// InvoId is used to execute the proper callback when reply comes back.
//
function Invo (str, cb) {
	this.what = str;
	this.invoId = ++invoCounter;
	callbacks[invoCounter] = cb;
}

//
//
// Exported functions as 'dm'
//
//

exports.getPublicMessageList = function  (sbj, cb) {
	var invo = new Invo ('get public message list', cb);	
	invo.sbj = sbj;
	zmqsocket.send(JSON.stringify(invo));
}

exports.getPrivateMessageList = function (u1, u2, cb) {
	invo = new Invo ('get private message list', cb);
	invo.u1 = u1;
	invo.u2 = u2;
	zmqsocket.send(JSON.stringify(invo));
}

exports.getSubjectList = function (cb) {
	zmqsocket.send(JSON.stringify(new Invo ('get subject list', cb)));
}

// TODO: complete the rest of the forum functions.

// true if already exists
exports.addUser = function (u,p, cb) {
	invo = new Invo ('new user', cb);
	invo.u = u;
	invo.p = p;
	zmqsocket.send(JSON.stringify(invo));
}

// Adds a new subject to subject list. Returns -1 if already exists, id on success
exports.addSubject = function (s, cb) {
	let invo = new Invo("new subject", cb);
	invo.s = s;
	zmqsocket.send(JSON.stringify(invo));

}

exports.getUserList = function (cb) {
	let invo = new Invo("get user list", cb);
	zmqsocket.send(JSON.stringify(invo));
}

// Tests if credentials are valid, returns true on success
exports.login = function (u, p, cb) {
	let invo = new Invo("login", cb);
	invo.u = u;
	invo.p = p;
	zmqsocket.send(JSON.stringify(invo));

}

exports.addPrivateMessage = function (msg, cb){
	let invo = new Invo("add private message", cb);
	invo.msg = msg;
	zmqsocket.send(JSON.stringify(invo));
}

// adds a public message to storage
exports.addPublicMessage = function (msg, cb)
{
	let invo = new Invo("add public message", cb);
	invo.msg = msg;
	zmqsocket.send(JSON.stringify(invo));
}


