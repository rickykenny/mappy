angular
    .module('app', ['ui.router', 'leaflet-directive'])

    .config(function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/public');
        $stateProvider
            .state('public', {
                name: 'public',
                url: '/public',
                template: publicMarkup,
                controller: 'publicController'
            })
    })
    .controller('publicController', function ($scope, $window, $state, geolocationSvc) {
        $scope.user = {
            id: new Date().getTime
        };
        $scope.markers = [];
        $scope.center = {
            lat: 51.505,
            lng: -0.09,
            zoom: 4
        }

        // get user's location
        geolocationSvc.getCurrentPosition()
            .then(function (response) {
                $scope.user.location = {
                    lat: response.coords.latitude,
                    lng: response.coords.longitude,
                    accuracy: response.coords.accuracy,
                    speed: response.coords.speed
                }
                $scope.center = {
                    lat: $scope.user.location.lat,
                    lng: $scope.user.location.lng,
                    zoom: 20
                };

                $scope.markers.push({
                    lat: $scope.user.location.lat,
                    lng: $scope.user.location.lng,
                    focus: true,
                    message: "Me",
                    draggable: false,
                    id: $scope.user.id
                });
            });

    })
    .factory('geolocationSvc', ['$q', '$window', function ($q, $window) {
        function getCurrentPosition() {
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

        return {
            getCurrentPosition: getCurrentPosition
        };
    }]);


var publicMarkup =
    '<h2>Mappy!</h2>' +
    '<div ng-show="locationDenied">You denied location ya dumb dog!</div>' +
    '<leaflet lf-center="center" markers="markers" height="480px" width="100%"></leaflet>'