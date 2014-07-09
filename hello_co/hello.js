var Q = require('q');
var co = require('co');
var thunkify = require('thunkify');

co(function *() {
    var one = yield Q.fcall(function() {
        return 1;
    });

    var two = yield Q.fcall(function() {
        return 2;
    });

    var three = yield Q.fcall(function() {
        return 3;
    });

    console.log(one, two, three);
})();




