angular.module('app')
    .controller('mapController', [
        '$scope', '$window', '$state', '$timeout', 'socket', 'locationService', 'uiGmapGoogleMapApi', 'dictionaryService',
        function ($scope, $window, $state, $timeout, socket, locationService, uiGmapGoogleMapApi, dictionaryService) {
            var vm = this;
            var myUserIcon = "https://cdn4.iconfinder.com/data/icons/small-n-flat/24/map-marker-32.png";
            var otherUserIcon = "https://cdn2.iconfinder.com/data/icons/font-awesome/1792/map-marker-32.png";
            vm.resized = false;

            // enable swears
            vm.swears = true;

            // get phrases
            vm.phrase = {};
            var phrases = ['findingLocation', 'locationDenied', 'locationDeniedLong'];
            phrases.forEach(function (phraseId) {
                vm.phrase[phraseId] = dictionaryService.getPhrase(phraseId, vm.swears);
            })

            $scope.reloadPage = function () {
                $window.location.reload();
            }

            // set default values for map
            vm.map = {
                center: {
                    latitude: 45,
                    longitude: -73
                },
                zoom: 8,
                events: {
                    tilesloaded: function (map) {
                        if (!vm.resized) {
                            vm.$apply(function () {
                                vm.mapInstance = map;
                                $timeout(function () {
                                    google.maps.event.trigger(map, "resize");
                                }, 100)
                            });
                        }
                    }
                }
            };

            // setup room and user        
            vm.user = {
                id: new Date().getTime(),
                name: "THEM"
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
                        // generic user
                        user.labelClass = "other-user-marker";
                        user.icon = {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 8
                        };

                        // my user specific
                        if (user.id === vm.userId) {
                            user.name = "YOU";
                            user.icon.strokeColor = '#d60b0b';
                            user.labelClass = "my-user-marker";
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