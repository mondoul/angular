define([
    'angular',
    './upload-srv'
], function (angular, uploadSrvFactory) {
    return angular.module('demoApp.services', [])
        .service('uploadSrv', uploadSrvFactory);
});
