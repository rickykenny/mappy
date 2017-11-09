var app = angular
    .module('app', ['ui.router', 'leaflet-directive'])

    .config(function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/public');
        $stateProvider
            .state('map', {
                name: 'map',
                url: '/:roomId',
                templateUrl: 'views/map.view.html',
                controller: 'mapController',
                controllerAs: 'vm'
            })
    })