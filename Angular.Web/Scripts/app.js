define([
    "angular",
    "services",
    "controllers",
    "modules/ui.event",
    "modules/underscore-module"
], function (angular) {
    return angular.module('demoApp', [
        'demoApp.controllers', 'ui.event', 'underscore'
    ]);
});
