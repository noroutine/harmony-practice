var koa = require('koa')
var http = require('http')
var app = koa()
var mime = require('mime')

var fs = require('co-fs')

var people = require('./people')
var greeter = new (require('./Greeter.js').Greeter);

app.use(require('koa-favi')())

// static files
app.use(function *(next) {
    var root = '/public'
    var index = '/app.html';

    if (this.path == '/') {
        this.path = index;
    }

    try {
        this.body = yield fs.readFile(__dirname + root + this.path)
        this.status = 200;
        this.set('Content-Type', mime.lookup(this.path))
    } catch (e) {
        yield next;
    }
})

// api
app.use(function *(next) {
    var intercept = '/api';

    if (! this.path.startsWith(intercept)) {
        yield next;
    }

    if (this.method == 'GET' && this.path == '/api/hello') {
        var name = this.query.name;
        var man = yield people.greet(name);
        this.body = greeter.greet(man.name, man.count);
    }
})

var server = http.createServer(app.callback())

server.listen(8080)


