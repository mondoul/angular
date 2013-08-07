define([
    'angular',
    './upload-srv',
    './client-srv',
    './chunkfile-srv'
], function (angular, uploadSrvFactory, clientSrvFactory, chunkFileSrvFactory) {
    return angular.module('demoApp.services', [])
        .service('uploadSrv', uploadSrvFactory)
        .service('clientSrv', clientSrvFactory)
        .service('chunkFileSrv', chunkFileSrvFactory);
});
