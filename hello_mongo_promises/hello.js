var MongoClient = require('mongodb').MongoClient;
var ask = require('./question.js').ask;
var Greeter = require('./greeter.js').Greeter;
var people = require('./people.js');
var Q = require('q');

MongoClient.connect('mongodb://127.0.0.1:27017/hello', function (err, db) {
	if (err) {
		console.log('Can\'t connect to mongo:' + err.message);
	}

	var greeter = new Greeter();

	var collection = db.collection('people');

	ask('Hello! What is your name? ')
	.then(function (name) {
		return people.greet(name, collection);
	})
	.then(function (man) {
		var greeting = greeter.greet(man.name, man.count);
		console.log(greeting);
	})
	.then(function () {
		db.close();
		process.exit();
	})
});