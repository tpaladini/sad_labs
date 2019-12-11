var net = require('net');

var HOST = '127.0.0.1';
var PORT = 9000;

// Create a server instance, and chain the listen function to it
// The function passed to net.createServer() becomes the event handler for the 'connection' event
// The sock object the callback function receives UNIQUE for each connection

var messages = ["primer mensaje\n", "segundo mensaje\n"];
var users = ["Juan", "Antonio"];
var subjects = ["Primer tema", "Segundo tema"];

server = net.createServer(function(sock) {
    
    // We have a connection - a socket object is assigned to the connection automatically
    console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
    
    // Add a 'data' event handler to this instance of socket
    sock.on('data', function(data) {
        
        var cmd = data.toString();
        console.log('DATA ' + sock.remoteAddress + ': ' + cmd);
        // Write the data back to the socket, the client will receive it as data from the server
        //sock.write('You said "' + data + '"');
        if (cmd == "messages") {
            messages.forEach((m) => sock.write(m));
        }
        else if (cmd == "users") {
            users.forEach((m) => sock.write(m + "\n"));
        }
        else if (cmd == "subjects") {
            subjects.forEach((m) => sock.write(m + "\n"));
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
