// very dirty SDK not awesome at all

var pubnub = PUBNUB.init({
    publish_key   : 'pub-c-ed7f4d10-a7aa-41ec-b5e9-a092e97902a9',
    subscribe_key : 'sub-c-0a916f70-0c1f-11e4-9922-02ee2ddab7fe'
})

var baseUrl = 'http://localhost:3000'

window.SyncSDK = {
    liveObject: function (syncUrl, channel, $scope) {
        // dirty way to have push and pull ;)

        function LiveObject () {

        }

        LiveObject.prototype = {
            push: function () {
                var self = this;
                var $injector = angular.injector(['ng']);
                $injector.invoke(function ($http) {
                    $http.post(baseUrl + syncUrl, self)
                        .success(function () {
                            console.log('push ' + syncUrl, instance)
                        })
                })
            },

            pull: function () {
                var self = this;
                var $injector = angular.injector(['ng']);
                $injector.invoke(function ($http) {
                    $http.get(baseUrl + syncUrl)
                        .success(function (newInstance) {
                            // dirty part: update members, but keep reference
                            for (var member in self) {
                                if (self.hasOwnProperty(member)) {
                                    delete self[member]
                                }
                            }

                            angular.extend(self, newInstance)

                            console.log('pull ' + syncUrl, instance)

                            $scope.$digest()
                        })
                })
            }
        }

        var instance = new LiveObject()

        // pull changes from backend
        pubnub.subscribe({
            channel : channel,
            message : function (changes) {
                console.log('got incoming notification' , changes)
                instance.pull()
            }
        })

        instance.pull()

        return instance
    },

    liveArray: function (channel, $scope) {
        var instance = new LiveArray()

        function LiveArray() {

        }

        LiveArray.prototype = {
            push: function () {

            },
            pull: function () {

            }
        }

        LiveArray.prototype = LiveObject.prototype // for the start we just submit everything

        pubnub.subscribe({
            channel : channel,
            message : function (changes) {
                instance.pull()
            }
        })

        instance.pull()

        return instance
    }
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