var dm = require ('./dm.js');
const zmq = require('zeromq');
var argparse = require('argparse');

var parser = new argparse.ArgumentParser({
	version: '0.0.1',
	addHelp:true,
	description: 'DMServer'
});

parser.addArgument('--servePort', {
	defaultValue: "9000",
	help: "Serve on port PORT"
})

parser.addArgument('--pubPort', {
	defaultValue: "9001",
	help: "Publish on port PORT"
})

var args = parser.parseArgs();
let servePort = args.servePort;
let pubPort = args.pubPort;


let server = zmq.socket('rep');
server.bind('tcp://*:' + servePort,
    function(error) {
        if (error) console.log(error);
        console.log("Opened reply socket on port:", servePort);
});

server.on('message', (data) => {
    var str = data.toString();
    var invo = JSON.parse (str);
    console.log('Received request:' + invo.what + ':' + str);

    // what is CMD?
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
        // TODO: complete all forum functions
        case 'add private message':
            reply.obj = dm.addPrivateMessage(cmd.msg);
            break;
        case 'get subject list':
            reply.obj = dm.getSubjectList();
            break;
        case 'new user':
            reply.obj = dm.addUser(cmd.u, cmd.p);
            break;
        case 'new subject':
            reply.obj = dm.addSubject(cmd.s);
            break;
        case 'get user list':
            reply.obj = dm.getUserList();
            break;
        case 'login':
            reply.obj = dm.login(cmd.u, cmd.p);
            break;
        case 'add public message':
            reply.obj = dm.addPublicMessage(cmd.msg);
            pub.send(['forumUpdates', JSON.stringify(invo.msg)]);
            break;                                                                                                            
    }
    server.send(JSON.stringify(reply));
});

let pub = zmq.socket('pub');
pub.bind('tcp://*:' + pubPort, function() {
    console.log("Publishing updates on port:", pubPort)
});
