var koa = require('koa')
var http = require('http')
var app = koa()
var mime = require('mime')

var fs = require('co-fs')
var parse = require('co-body')

var PUBNUB = require('pubnub')

app.use(require('koa-favi')())

var pubnub = PUBNUB.init({
    publish_key   : 'pub-c-ed7f4d10-a7aa-41ec-b5e9-a092e97902a9',
    subscribe_key : 'sub-c-0a916f70-0c1f-11e4-9922-02ee2ddab7fe'
})


// static files
app.use(function *(next) {
    var root = '/public'
    var index = '/app.html'

    if (this.path == '/') {
        this.path = index
    }

    try {
        this.body = yield fs.readFile(__dirname + root + this.path)
        this.status = 200
        this.set('Content-Type', mime.lookup(this.path))
    } catch (e) {
        yield next
    }
})

// bower_components
app.use(function *(next) {
    var bowerMatch = /^\/bower_components/

    if (! bowerMatch.test(this.path)) {
        yield next
        return
    }

    try {
        this.body = yield fs.readFile(__dirname + this.path)
        this.status = 200
        this.set('Content-Type', mime.lookup(this.path))
    } catch (e) {
        yield next
    }
})


// our database ;)
var DB = {
    user: {
        name: 'Alex',
        description: "That's me",
        url: 'http://noroutine.me'
    }
}

Object.observe(DB, function (changes) {
    pubnub.publish({
        channel: 'changes',
        message: 'http://2db7a602.ngrok.com/api/user'
    })
})

// sync api
app.use(function *(next) {
    if (this.method == 'POST' && /^\/api\/user/.test(this.path)) {
        DB.user = yield parse(this)
        this.status = 200
    }

    if (this.method == 'GET' && /^\/api\/user/.test(this.path)) {
        this.body = DB.user;
    }
})

var server = http.createServer(app.callback())

server.listen(8080)


