angular.module('app')
    .controller('mapController', function ($scope, $window, $state, socket, locationService) {
        var vm = this;

        // set default values for map
        vm.markers = [];
        vm.center = {
            lat: 51.505,
            lng: -0.09,
            zoom: 4
        }

        // setup room and user        
        vm.user = {
            id: new Date().getTime()
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

        socket.on('room-update', function (newRoom) {
            console.log('room updated!')
            console.log(newRoom);

            vm.room = newRoom;
            vm.markers = newRoom.users.filter(function (user) {
                return user.location && user.location.lat;
            }).map(function (user) {
                return {
                    lat: user.location.lat,
                    lng: user.location.lng,
                    focus: false,
                    message: user.name,
                    draggable: false,
                }
            })
        })

        var setLocation = function (location) {
            vm.user.location = {
                lat: location.coords.latitude,
                lng: location.coords.longitude,
                accuracy: location.coords.accuracy,
                speed: location.coords.speed
            }
            vm.updateUser();

            vm.center = {
                lat: vm.user.location.lat,
                lng: vm.user.location.lng,
                zoom: 20
            };
        }

        // get user's location
        vm.locationPending = true;
        locationService.getCurrentPosition()
            .then(function (response) {
                setLocation(response);
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