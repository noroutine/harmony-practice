var MongoClient = require('mongodb').MongoClient;
var ask = require('./question.js').ask;
var Greeter = require('./greeter.js').Greeter;
var Q = require('q');

MongoClient.connect('mongodb://127.0.0.1:27017/hello', function (err, db) {
	if (err) {
		console.log('Can\'t connect to mongo:' + err.message);
	}

	var greeter = new Greeter();

	var collection = db.collection('people');

	ask('Hello! What is your name? ')
	.then(function (name) {
		var greeting = greeter.greet(name);

		return Q.Promise(function (resolve, reject, notify) {
			console.log('blah');
			collection.insert({ name: name }, function (err, docs) {			
				if (err) {
					reject(err);
				} 

				collection.count(function (err, count) {
					console.log('count = ' + count);
				});

				console.log(greeting);

				collection.find().limit(10).toArray(function (err, results) {
					console.dir(results);
					resolve(results);
				})
			})
		});

	})
	.then(function () {
		db.close();
		process.exit();
	})
});