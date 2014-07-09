var os = require('os');
var http = require('http');

var log = console;

var app = module.exports = require('koa')();

app.env = 'test';

var Greeter = require('./Greeter.js').Greeter;
var people = require('./people.js');

app.use(function *() {

    if (this.method != 'GET') {
        this.throw(405);
    }

    var greeter = new Greeter();
    var name = this.query.name;
    var greeting;

    if (name) {
        var man = yield greet(name);
        greeting = greeter.greet(man.name, man.count);
    } else {
        greeting = 'Hello, World!';
    }

    this.status = 200;
    this.set('Content-Type', 'text/plain');
    this.body = greeting + os.EOL;
});

app.on('error', function (err, ctx) {
    log.error('server error', err);
});


if (!module.parent) {
    var httpServer = http.createServer();
    httpServer.on('request', app.callback());

    var httpsServer = http.createServer();
    httpsServer.on('request', app.callback());

    httpServer.listen(8080);
    httpsServer.listen(8443);
}