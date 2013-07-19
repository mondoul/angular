define([
    'angular',
    './upload-srv',
    './chunkfile-srv'
], function (angular, uploadSrvFactory, chunkFileSrvFactory) {
    return angular.module('demoApp.services', [])
        .service('uploadSrv', uploadSrvFactory)
        .service('chunkFileSrv', chunkFileSrvFactory);
});
