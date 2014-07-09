var koa = require('koa');
var http = require('http');

var fs = require('fs');
var url = require('url');

var Q = require('q');

var app = koa();

app.use(function *(next) {
    console.log(this.path);
    yield next;
});

app.use(require('koa-favi')());

app.use(function *() {
    this.status = 200;

    if (this.path === '/') {
        this.path = '/home.html';
    }

    /*
     determine content type
     .js - application/javascript
     .css - text/css
      */

    if (/\.css$/.test(this.path)) {
        this.set('Content-Type', 'text/css');
    } else if (/\.js$/.test(this.path)) {
        this.set('Content-Type', 'text/javascript');
    } else if (/\.woff$/.test(this.path)) {
        this.set('Content-Type', 'application/x-font-woff');
    } else if (/\.ttf$/.test(this.path)) {
        this.set('Content-Type', 'application/x-font-ttf');
    } else if (/\.svg$/.test(this.path)) {
        this.set('Content-Type', 'image/svg+xml');
    } else {
        this.set('Content-Type', 'text/html');
    }

    this.body = yield Q.ninvoke(fs, "readFile", __dirname + '/public' + this.path);
});


http.createServer(app.callback()).listen(8080);