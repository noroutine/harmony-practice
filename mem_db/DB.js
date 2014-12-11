var _ = require('lodash')
var PUBNUB = require('pubnub')

var pubnub = PUBNUB.init({
    publish_key   : 'pub-c-ed7f4d10-a7aa-41ec-b5e9-a092e97902a9',
    subscribe_key : 'sub-c-0a916f70-0c1f-11e4-9922-02ee2ddab7fe'
})

// our database ;)
var DB = module.exports.DB = {
    image: [
    ]
}

// CRUD operations on db

module.exports.DbClient = {
    insert: function (collection, item) {
        _observe(item, 'changes')
        collection.push(item)
    },
    update: function (collection, predicate, newItem) {
        _.each(collection, function (item) {
            if (item == undefined) return

            if (predicate.apply(item, arguments)) {
                updateObject(item, newItem)
            }
        })
    },
    select: function (collection, predicate) {
        return _.filter(collection, function (item) {
            return item != undefined && predicate.apply(item, arguments)
        })
    },
    'delete': function (collection, predicate) {
        _.each(collection, function (item, index) {
            if (item == undefined) return

            if (predicate.apply(item, arguments)) {
                delete collection[index]
            }
        })
    }
}

function updateObject(item, newItem) {
    // dirty
    _.each(item, function(value, key) {
        delete item[key]
    })
    _.extend(item, newItem)
}

function _observe(obj, channel) {
    Object.observe(obj, function (changes) {
        console.log('Changes', changes)
        pubnub.publish({
            channel: channel,
            message: changes
        })
    })
}

Object.prototype.patch = function() {
    _patch.apply(this, arguments)
}

function _patch(c) {
    var name = c.name

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


_observe(DB.image, 'changes')
