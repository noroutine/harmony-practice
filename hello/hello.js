var greeterModule = require('./greeter.js');
var ask = require('./question.js').ask;

var os = require('os');

var greeter = new greeterModule.Greeter();

// var greeting = greeter.greet('Oleksii');
ask('Hi! What\'s your name? ')
	.then(function(name) {
		var greeting = greeter.greet(name);
		process.stdout.write(greeting + os.EOL);
	}).
	then(function() {
		process.exit();
	});