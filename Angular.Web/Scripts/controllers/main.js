define([
    'angular',
    './upload-ctrl',
    './files-ctrl'
], function (angular, uploadController, filesController) {
    return angular.module('demoApp.controllers', ['demoApp.services'])
        .controller('uploadCtrl', uploadController)
        .controller('filesCtrl', filesController);
});
