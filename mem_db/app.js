var koa = require('koa')
var http = require('http')
var app = koa()
var mime = require('mime')

var fs = require('co-fs')
var parse = require('co-body')

var _ = require('lodash')

var PUBNUB = require('pubnub')


//var DB_Mod = require('./DB.js')
//var DbClient = DB_Mod.DbClient
//var DB = DB_Mod.DB

require('./sync.js')

var pubnub = PUBNUB.init({
    publish_key   : 'pub-c-ed7f4d10-a7aa-41ec-b5e9-a092e97902a9',
    subscribe_key : 'sub-c-0a916f70-0c1f-11e4-9922-02ee2ddab7fe'
})

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

    if (!bowerMatch.test(this.path)) {
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

var item = {
    name: 'Alex',
    description: "That's me",
    url: 'http://noroutine.me'
}

// sync api
app.use(function *(next) {

    // TODO: this should work with locking
    //Object.observe(item, function(changes) {
    //    pubnub.publish({
    //        channel: 'changes:/item',
    //        message: {} // just a notification to trigger active poll
    //    })
    //})


    if (this.method == 'POST' && /^\/api\/item/.test(this.path)) {
        var newItem = yield parse(this)

        var changes = item.diff(newItem)

        _.each(changes, function (change) {
            item.patch(change)
        })

        pubnub.publish({
            channel: 'changes:/item',
            message: changes // just a notification to trigger active poll
        })
        this.status = 200
    }

    if (this.method == 'GET' && /^\/api\/item/.test(this.path)) {
        this.body = item
        console.log('Sent ', item)
    }
})

var server = http.createServer(app.callback())

server.listen(3000)
console.log('Listening on port 3000')


