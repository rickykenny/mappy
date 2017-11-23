var app = angular
    .module('app', ['ui.router', 'uiGmapgoogle-maps'])

    .config(function ($stateProvider, $urlRouterProvider, uiGmapGoogleMapApiProvider) {
        $urlRouterProvider.otherwise('/public');
        $stateProvider
            .state('map', {
                name: 'map',
                url: '/:roomId',
                templateUrl: 'views/map.view.html',
                controller: 'mapController',
                controllerAs: 'vm'
            })

        uiGmapGoogleMapApiProvider.configure({
            key: 'AIzaSyAxxinU_M0_zlx6Wc_kRNHEE8ewvz-FWF8',
            v: '3.20', //defaults to latest 3.X anyhow
            libraries: 'weather,geometry,visualization'
        });
    })