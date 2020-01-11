#!/usr/bin/env node
let sub = zmq.socket('sub');
let publishers = []
sub.connect('tcp://' + dmhost + ':' + subPort);
console.log("Subscribed to port " + subPort);
sub.subscribe('webserver');
sub.on('message', (topic, message) => { 
	message = JSON.parse(message);
	console.log("READ: ", message);
	io.emit("message", JSON.stringify(message));
});