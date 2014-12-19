var koa = require('koa');
var http = require('http');
var app = koa();
var mime = require('mime');

var redis = require('redis');

var fs = require('co-fs');
var parseBody = require('co-body');

var _ = require('lodash');

var syncChannel = 'me.noroutine.sync.changes';

pubsub = {
    publish: function (channel, message) {
        redis.createClient().publish(channel, message);
    },

    subscribe: function (channel, f) {
        var sub = redis.createClient();
        sub.on('message', function (channel, message) {
            f(message)
        });
        sub.subscribe(channel);
    }
};

//var DB_Mod = require('./DB.js')
//var DbClient = DB_Mod.DbClient
//var DB = DB_Mod.DB

require('./sync.js');

app.use(require('koa-favi')());

// static files
app.use(function *(next) {
    var root = '/public';
    var index = '/app.html';

    if (this.path == '/') {
        this.path = index;
    }

    try {
        this.body = yield fs.readFile(__dirname + root + this.path);
        this.status = 200;
        this.set('Content-Type', mime.lookup(this.path));
    } catch (e) {
        yield next;
    }
});

// bower_components
app.use(function *(next) {
    var bowerMatch = /^\/bower_components/;

    if (!bowerMatch.test(this.path)) {
        yield next;
        return;
    }

    try {
        this.body = yield fs.readFile(__dirname + this.path);
        this.status = 200;
        this.set('Content-Type', mime.lookup(this.path));
    } catch (e) {
        yield next
    }
});

var item = {
    name: 'Alex',
    description: "That's me",
    url: 'http://noroutine.me'
};

var item1 = {
    name: 'Joe',
    description: "That's not me",
    url: 'http://noroutine.me'
};

function _liveExposed(item, syncUrl) {

}

// sync api
app.use(function *(next) {
    //_liveExposed.call(this, item, '/api/item')
    var syncUrl = '/api/item';

    if (this.method == 'POST' && new RegExp('^' + syncUrl).test(this.path)) {
        var newItem = yield parseBody(this);

        var changes = item.diff(newItem);

        _.each(changes, function (change) {
            item.patch(change)
        });

        redis.createClient().publish(syncChannel, JSON.stringify({
            instance: syncUrl,
            changes: changes
        }));

        this.status = 200;
    }

    if (this.method == 'GET' && new RegExp('^' + syncUrl).test(this.path)) {
        this.body = item;
    }

    syncUrl = '/api/meti';

    if (this.method == 'POST' && new RegExp('^' + syncUrl).test(this.path)) {
        var newItem = yield parseBody(this);

        var changes = item1.diff(newItem);

        _.each(changes, function (change) {
            item1.patch(change)
        });

        redis.createClient().publish(syncChannel, JSON.stringify({
            instance: syncUrl,
            changes: changes
        }));

        this.status = 200;
    }

    if (this.method == 'GET' && new RegExp('^' + syncUrl).test(this.path)) {
        this.body = item1;
    }

})

var server = http.createServer(app.callback());

server.listen(3000)

//can possibly implement other methods
//implement websocket hooks


var WebSocketServer = require('websocket').server;
var wsServer = new WebSocketServer({httpServer: server});

wsServer.on('request', function (request) {
    if (request.resource.indexOf(syncChannel) == 1) {
        var connection = request.accept('echo', request.origin);
        pubsub.subscribe(syncChannel, function (message) {
            connection.send(JSON.stringify({
                channel: syncChannel,
                message: message
            }));
        });

        connection.on('message', function (message) {
            pubsub.publish(syncChannel, message.utf8Data);
        });
    }
});

console.log('Listening on port 3000');
