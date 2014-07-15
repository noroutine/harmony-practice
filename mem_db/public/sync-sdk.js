// very dirty SDK not awesome at all

var pubnub = PUBNUB.init({
    publish_key   : 'pub-c-ed7f4d10-a7aa-41ec-b5e9-a092e97902a9',
    subscribe_key : 'sub-c-0a916f70-0c1f-11e4-9922-02ee2ddab7fe'
})

var baseUrl = 'http://localhost:8080'

window.SyncSDK = {
    liveObject: function (syncURL, $scope) {
        // dirty way to have push and pull ;)

        function LiveObject () {

        }

        LiveObject.prototype = {
            push: function () {
                var self = this;
                var $injector = angular.injector(['ng']);
                $injector.invoke(function ($http) {
                    $http.post(baseUrl + syncURL, self)
                        .success(function () {
                            console.log('push ' + syncURL, instance)
                        })
                })
            },

            pull: function () {
                var self = this;
                var $injector = angular.injector(['ng']);
                $injector.invoke(function ($http) {
                    $http.get(baseUrl + syncURL)
                        .success(function (newInstance) {
                            // dirty part: update members, but keep reference
                            for (var member in self) {
                                if (self.hasOwnProperty(member)) {
                                    delete self[member]
                                }
                            }

                            angular.extend(self, newInstance)

                            console.log('pull ' + syncURL, instance)

                            $scope.$digest()
                        })
                })
            }
        }

        var instance = new LiveObject()

        // pull changes from backend
        pubnub.subscribe({
            channel : "changes",
            message : function (changes) {
                if (changes == syncURL) {
                    instance.pull()
                }
            }
        })

        instance.pull()

        return instance
    },

    liveArray: function (syncURL, $scope) {
        var instance = new LiveArray()

        function LiveArray() {

        }

        LiveArray.prototype = {
            push: function () {

            },
            pull: function () {

            }
        }

        pubnub.subscribe({
            channel : "changes",
            message : function (changes) {
                if (changes == syncURL) {
                    instance.pull()
                }
            }
        })

        instance.pull()

        return instance
    }
}