var Q = require('Q');
//var process = require('process');

exports.ask = function (question, readable, writable) {
	return Q.Promise(function(resolve, reject, notify) {
		writable.write(question);
		readable.once('data', function(data) {
			resolve(data.slice(0, -2).toString());
		});
	});
};