angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider


      .state('login', {
    url: '/login',
    templateUrl: 'templates/menuInicio.html',
    controller: 'loginCtrl'
  })
      .state('registro', {
    url: '/registro',
    templateUrl: 'templates/registro.html',
    controller: 'registroCtrl'
  })
      .state('menu', {
    url: '/menu',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'menuCtrl'
  })
      .state('menu.jugar', {
    url: '/jugar',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/jugar.html',
        controller: 'jugarCtrl'
      }
    }
  })
      .state('menu.preguntas', {
    url: '/preguntas',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/preguntas.html',
        controller: 'preguntasCtrl'
      }
    }
  })
  .state('menu.estrellas', {
  url: '/estrellas',
  cache: false,
  views: {
    'menuContent': {
      templateUrl: 'templates/estrellas.html',
      controller: 'estrellasCtrl'
    }
  }
  })
  .state('menu.estadistica', {
  url: '/estadistica',
  cache: false,
  views: {
    'menuContent': {
      templateUrl: 'templates/estadistica.html',
      controller: 'estadisticaCtrl'
    }
  }
  })
    .state('menu.score', {
    url: '/score',
    views: {
      'menuContent': {
        templateUrl: 'templates/score.html',
        controller: 'scoreCtrl'
      }
    }
  })

    .state('menu.quinesSomos', {
    url: '/quienesSomos',
    views: {
      'menuContent': {
        templateUrl: 'templates/quienesSomos.html',
        controller: 'quienesSomosCtrl'
      }
    }
  })


$urlRouterProvider.otherwise('/login')



});
