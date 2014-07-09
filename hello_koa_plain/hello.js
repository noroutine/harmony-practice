var Greeter = require('./Greeter.js').Greeter;
var people = require('./people.js');
var Q = require('q');
var http = require('http');
var url = require('url');
var queryString = require('querystring');
var os = require('os');

var server = http.createServer();

server.on('connection', function (connection) {
    console.log('server connected');
    connection.on('end', function () {
        console.log('server disconnected');
    });
});

server.on('request', function (request, response) {

    if (request.method != 'GET') {
        response.statusCode = 405;
        response.end();
    }

    var greeter = new Greeter();

    var urlObj = url.parse(request.url);

    var name = queryString.parse(urlObj.query).name;

    var greetPromise;

    if (name) {
        greetPromise = people.greet(name)
            .then(function (man) {
                return greeter.greet(man.name, man.count);
            });
    } else {
        greetPromise = Q.fcall(function () {
            return 'Hello, World!';
        });
    }

    greetPromise
        .then(function (greeting) {
            response.statusCode = 200;
            response.setHeader('Content-Type', 'text/plain');
            response.write(greeting + os.EOL);
        })
        .then(function () {
            response.end();
        });

});

server.listen(65432, function () {
	console.log('server bound');
});
