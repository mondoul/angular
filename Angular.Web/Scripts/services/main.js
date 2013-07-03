define([
    'angular',
    './login-srv'
], function (angular, loginSrvFactory) {
    return angular.module('demoApp.services', [])
        .service('loginSrv', loginSrvFactory);
});
