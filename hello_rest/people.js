var Q = require('q');

exports.greet = function (name, collection) {
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
}