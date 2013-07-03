define([
    'angular',
    './login-ctrl'
], function (angular, loginController) {
    return angular.module('demoApp.controllers', ['demoApp.services'])
        .controller('loginCtrl', loginController);
});
