var net = require('net');

var HOST = '127.0.0.1';
var PORT = 9000;

var client = new net.Socket();

// Client asks for messages, users or subjects
switch (process.argv[2]) {
	case 'messages':
	case 'users':
	case 'subjects':
	break;
	default:
	console.log ('Argumento erróneo: messages, users, subjects');
	process.exit(1);
}

client.connect(PORT, HOST, function() {
    console.log('CONNECTED TO: ' + HOST + ':' + PORT);
    // Write the command to the server 
    client.write(process.argv[2]);
});

// Add a 'data' event handler for the client socket
// data is what the server sent to this socket
client.on('data', function(data) {
    
	var elems = data.toString().split('\n');
	for(i=0; i<elems.length; i++) {
   		console.log(elems[i]);
	}

});

// Add a 'close' event handler for the client socket
client.on('close', function() {
    console.log('Connection closed');
});
