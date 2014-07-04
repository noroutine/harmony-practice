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
		return Q.Promise(function (resolve, reject, notify) {
			collection.find({name: name}).toArray(function (err, results) {
				var manDocument;
				
				if (results.length == 0) {
					manDocument = { 
						name: name,
						count: 0
					}

					collection.insert(manDocument, function (err, docs) {
						if (err) {
							reject(err);
						}
						resolve(docs[0]);
					})
				} else {
					manDocument = results[0];
					manDocument.count = manDocument.count + 1;

					collection.update({name: name}, manDocument, function (err, count) {
						if (err) {
							reject(err);
						}
						resolve(manDocument);
					});
				}				
			});

		});

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