angular.module('app')
    .controller('mapController', function ($window, $state, socket, locationService) {
        var vm = this;

        // set default values for map
        vm.markers = [];
        vm.center = {
            lat: 51.505,
            lng: -0.09,
            zoom: 4
        }

        // setup room and user
        vm.roomId = $state.params.roomId;
        vm.user = {
            id: new Date().getTime()
        };
        socket.emit('join-room', {
            userId: vm.user.id,
            roomId: vm.roomId
        });
        vm.users = [];

        vm.postLocation = function () {
            locationService.postCurrentPosition(vm.user.location, vm.user.id, vm.roomId);
        }

        socket.on('other-user-location-update', function (data) {
            var otherUser = vm.users.find(function (user) {
                return user.id === data.userId;
            })
            if (!otherUser) {
                otherUser = {
                    id: data.userId
                }

                vm.users.push(otherUser);
                vm.markers.push({
                    lat: data.lat,
                    lng: data.lng,
                    focus: false,
                    message: data.userId,
                    draggable: false,
                    id: data.userId
                })
            }
        })

        // get user's location
        vm.locationPending = true;
        locationService.getCurrentPosition()
            .then(function (response) {
                vm.user.location = {
                    lat: response.coords.latitude,
                    lng: response.coords.longitude,
                    accuracy: response.coords.accuracy,
                    speed: response.coords.speed
                }
                locationService.postCurrentPosition(vm.user.location, vm.user.id, vm.roomId);

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