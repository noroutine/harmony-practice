var MongoClient = require('mongodb').MongoClient;
var ask = require('./question.js').ask;
var Greeter = require('./greeter.js').Greeter;
var people = require('./people.js');
var Q = require('q');
var net = require('net');
var os = require('os');

var server = net.createServer();

server.on('connection', function (connection) {
	console.log('server connected');
	connection.on('end', function () {
		console.log('server disconnected');		
	});

//	connection.pipe(connection);

	MongoClient.connect('mongodb://127.0.0.1:27017/hello', function (err, db) {
		if (err) {
			console.log('Can\'t connect to mongo:' + err.message);
		}

		var greeter = new Greeter();

		var collection = db.collection('people');

		ask('Hello! What is your name? ', connection, connection)
		.then(function (name) {
			return people.greet(name, collection);
		})
		.then(function (man) {
			var greeting = greeter.greet(man.name, man.count);
			connection.write(greeting + os.EOL);
		})
		.then(function () {
			db.close();			
			connection.end();
		})
	});
});

server.listen(65432, function () {
	console.log('server bound');
});
