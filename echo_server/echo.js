var net = require('net');
var os = require('os');

var server = net.createServer(function (connection) {
	console.log('server connected');
	connection.on('end', function () {
		console.log('server disconnected');		
	})

	connection.write('hello' + os.EOL);	
	connection.pipe(connection);
});

server.listen(65432, function () {
	console.log('server bound');
});