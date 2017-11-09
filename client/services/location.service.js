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

        this.postCurrentPosition = function (location, userId, roomId) {
            var packet = {
                userId: userId,
                lat: location.lat,
                lng: location.lng
            }
            socket.emit('user-location-update', packet, roomId);
        }

        return this;
    }]);