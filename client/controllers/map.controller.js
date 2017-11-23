angular.module('app')
    .controller('mapController', function ($scope, $window, $state, socket, locationService, uiGmapGoogleMapApi) {
        var vm = this;

        // set default values for map
        vm.map = {
            center: {
                latitude: 45,
                longitude: -73
            },
            zoom: 8
        };

        // setup room and user        
        vm.user = {
            id: new Date().getTime(),
            name: "piss head"
        };
        vm.room = {
            id: $state.params.roomId,
            users: []
        };

        vm.updateUser = function () {
            console.log('updating user...');
            socket.emit('user-update', vm.user);
        }

        socket.on('connected', function (response) {
            vm.userId = response.id;
        })

        socket.on('room-update', function (newRoom) {
            vm.room = newRoom;
            vm.markers = newRoom.users
                .filter(function (user) {
                    return user.location && user.location.longitude && user.location.latitude
                })
                .map(function (user) {
                    if (user.id === vm.userId) {
                        user.name = "me";
                        user.icon = "https://cdn3.iconfinder.com/data/icons/iconic-1/32/map_pin_fill-32.png"
                    } else {}
                    return {
                        id: user.id,
                        location: {
                            latitude: user.location.latitude,
                            longitude: user.location.longitude,
                        },
                        options: {
                            label: user.name[0].toUpperCase(),
                            title: user.name,
                            icon: user.icon
                        }
                    }
                })
            console.log(vm.markers);
        })

        var setLocation = function (location) {
            vm.user.location = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                accuracy: location.coords.accuracy,
                speed: location.coords.speed
            }
            vm.updateUser();
        }

        uiGmapGoogleMapApi.then(function (maps) {
            console.log('google maps ready mate');

            // join room
            socket.emit('room-join', {
                roomId: vm.room.id,
                user: vm.user
            });

            // get user's location
            vm.locationPending = true;
            locationService.getCurrentPosition()
                .then(function (response) {
                    setLocation(response);
                    vm.map.center.zoom = 8;
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

        });


    })