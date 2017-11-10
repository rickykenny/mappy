angular.module('app')
    .factory('locationService', ['$q', '$window', 'socket', function ($q, $window, socket) {
        this.getCurrentPosition = function () {
            var deferred = $q.defer();

            if (!$window.navigator.geolocation) {
                deferred.reject('Geolocation not supported.');
            } else {
                $window.navigator.geolocation.getCurrentPosition(
                    function (position) {
                        deferred.resolve(position);
                    },
                    function (err) {
                        deferred.reject(err);
                    });
            }

            return deferred.promise;
        }

        return this;
    }]);