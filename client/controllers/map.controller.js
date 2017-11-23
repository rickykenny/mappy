angular.module('app')
    .controller('mapController', function ($scope, $window, $state, socket, locationService, leafletBoundsHelpers) {
        var vm = this;

        var a = leafletBoundsHelpers;

        // set default values for map
        vm.markers = [];
        vm.bounds = leafletBoundsHelpers.createBoundsFromArray([
            [51.508742458803326, -0.087890625],
            [51.508742458803326, -0.087890625]
        ]);
        vm.center = {
            lat: 51.505,
            lng: -0.09,
            zoom: 4
        }

        // setup room and user        
        vm.user = {
            id: new Date().getTime(),
            name: "piss head"
        };
        vm.room = {
            id: $state.params.roomId,
            users: []
        };

        // join room
        socket.emit('room-join', {
            roomId: vm.room.id,
            user: vm.user
        });

        vm.updateUser = function () {
            console.log('updating user...');
            socket.emit('user-update', vm.user);
        }

        socket.on('connected', function (response) {
            vm.userId = response.id;
        })

        socket.on('room-update', function (newRoom) {
            console.log('room updated!')
            console.log(newRoom);

            vm.room = newRoom;
            vm.markers = newRoom.users.map(function (user) {
                if(user.id === vm.userId) {
                    user.name = "ME"
                }
                return {
                    lat: user.location.lat,
                    lng: user.location.lng,
                    focus: false,
                    message: user.name,
                    draggable: false,
                    id: user.id
                }
            })

            if (vm.markers.length > 1) {
                // zoom to fit everyone
                var arr = vm.markers.map(function (marker) {
                    return [marker.lat, marker.lng];
                });
                var bounds = leafletBoundsHelpers.createBoundsFromArray(arr);
                vm.bounds = bounds;
            } else {
                // zoom to just fit meeeee
                vm.center.zoom = 80;
            }
        })

        var setLocation = function (location) {
            vm.user.location = {
                lat: location.coords.latitude,
                lng: location.coords.longitude,
                accuracy: location.coords.accuracy,
                speed: location.coords.speed
            }
            vm.updateUser();

            vm.center.lat = vm.user.location.lat;
            vm.center.lng = vm.user.location.lng;
        }

        // get user's location
        vm.locationPending = true;
        locationService.getCurrentPosition()
            .then(function (response) {
                setLocation(response);
                vm.center.zoom = 8;
                vm.locationPending = false;
            })
            .catch(function (error) {
                vm.locationDenied = true;
            })

        // watch users location for changes
        locationService.watchCurrentPosition();

        $scope.$on('location-changed', function (event, args) {
            console.log(args);
            setLocation(args.position);

        })

    })