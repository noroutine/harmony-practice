var _ = require('lodash')
var PUBNUB = require('pubnub')

var pubnub = PUBNUB.init({
    publish_key   : 'pub-c-ed7f4d10-a7aa-41ec-b5e9-a092e97902a9',
    subscribe_key : 'sub-c-0a916f70-0c1f-11e4-9922-02ee2ddab7fe'
})

// our database ;)
var DB = module.exports.DB = {
    user: [
        {
            name: 'Alex',
            description: "That's me",
            url: 'http://noroutine.me'
        }
    ],
    image: [

    ]
}

// CRUD operations on db

module.exports.DbClient = {
    insert: function (collection, item) {
        collection.push(item)
    },
    update: function (collection, predicate, newItem) {
        _.each(collection, function (item) {
            if (item == undefined) return

            if (predicate(item)) {
                // dirty
                _.each(iten, function(value, key) {
                    delete item[key]
                })
                _.extend(item, newItem)
            }
        })
    },
    select: function (collection, predicate) {
        return _.filter(collection, function (item) {
            return item != undefined && predicate(item)
        })
    },
    'delete': function (collection, predicate) {
        _.each(collection, function (item, index) {
            if (item == undefined) return

            if (predicate(item)) {
                delete collection[index]
            }
        })
    }
}


Object.observe(DB.user, function (changes) {
    pubnub.publish({
        channel: 'changes',
        message: '/api/user'
    })
})

Object.observe(DB.image, function (changes) {
    pubnub.publish({
        channel: 'changes',
        message: '/api/image'
    })
})