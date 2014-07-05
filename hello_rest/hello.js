var MongoClient = require('mongodb').MongoClient;
var ask = require('./question.js').ask;
var Greeter = require('./greeter.js').Greeter;
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

//	connection.pipe(connection);
    if (request.method != 'GET') {
        response.statusCode = 405;
        response.end();
    }

    Q.ninvoke(MongoClient, "connect", 'mongodb://127.0.0.1:27017/hello')
        .then(function (db) {
            var greeter = new Greeter();

            var collection = db.collection('people');

            var urlObj = url.parse(request.url);

            var name = queryString.parse(urlObj.query).name;

            return people.greet(name, collection)
                .then(function (man) {
                    var greeting = greeter.greet(man.name, man.count);

                    response.statusCode = 200;
                    response.setHeader('Content-Type', 'text/plain');
                    response.write(greeting + os.EOL);
                })
                .then(function () {
                    db.close();
                    response.end();
                });
        });
});

server.listen(65432, function () {
	console.log('server bound');
});
