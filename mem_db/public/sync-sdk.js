// very dirty SDK not awesome at all
var baseHost = 'localhost:3000';
var baseUrl = 'http://' + baseHost;
var syncChannel = 'me.noroutine.sync.changes';

var syncMap = {};

var _syncForChannel = function (syncId) {
    var channelInstances = syncMap[syncId];
    if (channelInstances != undefined) {
        for (var i = 0, l = channelInstances.length; i < l; i++) {
            channelInstances[i].pull();
        }
    }
};

var _patchForChannel = function (syncId, changes) {
    var channelInstances = syncMap[syncId];
    if (channelInstances != undefined) {
        for (var i = 0, l = channelInstances.length; i < l; i++) {
            for (var j = 0, ll = changes.length; j < ll; j++) {
                _patch.call(channelInstances[i], changes[j])
            }
            channelInstances[i].change()
        }
    }
};

var _addLiveSync = function (syncId, instance) {
    var channelInstances = syncMap[syncId]
    if (channelInstances == undefined) {
        syncMap[syncId] = channelInstances = [ instance ]
    } else {
        channelInstances.push(instance)
    }
    instance.pull()
};


var ws = new WebSocket('ws://' + baseHost + '/' + syncChannel, ['echo']);
ws.onopen = function () {
    console.log('WebSocket connected...')
};

ws.onerror = function (e) {
    console.log('WebSocket Error: ' + e)
};

ws.onmessage = function (e) {
    // request to sync some object
    var json = JSON.parse(e.data);
    var channel = json.channel;
    var message = json.message;
    console.log('Change notification for channel ' + channel, message);

    var instanceChange = JSON.parse(message);

    _patchForChannel(instanceChange.instance, instanceChange.changes)
};

window.SyncSDK = {
    liveObject: function (syncUrl, $scope) {
        // dirty way to have push and pull ;)
        function LiveObject() {

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
            },
            change: function () {
                $scope.$digest()
            }


        };

        var instance = new LiveObject();

        _addLiveSync(syncUrl, instance);

        return instance;
    }
};

function _patch(c) {
    var name = c.name;

    ({
        'add': function() {
            if (this.hasOwnProperty(name)) {
                console.log('Object inconsistency for change', c);
            }
            this[name] = c.object[name];
        },
        'delete': function() {
            if (! this.hasOwnProperty(name)) {
                console.log('Object inconsistency for change', c);
            }
            delete this[name];
        },
        'update': function() {
            if (! this.hasOwnProperty(name) || this[name] != c.oldValue) {
                console.log('Object inconsistency for change', c);
            }
            this[name] = c.object[name];
        }
    })[c.type].apply(this, arguments);
}