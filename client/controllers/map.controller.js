angular.module('app')
    .controller('mapController', function ($window, $state, geolocationSvc) {
        var vm = this;
        // set default values
        vm.roomId = $state.params.roomId;
        vm.user = {
            id: new Date().getTime
        };
        vm.markers = [];
        vm.center = {
            lat: 51.505,
            lng: -0.09,
            zoom: 4
        }

        // connect to socket
        var socket = io();

        // get user's location
        vm.locationPending = true;
        geolocationSvc.getCurrentPosition()
            .then(function (response) {
                vm.user.location = {
                    lat: response.coords.latitude,
                    lng: response.coords.longitude,
                    accuracy: response.coords.accuracy,
                    speed: response.coords.speed
                }
                vm.center = {
                    lat: vm.user.location.lat,
                    lng: vm.user.location.lng,
                    zoom: 20
                };

                vm.markers.push({
                    lat: vm.user.location.lat,
                    lng: vm.user.location.lng,
                    focus: true,
                    message: "Me",
                    draggable: false,
                    id: vm.user.id
                });
                vm.locationPending = false;

                // get other users
                vm.usersPending = true;

            })
            .catch(function (error) {
                vm.locationDenied = true;
            })

    })