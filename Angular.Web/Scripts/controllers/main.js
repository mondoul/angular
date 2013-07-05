define([
    'angular',
    './upload-ctrl'
], function (angular, uploadController) {
    return angular.module('demoApp.controllers', ['demoApp.services'])
        .controller('uploadCtrl', uploadController);
});
