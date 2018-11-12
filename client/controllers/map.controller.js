angular.module('app')
    .controller('mapController', [
        '$scope', '$window', '$state', '$timeout', 'socket', 'locationService', 'uiGmapGoogleMapApi', 'dictionaryService',
        function ($scope, $window, $state, $timeout, socket, locationService, uiGmapGoogleMapApi, dictionaryService) {
            var vm = this;

            // enable swears
            vm.swears = true;

            // get phrases
            vm.phrase = {};
            var phrases = ['findingLocation', 'locationDenied', 'locationDeniedLong'];
            phrases.forEach(function (phraseId) {
                vm.phrase[phraseId] = dictionaryService.getPhrase(phraseId, vm.swears);
            })

            // set default values for map
            var myUserIcon = "https://cdn4.iconfinder.com/data/icons/small-n-flat/24/map-marker-32.png";
            var otherUserIcon = "https://cdn2.iconfinder.com/data/icons/font-awesome/1792/map-marker-32.png";

            vm.myColor = '#d60b0b';
            vm.otherColor = '#000';

            vm.map = {
                control: {},
                center: {
                    latitude: 45,
                    longitude: -73
                },
                zoom: 8
            };

            // setup room and user        
            vm.user = {
                id: new Date().getTime(),
                name: "someone"
            };
            vm.room = {
                id: $state.params.roomId,
                users: []
            };

            vm.updateUser = function () {
                console.log('updating user...');
                socket.emit('user-update', vm.user);
            }

            $scope.reloadPage = function () {
                $window.location.reload();
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
                        // generic user
                        user.icon = {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 8
                        };
                        user.label = {
                            color: 'white',
                            fontWeight: 'bold',
                            text: user.name,
                        }

                        // my user specific
                        if (user.id === vm.userId) {
                            user.name = vm.myName ? vm.myName : 'You';
                            user.icon.strokeColor = vm.myColor;
                        }

                        return {
                            id: user.id,
                            location: {
                                latitude: user.location.latitude,
                                longitude: user.location.longitude,
                            },
                            options: {
                                // label: user.name[0].toUpperCase(),
                                title: user.name,
                                icon: user.icon,
                                /* content: '<div class="user-marker">' +
                                    '<div class="user-name">' + user.name + '</div>' +
                                    '<img src="' + user.icon + '"/>' +
                                    '</div>' */
                            }
                        }
                    })
                console.log(vm.markers);
            })

            vm.renameMe = function () {
                google.maps.event.trigger(vm.map.control, "resize");
                var newName = prompt("Enter your name:");
                if (!newName) {
                    return;
                }
                vm.myName = newName;
                vm.user.name = vm.myName;
                vm.updateUser();
            }

            vm.showUsers = function () {
                var allUsers = vm.room.users.map(function (user) {
                    return user.name;
                })
                alert(allUsers.join(', '));
            }

            vm.quickShare = function () {
                prompt('Copy and send this link to your friend:', $window.location.href)
            }

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
                vm.mapInstance = maps;
                console.log(maps);
                google.maps.event.trigger(vm.map, "resize");

                // join room
                socket.emit('room-join', {
                    roomId: vm.room.id,
                    user: vm.user
                });

                vm.locationPending = true;

                // get user's location
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


        }
    ])