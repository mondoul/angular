define([
    'angular',
    './upload-srv',
    './file-srv',
    './client-srv',
    './chunkfile-srv'
], function (angular, uploadSrvFactory, fileSrvFactory, clientSrvFactory, chunkFileSrvFactory) {
    return angular.module('demoApp.services', [])
        .service('uploadSrv', uploadSrvFactory)
        .service('fileSrv', fileSrvFactory)
        .service('clientSrv', clientSrvFactory)
        .service('chunkFileSrv', chunkFileSrvFactory);
});
