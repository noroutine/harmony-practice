var Q = require('q');

var log = console.log;

Q.fcall(function() {
	return '';
})
.then(function(data) {
	return Q.fcall(function() {
		return Q.fcall(function() {
			return '1';
		})
		.then(function(data) {
			return data + '2';
		});
	})
})
.then(function(data) {
	return data + '3';
})
.then(function(data) {
	return data + '4';
})
.then(function(data) {
	console.log('result is 1234? ' + (data === '1234'));
});