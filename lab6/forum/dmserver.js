var dm = require ('./dm.js');
const zmq = require('zeromq');
var argparse = require('argparse');

var parser = new argparse.ArgumentParser({
	version: '0.0.1',
	addHelp:true,
	description: 'DMServer'
});

parser.addArgument('--servePort', {
	defaultValue: "8000",
	help: "Serve on port PORT"
})

parser.addArgument('--pubPort', {
	defaultValue: "9000",
	help: "Publish on port PORT"
})
   
parser.addArgument('--publishers', {
    help: "list of publishers",
    nargs: "+"
})

var args = parser.parseArgs();
let servePort = args.servePort;
let pubPort = args.pubPort;
let publishers = args.publishers ? args.publishers : [];

// for each known publisher subscribe to the topic "checkpoint"
let subSocket = zmq.socket('sub');

publishers.forEach((v) => { 
    console.log("Connecting to publisher (CHECKPOINT): "+ v);
    subSocket.connect(v);
    subSocket.subscribe('checkpoint');
});

subSocket.on('message', (topic, message) => {
    message = JSON.parse(message);
    console.log("Subscriber socket received (" + topic + "): ", message);
    console.log("Sending message to webservers");
    pubSocket.send(['webserver', JSON.stringify(message)]);
});

let pubSocket = zmq.socket('pub');
pubSocket.bind('tcp://*:' + pubPort, function() {
    console.log("Publishing updates on port (WEBSERVER):", pubPort)
});

let repSocket = zmq.socket('rep');
repSocket.bind('tcp://*:' + servePort,
    function(error) {
        if (error) console.log(error);
        console.log("Opened reply socket on port:", servePort);
});

repSocket.on('message', (data) => {
    var str = data.toString();
    var invo = JSON.parse (str);

    console.log('Received request:' + invo.what + ':' + str);

    let cmd = invo;
    var reply = {what:invo.what, invoId:invo.invoId};

    switch (invo.what) {
        case 'get subject list': 
            reply.obj = dm.getSubjectList();
            break;
        case 'get public message list': 
            reply.obj = dm.getPublicMessageList (cmd.sbj);
            break;
        case 'get private message list': 
            reply.obj = dm.getPrivateMessageList (cmd.u1, cmd.u2);
            break;
        case 'add private message':
            reply.obj = dm.addPrivateMessage(cmd.msg);
            pubSocket.send(['checkpoint', JSON.stringify(invo)]);
            break;
        case 'get subject list':
            reply.obj = dm.getSubjectList();
            break;
        case 'new user':
            reply.obj = dm.addUser(cmd.u, cmd.p);
            pubSocket.send(['checkpoint', JSON.stringify(invo)]);
            break;
        case 'new subject':
            reply.obj = dm.addSubject(cmd.s);
            pubSocket.send(['checkpoint', JSON.stringify(invo)]);
            break;
        case 'get user list':
            reply.obj = dm.getUserList();
            break;
        case 'login':
            reply.obj = dm.login(cmd.u, cmd.p);
            break;
        case 'add public message':
            reply.obj = dm.addPublicMessage(cmd.msg);
            if (cmd.msg.propagate) { 
                console.log("Sending to webserver")
                pubSocket.send(['webserver', JSON.stringify(invo.msg)]);
            }    
            console.log("Sending checkpoint message")
            pubSocket.send(['checkpoint', JSON.stringify(invo.msg)]);
            break;                                                                                                            
    }
    repSocket.send(JSON.stringify(reply));
});

function delay(n) {
    time = new Date().getTime();
    time2 = time + n;
    while (time < time2) {
        time = new Date().getTime(); 
    }
}