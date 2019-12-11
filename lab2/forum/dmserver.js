var net = require('net');

var HOST = '127.0.0.1';
var PORT = 9000;

var subjects = JSON.stringify({id0: 'Introduccion al foro', id1:'Literatura', id2:'Futbol'});
var users = JSON.stringify({ Foreador: '1234',
                mudito: '1234',
                troll: '1234',
                josocxe: '1234'
            });
var publicMessages = JSON.stringify({id0: [['primer mensaje', 'Foreador', new Date()],
                        ['SEGUNDO mensaje', 'Foreador', new Date()]],
                    id2: [['primer mensaje futbolero', 'josocxe', new Date()]]
                    });

server = net.createServer(function(sock) {
    
    // We have a connection - a socket object is assigned to the connection automatically
    console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
    
    // Add a 'data' event handler to this instance of socket
    sock.on('data', function(data) {
        
        var cmd = data.toString();
        console.log('DATA ' + sock.remoteAddress + ': ' + cmd);
        
        // Write the data back to the socket, the client will receive it as data from the server
        if (cmd == "messages") {
            sock.write(publicMessages);
        }
        else if (cmd == "users") {
            sock.write(users);
        }
        else if (cmd == "subjects") {
            sock.write(subjects);
        }
        sock.end();
    });
    
    // Add a 'close' event handler to this instance of socket
    sock.on('close', function(data) {
        console.log('Connection closed');
    });
    
});

server.listen(PORT, HOST);
console.log('Server listening on ' + HOST +':'+ PORT);
