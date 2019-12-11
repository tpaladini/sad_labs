var HOST = '127.0.0.1';
let port = process.argv[2];
// let pubPort = process.argv[3];

var dm = require ('./dm.js');
const zmq = require('zeromq');
let server = zmq.socket('rep');

server.bind('tcp://*:' + port);

server.on('message', (data) => {
    console.log('request comes in...' + data);
    var str = data.toString();
    var invo = JSON.parse (str);
    console.log('request is:' + invo.what + ':' + str);

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
            break;                                                                                                            
    }
    server.send(JSON.stringify(reply));
});

