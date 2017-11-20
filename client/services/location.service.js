angular.module('app')
    .factory('locationService', ['$q', '$window', 'socket', '$rootScope', function ($q, $window, socket, $rootScope) {
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

        this.watchCurrentPosition = function () {
            if (!$window.navigator.geolocation) {
                throw new Error('Geolocation not supported.');
            } else {
                $window.navigator.geolocation.watchPosition(
                    function (position) {
                        $rootScope.$broadcast('location-changed', {
                            position: position
                        })
                    },
                    function (err) {
                        throw new Error('Location cannot be watched')
                    });
            }
        }


        return this;
    }]);