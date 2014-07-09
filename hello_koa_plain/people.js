var Q = require('q');
var MongoClient = require('mongodb').MongoClient;

var PEOPLE = 'people';

var db;

Q.ninvoke(MongoClient, "connect", 'mongodb://127.0.0.1:27017/hello')
    .then(function (dbInstance) {
        db = dbInstance;
    });

process.on('exit', function () {
    db.close();
    db = undefined;
});

// close db somehow ... db.close();

exports.greet = function (name) {
    var collection = db.collection('people');

	return Q.ninvoke(collection.find({ name: name }), "toArray")
	.then(function (results) {
		var manDocument;

		if (results.length == 0) {
			manDocument = {
				name: name,
				count: 0
			}
		} else {
			manDocument = results[0];
			manDocument.count = manDocument.count + 1;
		}

		return Q.ninvoke(collection, "update", { name: name }, manDocument, { upsert: true })
			.then(function (result) {
				return manDocument;
			});
	});
};