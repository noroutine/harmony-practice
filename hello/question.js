var Q = require('Q');
//var process = require('process');

exports.ask = function(question) {
	return Q.Promise(function(resolve, reject, notify) {
		process.stdout.write(question);
		process.stdin.once('data', function(data) {
			resolve(data.slice(0, -1));
		});
	});
}