var koa = require('koa')
var http = require('http')
var app = koa()
var mime = require('mime')

var fs = require('co-fs')
var parse = require('co-body')

var _ = require('lodash')

var DB_Mod = require('./DB.js')
var DbClient = DB_Mod.DbClient
var DB = DB_Mod.DB

app.use(require('koa-favi')())

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

// sync api
app.use(function *(next) {
    if (this.method == 'POST' && /^\/api\/image/.test(this.path)) {
        DbClient.insert(DB.image, yield parse(this))
        this.status = 200
    }

    if (this.method == 'GET' && /^\/api\/image/.test(this.path)) {
        this.body = DbClient.select(DB.image, function () { return true });
    }
})

var server = http.createServer(app.callback())

server.listen(8080)


