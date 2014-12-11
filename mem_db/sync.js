var _ = require('lodash')

function _observe(obj, channel) {
    Object.observe(obj, function (changes) {
        console.log('Changes', changes)
        pubnub.publish({
            channel: channel,
            message: changes
        })
    })
}

Object.prototype.patch = function(c) {
    return _patch.call(this, c)
}

Object.prototype.diff = function(other) {
    return _diff.call(this, other)
}

function _diff(b) {
    var a = _.extend({}, this);

    console.log(a, b)

    var changes = []
    for (var key in this) {
        if (a.hasOwnProperty(key)) {
            if (b.hasOwnProperty(key)) {
                if (a[key] != b[key]) {
                    a[key] = b[key]
                    changes.push({
                        type: 'update',
                        object: _.extend({}, a),
                        name: key,
                        oldValue: this[key]
                    })
                } // else ignore
            } else {
                delete a[key]
                changes.push({
                    type: 'delete',
                    object: _.extend({}, a),
                    name: key
                })
            }
        } else {
            if (b.hasOwnProperty(key)) {
                a[key] = b[key]
                changes.push({
                    type: 'add',
                    object: _.extend({}, a),
                    name: key
                })
            } else {
                // not relevant case: properties are in prototype chain
            }
        }
    }
    return changes
}

function _patch(c) {
    var name = c.name;

    ({
        'add': function() {
            if (this.hasOwnProperty(name)) {
                console.err('Object inconsistency for change', c)
            }
            this[name] = c.object[name]
        },
        'delete': function() {
            if (! this.hasOwnProperty(name)) {
                console.err('Object inconsistency for change', c)
            }
            delete this[name]
        },
        'update': function() {
            if (! this.hasOwnProperty(name) || this[name] != c.oldValue) {
                console.err('Object inconsistency for change', c)
            }
            this[name] = c.object[name]
        }
    })[c.type].apply(this, arguments);
}
